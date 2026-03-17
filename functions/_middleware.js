export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';
  
  const isBot = /WhatsApp|facebookexternalhit|Twitterbot|Slackbot|Discordbot|TelegramBot|Googlebot|metatags.io|opengraph.xyz/i.test(userAgent);
  const isWatch = url.pathname.includes('/watch/filme/') || url.pathname.includes('/watch/serie/');

  // Se não for bot ou não for página de assistir, segue o fluxo normal
  if (!isBot || !isWatch) {
    return await next();
  }

  try {
    const match = url.pathname.match(/\/watch\/(filme|serie)\/([^/]+)/);
    if (!match) return await next();
    
    const type = match[1];
    const slug = match[2].split('?')[0]; // Remove query params
    
    const API_BASE = "https://pipoca-backend-jazs.onrender.com/api";
    const infoUrl = `${API_BASE}/${type}/${slug}`;
    
    // Busca os dados - Timeout de 5 segundos para não travar o carregamento
    const apiResponse = await fetch(infoUrl, { signal: AbortSignal.timeout(5000) });
    if (!apiResponse.ok) return await next();
    
    const data = await apiResponse.json();
    
    // Buscamos o HTML original e o transformamos
    const response = await next();
    let html = await response.text();

    const title = `${data.name} (${data.year}) - Pipoca Filmes`;
    const description = data.synopsis ? data.synopsis.substring(0, 160) + '...' : 'Assista os melhores filmes e séries no Pipoca Filmes.';
    const image = data.poster || data.backdrop;

    const metaTags = `
  <!-- Social Preview Middleware -->
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:type" content="${type === 'filme' ? 'video.movie' : 'video.tv_show'}">
  <meta property="og:url" content="${url.href}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
`;

    // Remove tags existentes e injeta novas
    html = html.replace(/<title>.*?<\/title>/gi, '');
    html = html.replace(/<meta property="og:.*?>/gi, '');
    html = html.replace('</head>', `${metaTags}</head>`);

    return new Response(html, {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
        'x-preview-debug': `Injected for ${slug}`,
        'cache-control': 'public, max-age=3600'
      },
    });

  } catch (err) {
    console.error('Middleware Preview error:', err);
    return await next();
  }
}

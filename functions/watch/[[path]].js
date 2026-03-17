export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';
  
  // Detecção robusta de bots
  const isBot = /WhatsApp|facebookexternalhit|Twitterbot|Slackbot|Discordbot|TelegramBot|Googlebot|metatags.io|opengraph.xyz/i.test(userAgent);
  
  // Só intercepta rotas de filmes/séries para bots
  const isTargetRoute = url.pathname.includes('/watch/filme/') || url.pathname.includes('/watch/serie/');
  
  if (!isBot || !isTargetRoute) {
    return await next();
  }

  try {
    // Determina tipo e slug
    const match = url.pathname.match(/\/watch\/(filme|serie)\/([^/]+)/);
    if (!match) return await next();
    
    const type = match[1];
    const slug = match[2];
    
    const API_BASE = "https://pipoca-backend-jazs.onrender.com/api";
    const infoUrl = `${API_BASE}/${type}/${slug}`;
    
    const apiResponse = await fetch(infoUrl);
    if (!apiResponse.ok) return await next();
    
    const data = await apiResponse.json();
    
    const originResponse = await next();
    let html = await originResponse.text();

    const title = `${data.name} (${data.year}) - Pipoca Filmes`;
    const description = data.synopsis ? data.synopsis.substring(0, 160) + '...' : 'Assista os melhores filmes e séries no Pipoca Filmes.';
    const image = data.poster || data.backdrop;

    const metaTags = `
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

    // Limpa títulos e injeta tags
    html = html.replace(/<title>.*?<\/title>/gi, '');
    html = html.replace('</head>', `${metaTags}</head>`);

    return new Response(html, {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
        'x-preview-status': 'success',
        'x-preview-target': slug
      },
    });

  } catch (err) {
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
}

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';
  
  const isBot = /WhatsApp|facebookexternalhit|Twitterbot|Slackbot|Discordbot|TelegramBot|Googlebot|metatags.io|opengraph.xyz/i.test(userAgent);
  const isWatch = url.pathname.includes('/watch/filme/') || url.pathname.includes('/watch/serie/');

  if (!isBot || !isWatch) {
    return await next();
  }

  let debugInfo = "";

  try {
    const match = url.pathname.match(/\/watch\/(filme|serie)\/([^/]+)/);
    if (!match) return await next();
    
    const type = match[1];
    const slug = match[2].split('?')[0];
    
    const API_BASE = "https://pipoca-backend-jazs.onrender.com/api";
    const infoUrl = `${API_BASE}/info/${type}/${slug}`;
    
    debugInfo += `Fetching ${infoUrl}... `;
    
    const apiResponse = await fetch(infoUrl, { 
      signal: AbortSignal.timeout(6000),
      headers: { 'Accept': 'application/json' }
    });

    if (!apiResponse.ok) {
        debugInfo += `API error: ${apiResponse.status}`;
        throw new Error(`API error: ${apiResponse.status}`);
    }
    
    const data = await apiResponse.json();
    debugInfo += `Success! Found ${data.name}. `;
    
    const response = await next();
    let html = await response.text();

    const title = `${data.name} (${data.year}) - Pipoca Filmes`;
    const description = data.synopsis ? data.synopsis.substring(0, 160) + '...' : 'Assista os melhores filmes e séries no Pipoca Filmes.';
    const image = data.poster || data.backdrop;

    const metaTags = `
  <!-- Social Preview Injected -->
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

    // Remove tags existentes para não duplicar
    html = html.replace(/<title>.*?<\/title>/gi, '');
    html = html.replace(/<meta property="og:title".*?>/gi, '');
    html = html.replace(/<meta property="og:image".*?>/gi, '');
    html = html.replace(/<meta property="og:description".*?>/gi, '');
    
    // Injeta as novas
    html = html.replace('</head>', `${metaTags}</head>`);

    return new Response(html, {
      headers: {
        ...response.headers, // Mantém headers originais
        'content-type': 'text/html;charset=UTF-8',
        'x-social-preview': 'active',
        'x-debug-info': debugInfo
      },
    });

  } catch (err) {
    return new Response(await (await next()).text(), {
        headers: {
            'x-social-preview-error': err.message,
            'x-debug-info': debugInfo,
            'content-type': 'text/html;charset=UTF-8'
        }
    });
  }
}

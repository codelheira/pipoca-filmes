export async function onRequest(context) {
  const { request, next, params } = context;
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';
  
  const isBot = /WhatsApp|facebookexternalhit|Twitterbot|Slackbot|Discordbot|TelegramBot|Googlebot|bingbot|metatags.io|opengraph.xyz/i.test(userAgent);
  
  if (!isBot) return await next();

  try {
    const slug = params.slug;
    const API_BASE = "https://pipoca-backend-jazs.onrender.com/api";
    const infoUrl = `${API_BASE}/serie/${slug}`;
    
    const apiResponse = await fetch(infoUrl);
    if (!apiResponse.ok) return await next();
    
    const data = await apiResponse.json();
    const originResponse = await next();
    let html = await originResponse.text();

    const title = `${data.name} (${data.year}) - Pipoca Filmes`;
    const description = data.synopsis ? data.synopsis.substring(0, 160) + '...' : 'Assista os melhores filmes e séries no Pipoca Filmes.';
    const image = data.poster || data.backdrop;

    const metaTags = `
  <!-- Social Preview Meta Tags (Serie) -->
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:type" content="video.tv_show">
  <meta property="og:url" content="${url.href}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
  `;

    html = html.replace(/<title>.*?<\/title>/, "");
    html = html.replace('</head>', `${metaTags}</head>`);

    return new Response(html, {
      headers: { 'content-type': 'text/html;charset=UTF-8', 'x-preview-type': 'serie' },
    });
  } catch (err) {
    return await next();
  }
}

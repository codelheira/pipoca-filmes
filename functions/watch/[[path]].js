export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';
  
  // Lista expandida de bots/crawlers
  const isBot = /WhatsApp|facebookexternalhit|Twitterbot|Slackbot|Discordbot|TelegramBot|Googlebot|bingbot|metatags.io|opengraph.xyz/i.test(userAgent);
  
  console.log(`User-Agent: ${userAgent}, isBot: ${isBot}, path: ${url.pathname}`);

  // Se não for um link de assistir ou não for um bot, deixa o React lidar normalmente
  if (!isBot || (!url.pathname.startsWith('/watch/filme/') && !url.pathname.startsWith('/watch/serie/'))) {
    return await next();
  }

  try {
    const parts = url.pathname.split('/');
    const type = parts[2] === 'filme' ? 'filme' : 'serie';
    const slug = parts[3];
    
    // URL da API
    const API_BASE = "https://pipoca-backend-jazs.onrender.com/api";
    const infoUrl = `${API_BASE}/${type}/${slug}`;
    
    console.log(`Fetching metadata from: ${infoUrl}`);
    
    const apiResponse = await fetch(infoUrl);
    if (!apiResponse.ok) {
      console.log(`API Fetch failed with status: ${apiResponse.status}`);
      return await next();
    }
    
    const data = await apiResponse.json();
    
    // Pega o HTML original
    const originResponse = await next();
    let html = await originResponse.text();

    const title = `${data.name} (${data.year}) - Pipoca Filmes`;
    const description = data.synopsis ? data.synopsis.substring(0, 160) + '...' : 'Assista os melhores filmes e séries no Pipoca Filmes.';
    const image = data.poster || data.backdrop;

    // Tags que serão injetadas
    const metaTags = `
  <!-- Social Preview Meta Tags -->
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

    // Remove o título original e injeta antes de </head>
    html = html.replace(/<title>.*?<\/title>/, "");
    html = html.replace('</head>', `${metaTags}</head>`);

    console.log(`Injected meta tags for: ${data.name}`);

    return new Response(html, {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
        'x-preview-injected': 'true' // Tag para debug fácil
      },
    });

  } catch (err) {
    console.error('Error in Social Preview Function:', err);
    return await next();
  }
}

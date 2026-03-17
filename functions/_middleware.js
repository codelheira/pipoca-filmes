export async function onRequest(context) {
  const { request, next, env } = context;
  
  // Use a variável de ambiente VITE_API_BASE_URL (configurada no painel da Cloudflare)
  // Se não estiver definida, usa o valor de produção como fallback
  const API_BASE = env.VITE_API_BASE_URL || "https://pipoca-backend-jazs.onrender.com/api";

  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';
  
  // Detect bots that require server-side meta tags
  const isBot = /WhatsApp|facebookexternalhit|Twitterbot|Slackbot|Discordbot|TelegramBot|Googlebot|metatags.io|opengraph.xyz/i.test(userAgent);
  const watchMatch = url.pathname.match(/\/watch\/(filme|serie)\/([^/]+)/);

  // If not a bot or not a watch page, proceed normally
  if (!isBot || !watchMatch) {
    return await next();
  }

  try {
    const type = watchMatch[1];
    const slug = watchMatch[2].split('?')[0];
    const infoUrl = `${API_BASE}/info/${type}/${slug}`;
    
    // Fetch movie/serie metadata from API
    const apiResponse = await fetch(infoUrl, { 
      signal: AbortSignal.timeout(5000),
      headers: { 'Accept': 'application/json' }
    });

    if (!apiResponse.ok) return await next();
    
    const data = await apiResponse.json();
    
    // Get the original HTML response
    const response = await next();
    
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

    // Inject meta tags using HTMLRewriter for reliability
    return new HTMLRewriter()
      .on('title', {
        element(element) {
          element.remove();
        }
      })
      .on('head', {
        element(element) {
          element.append(metaTags, { html: true });
        }
      })
      .transform(response);

  } catch (err) {
    // Fallback to normal rendering on any error
    console.error('Social Preview Error:', err);
    return await next();
  }
}

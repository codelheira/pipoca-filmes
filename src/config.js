// Centralização das URLs de API e WebSocket para evitar erros de Mixed Content e facilitar manutenção.
// As variáveis de ambiente (VITE_API_BASE_URL e VITE_WS_BASE_URL) devem ser configuradas no painel do Cloudflare/Render.

const getApiUrl = () => {
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (envUrl) return envUrl;

    // Fallback inteligente: se estivermos em HTTPS (produção), usamos o backend do Render em HTTPS.
    // Se estivermos em localhost, usamos o backend local.
    if (window.location.protocol === 'https:') {
        return "https://pipoca-backend-jazs.onrender.com/api";
    }
    
    return `http://${window.location.hostname}:8000/api`;
};

const getWsUrl = () => {
    const envUrl = import.meta.env.VITE_WS_BASE_URL;
    if (envUrl) return envUrl;

    if (window.location.protocol === 'https:') {
        return "wss://pipoca-backend-jazs.onrender.com/api";
    }

    return `ws://${window.location.hostname}:8000/api`;
};

export const API_URL = getApiUrl();
export const WS_URL = getWsUrl();

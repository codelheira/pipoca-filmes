// Centralização das URLs de API e WebSocket para evitar erros de Mixed Content e facilitar manutenção.
// As variáveis de ambiente (VITE_API_BASE_URL e VITE_WS_BASE_URL) devem ser configuradas no painel do Cloudflare/Render.

const getApiUrl = () => {
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (envUrl) {
        // Se a URL do ambiente terminar com /v1, retorna ela. Se não, adiciona.
        return envUrl.endsWith('/v1') ? envUrl : `${envUrl}/v1`;
    }

    // Fallback inteligente: se estivermos em HTTPS (produção), usamos o backend do Render em HTTPS com v1.
    // Se estivermos em localhost, usamos o backend local com v1.
    if (window.location.protocol === 'https:') {
        return "https://pipoca-backend-jazs.onrender.com/api/v1";
    }
    
    return `http://${window.location.hostname}:8000/api/v1`;
};

const getWsUrl = () => {
    const envUrl = import.meta.env.VITE_WS_BASE_URL;
    if (envUrl) {
        // O WebSocket NÃO deve ter /api ou /v1 no final. Limpamos se houver.
        return envUrl.replace('/api/v1', '').replace('/api', '');
    }

    if (window.location.protocol === 'https:') {
        return "wss://pipoca-backend-jazs.onrender.com";
    }

    return `ws://${window.location.hostname}:8000`;
};

export const API_URL = getApiUrl();
export const WS_URL = getWsUrl();
// Garante que o SOCKET_URL aponte sempre para a raiz do servidor (sem /api/v1).
export const SOCKET_URL = API_URL.split('/api')[0];

/**
 * PipocaBufferManager: Gerencia o pré-carregamento agressivo de vídeos MP4
 * Armazena chunks no IndexedDB para evitar travamentos de rede.
 */

import { openDB } from 'idb';

const DB_NAME = 'pipoca_buffer_db';
const STORE_NAME = 'video_chunks';
const DB_VERSION = 1;

class PipocaBufferManager {
    constructor() {
        this.db = null;
        this.activeSlug = null;
        this.init();
    }

    async init() {
        this.db = await openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            },
        });
    }

    /**
     * Gera uma chave única para o chunk baseado no slug e range
     */
    getChunkKey(slug, start, end) {
        return `${slug}_${start}-${end}`;
    }

    /**
     * Verifica se um chunk já existe no cache local
     */
    async getCachedChunk(slug, start, end) {
        if (!this.db) await this.init();
        const key = this.getChunkKey(slug, start, end);
        return await this.db.get(STORE_NAME, key);
    }

    /**
     * Salva um chunk no cache
     */
    async cacheChunk(slug, start, end, data) {
        if (!this.db) await this.init();
        const key = this.getChunkKey(slug, start, end);
        try {
            await this.db.put(STORE_NAME, data, key);
            this.cleanupOldChunks(slug);
        } catch (e) {
            console.warn('Erro ao salvar no IndexedDB (provavelmente limite de espaço):', e);
        }
    }

    /**
     * Retorna o tamanho total cachedo para um slug em MB
     */
    async getCachedSize(slug) {
        if (!this.db) await this.init();
        const keys = await this.db.getAllKeys(STORE_NAME);
        let totalBytes = 0;
        for (const key of keys) {
            if (key.startsWith(slug)) {
                const data = await this.db.get(STORE_NAME, key);
                if (data) totalBytes += data.byteLength;
            }
        }
        return (totalBytes / (1024 * 1024)).toFixed(2);
    }

    /**
     * Remove chunks antigos para não estourar o armazenamento do navegador
     */
    async cleanupOldChunks(currentSlug) {
        // Lógica simples: se mudar de filme, limpa o anterior (estratégia conservadora)
        // No futuro podemos implementar LRU
        const keys = await this.db.getAllKeys(STORE_NAME);
        for (const key of keys) {
            if (!key.startsWith(currentSlug)) {
                await this.db.delete(STORE_NAME, key);
            }
        }
    }

    /**
     * Baixa um intervalo de bytes (Range Request) de forma agressiva
     */
    async fetchRange(url, slug, start, end) {
        // 1. Tenta cache
        const cached = await this.getCachedChunk(slug, start, end);
        if (cached) return cached;

        // 2. Senão, baixa via HTTP
        try {
            const response = await fetch(url, {
                headers: {
                    'Range': `bytes=${start}-${end}`
                }
            });

            if (!response.ok && response.status !== 206) {
                 throw new Error(`Falha ao baixar range: ${response.status}`);
            }

            const data = await response.arrayBuffer();
            
            // 3. Salva em background
            this.cacheChunk(slug, start, end, data);
            
            return data;
        } catch (error) {
            console.error('Erro no PipocaBufferManager Fetch:', error);
            return null;
        }
    }
}

export const bufferManager = new PipocaBufferManager();

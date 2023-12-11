/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly WEBSOCKET_BASE_URL: string;
    readonly API_BASE_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
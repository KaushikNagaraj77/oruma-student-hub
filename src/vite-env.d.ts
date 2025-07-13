/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_WS_BASE_URL: string
  readonly VITE_PORT: string
  readonly VITE_AUTH_ENDPOINT: string
  readonly VITE_POSTS_ENDPOINT: string
  readonly VITE_MARKETPLACE_ENDPOINT: string
  readonly VITE_MESSAGES_ENDPOINT: string
  readonly VITE_EVENTS_ENDPOINT: string
  readonly VITE_ENABLE_WEBSOCKETS: string
  readonly VITE_ENABLE_MARKETPLACE: string
  readonly VITE_ENABLE_MESSAGING: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

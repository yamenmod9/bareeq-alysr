/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_ENABLE_MOCKS: string;
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_DEFAULT_LANGUAGE: string;
  readonly VITE_DEFAULT_THEME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

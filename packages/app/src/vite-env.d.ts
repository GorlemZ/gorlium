/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_TELEGRAM_BOT_TOKEN: string;
  readonly VITE_TELEGRAM_CHAT_ID: string;
  readonly VITE_INSTANT_APP_ID?: string;
  readonly VITE_BALTICI_EDIT_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

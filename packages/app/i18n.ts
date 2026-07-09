import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enMessages from "./src/locales/en.json";

// Single-language site. `as const` preserves the message shapes (including the
// string[] paragraph arrays) so the i18next augmentation in src/i18next.d.ts
// can type t() keys against the real resources.
export const resources = { en: enMessages } as const;

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  debug: import.meta.env.DEV,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
  returnObjects: true,
});

export default i18n;

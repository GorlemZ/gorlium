import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { LocalizedString } from "@gorlium/design-system";
import enMessages from "./src/locales/en.json";
import itMessages from "./src/locales/it.json";

type Primitive = string | boolean | number | null | undefined;
type MapLeafNodes<Obj, LeafType> = {
  [Prop in keyof Obj]: Obj[Prop] extends Primitive
    ? LeafType
    : // eslint-disable-next-line
    Obj[Prop] extends Record<string | number, any>
    ? MapLeafNodes<Obj[Prop], LeafType>
    : never;
};

const enResources = enMessages as MapLeafNodes<
  typeof enMessages,
  LocalizedString
>;

const itResources = itMessages as MapLeafNodes<
  typeof itMessages,
  LocalizedString
>;

export const resources = {
  en: enResources,
  it: itResources,
} as const;

i18n.use(initReactI18next).init({
  resources, // Use only the predefined resources
  lng: "it",
  fallbackLng: "it",
  debug: true,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
  returnObjects: true,
});

export default i18n;

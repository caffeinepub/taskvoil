import {
  type ReactNode,
  createContext,
  createElement,
  useContext,
} from "react";
import { de } from "./translations/de";
import { el } from "./translations/el";
import { en } from "./translations/en";
import { es } from "./translations/es";
import { type TranslationKeys, fr } from "./translations/fr";
import { it } from "./translations/it";
import { lu } from "./translations/lu";
import { nl } from "./translations/nl";
import { pt } from "./translations/pt";

// "ie" = Irish English (uses English translations, Irish flag)
export type Language =
  | "ie"
  | "fr"
  | "en"
  | "de"
  | "es"
  | "it"
  | "pt"
  | "nl"
  | "el"
  | "lu";

export const SUPPORTED_LANGUAGES: Language[] = [
  "ie",
  "fr",
  "en",
  "de",
  "es",
  "it",
  "pt",
  "nl",
  "el",
  "lu",
];

export const LANGUAGE_META: Record<
  Language,
  { flag: string; label: string; labelNative: string }
> = {
  ie: {
    flag: "🇮🇪",
    label: "Anglais (Irlande)",
    labelNative: "English (Ireland)",
  },
  fr: { flag: "🇫🇷", label: "Français", labelNative: "Français" },
  en: { flag: "🇬🇧", label: "Anglais", labelNative: "English" },
  de: { flag: "🇩🇪", label: "Allemand", labelNative: "Deutsch" },
  es: { flag: "🇪🇸", label: "Espagnol", labelNative: "Español" },
  it: { flag: "🇮🇹", label: "Italien", labelNative: "Italiano" },
  pt: { flag: "🇵🇹", label: "Portugais", labelNative: "Português" },
  nl: { flag: "🇳🇱", label: "Néerlandais", labelNative: "Nederlands" },
  el: { flag: "🇬🇷", label: "Grec", labelNative: "Ελληνικά" },
  lu: { flag: "🇱🇺", label: "Luxembourgeois", labelNative: "Lëtzebuergesch" },
};

const translations: Record<Language, TranslationKeys> = {
  ie: en,
  fr,
  en,
  de,
  es,
  it,
  pt,
  nl,
  el,
  lu,
};

type I18nContextType = {
  t: TranslationKeys;
  lang: Language;
  /**
   * Only used for Switzerland (FR/DE toggle).
   * All other countries have a fixed language — no toggle available.
   */
  setLang: (lang: Language) => void;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({
  children,
  lang,
  setLang,
}: {
  children: ReactNode;
  lang: Language;
  setLang: (lang: Language) => void;
}) {
  const value: I18nContextType = {
    t: translations[lang],
    lang,
    setLang,
  };

  return createElement(I18nContext.Provider, { value }, children);
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within I18nProvider");
  }
  return ctx;
}

// Locale map for date/number formatting
export const LOCALE_MAP: Record<Language, string> = {
  fr: "fr-FR",
  en: "en-GB",
  ie: "en-IE",
  de: "de-DE",
  es: "es-ES",
  it: "it-IT",
  pt: "pt-PT",
  nl: "nl-NL",
  el: "el-GR",
  lu: "lb-LU",
};

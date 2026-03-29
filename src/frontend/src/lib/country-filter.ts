/**
 * Country filtering utilities for TaskVoilà
 *
 * All data (pros, missions) is scoped strictly by country.
 * Users only see content from their selected country by default.
 * International search is opt-in and explicit.
 */

import type { Language } from "./i18n";

// Maps a language selection (from LanguageSelector) to a country code.
// "ie" (Irish English) maps to IE, "en" (British English) maps to GB, etc.
export const LANG_TO_COUNTRY: Record<Language, string> = {
  ie: "IE",
  fr: "FR",
  en: "GB",
  de: "DE",
  es: "ES",
  it: "IT",
  pt: "PT",
  nl: "NL",
  el: "GR",
};

// Country code → display info
export const COUNTRY_META: Record<
  string,
  { flag: string; name: Record<Language, string> }
> = {
  FR: {
    flag: "🇫🇷",
    name: {
      ie: "France",
      fr: "France",
      en: "France",
      de: "Frankreich",
      es: "Francia",
      it: "Francia",
      pt: "França",
      nl: "Frankrijk",
      el: "Γαλλία",
    },
  },
  BE: {
    flag: "🇧🇪",
    name: {
      ie: "Belgium",
      fr: "Belgique",
      en: "Belgium",
      de: "Belgien",
      es: "Bélgica",
      it: "Belgio",
      pt: "Bélgica",
      nl: "België",
      el: "Βέλγιο",
    },
  },
  IE: {
    flag: "🇮🇪",
    name: {
      ie: "Ireland",
      fr: "Irlande",
      en: "Ireland",
      de: "Irland",
      es: "Irlanda",
      it: "Irlanda",
      pt: "Irlanda",
      nl: "Ierland",
      el: "Ιρλανδία",
    },
  },
  GB: {
    flag: "🇬🇧",
    name: {
      ie: "United Kingdom",
      fr: "Royaume-Uni",
      en: "United Kingdom",
      de: "Vereinigtes Königreich",
      es: "Reino Unido",
      it: "Regno Unido",
      pt: "Reino Unido",
      nl: "Verenigd Koninkrijk",
      el: "Ηνωμένο Βασίλειο",
    },
  },
  DE: {
    flag: "🇩🇪",
    name: {
      ie: "Germany",
      fr: "Allemagne",
      en: "Germany",
      de: "Deutschland",
      es: "Alemania",
      it: "Germania",
      pt: "Alemanha",
      nl: "Duitsland",
      el: "Γερμανία",
    },
  },
  ES: {
    flag: "🇪🇸",
    name: {
      ie: "Spain",
      fr: "Espagne",
      en: "Spain",
      de: "Spanien",
      es: "España",
      it: "Spagna",
      pt: "Espanha",
      nl: "Spanje",
      el: "Ισπανία",
    },
  },
  IT: {
    flag: "🇮🇹",
    name: {
      ie: "Italy",
      fr: "Italie",
      en: "Italy",
      de: "Italien",
      es: "Italia",
      it: "Italia",
      pt: "Itália",
      nl: "Italië",
      el: "Ιταλία",
    },
  },
  PT: {
    flag: "🇵🇹",
    name: {
      ie: "Portugal",
      fr: "Portugal",
      en: "Portugal",
      de: "Portugal",
      es: "Portugal",
      it: "Portogallo",
      pt: "Portugal",
      nl: "Portugal",
      el: "Πορτογαλία",
    },
  },
  NL: {
    flag: "🇳🇱",
    name: {
      ie: "Netherlands",
      fr: "Pays-Bas",
      en: "Netherlands",
      de: "Niederlande",
      es: "Países Bajos",
      it: "Paesi Bassi",
      pt: "Países Baixos",
      nl: "Nederland",
      el: "Ολλανδία",
    },
  },
  LU: {
    flag: "🇱🇺",
    name: {
      ie: "Luxembourg",
      fr: "Luxembourg",
      en: "Luxembourg",
      de: "Luxemburg",
      es: "Luxemburgo",
      it: "Lussemburgo",
      pt: "Luxemburgo",
      nl: "Luxemburg",
      el: "Λουξεμβούργο",
    },
  },
  GR: {
    flag: "🇬🇷",
    name: {
      ie: "Greece",
      fr: "Grèce",
      en: "Greece",
      de: "Griechenland",
      es: "Grecia",
      it: "Grecia",
      pt: "Grécia",
      nl: "Griekenland",
      el: "Ελλάδα",
    },
  },
  CH: {
    flag: "🇨🇭",
    name: {
      ie: "Switzerland",
      fr: "Suisse",
      en: "Switzerland",
      de: "Schweiz",
      es: "Suiza",
      it: "Svizzera",
      pt: "Suíça",
      nl: "Zwitserland",
      el: "Ελβετία",
    },
  },
};

/**
 * Returns the country code derived from the user's selected language.
 * This is the primary country scope for all data filtering.
 */
export function getCountryFromLang(lang: Language): string {
  return LANG_TO_COUNTRY[lang] ?? "FR";
}

/**
 * Returns display info for a country code.
 */
export function getCountryMeta(
  code: string,
  lang: Language,
): { flag: string; name: string } {
  const meta = COUNTRY_META[code];
  if (!meta) return { flag: "🌍", name: code };
  return { flag: meta.flag, name: meta.name[lang] ?? code };
}

/**
 * Strict country match: a record belongs to the active country if
 * - its `country` field equals the active country code, OR
 * - it has no `country` field (legacy data — treated as belonging to FR by default)
 *
 * In international mode, all records pass through.
 */
export function matchesCountry(
  recordCountry: string | undefined,
  activeCountry: string,
  isInternational: boolean,
): boolean {
  if (isInternational) return true;
  // Records without a country are legacy FR data
  const recordCode = recordCountry ?? "FR";
  return recordCode === activeCountry;
}

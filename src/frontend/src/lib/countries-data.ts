// LangCode includes "ie" for Ireland (English with Irish flag in navbar)
export type LangCode =
  | "fr"
  | "en"
  | "de"
  | "nl"
  | "it"
  | "es"
  | "pt"
  | "el"
  | "ie";

export type CountryData = {
  code: string;
  nameFR: string;
  nameEN: string;
  flag: string;
  /** The language automatically applied when this country is selected */
  defaultLang: LangCode;
  isPriority: boolean;
};

export const priorityCountries: CountryData[] = [
  {
    code: "FR",
    nameFR: "France",
    nameEN: "France",
    flag: "🇫🇷",
    defaultLang: "fr",
    isPriority: true,
  },
  {
    code: "BE",
    nameFR: "Belgique",
    nameEN: "Belgium",
    flag: "🇧🇪",
    defaultLang: "fr",
    isPriority: true,
  },
  {
    code: "GB",
    nameFR: "Royaume-Uni",
    nameEN: "United Kingdom",
    flag: "🇬🇧",
    defaultLang: "en",
    isPriority: true,
  },
  {
    code: "DE",
    nameFR: "Allemagne",
    nameEN: "Germany",
    flag: "🇩🇪",
    defaultLang: "de",
    isPriority: true,
  },
  {
    code: "ES",
    nameFR: "Espagne",
    nameEN: "Spain",
    flag: "🇪🇸",
    defaultLang: "es",
    isPriority: true,
  },
  {
    code: "IE",
    nameFR: "Irlande",
    nameEN: "Ireland",
    flag: "🇮🇪",
    // "ie" = English translations with the Irish 🇮🇪 flag — NEVER shows 🇬🇧
    defaultLang: "ie",
    isPriority: true,
  },
  {
    code: "LU",
    nameFR: "Luxembourg",
    nameEN: "Luxembourg",
    flag: "🇱🇺",
    defaultLang: "fr",
    isPriority: true,
  },
  {
    code: "IT",
    nameFR: "Italie",
    nameEN: "Italy",
    flag: "🇮🇹",
    defaultLang: "it",
    isPriority: true,
  },
  {
    code: "PT",
    nameFR: "Portugal",
    nameEN: "Portugal",
    flag: "🇵🇹",
    defaultLang: "pt",
    isPriority: true,
  },
  {
    code: "GR",
    nameFR: "Grèce",
    nameEN: "Greece",
    flag: "🇬🇷",
    defaultLang: "el",
    isPriority: true,
  },
  {
    code: "CH",
    nameFR: "Suisse",
    nameEN: "Switzerland",
    flag: "🇨🇭",
    defaultLang: "fr",
    isPriority: true,
  },
  {
    code: "NL",
    nameFR: "Pays-Bas",
    nameEN: "Netherlands",
    flag: "🇳🇱",
    defaultLang: "nl",
    isPriority: true,
  },
];

// Only priority countries are shown — secondary EU countries removed per user request
export const otherEUCountries: CountryData[] = [];

export const allCountries: CountryData[] = [
  ...priorityCountries,
  ...otherEUCountries,
];

export function getCountryByCode(code: string): CountryData | undefined {
  return allCountries.find((c) => c.code === code);
}

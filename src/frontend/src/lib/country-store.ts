import {
  type ReactNode,
  createContext,
  createElement,
  useCallback,
  useContext,
  useState,
} from "react";
import type { Language } from "./i18n";

const STORAGE_KEY = "taskvoila_country_v6";
const OLD_STORAGE_KEYS = [
  "taskvoila_country_v1",
  "taskvoila_country_v2",
  "taskvoila_country_v3",
  "taskvoila_country_v4",
  "taskvoila_country_v5",
  "taskvoila_lang_v5",
  "taskvoila_lang_v6",
  "taskvoila_lang",
];
const EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Migrate: clear old keys so the country selector shows again
if (typeof window !== "undefined") {
  for (const oldKey of OLD_STORAGE_KEYS) {
    try {
      localStorage.removeItem(oldKey);
    } catch {
      // ignore
    }
  }
}

type StoredCountry = {
  code: string;
  lang: Language;
  timestamp: number;
  countryChangesUsed: number;
};

function readFromStorage(): StoredCountry | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredCountry;
    if (!parsed.code || !parsed.lang || !parsed.timestamp) return null;
    if (Date.now() - parsed.timestamp > EXPIRY_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    // Backfill countryChangesUsed if missing (migration from v4)
    if (typeof parsed.countryChangesUsed !== "number") {
      parsed.countryChangesUsed = 0;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeToStorage(
  code: string,
  lang: Language,
  countryChangesUsed: number,
): void {
  try {
    const data: StoredCountry = {
      code,
      lang,
      timestamp: Date.now(),
      countryChangesUsed,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

type CountryStoreContextType = {
  selectedCountry: string | null;
  selectedLang: Language;
  isCountrySelected: boolean;
  canChangeCountry: boolean;
  setCountry: (code: string, lang: Language) => void;
  changeCountry: (code: string, lang: Language) => void;
  clearCountry: () => void;
};

const CountryStoreContext = createContext<CountryStoreContextType | undefined>(
  undefined,
);

export function clearCountryStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    for (const oldKey of OLD_STORAGE_KEYS) {
      localStorage.removeItem(oldKey);
    }
  } catch {
    // ignore
  }
}

function getInitialState(): {
  code: string | null;
  lang: Language;
  countryChangesUsed: number;
} {
  const stored = readFromStorage();
  if (stored) {
    return {
      code: stored.code,
      lang: stored.lang,
      countryChangesUsed: stored.countryChangesUsed,
    };
  }
  return { code: null, lang: "fr", countryChangesUsed: 0 };
}

export function CountryStoreProvider({ children }: { children: ReactNode }) {
  const initial = getInitialState();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(
    initial.code,
  );
  const [selectedLang, setSelectedLang] = useState<Language>(initial.lang);
  const [countryChangesUsed, setCountryChangesUsed] = useState<number>(
    initial.countryChangesUsed,
  );

  // Initial selection — does NOT consume the change quota
  const setCountry = useCallback(
    (code: string, lang: Language) => {
      setSelectedCountry(code);
      setSelectedLang(lang);
      writeToStorage(code, lang, countryChangesUsed);
    },
    [countryChangesUsed],
  );

  // Voluntary country change from profile — consumes 1 quota slot
  const changeCountry = useCallback(
    (code: string, lang: Language) => {
      const newChangesUsed = countryChangesUsed + 1;
      setCountryChangesUsed(newChangesUsed);
      setSelectedCountry(code);
      setSelectedLang(lang);
      writeToStorage(code, lang, newChangesUsed);
    },
    [countryChangesUsed],
  );

  const clearCountry = useCallback(() => {
    setSelectedCountry(null);
    setSelectedLang("en"); // neutral default so lang selector shows properly
    setCountryChangesUsed(0);
    try {
      localStorage.removeItem(STORAGE_KEY);
      for (const oldKey of OLD_STORAGE_KEYS) {
        localStorage.removeItem(oldKey);
      }
    } catch {
      // ignore
    }
  }, []);

  const isCountrySelected = selectedCountry !== null;
  const canChangeCountry = countryChangesUsed < 1;

  return createElement(
    CountryStoreContext.Provider,
    {
      value: {
        selectedCountry,
        selectedLang,
        isCountrySelected,
        canChangeCountry,
        setCountry,
        changeCountry,
        clearCountry,
      },
    },
    children,
  );
}

export function useCountryStore() {
  const ctx = useContext(CountryStoreContext);
  if (!ctx) {
    throw new Error("useCountryStore must be used within CountryStoreProvider");
  }
  return ctx;
}

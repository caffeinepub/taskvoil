import { useCountryStore } from "@/lib/country-store";
import { useCallback, useEffect, useRef, useState } from "react";

export type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    hamlet?: string;
    suburb?: string;
    county?: string;
    state?: string;
    country?: string;
  };
};

const LANG_MAP: Record<string, string> = {
  fr: "fr",
  en: "en",
  de: "de",
  es: "es",
  it: "it",
  pt: "pt",
  nl: "nl",
  el: "el",
  ie: "en",
};

export function useNominatim() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { selectedLang } = useCountryStore();

  const search = useCallback(
    (q: string) => {
      setQuery(q);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!q.trim() || q.trim().length < 2) {
        setResults([]);
        return;
      }
      debounceRef.current = setTimeout(async () => {
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();
        setLoading(true);
        try {
          const lang = LANG_MAP[selectedLang] ?? "en";
          const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=6&addressdetails=1&accept-language=${lang}`;
          const res = await fetch(url, {
            signal: abortRef.current.signal,
            headers: {
              "Accept-Language": lang,
              "User-Agent": "TaskVoila/1.0 (hi@taskvoila.com)",
            },
          });
          const data = (await res.json()) as NominatimResult[];
          setResults(data);
        } catch (e) {
          if ((e as Error).name !== "AbortError") setResults([]);
        } finally {
          setLoading(false);
        }
      }, 300);
    },
    [selectedLang],
  );

  const clear = useCallback(() => {
    setQuery("");
    setResults([]);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return { query, results, loading, search, clear };
}

/** Geocode a single address string → { lat, lon } or null */
export async function geocodeAddress(
  address: string,
): Promise<{ lat: number; lon: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "TaskVoila/1.0 (hi@taskvoila.com)" },
    });
    const data = (await res.json()) as NominatimResult[];
    if (data.length === 0) return null;
    return {
      lat: Number.parseFloat(data[0].lat),
      lon: Number.parseFloat(data[0].lon),
    };
  } catch {
    return null;
  }
}

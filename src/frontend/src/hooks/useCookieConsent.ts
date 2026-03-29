import { useCallback, useState } from "react";

const STORAGE_KEY = "tv_cookie_consent";

export interface CookieConsent {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  personalisation: boolean;
  decided: boolean;
}

const DEFAULT_CONSENT: CookieConsent = {
  essential: true,
  analytics: false,
  marketing: false,
  personalisation: false,
  decided: false,
};

function readConsent(): CookieConsent {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONSENT;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CONSENT, ...parsed, essential: true };
  } catch {
    return DEFAULT_CONSENT;
  }
}

function writeConsent(consent: CookieConsent): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch {
    // ignore
  }
}

export function useCookieConsent() {
  const [consent, setConsentState] = useState<CookieConsent>(readConsent);

  const persistConsent = useCallback((next: CookieConsent) => {
    writeConsent(next);
    setConsentState(next);
  }, []);

  const acceptAll = useCallback(() => {
    persistConsent({
      essential: true,
      analytics: true,
      marketing: true,
      personalisation: true,
      decided: true,
    });
  }, [persistConsent]);

  const rejectAll = useCallback(() => {
    persistConsent({
      essential: true,
      analytics: false,
      marketing: false,
      personalisation: false,
      decided: true,
    });
  }, [persistConsent]);

  const savePreferences = useCallback(
    (
      prefs: Pick<CookieConsent, "analytics" | "marketing" | "personalisation">,
    ) => {
      persistConsent({
        essential: true,
        ...prefs,
        decided: true,
      });
    },
    [persistConsent],
  );

  return {
    consent,
    acceptAll,
    rejectAll,
    savePreferences,
    hasDecided: consent.decided,
  };
}

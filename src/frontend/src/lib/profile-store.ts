/**
 * Profile Store – stores profile photo and cover image per user (base64 data URLs)
 * Also handles contact-info detection/blocking for profile descriptions.
 */
import {
  type ReactNode,
  createContext,
  createElement,
  useCallback,
  useContext,
  useState,
} from "react";

// ─── Contact Info Detection ───────────────────────────────────────────────────

const PHONE_REGEX =
  /(\+?\d[\s\-.]?){7,15}|\b0[0-9](\s?\d{2}){4}\b|\b\d{2}[\s.]\d{2}[\s.]\d{2}[\s.]\d{2}[\s.]\d{2}\b/g;
const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const URL_REGEX =
  /(?:https?:\/\/|www\.)[^\s"'<>]+|(?:[a-zA-Z0-9\-]+\.(?:com|fr|be|ie|de|es|it|pt|nl|uk|net|org|io|co))\b/gi;
// Common obfuscation patterns
const OBFUSCATED_PHONE_REGEX = /(\d[\s\-._/|]{0,3}){7,}/g;

export function detectContactInfo(text: string): {
  hasContact: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  if (PHONE_REGEX.test(text)) violations.push("phone");
  if (EMAIL_REGEX.test(text)) violations.push("email");
  if (URL_REGEX.test(text)) violations.push("url");
  // reset lastIndex
  PHONE_REGEX.lastIndex = 0;
  EMAIL_REGEX.lastIndex = 0;
  URL_REGEX.lastIndex = 0;
  if (OBFUSCATED_PHONE_REGEX.test(text)) {
    OBFUSCATED_PHONE_REGEX.lastIndex = 0;
    if (!violations.includes("phone")) violations.push("phone");
  }
  return { hasContact: violations.length > 0, violations };
}

export function sanitizeContactInfo(text: string): string {
  let sanitized = text;
  sanitized = sanitized.replace(PHONE_REGEX, "***");
  sanitized = sanitized.replace(EMAIL_REGEX, "***@***.***");
  sanitized = sanitized.replace(URL_REGEX, "[lien supprimé]");
  // Reset
  PHONE_REGEX.lastIndex = 0;
  EMAIL_REGEX.lastIndex = 0;
  URL_REGEX.lastIndex = 0;
  return sanitized;
}

// ─── Store Types ──────────────────────────────────────────────────────────────

export type UserProfileImages = {
  avatarDataUrl?: string; // base64 data URL
  coverDataUrl?: string; // base64 data URL
};

type ProfileStoreState = {
  profiles: Record<string, UserProfileImages>; // keyed by userId
};

type ProfileStoreContextType = {
  getProfile: (userId: string) => UserProfileImages;
  setAvatar: (userId: string, dataUrl: string) => void;
  setCover: (userId: string, dataUrl: string) => void;
  removeAvatar: (userId: string) => void;
  removeCover: (userId: string) => void;
};

const ProfileStoreContext = createContext<ProfileStoreContextType | null>(null);

const STORAGE_KEY = "taskvoila_profiles_v1";

function loadFromStorage(): ProfileStoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ProfileStoreState;
  } catch {
    // ignore
  }
  return { profiles: {} };
}

function saveToStorage(state: ProfileStoreState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore (storage full if images are large)
  }
}

export function ProfileStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProfileStoreState>(loadFromStorage);

  const getProfile = useCallback(
    (userId: string): UserProfileImages => {
      return state.profiles[userId] ?? {};
    },
    [state],
  );

  const setAvatar = useCallback((userId: string, dataUrl: string) => {
    setState((prev) => {
      const next: ProfileStoreState = {
        profiles: {
          ...prev.profiles,
          [userId]: { ...prev.profiles[userId], avatarDataUrl: dataUrl },
        },
      };
      saveToStorage(next);
      return next;
    });
  }, []);

  const setCover = useCallback((userId: string, dataUrl: string) => {
    setState((prev) => {
      const next: ProfileStoreState = {
        profiles: {
          ...prev.profiles,
          [userId]: { ...prev.profiles[userId], coverDataUrl: dataUrl },
        },
      };
      saveToStorage(next);
      return next;
    });
  }, []);

  const removeAvatar = useCallback((userId: string) => {
    setState((prev) => {
      const profile = { ...prev.profiles[userId] };
      profile.avatarDataUrl = undefined;
      const next: ProfileStoreState = {
        profiles: { ...prev.profiles, [userId]: profile },
      };
      saveToStorage(next);
      return next;
    });
  }, []);

  const removeCover = useCallback((userId: string) => {
    setState((prev) => {
      const profile = { ...prev.profiles[userId] };
      profile.coverDataUrl = undefined;
      const next: ProfileStoreState = {
        profiles: { ...prev.profiles, [userId]: profile },
      };
      saveToStorage(next);
      return next;
    });
  }, []);

  return createElement(
    ProfileStoreContext.Provider,
    {
      value: { getProfile, setAvatar, setCover, removeAvatar, removeCover },
    },
    children,
  );
}

export function useProfileStore() {
  const ctx = useContext(ProfileStoreContext);
  if (!ctx)
    throw new Error("useProfileStore must be used within ProfileStoreProvider");
  return ctx;
}

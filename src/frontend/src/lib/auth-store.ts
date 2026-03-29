import {
  type ReactNode,
  createContext,
  createElement,
  useCallback,
  useContext,
  useState,
} from "react";

const SESSION_KEY = "taskvoila_session";

export interface CurrentUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  pseudo?: string;
  phone?: string;
  role: "client" | "pro" | "admin";
  country: string;
  language: string;
  createdAt: number;
  status: string;
  emailVerified: boolean;
  lockType?: "none" | "pin" | "biometric";
  icpPrincipal?: string;
  profileComplete?: boolean;
  approvalStatus?: "pending_approval" | "approved" | "suspended";
  // Address fields
  address?: string;
  postalCode?: string;
  city?: string;
  fullAddress?: string; // street + postal code, private
  // Pro-only fields
  companyName?: string;
  businessDescription?: string;
  serviceCategories?: string[];
  coverageArea?: string;
  website?: string;
  legalId?: string;
  vatNumber?: string;
  // KYC / verification documents
  idDocumentUrl?: string;
  registrationDocUrl?: string;
  verificationStatus?: "pending" | "verified" | "rejected";
  // DAC7 / tax compliance fields (pro only)
  dateOfBirth?: string;
  proStatus?: string; // "sole_trader" | "auto_entrepreneur" | "self_employed" | "limited_company" | "other"
  iban?: string; // AES-256 encrypted
  ibanLocked?: boolean;
  taxResidenceCountry?: string;
  dac7Accepted?: boolean;
  taxId?: string; // adaptive tax ID per country x proStatus
}

/**
 * Returns true when all required profile fields are filled.
 * - Pro: requires dac7Accepted, iban, proStatus on top of base fields
 * - Client: requires firstName, lastName, phone, city (fullAddress NOT required for completeness)
 */
export function isProfileComplete(user: CurrentUser | null): boolean {
  if (!user) return false;
  if (user.role === "pro") {
    const baseReqs = [
      user.pseudo,
      user.firstName,
      user.lastName,
      user.phone,
      user.city,
    ];
    const baseOk = baseReqs.every(
      (v) => typeof v === "string" && v.trim().length > 0,
    );
    return (
      baseOk && user.dac7Accepted === true && !!user.iban && !!user.proStatus
    );
  }
  // client / particular
  const required = [
    user.pseudo ?? user.firstName,
    user.firstName,
    user.lastName,
    user.phone,
    user.city,
  ];
  return required.every((v) => typeof v === "string" && v.trim().length > 0);
}

type AuthStoreContextType = {
  currentUser: CurrentUser | null;
  loginUser: (user: CurrentUser) => void;
  logoutUser: () => void;
  updateUser: (partial: Partial<CurrentUser>) => void;
};

const AuthStoreContext = createContext<AuthStoreContextType | undefined>(
  undefined,
);

function loadSession(): CurrentUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CurrentUser;
  } catch {
    return null;
  }
}

export function AuthStoreProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(
    loadSession,
  );

  const loginUser = useCallback((user: CurrentUser) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    if (user.icpPrincipal) {
      localStorage.setItem(
        `taskvoila_profile_${user.icpPrincipal}`,
        JSON.stringify(user),
      );
    }
    setCurrentUser(user);
  }, []);

  const logoutUser = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  }, []);

  const updateUser = useCallback((partial: Partial<CurrentUser>) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      if (updated.icpPrincipal) {
        localStorage.setItem(
          `taskvoila_profile_${updated.icpPrincipal}`,
          JSON.stringify(updated),
        );
      }
      return updated;
    });
  }, []);

  return createElement(
    AuthStoreContext.Provider,
    { value: { currentUser, loginUser, logoutUser, updateUser } },
    children,
  );
}

export function useAuthStore() {
  const ctx = useContext(AuthStoreContext);
  if (!ctx) {
    throw new Error("useAuthStore must be used within AuthStoreProvider");
  }
  return ctx;
}

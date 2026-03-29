import {
  type ReactNode,
  createContext,
  createElement,
  useCallback,
  useContext,
  useState,
} from "react";

// ── KYC identifier types per country ─────────────────────────────────────────

export type KYCIdType =
  | "SIRET"
  | "VAT_BE"
  | "VAT_LU"
  | "COMPANY_NUMBER_GB"
  | "CRO_IE"
  | "HANDELSREGISTER_DE"
  | "CIF_NIF_ES"
  | "PARTITA_IVA_IT"
  | "NIF_PT"
  | "AFM_GR"
  | "UID_CH"
  | "KVK_NL";

export type KYCStatus = "unverified" | "pending" | "verified" | "rejected";

export type KYCRequest = {
  userId: string;
  idType: KYCIdType;
  idNumber: string;
  country: string;
  submittedAt: string;
  status: KYCStatus;
  documentUrl?: string;
  rejectionReason?: string;
};

/** Maps a country code to the appropriate KYC identifier type */
export const COUNTRY_KYC_MAP: Record<string, KYCIdType> = {
  FR: "SIRET",
  BE: "VAT_BE",
  LU: "VAT_LU",
  GB: "COMPANY_NUMBER_GB",
  IE: "CRO_IE",
  DE: "HANDELSREGISTER_DE",
  ES: "CIF_NIF_ES",
  IT: "PARTITA_IVA_IT",
  PT: "NIF_PT",
  GR: "AFM_GR",
  CH: "UID_CH",
  NL: "KVK_NL",
};

/** Maps KYC type to its display key in translations.kyc.countryCodes */
export const KYC_ID_TYPE_LABEL: Record<
  KYCIdType,
  keyof {
    FR: string;
    BE: string;
    LU: string;
    GB: string;
    IE: string;
    DE: string;
    ES: string;
    IT: string;
    PT: string;
    GR: string;
    CH: string;
    NL: string;
  }
> = {
  SIRET: "FR",
  VAT_BE: "BE",
  VAT_LU: "LU",
  COMPANY_NUMBER_GB: "GB",
  CRO_IE: "IE",
  HANDELSREGISTER_DE: "DE",
  CIF_NIF_ES: "ES",
  PARTITA_IVA_IT: "IT",
  NIF_PT: "PT",
  AFM_GR: "GR",
  UID_CH: "CH",
  KVK_NL: "NL",
};

/** Validation regex per KYC type */
export const KYC_VALIDATION: Record<KYCIdType, RegExp> = {
  SIRET: /^\d{14}$|^\d{3}\s?\d{3}\s?\d{3}\s?\d{5}$/,
  VAT_BE: /^BE\s?0\d{9}$/i,
  VAT_LU: /^LU\d{8}$/i,
  COMPANY_NUMBER_GB: /^[A-Z]{2}\d{6}$|^\d{8}$/i,
  CRO_IE: /^\d{5,6}$/,
  HANDELSREGISTER_DE: /^HRB?\s?\d{1,6}|^HRA\s?\d{1,6}/i,
  CIF_NIF_ES: /^[A-Z]\d{7}[A-Z0-9]$|^\d{8}[A-Z]$/i,
  PARTITA_IVA_IT: /^IT\d{11}$|^\d{11}$/i,
  NIF_PT: /^\d{9}$/,
  AFM_GR: /^\d{9}$/,
  UID_CH: /^CHE-\d{3}\.\d{3}\.\d{3}$|^CHE\d{9}$/i,
  KVK_NL: /^\d{8}$/,
};

// ── Store ─────────────────────────────────────────────────────────────────────

type KYCStoreContextType = {
  myKYC: KYCRequest | null;
  allRequests: KYCRequest[];
  submitKYC: (req: Omit<KYCRequest, "submittedAt" | "status">) => void;
  approveKYC: (userId: string) => void;
  rejectKYC: (userId: string, reason?: string) => void;
  getKYCForUser: (userId: string) => KYCRequest | null;
};

const KYCStoreContext = createContext<KYCStoreContextType | undefined>(
  undefined,
);

export function KYCStoreProvider({ children }: { children: ReactNode }) {
  const [myKYC, setMyKYC] = useState<KYCRequest | null>(null);

  const [allRequests, setAllRequests] = useState<KYCRequest[]>([]);

  const submitKYC = useCallback(
    (req: Omit<KYCRequest, "submittedAt" | "status">) => {
      const newReq: KYCRequest = {
        ...req,
        submittedAt: new Date().toISOString(),
        status: "pending",
      };
      setMyKYC(newReq);
      setAllRequests((prev) => {
        const filtered = prev.filter((r) => r.userId !== req.userId);
        return [...filtered, newReq];
      });
    },
    [],
  );

  const approveKYC = useCallback((userId: string) => {
    setAllRequests((prev) =>
      prev.map((r) => (r.userId === userId ? { ...r, status: "verified" } : r)),
    );
    setMyKYC((prev) =>
      prev && prev.userId === userId ? { ...prev, status: "verified" } : prev,
    );
  }, []);

  const rejectKYC = useCallback((userId: string, reason?: string) => {
    setAllRequests((prev) =>
      prev.map((r) =>
        r.userId === userId
          ? { ...r, status: "rejected", rejectionReason: reason }
          : r,
      ),
    );
    setMyKYC((prev) =>
      prev && prev.userId === userId
        ? { ...prev, status: "rejected", rejectionReason: reason }
        : prev,
    );
  }, []);

  const getKYCForUser = useCallback(
    (userId: string): KYCRequest | null => {
      if (myKYC && myKYC.userId === userId) return myKYC;
      return allRequests.find((r) => r.userId === userId) ?? null;
    },
    [myKYC, allRequests],
  );

  return createElement(
    KYCStoreContext.Provider,
    {
      value: {
        myKYC,
        allRequests,
        submitKYC,
        approveKYC,
        rejectKYC,
        getKYCForUser,
      },
    },
    children,
  );
}

export function useKYCStore() {
  const ctx = useContext(KYCStoreContext);
  if (!ctx) {
    throw new Error("useKYCStore must be used within KYCStoreProvider");
  }
  return ctx;
}

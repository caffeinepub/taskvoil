/**
 * Promo Store — manages discount codes and loyalty system.
 */
import {
  type ReactNode,
  createContext,
  createElement,
  useContext,
  useState,
} from "react";

export type PromoType = "percent" | "fixed";
export type PromoTarget = "all" | "client" | "pro" | "new_user";

export type PromoCode = {
  id: number;
  code: string;
  type: PromoType;
  value: number; // e.g. 20 for 20% or 10 for 10€
  usageLimit: number; // 0 = unlimited
  usageCount: number;
  expiresAt: string | null; // ISO or null
  targetRole: PromoTarget;
  active: boolean;
  createdAt: string;
  descriptionFR: string;
  descriptionEN: string;
};

// Seed data
const SEED_PROMOS: PromoCode[] = [
  {
    id: 1,
    code: "BIENVENUE20",
    type: "percent",
    value: 20,
    usageLimit: 500,
    usageCount: 143,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    targetRole: "new_user",
    active: true,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    descriptionFR: "20% de réduction pour les nouveaux utilisateurs",
    descriptionEN: "20% off for new users",
  },
  {
    id: 2,
    code: "PRO10",
    type: "percent",
    value: 10,
    usageLimit: 0,
    usageCount: 67,
    expiresAt: null,
    targetRole: "pro",
    active: true,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    descriptionFR:
      "10% de réduction pour les professionnels sur leur 1ère mission",
    descriptionEN: "10% off for pros on their first mission",
  },
  {
    id: 3,
    code: "FIDELITE25",
    type: "fixed",
    value: 25,
    usageLimit: 200,
    usageCount: 38,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    targetRole: "client",
    active: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    descriptionFR: "25€ de réduction pour les clients fidèles",
    descriptionEN: "25€ off for loyal clients",
  },
  {
    id: 4,
    code: "SUMMER50",
    type: "percent",
    value: 50,
    usageLimit: 100,
    usageCount: 100,
    expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    targetRole: "all",
    active: false,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    descriptionFR: "50% de réduction été — expiré",
    descriptionEN: "50% summer discount — expired",
  },
];

type PromoStoreCtx = {
  promoCodes: PromoCode[];
  validateCode: (
    code: string,
    amount: number,
    userRole?: string,
  ) => { valid: boolean; discount: number; message: string; promo?: PromoCode };
  createPromoCode: (
    data: Omit<PromoCode, "id" | "usageCount" | "createdAt">,
  ) => void;
  togglePromoCode: (id: number) => void;
  deletePromoCode: (id: number) => void;
  incrementUsage: (code: string) => void;
};

const PromoStoreContext = createContext<PromoStoreCtx | undefined>(undefined);

export function PromoStoreProvider({ children }: { children: ReactNode }) {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(SEED_PROMOS);

  function validateCode(
    code: string,
    amount: number,
    _userRole?: string,
  ): { valid: boolean; discount: number; message: string; promo?: PromoCode } {
    const promo = promoCodes.find(
      (p) => p.code.toUpperCase() === code.toUpperCase(),
    );

    if (!promo) {
      return { valid: false, discount: 0, message: "Code promo invalide" };
    }

    if (!promo.active) {
      return {
        valid: false,
        discount: 0,
        message: "Ce code promo est désactivé",
      };
    }

    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return { valid: false, discount: 0, message: "Ce code promo a expiré" };
    }

    if (promo.usageLimit > 0 && promo.usageCount >= promo.usageLimit) {
      return {
        valid: false,
        discount: 0,
        message: "Ce code promo a atteint sa limite d'utilisation",
      };
    }

    const discount =
      promo.type === "percent"
        ? Math.round((amount * promo.value) / 100)
        : Math.min(promo.value, amount);

    return {
      valid: true,
      discount,
      message: `Code appliqué : -${promo.type === "percent" ? `${promo.value}%` : `${promo.value}€`}`,
      promo,
    };
  }

  function createPromoCode(
    data: Omit<PromoCode, "id" | "usageCount" | "createdAt">,
  ): void {
    const newPromo: PromoCode = {
      ...data,
      id: Date.now(),
      usageCount: 0,
      createdAt: new Date().toISOString(),
    };
    setPromoCodes((prev) => [newPromo, ...prev]);
  }

  function togglePromoCode(id: number): void {
    setPromoCodes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)),
    );
  }

  function deletePromoCode(id: number): void {
    setPromoCodes((prev) => prev.filter((p) => p.id !== id));
  }

  function incrementUsage(code: string): void {
    setPromoCodes((prev) =>
      prev.map((p) =>
        p.code.toUpperCase() === code.toUpperCase()
          ? { ...p, usageCount: p.usageCount + 1 }
          : p,
      ),
    );
  }

  return createElement(
    PromoStoreContext.Provider,
    {
      value: {
        promoCodes,
        validateCode,
        createPromoCode,
        togglePromoCode,
        deletePromoCode,
        incrementUsage,
      },
    },
    children,
  );
}

export function usePromoStore() {
  const ctx = useContext(PromoStoreContext);
  if (!ctx)
    throw new Error("usePromoStore must be used within PromoStoreProvider");
  return ctx;
}

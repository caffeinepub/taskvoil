/**
 * Subscription Store — manages Pro subscription plans (Solo, Team, Enterprise).
 */
import {
  type ReactNode,
  createContext,
  createElement,
  useContext,
  useState,
} from "react";

export type SubscriptionPlan = "solo" | "team" | "enterprise";

export type Subscription = {
  userId: string;
  plan: SubscriptionPlan;
  status: "active" | "cancelled" | "trial";
  startedAt: string;
  renewsAt: string;
  price: number; // monthly in EUR
  aiAssistantEnabled: boolean;
  carouselEnabled: boolean;
};

export const PLAN_DETAILS: Record<
  SubscriptionPlan,
  {
    labelFR: string;
    labelEN: string;
    price: number;
    descFR: string;
    descEN: string;
    features: { fr: string; en: string }[];
    badge?: string;
  }
> = {
  solo: {
    labelFR: "Indépendant",
    labelEN: "Solo",
    price: 0,
    descFR: "Pour démarrer gratuitement",
    descEN: "Start for free",
    features: [
      { fr: "Profil de base", en: "Basic profile" },
      { fr: "Répondre aux missions", en: "Reply to tasks" },
      { fr: "Messagerie on-chain", en: "On-chain messaging" },
    ],
  },
  team: {
    labelFR: "Pro Équipe",
    labelEN: "Pro Team",
    price: 29,
    descFR: "Pour les entreprises avec employés",
    descEN: "For companies with employees",
    badge: "Populaire",
    features: [
      { fr: "Tout du plan Solo", en: "Everything in Solo" },
      { fr: "Jusqu'à 10 employés", en: "Up to 10 employees" },
      { fr: "Calendrier partagé équipe", en: "Shared team calendar" },
      { fr: "Assistant IA (19€/mois inclus)", en: "AI Assistant (included)" },
      { fr: "Badge vérifié Pro Équipe", en: "Pro Team verified badge" },
      { fr: "Carrousel homepage", en: "Homepage carousel" },
      { fr: "Statistiques avancées", en: "Advanced statistics" },
    ],
  },
  enterprise: {
    labelFR: "Grand Groupe",
    labelEN: "Enterprise",
    price: 199,
    descFR: "Pour les franchises et grandes entreprises",
    descEN: "For franchises and large companies",
    features: [
      { fr: "Tout du plan Pro Équipe", en: "Everything in Pro Team" },
      { fr: "Agences multiples", en: "Multiple agencies" },
      { fr: "Branding complet (logo, couleurs)", en: "Full branding" },
      { fr: "Stats globales + par agence", en: "Global + per-agency stats" },
      { fr: "Account manager dédié", en: "Dedicated account manager" },
      { fr: "API partenaires (bientôt)", en: "Partner API (soon)" },
      { fr: "Priorité dans les résultats", en: "Priority in search results" },
    ],
  },
};

type SubscriptionStoreCtx = {
  subscriptions: Subscription[];
  getMySubscription: (userId: string) => Subscription | null;
  upgradePlan: (userId: string, plan: SubscriptionPlan) => void;
  cancelSubscription: (userId: string) => void;
  toggleAiAssistant: (userId: string, enabled: boolean) => void;
  getPremiumPros: () => string[]; // user ids with active paid plans
};

const SubscriptionStoreContext = createContext<
  SubscriptionStoreCtx | undefined
>(undefined);

export function SubscriptionStoreProvider({
  children,
}: { children: ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  function getMySubscription(userId: string): Subscription | null {
    return subscriptions.find((s) => s.userId === userId) ?? null;
  }

  function upgradePlan(userId: string, plan: SubscriptionPlan): void {
    const existing = subscriptions.find((s) => s.userId === userId);
    const now = new Date().toISOString();
    const renewsAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString();
    if (existing) {
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.userId === userId
            ? {
                ...s,
                plan,
                status: "active" as const,
                startedAt: now,
                renewsAt,
                price: PLAN_DETAILS[plan].price,
                aiAssistantEnabled: plan !== "solo",
                carouselEnabled: plan !== "solo",
              }
            : s,
        ),
      );
    } else {
      setSubscriptions((prev) => [
        ...prev,
        {
          userId,
          plan,
          status: "active",
          startedAt: now,
          renewsAt,
          price: PLAN_DETAILS[plan].price,
          aiAssistantEnabled: plan !== "solo",
          carouselEnabled: plan !== "solo",
        },
      ]);
    }
  }

  function cancelSubscription(userId: string): void {
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.userId === userId ? { ...s, status: "cancelled" as const } : s,
      ),
    );
  }

  function toggleAiAssistant(userId: string, enabled: boolean): void {
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.userId === userId ? { ...s, aiAssistantEnabled: enabled } : s,
      ),
    );
  }

  function getPremiumPros(): string[] {
    return subscriptions
      .filter(
        (s) =>
          (s.plan === "team" || s.plan === "enterprise") &&
          s.status === "active",
      )
      .map((s) => s.userId);
  }

  return createElement(
    SubscriptionStoreContext.Provider,
    {
      value: {
        subscriptions,
        getMySubscription,
        upgradePlan,
        cancelSubscription,
        toggleAiAssistant,
        getPremiumPros,
      },
    },
    children,
  );
}

export function useSubscriptionStore() {
  const ctx = useContext(SubscriptionStoreContext);
  if (!ctx)
    throw new Error(
      "useSubscriptionStore must be used within SubscriptionStoreProvider",
    );
  return ctx;
}

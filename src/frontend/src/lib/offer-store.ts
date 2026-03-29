import {
  type ReactNode,
  createContext,
  createElement,
  useCallback,
  useContext,
  useState,
} from "react";
import { useActor } from "../hooks/useActor";

export type OfferStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export interface Offer {
  id: string;
  missionId: string;
  proId: string;
  proPseudo: string;
  proCompany?: string;
  price: number;
  description: string;
  timeline: string;
  status: OfferStatus;
  createdAt: string;
}

interface OfferMeta {
  proPseudo: string;
  proCompany?: string;
}

const LS_KEY = "taskvoila_offers";

function loadOffers(): Offer[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Offer[];
  } catch {
    return [];
  }
}

function saveOffers(offers: Offer[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(offers));
  } catch {
    // ignore
  }
}

function saveOfferMeta(id: string, meta: OfferMeta): void {
  try {
    localStorage.setItem(`taskvoila_offer_meta_${id}`, JSON.stringify(meta));
  } catch {
    // ignore
  }
}

type OfferStoreContextType = {
  offers: Offer[];
  isLoading: boolean;
  error: string | null;
  submitOffer: (data: Omit<Offer, "id" | "createdAt">) => Promise<Offer>;
  getOffersForMission: (missionId: string) => Offer[];
  getAcceptedOffer: (missionId: string) => Offer | undefined;
  acceptOffer: (offerId: string) => Promise<void>;
  rejectOffer: (offerId: string) => Promise<void>;
  getOffersByPro: (proId: string) => Offer[];
  hasProSubmittedOffer: (missionId: string, proId: string) => boolean;
};

const OfferStoreContext = createContext<OfferStoreContextType | undefined>(
  undefined,
);

export function OfferStoreProvider({ children }: { children: ReactNode }) {
  const [offers, setOffers] = useState<Offer[]>(loadOffers);
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const { actor } = useActor();

  const submitOffer = useCallback(
    async (data: Omit<Offer, "id" | "createdAt">): Promise<Offer> => {
      if (actor) {
        try {
          const backendId = await (actor as any).submitOffer(
            BigInt(data.missionId),
            BigInt(data.price),
            data.description,
            data.timeline,
          );
          const id = String(Number(backendId as bigint));
          const meta: OfferMeta = {
            proPseudo: data.proPseudo,
            proCompany: data.proCompany,
          };
          saveOfferMeta(id, meta);
          const offer: Offer = {
            ...data,
            id,
            createdAt: new Date().toISOString(),
          };
          setOffers((prev) => {
            const updated = [offer, ...prev];
            saveOffers(updated);
            return updated;
          });
          return offer;
        } catch {
          // Fall through to localStorage fallback
        }
      }
      // localStorage fallback
      const offer: Offer = {
        ...data,
        id: `offer_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date().toISOString(),
      };
      setOffers((prev) => {
        const updated = [offer, ...prev];
        saveOffers(updated);
        return updated;
      });
      return offer;
    },
    [actor],
  );

  const getOffersForMission = useCallback(
    (missionId: string): Offer[] => {
      return offers
        .filter((o) => o.missionId === missionId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    },
    [offers],
  );

  const getAcceptedOffer = useCallback(
    (missionId: string): Offer | undefined => {
      return offers.find(
        (o) => o.missionId === missionId && o.status === "accepted",
      );
    },
    [offers],
  );

  const acceptOffer = useCallback(
    async (offerId: string): Promise<void> => {
      if (actor) {
        try {
          await (actor as any).acceptOffer(BigInt(offerId));
        } catch {
          // Fall through to local update
        }
      }
      setOffers((prev) => {
        const targetOffer = prev.find((o) => o.id === offerId);
        if (!targetOffer) return prev;
        const updated = prev.map((o) => {
          if (o.id === offerId)
            return { ...o, status: "accepted" as OfferStatus };
          if (o.missionId === targetOffer.missionId && o.status === "pending")
            return { ...o, status: "rejected" as OfferStatus };
          return o;
        });
        saveOffers(updated);
        return updated;
      });
    },
    [actor],
  );

  const rejectOffer = useCallback(
    async (offerId: string): Promise<void> => {
      if (actor) {
        try {
          await (actor as any).rejectOffer(BigInt(offerId));
        } catch {
          // Fall through to local update
        }
      }
      setOffers((prev) => {
        const updated = prev.map((o) =>
          o.id === offerId ? { ...o, status: "rejected" as OfferStatus } : o,
        );
        saveOffers(updated);
        return updated;
      });
    },
    [actor],
  );

  const getOffersByPro = useCallback(
    (proId: string): Offer[] => {
      return offers
        .filter((o) => o.proId === proId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    },
    [offers],
  );

  const hasProSubmittedOffer = useCallback(
    (missionId: string, proId: string): boolean => {
      return offers.some(
        (o) =>
          o.missionId === missionId &&
          o.proId === proId &&
          o.status !== "withdrawn",
      );
    },
    [offers],
  );

  return createElement(
    OfferStoreContext.Provider,
    {
      value: {
        offers,
        isLoading,
        error,
        submitOffer,
        getOffersForMission,
        getAcceptedOffer,
        acceptOffer,
        rejectOffer,
        getOffersByPro,
        hasProSubmittedOffer,
      },
    },
    children,
  );
}

export function useOfferStore() {
  const ctx = useContext(OfferStoreContext);
  if (!ctx) {
    throw new Error("useOfferStore must be used within OfferStoreProvider");
  }
  return ctx;
}

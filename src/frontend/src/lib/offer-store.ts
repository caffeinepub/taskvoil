import {
  type ReactNode,
  createContext,
  createElement,
  useCallback,
  useContext,
  useState,
} from "react";

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

type OfferStoreContextType = {
  offers: Offer[];
  submitOffer: (data: Omit<Offer, "id" | "createdAt">) => Offer;
  getOffersForMission: (missionId: string) => Offer[];
  getAcceptedOffer: (missionId: string) => Offer | undefined;
  acceptOffer: (offerId: string) => void;
  rejectOffer: (offerId: string) => void;
  getOffersByPro: (proId: string) => Offer[];
  hasProSubmittedOffer: (missionId: string, proId: string) => boolean;
};

const OfferStoreContext = createContext<OfferStoreContextType | undefined>(
  undefined,
);

export function OfferStoreProvider({ children }: { children: ReactNode }) {
  const [offers, setOffers] = useState<Offer[]>(loadOffers);

  const submitOffer = useCallback(
    (data: Omit<Offer, "id" | "createdAt">): Offer => {
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
    [],
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

  const acceptOffer = useCallback((offerId: string): void => {
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
  }, []);

  const rejectOffer = useCallback((offerId: string): void => {
    setOffers((prev) => {
      const updated = prev.map((o) =>
        o.id === offerId ? { ...o, status: "rejected" as OfferStatus } : o,
      );
      saveOffers(updated);
      return updated;
    });
  }, []);

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

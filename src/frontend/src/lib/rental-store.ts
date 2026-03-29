import {
  type ReactNode,
  createContext,
  createElement,
  useCallback,
  useContext,
  useState,
} from "react";

export type RentalCondition = "good" | "very_good" | "new_item";
export type RentalStatus = "active" | "inactive" | "deleted";
export type RentalRequestStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled";

export interface RentalListing {
  id: number;
  ownerId: string;
  ownerCountry: string;
  title: string;
  description: string;
  photos: string[];
  categoryId: string;
  subcategoryId: string;
  pricePerDay: number;
  pricePerHalfDay: number;
  deposit: number;
  availabilityDates: string[];
  city: string;
  condition: RentalCondition;
  deliveryAvailable: boolean;
  deliveryPrice: number;
  brand?: string;
  model?: string;
  country: string;
  createdAt: number;
  status: RentalStatus;
}

export interface RentalRequest {
  id: number;
  requesterId: string;
  listingId: number;
  startDate: string;
  endDate: string;
  message: string;
  status: RentalRequestStatus;
  createdAt: number;
}

export const RENTAL_CATEGORIES = [
  {
    id: "tools",
    icon: "🔨",
    subcategories: [
      "Perceuse, visseuse, perforateur",
      "Ponceuse, meuleuse, scie",
      "Compresseur, pistolet à peinture",
      "Échafaudage, escabeau, échelle",
      "Bétonnière",
      "Niveau laser",
      "Pistolet à colle, décapeur thermique",
      "Poste à souder",
    ],
  },
  {
    id: "machinery",
    icon: "🏗️",
    subcategories: [
      "Mini-pelle, pelleteuse",
      "Nacelle élévatrice",
      "Compacteur, plaque vibrante",
      "Nettoyeur de façade",
    ],
  },
  {
    id: "garden",
    icon: "🌿",
    subcategories: [
      "Tondeuse à gazon",
      "Débroussailleuse, taille-haies",
      "Tronçonneuse",
      "Motoculteur, motobineuse",
      "Broyeur de végétaux",
      "Scarificateur, rouleau à gazon",
      "Tarière",
      "Souffleur de feuilles",
      "Nettoyeur haute pression",
    ],
  },
  {
    id: "transport",
    icon: "🚛",
    subcategories: [
      "Transport de meubles / gros objets",
      "Transport de matériaux de chantier",
      "Benne à ordures et gravats",
      "Big bag (livraison & récupération)",
      "Remorque avec chauffeur",
      "Remorque auto",
      "Diable, transpalette",
      "Sangles de transport",
      "Monte-charge, lève-plaques",
    ],
  },
  {
    id: "cleaning",
    icon: "🏠",
    subcategories: [
      "Nettoyeur vapeur",
      "Shampouineuse (moquette, canapé)",
      "Autolaveuse, monobrosse",
      "Aspirateur industriel",
      "Ventilateur industriel",
    ],
  },
];

const LS_KEY = "taskvoila_rentals";
const LS_REQUESTS_KEY = "taskvoila_rental_requests";

function loadListings(): RentalListing[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RentalListing[];
  } catch {
    return [];
  }
}

function saveListings(listings: RentalListing[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(listings));
  } catch {
    // ignore
  }
}

function loadRequests(): RentalRequest[] {
  try {
    const raw = localStorage.getItem(LS_REQUESTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RentalRequest[];
  } catch {
    return [];
  }
}

function saveRequests(requests: RentalRequest[]): void {
  try {
    localStorage.setItem(LS_REQUESTS_KEY, JSON.stringify(requests));
  } catch {
    // ignore
  }
}

type RentalStoreContextType = {
  listings: RentalListing[];
  requests: RentalRequest[];
  createListing: (
    data: Omit<RentalListing, "id" | "createdAt" | "status">,
  ) => RentalListing;
  getListings: (country: string, categoryId?: string) => RentalListing[];
  getListing: (id: number) => RentalListing | undefined;
  updateListing: (id: number, data: Partial<RentalListing>) => void;
  deleteListing: (id: number) => void;
  createRequest: (
    data: Omit<RentalRequest, "id" | "createdAt" | "status">,
  ) => RentalRequest;
  getRequestsForOwner: (ownerId: string) => RentalRequest[];
  updateRequestStatus: (id: number, status: RentalRequestStatus) => void;
};

const RentalStoreContext = createContext<RentalStoreContextType | undefined>(
  undefined,
);

export function RentalStoreProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<RentalListing[]>(loadListings);
  const [requests, setRequests] = useState<RentalRequest[]>(loadRequests);

  const createListing = useCallback(
    (
      data: Omit<RentalListing, "id" | "createdAt" | "status">,
    ): RentalListing => {
      const listing: RentalListing = {
        ...data,
        id: Date.now(),
        createdAt: Date.now(),
        status: "active",
      };
      setListings((prev) => {
        const updated = [listing, ...prev];
        saveListings(updated);
        return updated;
      });
      return listing;
    },
    [],
  );

  const getListings = useCallback(
    (country: string, categoryId?: string): RentalListing[] => {
      return listings
        .filter(
          (l) =>
            l.status === "active" &&
            l.country === country &&
            (categoryId === undefined || l.categoryId === categoryId),
        )
        .sort((a, b) => b.createdAt - a.createdAt);
    },
    [listings],
  );

  const getListing = useCallback(
    (id: number): RentalListing | undefined =>
      listings.find((l) => l.id === id),
    [listings],
  );

  const updateListing = useCallback(
    (id: number, data: Partial<RentalListing>): void => {
      setListings((prev) => {
        const updated = prev.map((l) => (l.id === id ? { ...l, ...data } : l));
        saveListings(updated);
        return updated;
      });
    },
    [],
  );

  const deleteListing = useCallback((id: number): void => {
    setListings((prev) => {
      const updated = prev.map((l) =>
        l.id === id ? { ...l, status: "deleted" as RentalStatus } : l,
      );
      saveListings(updated);
      return updated;
    });
  }, []);

  const createRequest = useCallback(
    (
      data: Omit<RentalRequest, "id" | "createdAt" | "status">,
    ): RentalRequest => {
      const request: RentalRequest = {
        ...data,
        id: Date.now(),
        createdAt: Date.now(),
        status: "pending",
      };
      setRequests((prev) => {
        const updated = [request, ...prev];
        saveRequests(updated);
        return updated;
      });
      return request;
    },
    [],
  );

  const getRequestsForOwner = useCallback(
    (ownerId: string): RentalRequest[] => {
      const ownerListingIds = listings
        .filter((l) => l.ownerId === ownerId)
        .map((l) => l.id);
      return requests.filter((r) => ownerListingIds.includes(r.listingId));
    },
    [listings, requests],
  );

  const updateRequestStatus = useCallback(
    (id: number, status: RentalRequestStatus): void => {
      setRequests((prev) => {
        const updated = prev.map((r) => (r.id === id ? { ...r, status } : r));
        saveRequests(updated);
        return updated;
      });
    },
    [],
  );

  return createElement(
    RentalStoreContext.Provider,
    {
      value: {
        listings,
        requests,
        createListing,
        getListings,
        getListing,
        updateListing,
        deleteListing,
        createRequest,
        getRequestsForOwner,
        updateRequestStatus,
      },
    },
    children,
  );
}

export function useRentalStore() {
  const ctx = useContext(RentalStoreContext);
  if (!ctx) {
    throw new Error("useRentalStore must be used within RentalStoreProvider");
  }
  return ctx;
}

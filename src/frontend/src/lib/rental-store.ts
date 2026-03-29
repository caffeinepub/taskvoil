import {
  type ReactNode,
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

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
  isLoading: boolean;
  error: string | null;
  createListing: (
    data: Omit<RentalListing, "id" | "createdAt" | "status">,
  ) => Promise<RentalListing>;
  getListings: (country: string, categoryId?: string) => RentalListing[];
  getListing: (id: number) => RentalListing | undefined;
  updateListing: (id: number, data: Partial<RentalListing>) => Promise<void>;
  deleteListing: (id: number) => Promise<void>;
  createRequest: (
    data: Omit<RentalRequest, "id" | "createdAt" | "status">,
  ) => RentalRequest;
  getRequestsForOwner: (ownerId: string) => RentalRequest[];
  updateRequestStatus: (id: number, status: RentalRequestStatus) => void;
  refreshListings: () => Promise<void>;
};

const RentalStoreContext = createContext<RentalStoreContextType | undefined>(
  undefined,
);

export function RentalStoreProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<RentalListing[]>(loadListings);
  const [requests, setRequests] = useState<RentalRequest[]>(loadRequests);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Backend integration point — when backend.listRentalListings() is available:
      // const backendListings = await (backend as any).listRentalListings("", "");
      // const mapped = backendListings.map(fromBackendListing);
      // setListings(mapped);
      // saveListings(mapped);
      await Promise.resolve();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load listings";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshListings();
  }, [refreshListings]);

  const createListing = useCallback(
    async (
      data: Omit<RentalListing, "id" | "createdAt" | "status">,
    ): Promise<RentalListing> => {
      // Backend integration point:
      // try {
      //   const id = await (backend as any).createRentalListing(
      //     data.title, data.description, data.categoryId, data.subcategoryId,
      //     BigInt(data.pricePerDay), BigInt(data.pricePerHalfDay), BigInt(data.deposit),
      //     data.city, data.country, data.condition,
      //     data.deliveryAvailable, BigInt(data.deliveryPrice),
      //     data.brand ? [data.brand] : [], data.model ? [data.model] : []
      //   );
      //   const listing = { ...data, id: Number(id), createdAt: Date.now(), status: "active" as RentalStatus };
      //   setListings(prev => { const u = [listing, ...prev]; saveListings(u); return u; });
      //   return listing;
      // } catch {
      //   toast.error("Backend not connected yet — saving locally");
      // }
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
    async (id: number, data: Partial<RentalListing>): Promise<void> => {
      // Backend integration point:
      // try {
      //   await (backend as any).updateRentalListing(
      //     BigInt(id), data.title ?? "", data.description ?? "",
      //     BigInt(data.pricePerDay ?? 0), BigInt(data.pricePerHalfDay ?? 0),
      //     BigInt(data.deposit ?? 0), data.city ?? "",
      //     data.deliveryAvailable ?? false, BigInt(data.deliveryPrice ?? 0)
      //   );
      // } catch {
      //   toast.error("Backend not connected yet — updating locally");
      // }
      setListings((prev) => {
        const updated = prev.map((l) => (l.id === id ? { ...l, ...data } : l));
        saveListings(updated);
        return updated;
      });
    },
    [],
  );

  const deleteListing = useCallback(async (id: number): Promise<void> => {
    // Backend integration point:
    // try {
    //   await (backend as any).deleteRentalListing(BigInt(id));
    // } catch {
    //   toast.error("Backend not connected yet — removing locally");
    // }
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

  // Silence unused toast import warning
  void toast;

  return createElement(
    RentalStoreContext.Provider,
    {
      value: {
        listings,
        requests,
        isLoading,
        error,
        createListing,
        getListings,
        getListing,
        updateListing,
        deleteListing,
        createRequest,
        getRequestsForOwner,
        updateRequestStatus,
        refreshListings,
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

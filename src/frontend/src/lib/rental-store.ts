import {
  type ReactNode,
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useActor } from "../hooks/useActor";

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
const LS_META_PREFIX = "taskvoila_rental_meta_";

interface RentalMeta {
  ownerId: string;
  ownerCountry: string;
  photos: string[];
  availabilityDates: string[];
}

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

function loadRentalMeta(id: number): RentalMeta | undefined {
  try {
    const raw = localStorage.getItem(`${LS_META_PREFIX}${id}`);
    if (!raw) return undefined;
    return JSON.parse(raw) as RentalMeta;
  } catch {
    return undefined;
  }
}

function saveRentalMeta(id: number, meta: RentalMeta): void {
  try {
    localStorage.setItem(`${LS_META_PREFIX}${id}`, JSON.stringify(meta));
  } catch {
    // ignore
  }
}

function fromBackendRentalStatus(s: Record<string, null>): RentalStatus {
  if ("active" in s) return "active";
  if ("inactive" in s) return "inactive";
  if ("deleted" in s) return "deleted";
  return "active";
}

function fromBackendListing(
  r: Record<string, unknown>,
  meta?: RentalMeta,
): RentalListing {
  const id = Number(r.id as bigint);
  return {
    id,
    ownerId: meta?.ownerId ?? String(Number(r.ownerId as bigint)),
    ownerCountry: meta?.ownerCountry ?? (r.country as string),
    title: r.title as string,
    description: r.description as string,
    photos: meta?.photos ?? [],
    categoryId: r.categoryId as string,
    subcategoryId: r.subcategoryId as string,
    pricePerDay: Number(r.pricePerDay as bigint),
    pricePerHalfDay: Number(r.pricePerHalfDay as bigint),
    deposit: Number(r.deposit as bigint),
    availabilityDates: meta?.availabilityDates ?? [],
    city: r.city as string,
    condition: r.condition as RentalCondition,
    deliveryAvailable: r.deliveryAvailable as boolean,
    deliveryPrice: Number(r.deliveryPrice as bigint),
    brand:
      Array.isArray(r.brand) && r.brand.length > 0
        ? (r.brand[0] as string)
        : undefined,
    model:
      Array.isArray(r.model) && r.model.length > 0
        ? (r.model[0] as string)
        : undefined,
    country: r.country as string,
    createdAt: Number(r.createdAt as bigint) / 1_000_000,
    status: fromBackendRentalStatus(r.status as Record<string, null>),
  };
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
  const { actor } = useActor();

  const refreshListings = useCallback(async () => {
    if (!actor) return;
    setIsLoading(true);
    setError(null);
    try {
      const country = localStorage.getItem("taskvoila_country_v6") ?? "";
      const backendListings = await (actor as any).listRentalListings(
        country,
        "",
      );
      const mapped: RentalListing[] = (
        backendListings as Record<string, unknown>[]
      ).map((r) => {
        const id = Number(r.id as bigint);
        const meta = loadRentalMeta(id);
        return fromBackendListing(r, meta);
      });
      setListings(mapped);
      saveListings(mapped);
    } catch {
      // Silently keep localStorage data
    } finally {
      setIsLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    void refreshListings();
  }, [refreshListings]);

  const createListing = useCallback(
    async (
      data: Omit<RentalListing, "id" | "createdAt" | "status">,
    ): Promise<RentalListing> => {
      if (actor) {
        try {
          const backendId = await (actor as any).createRentalListing(
            data.title,
            data.description,
            data.categoryId,
            data.subcategoryId,
            BigInt(data.pricePerDay),
            BigInt(data.pricePerHalfDay),
            BigInt(data.deposit),
            data.city,
            data.country,
            data.condition,
            data.deliveryAvailable,
            BigInt(data.deliveryPrice),
            data.brand ? [data.brand] : [],
            data.model ? [data.model] : [],
          );
          const id = Number(backendId as bigint);
          const meta: RentalMeta = {
            ownerId: data.ownerId,
            ownerCountry: data.ownerCountry,
            photos: data.photos,
            availabilityDates: data.availabilityDates,
          };
          saveRentalMeta(id, meta);
          const listing: RentalListing = {
            ...data,
            id,
            createdAt: Date.now(),
            status: "active",
          };
          setListings((prev) => {
            const updated = [listing, ...prev];
            saveListings(updated);
            return updated;
          });
          return listing;
        } catch {
          // Fall through to localStorage fallback
        }
      }
      // localStorage fallback
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
    [actor],
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
      if (actor) {
        try {
          await (actor as any).updateRentalListing(
            BigInt(id),
            data.title ?? "",
            data.description ?? "",
            BigInt(data.pricePerDay ?? 0),
            BigInt(data.pricePerHalfDay ?? 0),
            BigInt(data.deposit ?? 0),
            data.city ?? "",
            data.deliveryAvailable ?? false,
            BigInt(data.deliveryPrice ?? 0),
          );
        } catch {
          // Fall through to local update
        }
      }
      setListings((prev) => {
        const updated = prev.map((l) => (l.id === id ? { ...l, ...data } : l));
        saveListings(updated);
        return updated;
      });
    },
    [actor],
  );

  const deleteListing = useCallback(
    async (id: number): Promise<void> => {
      if (actor) {
        try {
          await (actor as any).deleteRentalListing(BigInt(id));
        } catch {
          // Fall through to local delete
        }
      }
      setListings((prev) => {
        const updated = prev.map((l) =>
          l.id === id ? { ...l, status: "deleted" as RentalStatus } : l,
        );
        saveListings(updated);
        return updated;
      });
    },
    [actor],
  );

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

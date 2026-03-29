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

export type MissionStatus =
  | "open"
  | "in_progress"
  | "accepted"
  | "completed"
  | "paid"
  | "cancelled";

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  city: string;
  country: string;
  budgetMin: number;
  budgetMax: number;
  date?: string;
  photos?: string[];
  status: MissionStatus;
  authorId: string;
  authorPseudo: string;
  authorRole: "client" | "pro";
  createdAt: string;
  acceptedOfferId?: string;
}

interface MissionMeta {
  authorId: string;
  authorPseudo: string;
  authorRole: "client" | "pro";
  photos?: string[];
}

const LS_KEY = "taskvoila_missions";

function loadMissions(): Mission[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Mission[];
  } catch {
    return [];
  }
}

function saveMissions(missions: Mission[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(missions));
  } catch {
    // ignore
  }
}

function loadMeta(id: string): MissionMeta | undefined {
  try {
    const raw = localStorage.getItem(`taskvoila_mission_meta_${id}`);
    if (!raw) return undefined;
    return JSON.parse(raw) as MissionMeta;
  } catch {
    return undefined;
  }
}

function saveMeta(id: string, meta: MissionMeta): void {
  try {
    localStorage.setItem(`taskvoila_mission_meta_${id}`, JSON.stringify(meta));
  } catch {
    // ignore
  }
}

function toBackendStatus(status: MissionStatus): object {
  switch (status) {
    case "open":
      return { open: null };
    case "in_progress":
      return { in_progress: null };
    case "accepted":
      return { in_progress: null };
    case "completed":
      return { completed: null };
    case "paid":
      return { completed: null };
    case "cancelled":
      return { cancelled: null };
    default:
      return { open: null };
  }
}

function fromBackendStatus(s: Record<string, null>): MissionStatus {
  if ("open" in s) return "open";
  if ("in_progress" in s) return "in_progress";
  if ("completed" in s) return "completed";
  if ("cancelled" in s) return "cancelled";
  return "open";
}

function fromBackendMission(
  m: Record<string, unknown>,
  meta?: MissionMeta,
): Mission {
  const id = String(Number(m.id as bigint));
  return {
    id,
    title: m.title as string,
    description: m.description as string,
    category: m.category as string,
    subcategory: m.subcategory as string,
    city: m.city as string,
    country: m.country as string,
    budgetMin: Number(m.budgetMin as bigint),
    budgetMax: Number(m.budgetMax as bigint),
    date:
      Array.isArray(m.scheduledDate) && m.scheduledDate.length > 0
        ? (m.scheduledDate[0] as string)
        : undefined,
    status: fromBackendStatus(m.status as Record<string, null>),
    createdAt: new Date(
      Number(m.createdAt as bigint) / 1_000_000,
    ).toISOString(),
    acceptedOfferId:
      Array.isArray(m.acceptedOfferId) && m.acceptedOfferId.length > 0
        ? String(Number(m.acceptedOfferId[0] as bigint))
        : undefined,
    authorId: meta?.authorId ?? "",
    authorPseudo: meta?.authorPseudo ?? "Utilisateur",
    authorRole: meta?.authorRole ?? "client",
    photos: meta?.photos ?? [],
  };
}

type MissionStoreContextType = {
  missions: Mission[];
  isLoading: boolean;
  error: string | null;
  createMission: (data: Omit<Mission, "id" | "createdAt">) => Promise<Mission>;
  getMissionById: (id: string) => Mission | undefined;
  listAllMissions: () => Mission[];
  listMissionsByUser: (userId: string) => Mission[];
  updateMissionStatus: (
    id: string,
    status: MissionStatus,
    acceptedOfferId?: string,
  ) => Promise<void>;
  deleteMission: (id: string) => Promise<void>;
  refreshMissions: () => Promise<void>;
};

const MissionStoreContext = createContext<MissionStoreContextType | undefined>(
  undefined,
);

export function MissionStoreProvider({ children }: { children: ReactNode }) {
  const [missions, setMissions] = useState<Mission[]>(loadMissions);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { actor } = useActor();

  const refreshMissions = useCallback(async () => {
    if (!actor) return;
    setIsLoading(true);
    setError(null);
    try {
      const country = localStorage.getItem("taskvoila_country_v6") ?? "";
      const backendMissions = await (actor as any).listMissions(country, "");
      const mapped: Mission[] = (
        backendMissions as Record<string, unknown>[]
      ).map((m) => {
        const id = String(Number(m.id as bigint));
        const meta = loadMeta(id);
        return fromBackendMission(m, meta);
      });
      setMissions(mapped);
      saveMissions(mapped);
    } catch {
      // Silently keep localStorage data
    } finally {
      setIsLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    void refreshMissions();
  }, [refreshMissions]);

  const createMission = useCallback(
    async (data: Omit<Mission, "id" | "createdAt">): Promise<Mission> => {
      if (actor) {
        try {
          const backendId = await (actor as any).createMission(
            data.title,
            data.description,
            data.category,
            data.subcategory ?? "",
            data.city,
            data.country,
            BigInt(data.budgetMin),
            BigInt(data.budgetMax),
            data.date ? [data.date] : [],
          );
          const id = String(Number(backendId as bigint));
          const meta: MissionMeta = {
            authorId: data.authorId,
            authorPseudo: data.authorPseudo,
            authorRole: data.authorRole,
            photos: data.photos,
          };
          saveMeta(id, meta);
          const mission: Mission = {
            ...data,
            id,
            createdAt: new Date().toISOString(),
          };
          setMissions((prev) => {
            const updated = [mission, ...prev];
            saveMissions(updated);
            return updated;
          });
          return mission;
        } catch {
          // Fall through to localStorage fallback
        }
      }
      // localStorage fallback
      const mission: Mission = {
        ...data,
        id: `mission_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date().toISOString(),
      };
      setMissions((prev) => {
        const updated = [mission, ...prev];
        saveMissions(updated);
        return updated;
      });
      return mission;
    },
    [actor],
  );

  const getMissionById = useCallback(
    (id: string): Mission | undefined => {
      return missions.find((m) => m.id === id);
    },
    [missions],
  );

  const listAllMissions = useCallback((): Mission[] => {
    return [...missions].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [missions]);

  const listMissionsByUser = useCallback(
    (userId: string): Mission[] => {
      return missions
        .filter((m) => m.authorId === userId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    },
    [missions],
  );

  const updateMissionStatus = useCallback(
    async (
      id: string,
      status: MissionStatus,
      acceptedOfferId?: string,
    ): Promise<void> => {
      if (actor) {
        try {
          await (actor as any).updateMissionStatus(
            BigInt(id),
            toBackendStatus(status),
          );
        } catch {
          // Fall through to local update
        }
      }
      setMissions((prev) => {
        const updated = prev.map((m) =>
          m.id === id
            ? { ...m, status, ...(acceptedOfferId ? { acceptedOfferId } : {}) }
            : m,
        );
        saveMissions(updated);
        return updated;
      });
    },
    [actor],
  );

  const deleteMission = useCallback(
    async (id: string): Promise<void> => {
      if (actor) {
        try {
          await (actor as any).deleteMission(BigInt(id));
        } catch {
          // Fall through to local delete
        }
      }
      setMissions((prev) => {
        const updated = prev.filter((m) => m.id !== id);
        saveMissions(updated);
        return updated;
      });
    },
    [actor],
  );

  return createElement(
    MissionStoreContext.Provider,
    {
      value: {
        missions,
        isLoading,
        error,
        createMission,
        getMissionById,
        listAllMissions,
        listMissionsByUser,
        updateMissionStatus,
        deleteMission,
        refreshMissions,
      },
    },
    children,
  );
}

export function useMissionStore() {
  const ctx = useContext(MissionStoreContext);
  if (!ctx) {
    throw new Error("useMissionStore must be used within MissionStoreProvider");
  }
  return ctx;
}

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

  // Attempt to sync from backend on mount.
  // Since the backend APIs for missions are not yet in the generated declarations,
  // this will gracefully fall back to localStorage.
  const refreshMissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Backend integration point — when backend.listMissions() is available:
      // const backendMissions = await (backend as any).listMissions("", "");
      // const mapped = backendMissions.map(fromBackendMission);
      // setMissions(mapped);
      // saveMissions(mapped);
      // For now, use localStorage (already loaded in initial state).
      await Promise.resolve();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load missions";
      setError(msg);
      // Keep localStorage data — don't show error toast on silent fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshMissions();
  }, [refreshMissions]);

  const createMission = useCallback(
    async (data: Omit<Mission, "id" | "createdAt">): Promise<Mission> => {
      // Backend integration point:
      // try {
      //   const id = await (backend as any).createMission(
      //     data.title, data.description, data.category,
      //     data.subcategory ?? "", data.city, data.country,
      //     BigInt(data.budgetMin), BigInt(data.budgetMax),
      //     data.date ? [data.date] : []
      //   );
      //   const mission = { ...data, id: String(Number(id)), createdAt: new Date().toISOString() };
      //   setMissions(prev => { const u = [mission, ...prev]; saveMissions(u); return u; });
      //   return mission;
      // } catch {
      //   toast.error("Backend not connected yet — saving locally");
      // }
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
    [],
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
      // Backend integration point:
      // try {
      //   await (backend as any).updateMissionStatus(BigInt(id), status);
      // } catch {
      //   toast.error("Backend not connected yet — updating locally");
      // }
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
    [],
  );

  const deleteMission = useCallback(async (id: string): Promise<void> => {
    // Backend integration point:
    // try {
    //   await (backend as any).deleteMission(BigInt(id));
    // } catch {
    //   toast.error("Backend not connected yet — removing locally");
    // }
    setMissions((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      saveMissions(updated);
      return updated;
    });
  }, []);

  // Silence unused toast import warning
  void toast;

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

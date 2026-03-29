import {
  type ReactNode,
  createContext,
  createElement,
  useCallback,
  useContext,
  useState,
} from "react";

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
  createMission: (data: Omit<Mission, "id" | "createdAt">) => Mission;
  getMissionById: (id: string) => Mission | undefined;
  listAllMissions: () => Mission[];
  listMissionsByUser: (userId: string) => Mission[];
  updateMissionStatus: (
    id: string,
    status: MissionStatus,
    acceptedOfferId?: string,
  ) => void;
};

const MissionStoreContext = createContext<MissionStoreContextType | undefined>(
  undefined,
);

export function MissionStoreProvider({ children }: { children: ReactNode }) {
  const [missions, setMissions] = useState<Mission[]>(loadMissions);

  const createMission = useCallback(
    (data: Omit<Mission, "id" | "createdAt">): Mission => {
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
    (id: string, status: MissionStatus, acceptedOfferId?: string): void => {
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

  return createElement(
    MissionStoreContext.Provider,
    {
      value: {
        missions,
        createMission,
        getMissionById,
        listAllMissions,
        listMissionsByUser,
        updateMissionStatus,
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

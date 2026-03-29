import {
  type ReactNode,
  createContext,
  createElement,
  useCallback,
  useContext,
  useState,
} from "react";

export type DemoRole = "client" | "pro" | "admin";

export type DemoUserState = {
  id: number;
  role: DemoRole;
  firstName: string;
  lastName: string;
  email: string;
};

const demoUsers: Record<DemoRole, DemoUserState> = {
  client: {
    id: 1,
    role: "client",
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean.dupont@example.com",
  },
  pro: {
    id: 2,
    role: "pro",
    firstName: "Marc",
    lastName: "Dubois",
    email: "marc.dubois@plomberie-dubois.fr",
  },
  admin: {
    id: 3,
    role: "admin",
    firstName: "Admin",
    lastName: "TaskVoilà",
    email: "admin@taskvoila.com",
  },
};

type DemoStoreContextType = {
  demoUser: DemoUserState | null;
  loginAsDemo: (role: DemoRole) => void;
  logoutDemo: () => void;
};

const DemoStoreContext = createContext<DemoStoreContextType | undefined>(
  undefined,
);

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [demoUser, setDemoUser] = useState<DemoUserState | null>(null);

  const loginAsDemo = useCallback((role: DemoRole) => {
    setDemoUser(demoUsers[role]);
  }, []);

  const logoutDemo = useCallback(() => {
    setDemoUser(null);
  }, []);

  return createElement(
    DemoStoreContext.Provider,
    { value: { demoUser, loginAsDemo, logoutDemo } },
    children,
  );
}

export function useDemoStore() {
  const ctx = useContext(DemoStoreContext);
  if (!ctx) {
    throw new Error("useDemoStore must be used within DemoStoreProvider");
  }
  return ctx;
}

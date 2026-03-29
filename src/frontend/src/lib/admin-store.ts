import {
  type ReactNode,
  createContext,
  createElement,
  useContext,
  useState,
} from "react";

const ADMIN_USERS_KEY = "taskvoila_admin_users";
const ADMINS_KEY = "taskvoila_admins";

export interface AdminUser {
  id: string;
  pseudo: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "client" | "pro" | "admin";
  country: string;
  registeredAt: number;
  approvalStatus: "pending_approval" | "approved" | "suspended" | "deleted";
  verificationStatus?: "pending" | "verified" | "rejected";
  // DAC7 fields (pro only)
  companyName?: string;
  taxId?: string;
  iban?: string;
  taxResidenceCountry?: string;
  proStatus?: string;
  dac7Accepted?: boolean;
  dac7Complete?: boolean;
  // KYC
  idDocumentUrl?: string;
  registrationDocUrl?: string;
  kycStatus?: "none" | "pending" | "verified" | "rejected";
}

function maskIBAN(iban: string): string {
  if (!iban || iban.length < 4) return iban;
  return `${iban.substring(0, 4)} **** **** **** ${iban.slice(-4)}`;
}

export { maskIBAN };

const SEED_USERS: AdminUser[] = [
  {
    id: "seed_1",
    pseudo: "marie_b",
    firstName: "Marie",
    lastName: "Beaumont",
    email: "marie.beaumont@email.fr",
    role: "pro",
    country: "FR",
    registeredAt: Date.now() - 86400000 * 3,
    approvalStatus: "pending_approval",
    verificationStatus: "pending",
    companyName: "Beaumont Rénovation",
    taxId: "FR83 493 482 100",
    iban: "FR76 3000 6000 0112 3456 7890 189",
    taxResidenceCountry: "FR",
    proStatus: "auto_entrepreneur",
    dac7Accepted: true,
    dac7Complete: true,
    kycStatus: "pending",
  },
  {
    id: "seed_2",
    pseudo: "thomas_v",
    firstName: "Thomas",
    lastName: "Van der Berg",
    email: "thomas.vdb@gmail.com",
    role: "client",
    country: "NL",
    registeredAt: Date.now() - 86400000 * 10,
    approvalStatus: "approved",
  },
  {
    id: "seed_3",
    pseudo: "luigi_c",
    firstName: "Luigi",
    lastName: "Caruso",
    email: "luigi.caruso@posta.it",
    role: "pro",
    country: "IT",
    registeredAt: Date.now() - 86400000 * 7,
    approvalStatus: "pending_approval",
    verificationStatus: "pending",
    companyName: "Caruso Impianti",
    taxId: "CRSLGU85M12A944T",
    iban: "IT60 X054 2811 1010 0000 0123 456",
    taxResidenceCountry: "IT",
    proStatus: "sole_trader",
    dac7Accepted: true,
    dac7Complete: true,
    kycStatus: "pending",
  },
  {
    id: "seed_4",
    pseudo: "sophie_m",
    firstName: "Sophie",
    lastName: "Müller",
    email: "sophie.mueller@web.de",
    role: "client",
    country: "DE",
    registeredAt: Date.now() - 86400000 * 2,
    approvalStatus: "approved",
  },
  {
    id: "seed_5",
    pseudo: "carlos_h",
    firstName: "Carlos",
    lastName: "Hernández",
    email: "carlos.hernandez@correo.es",
    role: "pro",
    country: "ES",
    registeredAt: Date.now() - 86400000 * 5,
    approvalStatus: "approved",
    verificationStatus: "verified",
    companyName: "Hernández Obras",
    taxId: "12345678A",
    iban: "ES91 2100 0418 4502 0005 1332",
    taxResidenceCountry: "ES",
    proStatus: "self_employed",
    dac7Accepted: true,
    dac7Complete: true,
    kycStatus: "verified",
  },
];

function loadAdminUsers(): AdminUser[] {
  try {
    const raw = localStorage.getItem(ADMIN_USERS_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(SEED_USERS));
      return SEED_USERS;
    }
    return JSON.parse(raw) as AdminUser[];
  } catch {
    return SEED_USERS;
  }
}

function loadAdminIds(): string[] {
  try {
    const raw = localStorage.getItem(ADMINS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function saveAdminUsers(users: AdminUser[]) {
  localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(users));
}

function saveAdminIds(ids: string[]) {
  localStorage.setItem(ADMINS_KEY, JSON.stringify(ids));
}

type AdminStoreContextType = {
  adminUsers: AdminUser[];
  adminIds: string[];
  promoteToAdmin: (userId: string) => void;
  revokeAdmin: (userId: string) => void;
  approveUser: (userId: string) => void;
  suspendUser: (userId: string) => void;
  deleteUser: (userId: string) => void;
  validateKYC: (userId: string) => void;
  rejectKYC: (userId: string) => void;
  flagVerified: (userId: string) => void;
  flagSuspended: (userId: string) => void;
  addOrUpdateUser: (user: AdminUser) => void;
};

const AdminStoreContext = createContext<AdminStoreContextType | undefined>(
  undefined,
);

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    const users = loadAdminUsers();
    // Ensure first logged-in admin is in the list
    try {
      const sessionRaw = localStorage.getItem("taskvoila_session");
      if (sessionRaw) {
        const session = JSON.parse(sessionRaw);
        if (session.role === "admin" && session.id) {
          const adminIdsRaw = localStorage.getItem(ADMINS_KEY);
          const adminIds: string[] = adminIdsRaw ? JSON.parse(adminIdsRaw) : [];
          const userId = String(session.id);
          if (!adminIds.includes(userId)) {
            adminIds.push(userId);
            saveAdminIds(adminIds);
          }
          const exists = users.find((u) => String(u.id) === userId);
          if (!exists) {
            const adminUser: AdminUser = {
              id: userId,
              pseudo: session.pseudo ?? session.firstName ?? "Admin",
              firstName: session.firstName ?? "Admin",
              lastName: session.lastName ?? "",
              email: session.email ?? "",
              role: "admin",
              country: session.country ?? "IE",
              registeredAt: session.createdAt ?? Date.now(),
              approvalStatus: "approved",
            };
            users.push(adminUser);
            saveAdminUsers(users);
          }
        }
      }
    } catch {
      // ignore
    }
    return users;
  });

  const [adminIds, setAdminIds] = useState<string[]>(() => {
    const ids = loadAdminIds();
    // Auto-add first admin from session if list is empty
    if (ids.length === 0) {
      try {
        const sessionRaw = localStorage.getItem("taskvoila_session");
        if (sessionRaw) {
          const session = JSON.parse(sessionRaw);
          if (session.role === "admin" && session.id) {
            const newIds = [String(session.id)];
            saveAdminIds(newIds);
            return newIds;
          }
        }
      } catch {
        // ignore
      }
    }
    return ids;
  });

  const updateUsers = (updater: (prev: AdminUser[]) => AdminUser[]) => {
    setAdminUsers((prev) => {
      const next = updater(prev);
      saveAdminUsers(next);
      return next;
    });
  };

  const promoteToAdmin = (userId: string) => {
    updateUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: "admin" as const } : u)),
    );
    setAdminIds((prev) => {
      if (prev.includes(userId)) return prev;
      const next = [...prev, userId];
      saveAdminIds(next);
      return next;
    });
  };

  const revokeAdmin = (userId: string) => {
    updateUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const prevRole =
          u.proStatus || u.companyName ? ("pro" as const) : ("client" as const);
        return { ...u, role: prevRole };
      }),
    );
    setAdminIds((prev) => {
      const next = prev.filter((id) => id !== userId);
      saveAdminIds(next);
      return next;
    });
  };

  const approveUser = (userId: string) => {
    updateUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, approvalStatus: "approved" as const } : u,
      ),
    );
  };

  const suspendUser = (userId: string) => {
    updateUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, approvalStatus: "suspended" as const } : u,
      ),
    );
  };

  const deleteUser = (userId: string) => {
    updateUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, approvalStatus: "deleted" as const } : u,
      ),
    );
  };

  const validateKYC = (userId: string) => {
    updateUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              kycStatus: "verified" as const,
              verificationStatus: "verified" as const,
            }
          : u,
      ),
    );
  };

  const rejectKYC = (userId: string) => {
    updateUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              kycStatus: "rejected" as const,
              verificationStatus: "rejected" as const,
            }
          : u,
      ),
    );
  };

  const flagVerified = (userId: string) => {
    updateUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              verificationStatus: "verified" as const,
              kycStatus: "verified" as const,
            }
          : u,
      ),
    );
  };

  const flagSuspended = (userId: string) => {
    updateUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, approvalStatus: "suspended" as const } : u,
      ),
    );
  };

  const addOrUpdateUser = (user: AdminUser) => {
    updateUsers((prev) => {
      const exists = prev.find((u) => u.id === user.id);
      if (exists) return prev.map((u) => (u.id === user.id ? user : u));
      return [...prev, user];
    });
  };

  return createElement(
    AdminStoreContext.Provider,
    {
      value: {
        adminUsers,
        adminIds,
        promoteToAdmin,
        revokeAdmin,
        approveUser,
        suspendUser,
        deleteUser,
        validateKYC,
        rejectKYC,
        flagVerified,
        flagSuspended,
        addOrUpdateUser,
      },
    },
    children,
  );
}

export function useAdminStore() {
  const ctx = useContext(AdminStoreContext);
  if (!ctx) {
    throw new Error("useAdminStore must be used within AdminStoreProvider");
  }
  return ctx;
}

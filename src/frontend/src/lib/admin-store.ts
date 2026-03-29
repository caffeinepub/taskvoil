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

function loadAdminUsers(): AdminUser[] {
  try {
    const raw = localStorage.getItem(ADMIN_USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AdminUser[];
  } catch {
    return [];
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

import {
  type ReactNode,
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type LockType = "none" | "pin" | "biometric";

const LOCK_TYPE_KEY = "taskvoila_lock_type";
const DB_NAME = "taskvoila_security";
const STORE_NAME = "pins";
const PIN_KEY = "pin_hash";
const SALT_KEY = "taskvoila_device_salt";

// --- IndexedDB helpers ---
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbGet(key: string): Promise<string | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result as string | undefined);
    req.onerror = () => reject(req.error);
  });
}

async function dbPut(key: string, value: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function dbDelete(key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// --- Crypto helpers ---
function getDeviceSalt(): string {
  let salt = localStorage.getItem(SALT_KEY);
  if (!salt) {
    salt = crypto.getRandomValues(new Uint8Array(16)).join("-");
    localStorage.setItem(SALT_KEY, salt);
  }
  return salt;
}

async function deriveKey(salt: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(salt),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("taskvoila-pin"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function encryptPin(pin: string): Promise<string> {
  const key = await deriveKey(getDeviceSalt());
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(pin),
  );
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return btoa(String.fromCharCode(...combined));
}

async function decryptPin(stored: string): Promise<string> {
  const key = await deriveKey(getDeviceSalt());
  const combined = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext,
  );
  return new TextDecoder().decode(plain);
}

// --- Store ---
type SecurityStoreContextType = {
  lockType: LockType;
  isLocked: boolean;
  setLockType: (type: LockType) => void;
  savePin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  clearPin: () => Promise<void>;
  unlock: () => void;
  lock: () => void;
};

const SecurityStoreContext = createContext<
  SecurityStoreContextType | undefined
>(undefined);

export function SecurityStoreProvider({ children }: { children: ReactNode }) {
  const [lockType, setLockTypeState] = useState<LockType>(() => {
    return (localStorage.getItem(LOCK_TYPE_KEY) as LockType) ?? "none";
  });
  const [isLocked, setIsLocked] = useState(false);

  const setLockType = useCallback((type: LockType) => {
    localStorage.setItem(LOCK_TYPE_KEY, type);
    setLockTypeState(type);
  }, []);

  const savePin = useCallback(async (pin: string) => {
    const encrypted = await encryptPin(pin);
    await dbPut(PIN_KEY, encrypted);
  }, []);

  const verifyPin = useCallback(async (pin: string): Promise<boolean> => {
    try {
      const stored = await dbGet(PIN_KEY);
      if (!stored) return false;
      const decrypted = await decryptPin(stored);
      return decrypted === pin;
    } catch {
      return false;
    }
  }, []);

  const clearPin = useCallback(async () => {
    await dbDelete(PIN_KEY);
  }, []);

  const unlock = useCallback(() => setIsLocked(false), []);
  const lock = useCallback(() => {
    if (lockType !== "none") setIsLocked(true);
  }, [lockType]);

  // Lock when app comes to foreground
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && lockType !== "none") {
        setIsLocked(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [lockType]);

  return createElement(
    SecurityStoreContext.Provider,
    {
      value: {
        lockType,
        isLocked,
        setLockType,
        savePin,
        verifyPin,
        clearPin,
        unlock,
        lock,
      },
    },
    children,
  );
}

export function useSecurityStore() {
  const ctx = useContext(SecurityStoreContext);
  if (!ctx)
    throw new Error(
      "useSecurityStore must be used within SecurityStoreProvider",
    );
  return ctx;
}

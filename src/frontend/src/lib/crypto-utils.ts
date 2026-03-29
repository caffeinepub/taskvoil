/**
 * AES-GCM 256 encryption utilities using Web Crypto API.
 * The key is derived from the user's ICP principal — unique per account.
 * Falls back to a session-scoped random key if no principal is available.
 */

// Cache: one key per principal to avoid re-deriving on every call
const keyCache = new Map<string, CryptoKey>();

/**
 * Derive an AES-GCM 256 key from the user's ICP principal.
 * The salt is derived from the principal itself (public, non-secret).
 * This ensures each user has a unique encryption key.
 */
export async function generateKey(principal?: string): Promise<CryptoKey> {
  const keyId = principal ?? "__session__";

  const cached = keyCache.get(keyId);
  if (cached) return cached;

  // Derive a per-user password from the principal string
  // The principal is user-specific — no two users share the same key
  const password = principal
    ? `tv-${principal}-2026`
    : `tv-session-${crypto.getRandomValues(new Uint8Array(16)).join("-")}`;

  // Salt is derived from the principal bytes (unique per user)
  const saltSource = new TextEncoder().encode(principal ?? password);
  const saltHash = await crypto.subtle.digest("SHA-256", saltSource);
  const salt = new Uint8Array(saltHash).slice(0, 16);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );

  keyCache.set(keyId, key);
  return key;
}

/**
 * Clear cached key (e.g., on logout).
 */
export function clearKeyCache(principal?: string): void {
  if (principal) {
    keyCache.delete(principal);
  } else {
    keyCache.clear();
  }
}

/**
 * Encrypt a string value with AES-GCM 256.
 * Returns a base64-encoded string: IV (12 bytes) + ciphertext.
 */
export async function encryptField(
  value: string,
  key: CryptoKey,
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(value);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded,
  );

  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt a base64-encoded AES-GCM 256 ciphertext.
 */
export async function decryptField(
  value: string,
  key: CryptoKey,
): Promise<string> {
  const combined = new Uint8Array(
    atob(value)
      .split("")
      .map((c) => c.charCodeAt(0)),
  );

  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext,
  );

  return new TextDecoder().decode(decrypted);
}

export interface UserDataToEncrypt {
  phone?: string;
  email?: string;
  address?: string;
  fullName?: string;
}

export interface EncryptedUserData {
  phone?: string;
  email?: string;
  address?: string;
  fullName?: string;
}

/**
 * Encrypt all sensitive personal data fields.
 * Pass the user's ICP principal for a user-unique key.
 */
export async function encryptUserData(
  data: UserDataToEncrypt,
  principal?: string,
): Promise<EncryptedUserData> {
  const key = await generateKey(principal);

  const [phone, email, address, fullName] = await Promise.all([
    data.phone ? encryptField(data.phone, key) : Promise.resolve(undefined),
    data.email ? encryptField(data.email, key) : Promise.resolve(undefined),
    data.address ? encryptField(data.address, key) : Promise.resolve(undefined),
    data.fullName
      ? encryptField(data.fullName, key)
      : Promise.resolve(undefined),
  ]);

  return { phone, email, address, fullName };
}

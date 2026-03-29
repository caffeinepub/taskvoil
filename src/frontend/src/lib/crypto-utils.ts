/**
 * AES-GCM 256 encryption utilities using Web Crypto API.
 * NOTE: In production, the key should be derived from a user-specific secret
 * or managed by a secure key management service, not a hardcoded constant.
 */

// A fixed salt for PBKDF2 key derivation (demo only)
const DEMO_PASSWORD = "taskvoila-demo-encryption-key-2026";
const DEMO_SALT = new Uint8Array([
  84, 97, 115, 107, 86, 111, 105, 108, 195, 160, 75, 101, 121, 50, 48, 50,
]);

let cachedKey: CryptoKey | null = null;

/**
 * Generate (or return cached) AES-GCM 256 key derived via PBKDF2.
 */
export async function generateKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;

  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(DEMO_PASSWORD),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  cachedKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: DEMO_SALT,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );

  return cachedKey;
}

/**
 * Encrypt a string value with AES-GCM 256.
 * Returns a base64-encoded string: IV (12 bytes) + ciphertext.
 */
export async function encryptField(
  value: string,
  key: CryptoKey,
): Promise<string> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(value);

  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded,
  );

  // Combine IV + ciphertext
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

  const decrypted = await window.crypto.subtle.decrypt(
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
 * Returns the same structure with encrypted base64 values.
 */
export async function encryptUserData(
  data: UserDataToEncrypt,
): Promise<EncryptedUserData> {
  const key = await generateKey();

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

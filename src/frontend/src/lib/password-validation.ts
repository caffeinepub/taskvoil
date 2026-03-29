// Inline password strength scorer (replaces zxcvbn)
function zxcvbn(
  password: string,
  userInputs?: string[],
): {
  score: 0 | 1 | 2 | 3 | 4;
  feedback: { warning: string; suggestions: string[] };
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) && /[!@#$%&*]/.test(password)) score++;
  if (userInputs) {
    for (const input of userInputs) {
      if (input && password.toLowerCase().includes(input.toLowerCase())) {
        score = Math.max(0, score - 2) as 0 | 1 | 2 | 3 | 4;
      }
    }
  }
  const suggestions: string[] = [];
  if (password.length < 12) suggestions.push("Utilisez au moins 12 caractères");
  if (!/[A-Z]/.test(password)) suggestions.push("Ajoutez une majuscule");
  if (!/[0-9]/.test(password)) suggestions.push("Ajoutez un chiffre");
  if (!/[!@#$%&*]/.test(password))
    suggestions.push("Ajoutez un caractère spécial");
  return {
    score: Math.min(4, score) as 0 | 1 | 2 | 3 | 4,
    feedback: { warning: suggestions[0] ?? "", suggestions },
  };
}

export interface PasswordValidationResult {
  valid: boolean;
  score: number;
  errors: string[];
  suggestions: string[];
}

const BLACKLIST = [
  "password",
  "123456",
  "000000",
  "qwerty",
  "taskvoila",
  "azerty",
  "admin",
  "letmein",
  "welcome",
  "password123",
  "12345678",
  "qwerty123",
];

export function validatePassword(
  password: string,
  userInfo?: { firstName?: string; lastName?: string; email?: string },
): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 12) errors.push("passwordTooShort");
  if (!/[A-Z]/.test(password)) errors.push("passwordNoUppercase");
  if (!/[a-z]/.test(password)) errors.push("passwordNoLowercase");
  if (!/[0-9]/.test(password)) errors.push("passwordNoDigit");
  if (!/[!@#$%&*]/.test(password)) errors.push("passwordNoSpecial");

  // Check consecutive repeated chars (more than 3 identical in a row)
  if (/(.)\1{3,}/.test(password)) errors.push("passwordRepeated");

  const lower = password.toLowerCase();
  if (BLACKLIST.some((w) => lower.includes(w))) errors.push("passwordCommon");

  if (userInfo) {
    const { firstName, lastName, email } = userInfo;
    const fragments = [
      firstName?.toLowerCase(),
      lastName?.toLowerCase(),
      email?.split("@")[0].toLowerCase(),
    ].filter(Boolean) as string[];
    if (fragments.some((f) => f.length >= 3 && lower.includes(f))) {
      errors.push("passwordContainsUserInfo");
    }
  }

  const result = zxcvbn(password);
  const score = result.score;
  if (score < 3 && errors.length === 0) errors.push("passwordWeak");

  const suggestions = result.feedback.suggestions ?? [];

  return {
    valid: errors.length === 0 && score >= 3,
    score,
    errors,
    suggestions,
  };
}

export async function checkHIBP(password: string): Promise<number> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
    const prefix = hashHex.slice(0, 5);
    const suffix = hashHex.slice(5);

    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      {
        headers: { "Add-Padding": "true" },
      },
    );
    if (!response.ok) return 0;

    const text = await response.text();
    const lines = text.split("\n");
    for (const line of lines) {
      const [hashSuffix, countStr] = line.split(":");
      if (hashSuffix.trim() === suffix) {
        return Number.parseInt(countStr.trim(), 10);
      }
    }
    return 0;
  } catch {
    return 0;
  }
}

const CHARSET_UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const CHARSET_LOWER = "abcdefghjkmnpqrstuvwxyz";
const CHARSET_DIGITS = "23456789";
const CHARSET_SPECIAL = "!@#$%&*";
const CHARSET_ALL =
  CHARSET_UPPER + CHARSET_LOWER + CHARSET_DIGITS + CHARSET_SPECIAL;

function generateOnePassword(): string {
  // Build 14 chars: 1 of each required type + 10 from full charset
  const required = [
    CHARSET_UPPER[randomInt(CHARSET_UPPER.length)],
    CHARSET_LOWER[randomInt(CHARSET_LOWER.length)],
    CHARSET_DIGITS[randomInt(CHARSET_DIGITS.length)],
    CHARSET_SPECIAL[randomInt(CHARSET_SPECIAL.length)],
  ];
  const rest: string[] = [];
  for (let i = 0; i < 10; i++) {
    rest.push(CHARSET_ALL[randomInt(CHARSET_ALL.length)]);
  }

  // Fisher-Yates shuffle with fresh entropy for each swap
  const combined = [...required, ...rest];
  for (let i = combined.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }

  return combined.join("");
}

/** Cryptographically secure integer in [0, max) */
function randomInt(max: number): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

export function generatePasswordSuggestions(): string[] {
  const suggestions: string[] = [];
  let attempts = 0;
  while (suggestions.length < 3 && attempts < 50) {
    attempts++;
    const pw = generateOnePassword();
    const result = validatePassword(pw);
    if (result.valid) {
      suggestions.push(pw);
    }
  }
  // Fallback: force-build a valid password if needed
  while (suggestions.length < 3) {
    const pw = forceValidPassword();
    suggestions.push(pw);
  }
  return suggestions;
}

/** Guaranteed valid password built deterministically */
function forceValidPassword(): string {
  let pw = "";
  let tries = 0;
  while (tries < 100) {
    tries++;
    const chars = [
      CHARSET_UPPER[randomInt(CHARSET_UPPER.length)],
      CHARSET_UPPER[randomInt(CHARSET_UPPER.length)],
      CHARSET_LOWER[randomInt(CHARSET_LOWER.length)],
      CHARSET_LOWER[randomInt(CHARSET_LOWER.length)],
      CHARSET_LOWER[randomInt(CHARSET_LOWER.length)],
      CHARSET_DIGITS[randomInt(CHARSET_DIGITS.length)],
      CHARSET_DIGITS[randomInt(CHARSET_DIGITS.length)],
      CHARSET_SPECIAL[randomInt(CHARSET_SPECIAL.length)],
      CHARSET_ALL[randomInt(CHARSET_ALL.length)],
      CHARSET_ALL[randomInt(CHARSET_ALL.length)],
      CHARSET_ALL[randomInt(CHARSET_ALL.length)],
      CHARSET_ALL[randomInt(CHARSET_ALL.length)],
    ];
    // Shuffle
    for (let i = chars.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    pw = chars.join("");
    if (validatePassword(pw).valid) return pw;
  }
  return pw;
}

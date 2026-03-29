/**
 * Text sanitization utilities for TaskVoilà.
 * Removes contact info (phone/email), censors profanity, enforces length limits.
 */

// ─── Max length constants ──────────────────────────────────────────────────
export const MAX_LENGTHS = {
  missionTitle: 100,
  missionDescription: 2000,
  proDescription: 1500,
  aboutField: 500,
  contactMessage: 1000,
} as const;

// ─── Phone number patterns (international formats) ────────────────────────
const PHONE_PATTERNS = [
  /(?:\+|00)[1-9]\d{6,14}/g, // +33612345678 / 0033...
  /0[1-9](?:[\s.-]?\d{2}){4}/g, // 06 12 34 56 78 (French)
  /\b\d{3}[\s.-]\d{3}[\s.-]\d{4}\b/g, // 123-456-7890 (US)
  /\b\d{10,13}\b/g, // raw digit sequence
];

// ─── Email pattern ────────────────────────────────────────────────────────
const EMAIL_PATTERN = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

// ─── Profanity list (FR + EN basics — extend as needed) ──────────────────
const PROFANITY_LIST = [
  // FR
  "merde",
  "putain",
  "connard",
  "connasse",
  "salope",
  "enculé",
  "enculer",
  "fdp",
  "pd",
  "ntm",
  "pute",
  "cul",
  "bite",
  "couille",
  "con",
  // EN
  "fuck",
  "shit",
  "asshole",
  "bastard",
  "bitch",
  "cunt",
  "dick",
  "prick",
  "wanker",
  "motherfucker",
];

const PROFANITY_REGEX = new RegExp(
  `\\b(${PROFANITY_LIST.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})[a-z]*\\b`,
  "gi",
);

/**
 * Remove phone numbers and email addresses from text.
 */
export function removeContactInfo(text: string): string {
  let result = text;

  // Remove emails first (more specific)
  result = result.replace(EMAIL_PATTERN, "[email masqué]");

  // Remove phone numbers
  for (const pattern of PHONE_PATTERNS) {
    result = result.replace(pattern, "[numéro masqué]");
  }

  return result;
}

/**
 * Censor profanity by replacing with asterisks.
 */
export function censorProfanity(text: string): string {
  return text.replace(PROFANITY_REGEX, (match) => "*".repeat(match.length));
}

/**
 * Full sanitization: remove contact info + censor profanity + enforce max length.
 */
export function sanitizeText(text: string, maxLength?: number): string {
  let result = removeContactInfo(text);
  result = censorProfanity(result);

  if (maxLength !== undefined && result.length > maxLength) {
    result = result.slice(0, maxLength);
  }

  return result;
}

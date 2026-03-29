/**
 * Frontend rate limiting for account creation.
 * Uses localStorage to track attempts.
 * Max 3 attempts in 10 minutes window.
 */

const STORAGE_KEY = "taskvoila_signup_attempts";
const MAX_ATTEMPTS = 3;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

interface RateLimitData {
  attempts: number;
  firstAttemptTime: number;
}

function getData(): RateLimitData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RateLimitData;
  } catch {
    return null;
  }
}

function setData(data: RateLimitData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

export interface RateLimitCheckResult {
  allowed: boolean;
  remainingMinutes?: number;
}

/**
 * Check if a new signup attempt is allowed.
 */
export function checkRateLimit(): RateLimitCheckResult {
  const data = getData();

  if (!data) return { allowed: true };

  const now = Date.now();
  const elapsed = now - data.firstAttemptTime;

  // Window has expired — reset
  if (elapsed >= WINDOW_MS) {
    return { allowed: true };
  }

  // Under the limit
  if (data.attempts < MAX_ATTEMPTS) {
    return { allowed: true };
  }

  // Blocked
  const remainingMs = WINDOW_MS - elapsed;
  const remainingMinutes = Math.ceil(remainingMs / 60000);
  return { allowed: false, remainingMinutes };
}

/**
 * Record a signup attempt.
 */
export function recordAttempt(): void {
  const data = getData();
  const now = Date.now();

  if (!data) {
    setData({ attempts: 1, firstAttemptTime: now });
    return;
  }

  const elapsed = now - data.firstAttemptTime;

  // Window has expired — start fresh
  if (elapsed >= WINDOW_MS) {
    setData({ attempts: 1, firstAttemptTime: now });
    return;
  }

  setData({
    attempts: data.attempts + 1,
    firstAttemptTime: data.firstAttemptTime,
  });
}

/**
 * Reset all rate limit data (e.g., after successful login).
 */
export function resetAttempts(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}

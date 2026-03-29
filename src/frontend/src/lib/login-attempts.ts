interface LoginAttemptState {
  attempts: number;
  lockedUntil: number | null;
  lockoutCount: number;
  otpRequired: boolean;
  otp: string | null;
  otpExpiry: number | null;
  otpUsed: boolean;
}

const STORAGE_KEY = (email: string) => `login_attempts_${email.toLowerCase()}`;
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const OTP_LOCKOUT_THRESHOLD = 3;

function getState(email: string): LoginAttemptState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(email));
    if (!raw) return defaultState();
    return JSON.parse(raw) as LoginAttemptState;
  } catch {
    return defaultState();
  }
}

function defaultState(): LoginAttemptState {
  return {
    attempts: 0,
    lockedUntil: null,
    lockoutCount: 0,
    otpRequired: false,
    otp: null,
    otpExpiry: null,
    otpUsed: true,
  };
}

function saveState(email: string, state: LoginAttemptState): void {
  localStorage.setItem(STORAGE_KEY(email), JSON.stringify(state));
}

export function recordFailedAttempt(email: string): LoginAttemptState {
  const state = getState(email);
  state.attempts += 1;

  if (state.attempts >= MAX_ATTEMPTS) {
    state.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    state.lockoutCount += 1;
    state.attempts = 0;
    if (state.lockoutCount >= OTP_LOCKOUT_THRESHOLD) {
      state.otpRequired = true;
    }
  }

  saveState(email, state);
  return state;
}

export function isLocked(email: string): {
  locked: boolean;
  remaining: number;
} {
  const state = getState(email);
  if (!state.lockedUntil) return { locked: false, remaining: 0 };
  const remaining = state.lockedUntil - Date.now();
  if (remaining <= 0) {
    // Auto-clear lock (but keep lockout count)
    state.lockedUntil = null;
    state.attempts = 0;
    saveState(email, state);
    return { locked: false, remaining: 0 };
  }
  return { locked: true, remaining };
}

export function isOtpRequired(email: string): boolean {
  return getState(email).otpRequired;
}

export function generateOtp(email: string): string {
  const state = getState(email);
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  state.otp = otp;
  state.otpExpiry = Date.now() + OTP_EXPIRY_MS;
  state.otpUsed = false;
  saveState(email, state);
  return otp;
}

export function validateOtp(email: string, code: string): boolean {
  const state = getState(email);
  if (!state.otp || state.otpUsed) return false;
  if (!state.otpExpiry || Date.now() > state.otpExpiry) return false;
  if (state.otp !== code.trim()) return false;

  // Valid: mark used, clear OTP requirement
  state.otpUsed = true;
  state.otp = null;
  state.otpRequired = false;
  state.lockoutCount = 0;
  state.lockedUntil = null;
  state.attempts = 0;
  saveState(email, state);
  return true;
}

export function recordSuccess(email: string): void {
  localStorage.removeItem(STORAGE_KEY(email));
}

export { getState };

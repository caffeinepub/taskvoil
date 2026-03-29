import { useAuthStore } from "@/lib/auth-store";
import { useSecurityStore } from "@/lib/security-store";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { PinLockScreen } from "./PinLockScreen";

interface Props {
  children: ReactNode;
}

async function triggerBiometric(): Promise<boolean> {
  try {
    if (!window.PublicKeyCredential) return false;
    const available =
      await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    if (!available) return false;
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    await navigator.credentials.get({
      publicKey: {
        challenge,
        timeout: 60000,
        userVerification: "required",
        rpId: window.location.hostname,
        allowCredentials: [],
      },
    });
    return true;
  } catch {
    return false;
  }
}

export function AppLockGate({ children }: Props) {
  const { currentUser } = useAuthStore();
  const { lockType, isLocked, unlock } = useSecurityStore();
  const [showPinFallback, setShowPinFallback] = useState(false);

  const attemptBiometric = useCallback(async () => {
    const ok = await triggerBiometric();
    if (ok) {
      unlock();
    } else {
      setShowPinFallback(true);
    }
  }, [unlock]);

  useEffect(() => {
    if (isLocked && currentUser) {
      if (lockType === "biometric") {
        setShowPinFallback(false);
        void attemptBiometric();
      } else if (lockType === "pin") {
        setShowPinFallback(false);
      }
    }
    if (!isLocked) {
      setShowPinFallback(false);
    }
  }, [isLocked, lockType, currentUser, attemptBiometric]);

  const showPin =
    isLocked && currentUser && (lockType === "pin" || showPinFallback);

  return (
    <>
      {showPin && <PinLockScreen />}
      {children}
    </>
  );
}

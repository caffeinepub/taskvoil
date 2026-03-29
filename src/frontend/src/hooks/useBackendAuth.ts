import { Role } from "../backend";
import { useActor } from "./useActor";

export interface RegisterParams {
  role: "client" | "pro";
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  language: string;
  passwordHash: string;
}

/**
 * useBackendAuth — wraps real backend auth calls.
 */
export function useBackendAuth() {
  const { actor, isFetching } = useActor();

  async function register(params: RegisterParams) {
    if (!actor) throw new Error("Backend actor not ready");

    const backendRole = params.role === "pro" ? Role.pro : Role.client;
    const actorAny = actor as any;

    // Use registerUser (new, sends verification email)
    if (typeof actorAny.registerUser === "function") {
      return actorAny.registerUser(
        backendRole,
        params.email,
        params.firstName,
        params.lastName,
        params.country,
        params.language,
        params.passwordHash,
      );
    }

    // Fallback to legacy register if registerUser not available
    return actor.register(
      backendRole,
      params.email,
      params.firstName,
      params.lastName,
      params.country,
      params.language,
    );
  }

  async function resendVerification(email: string): Promise<boolean> {
    if (!actor) return false;
    const actorAny = actor as any;
    if (typeof actorAny.resendVerificationEmail === "function") {
      try {
        return await actorAny.resendVerificationEmail(email);
      } catch {
        return false;
      }
    }
    return false;
  }

  async function requestPasswordReset(email: string): Promise<boolean> {
    if (!actor) return false;
    const actorAny = actor as any;
    if (typeof actorAny.requestPasswordReset === "function") {
      try {
        return await actorAny.requestPasswordReset(email);
      } catch {
        return false;
      }
    }
    return false;
  }

  return {
    register,
    resendVerification,
    requestPasswordReset,
    isActorReady: !!actor && !isFetching,
  };
}

import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";

export function useAuth() {
  const { identity, login, clear, isLoginSuccess, isInitializing } =
    useInternetIdentity();
  const { actor } = useActor();

  return {
    isAuthenticated: isLoginSuccess || !!identity,
    isInitializing,
    login,
    logout: clear,
    identity,
    actor,
  };
}

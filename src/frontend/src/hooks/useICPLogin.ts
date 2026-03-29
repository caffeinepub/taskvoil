declare global {
  interface Window {
    ic?: { plug?: unknown };
  }
}

import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { type CurrentUser, useAuthStore } from "@/lib/auth-store";
import { AuthClient } from "@dfinity/auth-client";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const RECOVERY_MSGS: Record<string, string> = {
  fr: "💡 Conseil : sauvegardez votre méthode de connexion pour ne pas perdre l'accès à votre compte.",
  en: "💡 Tip: save your login method to avoid losing access to your account.",
  de: "💡 Tipp: Speichern Sie Ihre Anmeldemethode, um den Zugang zu Ihrem Konto nicht zu verlieren.",
  es: "💡 Consejo: guarda tu método de inicio de sesión para no perder el acceso a tu cuenta.",
  it: "💡 Consiglio: salva il tuo metodo di accesso per non perdere l'accesso al tuo account.",
  pt: "💡 Dica: guarda o teu método de login para não perderes o acesso à tua conta.",
  nl: "💡 Tip: sla uw inlogmethode op zodat u geen toegang tot uw account verliest.",
  el: "💡 Συμβουλή: αποθηκεύστε τη μέθοδο σύνδεσής σας για να μην χάσετε την πρόσβαση στον λογαριασμό σας.",
  lu: "💡 Conseil : sauvegardez votre méthode de connexion pour ne pas perdre l'accès à votre compte.",
};

const PLUG_MISSING_MSGS: Record<string, string> = {
  fr: "Plug Wallet n'est pas installé. Installez l'extension Plug.",
  en: "Plug Wallet is not installed. Please install the Plug extension.",
  de: "Plug Wallet ist nicht installiert. Bitte installieren Sie die Plug-Erweiterung.",
  es: "Plug Wallet no está instalado. Por favor instala la extensión Plug.",
  it: "Plug Wallet non è installato. Installa l'estensione Plug.",
  pt: "O Plug Wallet não está instalado. Por favor instale a extensão Plug.",
  nl: "Plug Wallet is niet geïnstalleerd. Installeer de Plug-extensie.",
  el: "Το Plug Wallet δεν είναι εγκατεστημένο. Εγκαταστήστε την επέκταση Plug.",
};

const AUTH_ERROR_MSGS: Record<string, string> = {
  fr: "Connexion annulée ou échouée",
  en: "Login cancelled or failed",
  de: "Anmeldung abgebrochen oder fehlgeschlagen",
  es: "Inicio de sesión cancelado o fallido",
  it: "Accesso annullato o fallito",
  pt: "Login cancelado ou falhado",
  nl: "Inloggen geannuleerd of mislukt",
  el: "Σύνδεση ακυρώθηκε ή απέτυχε",
};

function getLang(): string {
  try {
    const country = localStorage.getItem("taskvoila_country_v6") ?? "FR";
    const map: Record<string, string> = {
      FR: "fr",
      BE: "fr",
      LU: "fr",
      GB: "en",
      IE: "en",
      DE: "de",
      CH: "de",
      ES: "es",
      IT: "it",
      PT: "pt",
      NL: "nl",
      GR: "el",
    };
    return map[country.toUpperCase()] ?? "en";
  } catch {
    return "en";
  }
}

export function useICPLogin() {
  const { login: iiLogin, isLoginSuccess, identity } = useInternetIdentity();
  const { loginUser } = useAuthStore();
  const navigate = useNavigate();
  const [loadingProvider, setLoadingProvider] = useState<
    "ii" | "nfid" | "plug" | null
  >(null);
  const pendingProvider = useRef<"ii" | "nfid" | "plug" | null>(null);

  const handlePrincipalLogin = useCallback(
    (principal: string) => {
      const savedRaw = localStorage.getItem(`taskvoila_profile_${principal}`);
      if (savedRaw) {
        try {
          const saved = JSON.parse(savedRaw) as CurrentUser;
          loginUser({ ...saved, icpPrincipal: principal });

          if (!localStorage.getItem("tv_recovery_shown")) {
            const lang = getLang();
            toast.success(RECOVERY_MSGS[lang] ?? RECOVERY_MSGS.en, {
              duration: 6000,
            });
            localStorage.setItem("tv_recovery_shown", "1");
          }

          const dest =
            saved.role === "admin"
              ? "/dashboard/admin"
              : saved.role === "pro"
                ? "/dashboard/pro"
                : "/dashboard/client";
          void navigate({ to: dest });
          return;
        } catch {
          // corrupted profile — fall through
        }
      }

      localStorage.setItem("taskvoila_pending_principal", principal);
      void navigate({ to: "/complete-profile" });
    },
    [loginUser, navigate],
  );

  // Watch II login success
  useEffect(() => {
    if (isLoginSuccess && identity && pendingProvider.current === "ii") {
      const principal = identity.getPrincipal().toString();
      pendingProvider.current = null;
      setLoadingProvider(null);
      handlePrincipalLogin(principal);
    }
  }, [isLoginSuccess, identity, handlePrincipalLogin]);

  const handleAuth = useCallback(
    async (provider: "ii" | "nfid" | "plug") => {
      setLoadingProvider(provider);

      try {
        if (provider === "ii") {
          pendingProvider.current = "ii";
          iiLogin();
          // loading state cleared in useEffect above
          return;
        }

        if (provider === "nfid") {
          const authClient = await AuthClient.create();
          await new Promise<void>((resolve, reject) => {
            authClient.login({
              identityProvider: "https://nfid.one/authenticate",
              maxTimeToLive: BigInt(24 * 30) * BigInt(3_600_000_000_000),
              onSuccess: () => resolve(),
              onError: (err) => reject(new Error(err ?? "NFID login failed")),
            });
          });
          const principal = authClient.getIdentity().getPrincipal().toString();
          handlePrincipalLogin(principal);
          return;
        }

        if (provider === "plug") {
          if (!window.ic?.plug) {
            const lang = getLang();
            toast.error(PLUG_MISSING_MSGS[lang] ?? PLUG_MISSING_MSGS.en);
            setLoadingProvider(null);
            return;
          }
          const plug = window.ic.plug as any;
          await plug.requestConnect();
          const principalObj = await plug.agent?.getPrincipal();
          const principal =
            (principalObj?.toString() as string | undefined) ?? "";
          if (!principal) throw new Error("Could not retrieve Plug principal");
          handlePrincipalLogin(principal);
          return;
        }
      } catch (err) {
        const lang = getLang();
        console.error(err);
        toast.error(AUTH_ERROR_MSGS[lang] ?? AUTH_ERROR_MSGS.en);
        pendingProvider.current = null;
        setLoadingProvider(null);
      }
    },
    [iiLogin, handlePrincipalLogin],
  );

  return { handleAuth, loadingProvider, isReady: true };
}

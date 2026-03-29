import { SimulatedICPModal } from "@/components/auth/SimulatedICPModal";
import { Button } from "@/components/ui/button";
import { useSimulatedICP } from "@/hooks/useSimulatedICP";
import { type CurrentUser, useAuthStore } from "@/lib/auth-store";
import { useTranslation } from "@/lib/i18n";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Fingerprint,
  Loader2,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ICP_TEXTS: Record<
  string,
  {
    title: string;
    subtitle: string;
    iiSubtitle: string;
    nfidSubtitle: string;
    plugSubtitle: string;
    decentralized: string;
    noAccount: string;
    register: string;
    cancelledError: string;
  }
> = {
  fr: {
    title: "Connexion",
    subtitle: "Choisissez votre méthode de connexion sécurisée",
    iiSubtitle: "Biométrie · Clé d'appareil",
    nfidSubtitle: "Connexion avec Google possible",
    plugSubtitle: "Wallet Web3 · Sans mot de passe",
    decentralized: "Authentification décentralisée sécurisée par ICP",
    noAccount: "Pas encore inscrit ?",
    register: "Créer un compte",
    cancelledError: "Connexion annulée ou échouée",
  },
  en: {
    title: "Sign In",
    subtitle: "Choose your secure login method",
    iiSubtitle: "Biometrics · Device key",
    nfidSubtitle: "Google login available",
    plugSubtitle: "Web3 Wallet · Passwordless",
    decentralized: "Decentralised authentication secured by ICP",
    noAccount: "No account yet?",
    register: "Create an account",
    cancelledError: "Login cancelled or failed",
  },
  de: {
    title: "Anmelden",
    subtitle: "Wählen Sie Ihre sichere Anmeldemethode",
    iiSubtitle: "Biometrie · Geräteschlüssel",
    nfidSubtitle: "Google-Login verfügbar",
    plugSubtitle: "Web3-Wallet · Ohne Passwort",
    decentralized: "Dezentrale Authentifizierung gesichert durch ICP",
    noAccount: "Noch kein Konto?",
    register: "Konto erstellen",
    cancelledError: "Anmeldung abgebrochen oder fehlgeschlagen",
  },
  es: {
    title: "Iniciar sesión",
    subtitle: "Elige tu método de inicio de sesión seguro",
    iiSubtitle: "Biometría · Clave de dispositivo",
    nfidSubtitle: "Inicio de sesión con Google disponible",
    plugSubtitle: "Cartera Web3 · Sin contraseña",
    decentralized: "Autenticación descentralizada protegida por ICP",
    noAccount: "¿Aún no tienes cuenta?",
    register: "Crear una cuenta",
    cancelledError: "Inicio de sesión cancelado o fallido",
  },
  it: {
    title: "Accedi",
    subtitle: "Scegli il tuo metodo di accesso sicuro",
    iiSubtitle: "Biometria · Chiave dispositivo",
    nfidSubtitle: "Accesso con Google disponibile",
    plugSubtitle: "Portafoglio Web3 · Senza password",
    decentralized: "Autenticazione decentralizzata protetta da ICP",
    noAccount: "Non hai ancora un account?",
    register: "Crea un account",
    cancelledError: "Accesso annullato o fallito",
  },
  pt: {
    title: "Iniciar sessão",
    subtitle: "Escolha o seu método de início de sessão seguro",
    iiSubtitle: "Biometria · Chave de dispositivo",
    nfidSubtitle: "Login com Google disponível",
    plugSubtitle: "Carteira Web3 · Sem palavra-passe",
    decentralized: "Autenticação descentralizada protegida pelo ICP",
    noAccount: "Ainda não tem conta?",
    register: "Criar uma conta",
    cancelledError: "Login cancelado ou falhado",
  },
  nl: {
    title: "Inloggen",
    subtitle: "Kies uw veilige inlogmethode",
    iiSubtitle: "Biometrie · Apparaatsleutel",
    nfidSubtitle: "Google-login beschikbaar",
    plugSubtitle: "Web3-portemonnee · Zonder wachtwoord",
    decentralized: "Gedecentraliseerde authenticatie beveiligd door ICP",
    noAccount: "Nog geen account?",
    register: "Account aanmaken",
    cancelledError: "Inloggen geannuleerd of mislukt",
  },
  el: {
    title: "Σύνδεση",
    subtitle: "Επιλέξτε τη μέθοδο ασφαλούς σύνδεσής σας",
    iiSubtitle: "Βιομετρία · Κλειδί συσκευής",
    nfidSubtitle: "Διαθέσιμη σύνδεση Google",
    plugSubtitle: "Web3 Πορτοφόλι · Χωρίς κωδικό",
    decentralized: "Αποκεντρωμένη αυθεντικοποίηση ασφαλισμένη από το ICP",
    noAccount: "Δεν έχετε ακόμα λογαριασμό;",
    register: "Δημιουργία λογαριασμού",
    cancelledError: "Σύνδεση ακυρώθηκε ή απέτυχε",
  },
};

export function LoginPage() {
  const { lang } = useTranslation();
  const icp = ICP_TEXTS[lang] ?? ICP_TEXTS.en;
  const { loginUser } = useAuthStore();
  const navigate = useNavigate();
  const { simulateICP, modalState } = useSimulatedICP();
  const [loadingProvider, setLoadingProvider] = useState<
    "ii" | "nfid" | "plug" | null
  >(null);

  async function handleAuth(provider: "ii" | "nfid" | "plug") {
    setLoadingProvider(provider);
    try {
      const principal = await simulateICP(provider);

      // Check if this principal already has a saved profile
      const savedRaw = localStorage.getItem(`taskvoila_profile_${principal}`);
      if (savedRaw) {
        try {
          const saved = JSON.parse(savedRaw) as CurrentUser;
          loginUser(saved);
          // Show one-time recovery advice toast
          if (!localStorage.getItem("tv_recovery_shown")) {
            const recoveryMsg: Record<string, string> = {
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
            toast.success(recoveryMsg[lang] ?? recoveryMsg.en, {
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
          // Corrupted profile — fall through to complete-profile
        }
      }

      // New principal — store pending and redirect to complete profile
      localStorage.setItem("taskvoila_pending_principal", principal);
      void navigate({ to: "/complete-profile" });
    } catch {
      toast.error(icp.cancelledError);
    } finally {
      setLoadingProvider(null);
    }
  }

  return (
    <>
      <SimulatedICPModal state={modalState} />
      <main className="min-h-screen auth-bg flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none bg-amber-400"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none bg-amber-300"
          aria-hidden="true"
        />

        <div className="w-full max-w-md relative z-10">
          {/* Back button top-left */}
          <div className="flex justify-start mb-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => void navigate({ to: "/" })}
              data-ocid="login.back.button"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {{
                fr: "Retour",
                en: "Back",
                de: "Zurück",
                es: "Volver",
                nl: "Terug",
                it: "Indietro",
                pt: "Voltar",
                el: "Πίσω",
              }[lang] ?? "Back"}
            </Button>
          </div>
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex flex-col items-center gap-3">
              <img
                src="/assets/generated/logo-proposal-3-squirrel-helmet-clipboard.dim_600x600.png"
                loading="eager"
                alt="TaskVoilà"
                className="w-16 h-16 object-contain drop-shadow-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <span className="font-display font-bold text-3xl text-foreground tracking-tight">
                Task<span className="text-amber-500">Voilà</span>
              </span>
            </Link>
            <h1 className="font-display text-xl font-bold text-foreground mt-5">
              {icp.title}
            </h1>
            <p className="text-muted-foreground mt-1.5 text-sm">
              {icp.subtitle}
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-xl p-6 md:p-8">
            <div className="space-y-3">
              {/* Internet Identity */}
              <Button
                data-ocid="login.internet_identity.button"
                className="w-full h-14 gap-3 justify-start px-5 bg-amber-50 hover:bg-amber-100 border border-amber-200 hover:border-amber-400 text-amber-900 font-semibold transition-all shadow-sm"
                variant="outline"
                onClick={() => void handleAuth("ii")}
                disabled={loadingProvider !== null}
              >
                {loadingProvider === "ii" ? (
                  <Loader2 className="h-5 w-5 animate-spin text-amber-500 shrink-0" />
                ) : (
                  <Fingerprint className="h-5 w-5 text-amber-500 shrink-0" />
                )}
                <div className="flex-1 text-left">
                  <div className="text-sm font-bold text-amber-900">
                    Internet Identity
                  </div>
                  <div className="text-xs text-amber-700 font-normal mt-0.5">
                    {icp.iiSubtitle}
                  </div>
                </div>
                <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />
              </Button>

              {/* NFID */}
              <Button
                data-ocid="login.nfid.button"
                className="w-full h-14 gap-3 justify-start px-5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 hover:border-indigo-400 text-indigo-900 font-semibold transition-all shadow-sm"
                variant="outline"
                onClick={() => void handleAuth("nfid")}
                disabled={loadingProvider !== null}
              >
                {loadingProvider === "nfid" ? (
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-500 shrink-0" />
                ) : (
                  <span className="text-xl shrink-0">🔒</span>
                )}
                <div className="flex-1 text-left">
                  <div className="text-sm font-bold text-indigo-900">NFID</div>
                  <div className="text-xs text-indigo-600 font-normal mt-0.5">
                    {icp.nfidSubtitle}
                  </div>
                </div>
              </Button>

              {/* Plug Wallet */}
              <Button
                data-ocid="login.plug_wallet.button"
                className="w-full h-14 gap-3 justify-start px-5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 hover:border-emerald-400 text-emerald-900 font-semibold transition-all shadow-sm"
                variant="outline"
                onClick={() => void handleAuth("plug")}
                disabled={loadingProvider !== null}
              >
                {loadingProvider === "plug" ? (
                  <Loader2 className="h-5 w-5 animate-spin text-emerald-500 shrink-0" />
                ) : (
                  <Wallet className="h-5 w-5 text-emerald-500 shrink-0" />
                )}
                <div className="flex-1 text-left">
                  <div className="text-sm font-bold text-emerald-900">
                    Plug Wallet
                  </div>
                  <div className="text-xs text-emerald-600 font-normal mt-0.5">
                    {icp.plugSubtitle}
                  </div>
                </div>
              </Button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground/60" />
              <p className="text-xs text-muted-foreground/60 text-center">
                {icp.decentralized}
              </p>
            </div>

            <div className="mt-5 pt-5 border-t border-border text-center text-sm text-muted-foreground">
              {icp.noAccount}{" "}
              <Link
                to="/register"
                data-ocid="login.register.link"
                className="font-bold text-amber-600 hover:underline"
              >
                {icp.register}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

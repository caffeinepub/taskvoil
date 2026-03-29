import { useAuthStore } from "@/lib/auth-store";
import { useTranslation } from "@/lib/i18n";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { LogIn, UserPlus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const EXCLUDED_PATHS = ["/register", "/login"];

const SESSION_KEY = "tv_visitor_clicks";
const AUTO_TRIGGER_MS = 25_000;

type VisitorGateContextType = {
  triggerGate: () => boolean;
  isGateOpen: boolean;
  closeGate: () => void;
};

const VisitorGateContext = createContext<VisitorGateContextType | undefined>(
  undefined,
);

export function useVisitorGate() {
  const ctx = useContext(VisitorGateContext);
  if (!ctx) {
    throw new Error("useVisitorGate must be used within VisitorGateProvider");
  }
  return ctx;
}

const GATE_TEXTS: Record<
  string,
  {
    title: string;
    subtitle: string;
    createAccount: string;
    haveAccount: string;
    free: string;
    close: string;
  }
> = {
  fr: {
    title: "Rejoignez TaskVoilà",
    subtitle: "Accédez à toutes les annonces et contactez les professionnels",
    createAccount: "Créer un compte",
    haveAccount: "J'ai déjà un compte",
    free: "🔒 Inscription gratuite · Sans engagement",
    close: "Fermer",
  },
  en: {
    title: "Join TaskVoilà",
    subtitle: "Access all listings and contact professionals",
    createAccount: "Create an account",
    haveAccount: "I already have an account",
    free: "🔒 Free sign-up · No commitment",
    close: "Close",
  },
  de: {
    title: "TaskVoilà beitreten",
    subtitle: "Zugriff auf alle Inserate und Kontakt zu Profis",
    createAccount: "Konto erstellen",
    haveAccount: "Ich habe bereits ein Konto",
    free: "🔒 Kostenlose Registrierung · Ohne Verpflichtung",
    close: "Schließen",
  },
  es: {
    title: "Únete a TaskVoilà",
    subtitle: "Accede a todos los anuncios y contacta a los profesionales",
    createAccount: "Crear una cuenta",
    haveAccount: "Ya tengo una cuenta",
    free: "🔒 Registro gratuito · Sin compromiso",
    close: "Cerrar",
  },
  it: {
    title: "Unisciti a TaskVoilà",
    subtitle: "Accedi a tutti gli annunci e contatta i professionisti",
    createAccount: "Crea un account",
    haveAccount: "Ho già un account",
    free: "🔒 Registrazione gratuita · Senza impegno",
    close: "Chiudi",
  },
  pt: {
    title: "Junte-se ao TaskVoilà",
    subtitle: "Aceda a todos os anúncios e contacte os profissionais",
    createAccount: "Criar uma conta",
    haveAccount: "Já tenho uma conta",
    free: "🔒 Registo gratuito · Sem compromisso",
    close: "Fechar",
  },
  nl: {
    title: "Word lid van TaskVoilà",
    subtitle: "Toegang tot alle advertenties en contact met professionals",
    createAccount: "Account aanmaken",
    haveAccount: "Ik heb al een account",
    free: "🔒 Gratis registratie · Zonder verplichtingen",
    close: "Sluiten",
  },
  el: {
    title: "Εγγραφείτε στο TaskVoilà",
    subtitle: "Πρόσβαση σε όλες τις αγγελίες και επικοινωνία με επαγγελματίες",
    createAccount: "Δημιουργία λογαριασμού",
    haveAccount: "Έχω ήδη λογαριασμό",
    free: "🔒 Δωρεάν εγγραφή · Χωρίς δέσμευση",
    close: "Κλείσιμο",
  },
};

function getGateLang(): string {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("taskvoila_country_v6");
      if (raw) {
        const parsed = JSON.parse(raw) as { lang?: string };
        if (parsed.lang) {
          if (GATE_TEXTS[parsed.lang]) return parsed.lang;
          if (parsed.lang === "ie") return "en";
        }
      }
    } catch {
      // ignore
    }
  }
  return "en";
}

export function VisitorGateProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuthStore();
  const [isGateOpen, setIsGateOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const isExcluded = EXCLUDED_PATHS.some((p) => currentPath.startsWith(p));

  useEffect(() => {
    if (isExcluded) {
      setIsGateOpen(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [isExcluded]);

  useEffect(() => {
    if (currentUser || isExcluded) return;
    timerRef.current = setTimeout(() => {
      if (!currentUser && !isExcluded) setIsGateOpen(true);
    }, AUTO_TRIGGER_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentUser, isExcluded]);

  useEffect(() => {
    if (currentUser) {
      setIsGateOpen(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [currentUser]);

  const triggerGate = useCallback((): boolean => {
    if (currentUser || isExcluded) return false;
    const current = Number(sessionStorage.getItem(SESSION_KEY) ?? "0");
    const next = current + 1;
    sessionStorage.setItem(SESSION_KEY, String(next));
    if (next >= 2) {
      setIsGateOpen(true);
      return true;
    }
    return false;
  }, [currentUser, isExcluded]);

  const closeGate = useCallback(() => setIsGateOpen(false), []);

  return (
    <VisitorGateContext.Provider value={{ triggerGate, isGateOpen, closeGate }}>
      {children}
      <VisitorGateModal />
    </VisitorGateContext.Provider>
  );
}

function VisitorGateModal() {
  const { isGateOpen, closeGate } = useVisitorGate();
  const { lang } = useTranslation();
  const navigate = useNavigate();

  // Prefer locale from country store if available; fall back to useTranslation lang
  const gateLang = getGateLang();
  const texts = GATE_TEXTS[gateLang] ?? GATE_TEXTS[lang] ?? GATE_TEXTS.en;

  useEffect(() => {
    if (!isGateOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeGate();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isGateOpen, closeGate]);

  useEffect(() => {
    document.body.style.overflow = isGateOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isGateOpen]);

  return (
    <AnimatePresence>
      {isGateOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
            onClick={closeGate}
            aria-hidden="true"
          />

          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 pointer-events-none">
            <motion.div
              data-ocid="visitor_gate.modal"
              aria-labelledby="visitor-gate-title"
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeGate}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label={texts.close}
                data-ocid="visitor_gate.close_button"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="text-center mb-8">
                <img
                  src="/assets/generated/logo-proposal-3-squirrel-helmet-clipboard.dim_600x600.png"
                  loading="eager"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                  alt="TaskVoilà"
                  className="w-16 h-16 object-contain mx-auto mb-4 drop-shadow-md"
                />
                <h2
                  id="visitor-gate-title"
                  className="font-display text-xl font-black mb-2"
                  style={{ color: "oklch(0.18 0.06 250)" }}
                >
                  {texts.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {texts.subtitle}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  data-ocid="visitor_gate.create_account"
                  onClick={() => {
                    closeGate();
                    setTimeout(() => void navigate({ to: "/register" }), 50);
                  }}
                  className="w-full h-12 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.72 0.18 65), oklch(0.62 0.22 55))",
                  }}
                >
                  <UserPlus className="h-4 w-4" />
                  {texts.createAccount}
                </button>

                <button
                  type="button"
                  data-ocid="visitor_gate.login"
                  onClick={() => {
                    closeGate();
                    setTimeout(() => void navigate({ to: "/login" }), 50);
                  }}
                  className="w-full h-12 rounded-xl text-sm font-bold border-2 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] bg-white"
                  style={{
                    borderColor: "oklch(0.72 0.18 65)",
                    color: "oklch(0.45 0.15 55)",
                  }}
                >
                  <LogIn className="h-4 w-4" />
                  {texts.haveAccount}
                </button>
              </div>

              <p className="text-center text-xs text-muted-foreground mt-5">
                {texts.free}
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

import { useAuthStore } from "@/lib/auth-store";
import { useNavigate } from "@tanstack/react-router";
import { LogIn, UserPlus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";

const BLUR_DELAY_MS = 3_000;

const TEXTS: Record<
  string,
  {
    title: string;
    subtitle: string;
    createAccount: string;
    haveAccount: string;
    badge: string;
  }
> = {
  fr: {
    title: "Accédez aux annonces",
    subtitle:
      "Inscrivez-vous gratuitement pour voir toutes les annonces et contacter les professionnels.",
    createAccount: "Créer un compte",
    haveAccount: "J'ai déjà un compte",
    badge: "🔒 Gratuit · Sans engagement",
  },
  en: {
    title: "Access listings",
    subtitle:
      "Sign up for free to view all listings and contact professionals.",
    createAccount: "Create an account",
    haveAccount: "I already have an account",
    badge: "🔒 Free · No commitment",
  },
  de: {
    title: "Inserate ansehen",
    subtitle:
      "Registrieren Sie sich kostenlos, um alle Inserate zu sehen und Profis zu kontaktieren.",
    createAccount: "Konto erstellen",
    haveAccount: "Ich habe bereits ein Konto",
    badge: "🔒 Kostenlos · Ohne Verpflichtung",
  },
  es: {
    title: "Accede a los anuncios",
    subtitle:
      "Regístrate gratis para ver todos los anuncios y contactar a los profesionales.",
    createAccount: "Crear una cuenta",
    haveAccount: "Ya tengo una cuenta",
    badge: "🔒 Gratis · Sin compromiso",
  },
  it: {
    title: "Accedi agli annunci",
    subtitle:
      "Registrati gratuitamente per vedere tutti gli annunci e contattare i professionisti.",
    createAccount: "Crea un account",
    haveAccount: "Ho già un account",
    badge: "🔒 Gratuito · Senza impegno",
  },
  pt: {
    title: "Aceda aos anúncios",
    subtitle:
      "Registe-se gratuitamente para ver todos os anúncios e contactar os profissionais.",
    createAccount: "Criar uma conta",
    haveAccount: "Já tenho uma conta",
    badge: "🔒 Gratuito · Sem compromisso",
  },
  nl: {
    title: "Toegang tot advertenties",
    subtitle:
      "Meld u gratis aan om alle advertenties te bekijken en contact op te nemen met professionals.",
    createAccount: "Account aanmaken",
    haveAccount: "Ik heb al een account",
    badge: "🔒 Gratis · Zonder verplichtingen",
  },
  el: {
    title: "Πρόσβαση στις αγγελίες",
    subtitle:
      "Εγγραφείτε δωρεάν για να δείτε όλες τις αγγελίες και να επικοινωνήσετε με επαγγελματίες.",
    createAccount: "Δημιουργία λογαριασμού",
    haveAccount: "Έχω ήδη λογαριασμό",
    badge: "🔒 Δωρεάν · Χωρίς δέσμευση",
  },
};

function getLang(): string {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("taskvoila_country_v6");
      if (raw) {
        const parsed = JSON.parse(raw) as { lang?: string };
        if (parsed.lang) {
          if (TEXTS[parsed.lang]) return parsed.lang;
          // "ie" maps to English
          if (parsed.lang === "ie") return "en";
        }
      }
    } catch {
      // ignore
    }
  }
  return "en"; // default to English, not French
}

interface BlurGateProps {
  children: ReactNode;
}

export function BlurGate({ children }: BlurGateProps) {
  const { currentUser } = useAuthStore();
  const [blurred, setBlurred] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();
  const lang = getLang();
  const texts = TEXTS[lang] ?? TEXTS.en;

  useEffect(() => {
    if (currentUser) {
      setBlurred(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    timerRef.current = setTimeout(() => {
      setBlurred(true);
    }, BLUR_DELAY_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentUser]);

  // Lock body scroll when popup is showing
  useEffect(() => {
    document.body.style.overflow = blurred ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [blurred]);

  // Block Escape key
  useEffect(() => {
    if (!blurred) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") e.preventDefault();
    };
    document.addEventListener("keydown", handleKey, true);
    return () => document.removeEventListener("keydown", handleKey, true);
  }, [blurred]);

  return (
    <div className="relative">
      {/* Page content — blurs when timer fires */}
      <div
        style={{
          filter: blurred ? "blur(6px)" : "blur(0px)",
          transition: "filter 0.8s ease",
          pointerEvents: blurred ? "none" : undefined,
          userSelect: blurred ? "none" : undefined,
        }}
      >
        {children}
      </div>

      {/* Non-closeable popup */}
      <AnimatePresence>
        {blurred && (
          <>
            {/* Backdrop — no onClick handler intentionally */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[9990]"
              style={{
                background: "rgba(10, 8, 5, 0.65)",
                backdropFilter: "blur(2px)",
              }}
              aria-hidden="true"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[9991] flex items-center justify-center px-4 pointer-events-none">
              <motion.div
                data-ocid="blur_gate.modal"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="blur-gate-title"
                initial={{ opacity: 0, scale: 0.9, y: 28 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="relative w-full max-w-sm rounded-2xl shadow-2xl p-8 pointer-events-auto"
                style={{ background: "white" }}
              >
                {/* No close button — intentionally omitted */}

                <div className="text-center mb-7">
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
                    id="blur-gate-title"
                    className="font-display text-xl font-black mb-2"
                    style={{ color: "oklch(0.18 0.06 250)" }}
                  >
                    {texts.title}
                  </h2>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "oklch(0.45 0.05 250)" }}
                  >
                    {texts.subtitle}
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    data-ocid="blur_gate.create_account_button"
                    onClick={() => void navigate({ to: "/register" })}
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
                    data-ocid="blur_gate.login_button"
                    onClick={() => void navigate({ to: "/login" })}
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

                <p
                  className="text-center text-xs mt-5"
                  style={{ color: "oklch(0.6 0.04 250)" }}
                >
                  {texts.badge}
                </p>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

import type {
  ICPProvider,
  SimulatedICPModalState,
} from "@/hooks/useSimulatedICP";
import { AnimatePresence, motion } from "motion/react";

const PROVIDER_LABELS: Record<ICPProvider, string> = {
  ii: "Internet Identity",
  nfid: "NFID",
  plug: "Plug Wallet",
};

const PROVIDER_ICONS: Record<ICPProvider, string> = {
  ii: "🔐",
  nfid: "🔒",
  plug: "🔌",
};

interface Props {
  state: SimulatedICPModalState;
}

export function SimulatedICPModal({ state }: Props) {
  const { open, provider, progress } = state;

  return (
    <AnimatePresence>
      {open && provider && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Card */}
          <div className="fixed inset-0 z-[10000] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-5"
              aria-label={`Connexion via ${PROVIDER_LABELS[provider]}`}
            >
              {/* Logo */}
              <img
                src="/assets/generated/logo-proposal-3-squirrel-helmet-clipboard.dim_600x600.png"
                alt="TaskVoilà"
                className="w-14 h-14 object-contain drop-shadow-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />

              {/* Spinner + icon */}
              <div className="relative flex items-center justify-center w-16 h-16">
                {/* Spinning ring */}
                <svg
                  className="absolute inset-0 w-16 h-16"
                  viewBox="0 0 64 64"
                  aria-hidden="true"
                >
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="oklch(0.94 0.05 65)"
                    strokeWidth="4"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="oklch(0.72 0.18 65)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="44 132"
                    style={{
                      transformOrigin: "center",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                </svg>
                <span className="text-2xl">{PROVIDER_ICONS[provider]}</span>
              </div>

              {/* Label */}
              <div className="text-center">
                <p className="font-display font-bold text-base text-foreground">
                  Connexion via {PROVIDER_LABELS[provider]}…
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Authentification sécurisée en cours
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, oklch(0.72 0.18 65), oklch(0.65 0.22 55))",
                    width: `${progress}%`,
                  }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

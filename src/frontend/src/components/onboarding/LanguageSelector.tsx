import { LANGUAGE_META, type Language, SUPPORTED_LANGUAGES } from "@/lib/i18n";
import { AnimatePresence, motion } from "motion/react";

interface LanguageSelectorProps {
  onComplete: (lang: Language) => void;
}

export function LanguageSelector({ onComplete }: LanguageSelectorProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col"
      style={{
        background:
          "linear-gradient(160deg, #0f172a 0%, #1e3a5f 50%, #0f2d1a 100%)",
      }}
    >
      {/* Ambient glow decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "oklch(0.55 0.18 160)" }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: "oklch(0.45 0.20 260)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-[0.04] blur-3xl"
          style={{ background: "oklch(0.55 0.18 200)" }}
        />
      </div>

      {/* Scrollable content */}
      <div className="relative flex flex-col items-center justify-center min-h-full px-4 py-10 overflow-y-auto">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex items-center gap-3 mb-14"
        >
          <img
            src="/assets/generated/logo-proposal-3-squirrel-helmet-clipboard.dim_600x600.png"
            loading="eager"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
            alt="TaskVoilà"
            className="w-12 h-12 object-contain drop-shadow-lg shrink-0"
          />
          <span className="font-bold text-2xl text-white tracking-tight">
            Task
            <span style={{ color: "oklch(0.78 0.18 160)" }}>Voilà</span>
          </span>
        </motion.div>

        {/* Language flags grid */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="grid grid-cols-3 sm:grid-cols-4 gap-4 sm:gap-5 w-full max-w-xs sm:max-w-sm"
          >
            {SUPPORTED_LANGUAGES.map((lang, i) => {
              const meta = LANGUAGE_META[lang];
              return (
                <LangCard
                  key={lang}
                  lang={lang}
                  flag={meta.flag}
                  labelNative={meta.labelNative}
                  onClick={() => onComplete(lang)}
                  delay={i * 0.05}
                />
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function LangCard({
  flag,
  labelNative,
  onClick,
  delay,
}: {
  lang: Language;
  flag: string;
  labelNative: string;
  onClick: () => void;
  delay?: number;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay ?? 0, ease: "easeOut" }}
      whileHover={{ scale: 1.1, y: -4 }}
      whileTap={{ scale: 0.9 }}
      className="
        group flex items-center justify-center
        rounded-2xl p-3 sm:p-4 aspect-square
        cursor-pointer transition-colors duration-150 outline-none
        focus-visible:ring-2 focus-visible:ring-white/50
        hover:bg-white/15
      "
      style={{
        background: "rgba(255,255,255,0.07)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
      aria-label={labelNative}
      title={labelNative}
      data-ocid={`lang_selector.${flag}.button`}
    >
      <span
        className="text-3xl sm:text-4xl leading-none transition-transform group-hover:scale-110 duration-150"
        role="img"
        aria-hidden="true"
      >
        {flag}
      </span>
    </motion.button>
  );
}

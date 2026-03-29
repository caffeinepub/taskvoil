import { type CountryData, priorityCountries } from "@/lib/countries-data";
import { useCountryStore } from "@/lib/country-store";
import type { Language } from "@/lib/i18n";
import { AnimatePresence, motion } from "motion/react";

interface CountrySelectorProps {
  onComplete: () => void;
  /** Optional override: called instead of setCountry (used for profile country change) */
  onCountryChange?: (code: string, lang: Language) => void;
}

export function CountrySelector({
  onComplete,
  onCountryChange,
}: CountrySelectorProps) {
  const { setCountry } = useCountryStore();
  const applyCountry = onCountryChange ?? setCountry;

  function handleCountryClick(country: CountryData) {
    const lang = country.defaultLang as Language;
    applyCountry(country.code, lang);
    onComplete();
  }

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
      <div className="relative flex flex-col min-h-full overflow-y-auto">
        {/* Logo -- minimal, centered */}
        <div className="flex justify-center pt-10 pb-8 px-4 shrink-0">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex items-center gap-3"
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
        </div>

        {/* Content area -- flex-1, centered */}
        <div className="flex-1 flex flex-col items-center justify-start w-full px-4 pb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key="country-step"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-xl"
            >
              {/* Flags grid -- 4 cols on mobile, 5-6 on larger screens */}
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 sm:gap-4">
                {priorityCountries.map((country, i) => (
                  <FlagCard
                    key={country.code}
                    country={country}
                    onClick={() => handleCountryClick(country)}
                    delay={i * 0.04}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function FlagCard({
  country,
  onClick,
  delay,
}: {
  country: CountryData;
  onClick: () => void;
  delay?: number;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay ?? 0, ease: "easeOut" }}
      whileHover={{ scale: 1.12, y: -3 }}
      whileTap={{ scale: 0.9 }}
      className="
        group flex flex-col items-center justify-center
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
      title={country.nameFR}
      aria-label={`${country.nameFR} / ${country.nameEN}`}
      data-ocid={`country_selector.${country.code.toLowerCase()}.button`}
    >
      <span
        className="text-3xl sm:text-4xl md:text-5xl leading-none transition-transform group-hover:scale-110 duration-150"
        role="img"
        aria-hidden="true"
      >
        {country.flag}
      </span>
    </motion.button>
  );
}

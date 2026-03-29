import { type CountryData, priorityCountries } from "@/lib/countries-data";
import { useCountryStore } from "@/lib/country-store";
import type { Language } from "@/lib/i18n";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface CountrySelectorProps {
  onComplete: () => void;
  onCountryChange?: (code: string, lang: Language) => void;
}

export function CountrySelector({
  onComplete,
  onCountryChange,
}: CountrySelectorProps) {
  const { setCountry } = useCountryStore();
  const applyCountry = onCountryChange ?? setCountry;
  const [bilingualCountry, setBilingualCountry] = useState<CountryData | null>(
    null,
  );

  function handleCountryClick(country: CountryData) {
    // If country has multiple languages, show language picker first
    if (country.languages && country.languages.length > 1) {
      setBilingualCountry(country);
      return;
    }
    const lang = country.defaultLang as Language;
    applyCountry(country.code, lang);
    onComplete();
  }

  function handleLangPick(lang: Language) {
    if (!bilingualCountry) return;
    applyCountry(bilingualCountry.code, lang);
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
        {/* Logo */}
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

        {/* Content area */}
        <div className="flex-1 flex flex-col items-center justify-start w-full px-4 pb-12">
          <AnimatePresence mode="wait">
            {bilingualCountry ? (
              /* Language picker for bilingual countries (e.g. Switzerland) */
              <motion.div
                key="lang-step"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="w-full max-w-xs flex flex-col items-center gap-6"
              >
                <div className="text-center">
                  <div className="text-5xl mb-3">{bilingualCountry.flag}</div>
                  <p className="text-white/70 text-sm">
                    {bilingualCountry.nameFR} / {bilingualCountry.nameEN}
                  </p>
                  <p className="text-white font-semibold text-lg mt-1">
                    Choisissez votre langue
                  </p>
                  <p className="text-white/50 text-xs mt-1">
                    Wählen Sie Ihre Sprache
                  </p>
                </div>
                <div className="flex gap-4">
                  <motion.button
                    type="button"
                    onClick={() => handleLangPick("fr")}
                    whileHover={{ scale: 1.07 }}
                    whileTap={{ scale: 0.94 }}
                    className="flex flex-col items-center gap-2 px-8 py-5 rounded-2xl cursor-pointer"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.15)",
                    }}
                  >
                    <span className="text-3xl">🇫🇷</span>
                    <span className="text-white font-medium">Français</span>
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => handleLangPick("de")}
                    whileHover={{ scale: 1.07 }}
                    whileTap={{ scale: 0.94 }}
                    className="flex flex-col items-center gap-2 px-8 py-5 rounded-2xl cursor-pointer"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.15)",
                    }}
                  >
                    <span className="text-3xl">🇨🇭</span>
                    <span className="text-white font-medium">Deutsch</span>
                  </motion.button>
                </div>
                <button
                  type="button"
                  onClick={() => setBilingualCountry(null)}
                  className="text-white/40 text-sm hover:text-white/70 transition-colors mt-2"
                >
                  ← Retour / Zurück
                </button>
              </motion.div>
            ) : (
              /* Country grid */
              <motion.div
                key="country-step"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25 }}
                className="w-full max-w-xl"
              >
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
            )}
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
      {country.languages && country.languages.length > 1 && (
        <span className="text-[8px] text-white/40 mt-1">
          {country.languages.join("/").toUpperCase()}
        </span>
      )}
    </motion.button>
  );
}

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useVisitorGate } from "@/components/visitor/VisitorGate";
import { matchesCountry } from "@/lib/country-filter";
import { useCountryStore } from "@/lib/country-store";
import { type DemoPro, categoryEmojis, n1Categories } from "@/lib/demo-data";
import { useTranslation } from "@/lib/i18n";
import { useProfileStore } from "@/lib/profile-store";
import { PLAN_DETAILS, useSubscriptionStore } from "@/lib/subscription-store";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Clock,
  Shield,
  Star,
  ThumbsUp,
} from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import { useState } from "react";

// ─── Country-specific hero slogans ────────────────────────────────────────────
const COUNTRY_SLOGANS: Record<string, string> = {
  FR: "Postez votre demande. Recevez votre service. Voilà.",
  BE: "Postez votre demande. Recevez votre service. Voilà.",
  GB: "Task it. Get it. Voilà.",
  DE: "Stell deine Anfrage ein. Erhalte Angebote. Voilà.",
  ES: "Publica tu necesidad. Recibe ofertas. Voilà.",
  IE: "Task it. Get it. Voilà.",
  NL: "Plaats je klus. Ontvang offertes. Voilà.",
  IT: "Pubblica la tua richiesta. Ricevi le offerte. Voilà.",
  PT: "Publica o teu pedido. Recebe propostas. Voilà.",
  GR: "Δημοσίευσε την ανάγκη σου. Λάβε προσφορές. Voilà.",
  CH: "Stell deinen Auftrag ein. Erhalte Angebote. Voilà.",
};

// ─── Country-specific hero headlines ("Need a hand?" translated) ──────────────
const COUNTRY_HEADLINES: Record<string, string> = {
  FR: "Besoin d'un artisan ?",
  BE: "Besoin d'un artisan ?",
  GB: "Need a hand?",
  IE: "Need a hand?",
  DE: "Brauchen Sie Hilfe?",
  ES: "¿Necesita ayuda?",
  NL: "Hulp nodig?",
  IT: "Hai bisogno di aiuto?",
  PT: "Precisa de ajuda?",
  GR: "Χρειάζεστε βοήθεια;",
  CH: "Brauchen Sie Hilfe?",
};

// ─── Réalisations avant/après ───────────────────────────────────────────────

interface RealisationItem {
  labelFR: string;
  labelEN: string;
  categoryFR: string;
  categoryEN: string;
  before: string;
  after: string;
  tagFR: string;
  tagEN: string;
}

const realisations: RealisationItem[] = [
  {
    labelFR: "Rénovation Cuisine",
    labelEN: "Kitchen Renovation",
    categoryFR: "Gros Œuvre & Rénovation",
    categoryEN: "Construction & Renovation",
    before: "/assets/generated/kitchen-before-90s.dim_800x600.jpg",
    after: "/assets/generated/kitchen-after-2025.dim_800x600.jpg",
    tagFR: "Cuisine complète",
    tagEN: "Full kitchen",
  },
  {
    labelFR: "Rénovation Salle de Bain",
    labelEN: "Bathroom Renovation",
    categoryFR: "Gros Œuvre & Rénovation",
    categoryEN: "Construction & Renovation",
    before: "/assets/generated/bathroom-before-90s.dim_800x600.jpg",
    after: "/assets/generated/bathroom-after-2025.dim_800x600.jpg",
    tagFR: "Salle de bain",
    tagEN: "Bathroom",
  },
];

const singleWorks = [
  {
    labelFR: "Dépannage Électrique",
    labelEN: "Electrical Repair",
    image: "/assets/generated/handyman-work.dim_800x600.jpg",
    tagFR: "HandyTask",
    tagEN: "HandyTask",
  },
  {
    labelFR: "Peinture Intérieure",
    labelEN: "Interior Painting",
    image: "/assets/generated/painting-work.dim_800x600.jpg",
    tagFR: "Peinture",
    tagEN: "Painting",
  },
  {
    labelFR: "Plomberie Dépannage",
    labelEN: "Plumbing Repair",
    image: "/assets/generated/plumbing-work.dim_800x600.jpg",
    tagFR: "Plomberie",
    tagEN: "Plumbing",
  },
  {
    labelFR: "Jardin & Extérieur",
    labelEN: "Garden & Outdoor",
    image: "/assets/generated/garden-work.dim_800x600.jpg",
    tagFR: "Jardinage",
    tagEN: "Gardening",
  },
];

// ─── ProAvatar helper (uses profile store) ───────────────────────────────────
function ProAvatar({
  proId,
  initials,
  size,
  index,
}: {
  proId: number;
  initials: string;
  size: "sm" | "md" | "lg";
  index?: number;
}) {
  const { getProfile } = useProfileStore();
  const imgs = getProfile(`pro_${proId}`);
  const dim =
    size === "sm" ? "w-10 h-10" : size === "lg" ? "w-20 h-20" : "w-14 h-14";
  const text =
    size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-lg";
  const idx = index ?? 0;
  return (
    <div
      className={`${dim} rounded-full border-[3px] border-white shadow-md overflow-hidden flex items-center justify-center text-white font-black ${text} shrink-0 relative`}
      style={{
        background: `linear-gradient(135deg, oklch(0.55 0.18 ${160 + idx * 20}), oklch(0.35 0.15 ${250 - idx * 15}))`,
        zIndex: 10,
      }}
    >
      {imgs.avatarDataUrl ? (
        <img
          src={imgs.avatarDataUrl}
          alt="avatar"
          className="w-full h-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
}

// ─── ProCover helper ──────────────────────────────────────────────────────────
function ProCover({
  proId,
  children,
  className,
  style,
}: {
  proId: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { getProfile } = useProfileStore();
  const imgs = getProfile(`pro_${proId}`);
  return (
    <div
      className={`relative ${className ?? ""}`}
      style={{ ...style, overflow: "visible" }}
    >
      {/* Background layer — clipped so gradient/image doesn't bleed outside the cover area */}
      <div className="absolute inset-0 overflow-hidden rounded-t-2xl">
        {imgs.coverDataUrl ? (
          <img
            src={imgs.coverDataUrl}
            alt="cover"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : null}
      </div>
      {/* Children (badges, etc.) rendered above the background */}
      <div className="relative" style={{ zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}

function BeforeAfterCard({
  item,
  lang,
  index,
}: {
  item: RealisationItem;
  lang: string;
  index: number;
}) {
  const { t } = useTranslation();
  const [showAfter, setShowAfter] = useState(false);
  const label = lang === "fr" ? item.labelFR : item.labelEN;
  const tag = lang === "fr" ? item.tagFR : item.tagEN;
  const beforeLabel = t.ui.uiBefore;
  const afterLabel = t.ui.uiAfter;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, delay: index * 0.12, ease: "easeOut" }}
      className="relative group"
    >
      {/* Amber floating glow — always visible, stronger on hover */}
      <div
        className="absolute -inset-3 rounded-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 110%, oklch(0.75 0.15 60 / 0.55) 0%, oklch(0.75 0.15 60 / 0.18) 45%, transparent 70%)",
          filter: "blur(18px)",
          zIndex: 0,
        }}
        aria-hidden="true"
      />
      {/* Always-on amber shadow below card */}
      <div
        className="absolute -bottom-4 left-[10%] right-[10%] h-10 rounded-full pointer-events-none"
        style={{
          background: "oklch(0.75 0.15 60 / 0.40)",
          filter: "blur(22px)",
          zIndex: 0,
        }}
        aria-hidden="true"
      />

      {/* Card */}
      <div className="relative z-10 rounded-2xl overflow-hidden bg-white border border-amber-200 shadow-lg group-hover:shadow-2xl transition-shadow duration-300">
        {/* Image area */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {/* Before image */}
          <img
            src={item.before}
            alt={`${label} - ${beforeLabel}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${showAfter ? "opacity-0" : "opacity-100"}`}
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement;
              el.style.display = "none";
              const parent = el.parentElement;
              if (parent && !parent.querySelector(".img-fallback")) {
                const fb = document.createElement("div");
                fb.className =
                  "img-fallback absolute inset-0 bg-stone-200 flex items-center justify-center text-stone-400 text-sm";
                fb.textContent = label;
                parent.appendChild(fb);
              }
            }}
          />
          {/* After image */}
          <img
            src={item.after}
            alt={`${label} - ${afterLabel}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${showAfter ? "opacity-100" : "opacity-0"}`}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />

          {/* Amber overlay shimmer on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, transparent 55%, oklch(0.75 0.15 60 / 0.22) 100%)",
            }}
            aria-hidden="true"
          />

          {/* Before / After toggle tabs */}
          <div className="absolute top-3 left-3 flex rounded-lg overflow-hidden shadow-lg border border-white/30">
            <button
              type="button"
              onClick={() => setShowAfter(false)}
              className={`px-3 py-1.5 text-xs font-black transition-colors duration-200 ${
                !showAfter
                  ? "bg-amber-500 text-white"
                  : "bg-black/50 text-white/70 hover:bg-black/60 backdrop-blur-sm"
              }`}
            >
              {beforeLabel}
            </button>
            <button
              type="button"
              onClick={() => setShowAfter(true)}
              className={`px-3 py-1.5 text-xs font-black transition-colors duration-200 ${
                showAfter
                  ? "bg-emerald-500 text-white"
                  : "bg-black/50 text-white/70 hover:bg-black/60 backdrop-blur-sm"
              }`}
            >
              {afterLabel}
            </button>
          </div>

          {/* Category tag bottom-right */}
          <div className="absolute bottom-3 right-3">
            <span className="bg-amber-500/90 text-white text-[11px] font-black px-2.5 py-1 rounded-full backdrop-blur-sm shadow">
              {tag}
            </span>
          </div>
        </div>

        {/* Info footer */}
        <div className="px-4 py-3 flex items-center justify-between bg-white">
          <span
            className="font-black text-sm"
            style={{ color: "oklch(0.18 0.06 250)" }}
          >
            {label}
          </span>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{
              background: "oklch(0.96 0.02 60)",
              color: "oklch(0.55 0.14 60)",
            }}
          >
            {showAfter ? t.ui.uiDone : t.ui.uiBefore}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function SingleWorkCard({
  item,
  lang,
  index,
}: {
  item: (typeof singleWorks)[0];
  lang: string;
  index: number;
}) {
  const label = lang === "fr" ? item.labelFR : item.labelEN;
  const tag = lang === "fr" ? item.tagFR : item.tagEN;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, delay: 0.3 + index * 0.1, ease: "easeOut" }}
      className="relative group"
    >
      {/* Amber floating glow — always visible */}
      <div
        className="absolute -inset-3 rounded-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 110%, oklch(0.75 0.15 60 / 0.50) 0%, oklch(0.75 0.15 60 / 0.15) 45%, transparent 70%)",
          filter: "blur(18px)",
          zIndex: 0,
        }}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-4 left-[10%] right-[10%] h-10 rounded-full pointer-events-none"
        style={{
          background: "oklch(0.75 0.15 60 / 0.38)",
          filter: "blur(20px)",
          zIndex: 0,
        }}
        aria-hidden="true"
      />

      {/* Card */}
      <div className="relative z-10 rounded-2xl overflow-hidden bg-white border border-amber-200 shadow-lg group-hover:shadow-2xl transition-shadow duration-300">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={item.image}
            alt={label}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Amber gradient overlay on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, transparent 55%, oklch(0.75 0.15 60 / 0.25) 100%)",
            }}
            aria-hidden="true"
          />
          <div className="absolute bottom-3 right-3">
            <span className="bg-amber-500/90 text-white text-[11px] font-black px-2.5 py-1 rounded-full backdrop-blur-sm shadow">
              {tag}
            </span>
          </div>
        </div>
        <div className="px-4 py-3">
          <span
            className="font-black text-sm"
            style={{ color: "oklch(0.18 0.06 250)" }}
          >
            {label}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function RealisationsSection({
  lang,
  onGatedAction,
}: {
  lang: string;
  onGatedAction: () => boolean;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{ background: "oklch(0.97 0.012 55)" }}
    >
      {/* Ambient amber glow top-right */}
      <div
        className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.85 0.12 60 / 0.30) 0%, transparent 65%)",
          filter: "blur(40px)",
        }}
        aria-hidden="true"
      />
      {/* Ambient amber glow bottom-left */}
      <div
        className="absolute -bottom-16 -left-16 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.80 0.14 55 / 0.22) 0%, transparent 60%)",
          filter: "blur(40px)",
        }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold mb-5 border"
            style={{
              background: "oklch(0.96 0.05 60)",
              color: "oklch(0.50 0.14 60)",
              borderColor: "oklch(0.88 0.08 60)",
            }}
          >
            ✨ {t.ui.uiVerifiedWork}
          </div>
          <h2
            className="font-display text-3xl md:text-5xl font-black mb-4 leading-tight"
            style={{ color: "oklch(0.18 0.06 250)" }}
          >
            {lang === "fr" ? (
              <>
                Des transformations{" "}
                <span style={{ color: "oklch(0.55 0.15 55)" }}>
                  avant · après
                </span>
              </>
            ) : (
              <>
                Real{" "}
                <span style={{ color: "oklch(0.55 0.15 55)" }}>
                  before · after
                </span>{" "}
                transformations
              </>
            )}
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            {t.ui.uiVerifiedProsDesc}
          </p>
        </motion.div>

        {/* Before/After cards */}
        <div className="grid md:grid-cols-2 gap-10 mb-10">
          {realisations.map((item, i) => (
            <BeforeAfterCard
              key={item.labelFR}
              item={item}
              lang={lang}
              index={i}
            />
          ))}
        </div>

        {/* Single work photos */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {singleWorks.map((item, i) => (
            <SingleWorkCard
              key={item.labelFR}
              item={item}
              lang={lang}
              index={i}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-14"
        >
          <p
            className="text-sm font-semibold mb-4"
            style={{ color: "oklch(0.55 0.10 60)" }}
          >
            {t.ui.uiBlockchainDoc}
          </p>
          <button
            type="button"
            onClick={() => {
              if (onGatedAction()) return;
              void navigate({ to: "/post-task" });
            }}
            className="inline-flex items-center gap-2 font-black text-sm px-6 py-3 rounded-full text-white shadow-lg hover:scale-[1.03] transition-transform"
            style={{ background: "oklch(0.55 0.15 55)" }}
          >
            {t.ui.uiPostMyTask}
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

export function LandingPage() {
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const { triggerGate } = useVisitorGate();
  const { getPremiumPros } = useSubscriptionStore();
  const premiumProIds = getPremiumPros();
  const { selectedCountry } = useCountryStore();

  // Use the stored country (set at onboarding) — NEVER derived from the active language
  // so that switching to English does not shift the country filter to GB.
  const _activeCountry = selectedCountry ?? "FR";
  const countrySlogan =
    COUNTRY_SLOGANS[selectedCountry ?? "FR"] ?? t.hero.slogan;
  const countryHeadline =
    COUNTRY_HEADLINES[selectedCountry ?? "FR"] ?? "Need a hand?";

  // Premium/featured pros will come from real registered pros — shown only when available
  const premiumPros: DemoPro[] = [];
  const featuredPros: DemoPro[] = [];

  const topCategories = n1Categories
    .filter((c) => c.order <= 6)
    .sort((a, b) => a.order - b.order);

  // Stats will reflect real platform data once users register
  const stats: { value: string; label: string }[] = [];

  const trustItems = [
    {
      icon: Shield,
      title: t.trust.secure,
      desc: t.trust.secureDesc,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: BadgeCheck,
      title: t.trust.verified,
      desc: t.trust.verifiedDesc,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      icon: Clock,
      title: t.trust.support,
      desc: t.trust.supportDesc,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: ThumbsUp,
      title: t.trust.satisfaction,
      desc: t.trust.satisfactionDesc,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
  ];

  const testimonials = [
    t.testimonials[1],
    t.testimonials[2],
    t.testimonials[3],
  ];

  const howItWorks = [
    {
      icon: t.howItWorks.step1Icon,
      title: t.howItWorks.step1Title,
      desc: t.howItWorks.step1Desc,
    },
    {
      icon: t.howItWorks.step2Icon,
      title: t.howItWorks.step2Title,
      desc: t.howItWorks.step2Desc,
    },
    {
      icon: t.howItWorks.step3Icon,
      title: t.howItWorks.step3Title,
      desc: t.howItWorks.step3Desc,
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ─────────────────── HERO ─────────────────── */}
      <section
        className="relative min-h-[90vh] flex items-center overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.18 258) 0%, oklch(0.30 0.16 250) 45%, oklch(0.40 0.14 240) 100%)",
        }}
      >
        {/* Decorative geometric background shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Large blurred circle top-right */}
          <div
            className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
            style={{ background: "oklch(0.55 0.18 160)" }}
          />
          {/* Bottom-left glow */}
          <div
            className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl"
            style={{ background: "oklch(0.45 0.20 260)" }}
          />

          {/* Dot grid pattern */}
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.06]"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="dots"
                x="0"
                y="0"
                width="28"
                height="28"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>

          {/* Wavy line accent top */}
          <svg
            className="absolute top-0 left-0 w-full opacity-10"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0,40 C180,80 360,0 540,40 C720,80 900,0 1080,40 C1260,80 1440,20 1440,20 L1440,0 L0,0 Z"
              fill="white"
            />
          </svg>

          {/* Floating decorative circles */}
          <div className="absolute top-16 left-[8%] w-4 h-4 rounded-full bg-white/20" />
          <div className="absolute top-32 left-[15%] w-2.5 h-2.5 rounded-full bg-secondary/50" />
          <div className="absolute bottom-24 left-[5%] w-6 h-6 rounded-full border-2 border-white/20" />
          <div className="absolute top-20 right-[10%] w-3 h-3 rounded-full bg-white/25 hidden lg:block" />
          <div className="absolute bottom-20 right-[8%] w-5 h-5 rounded-full bg-secondary/40 hidden lg:block" />

          {/* Plus signs */}
          <div className="absolute top-[20%] left-[45%] text-white/15 text-3xl font-thin select-none hidden md:block">
            +
          </div>
          <div className="absolute bottom-[30%] right-[30%] text-white/10 text-4xl font-thin select-none hidden md:block">
            +
          </div>
          <div className="absolute top-[60%] left-[20%] text-secondary/30 text-2xl font-thin select-none hidden md:block">
            +
          </div>
        </div>

        <div className="relative container mx-auto px-4 py-16 sm:py-20 md:py-0 md:min-h-[90vh] flex items-center">
          <div className="grid md:grid-cols-2 gap-8 md:gap-8 items-center w-full">
            {/* Left: Text content */}
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="flex flex-col"
            >
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Badge className="mb-6 bg-white/15 text-white border-white/25 hover:bg-white/25 text-sm px-4 py-1.5 w-fit backdrop-blur-sm">
                  🚀 {t.ui.uiMarketplace1}
                </Badge>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.08] mb-6 tracking-tight"
              >
                {lang === "fr" ? (
                  <>
                    TaskVoilà –{" "}
                    <span
                      style={{ color: "oklch(0.78 0.18 160)" }}
                      className="whitespace-nowrap"
                    >
                      Handyman &amp;
                    </span>
                    <br />
                    Services Locaux
                    <br />
                    <span className="text-white/70 text-3xl sm:text-4xl lg:text-5xl font-bold">
                      en 3 clics
                    </span>
                  </>
                ) : (
                  <>
                    TaskVoilà –{" "}
                    <span style={{ color: "oklch(0.78 0.18 160)" }}>
                      Handyman &amp;
                    </span>
                    <br />
                    Local Services
                    <br />
                    <span className="text-white/70 text-3xl sm:text-4xl lg:text-5xl font-bold">
                      in 3 clicks
                    </span>
                  </>
                )}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.24 }}
                className="text-white text-2xl sm:text-3xl font-bold leading-snug mb-2 max-w-lg tracking-tight"
              >
                {countryHeadline}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.28 }}
                className="text-amber-300/90 text-xl sm:text-2xl font-semibold leading-snug mb-4 max-w-lg tracking-tight"
              >
                {countrySlogan}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="text-white/80 text-lg sm:text-xl leading-relaxed mb-10 max-w-lg"
              >
                {t.hero.subtitle}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="flex flex-col sm:flex-row gap-3 mb-10"
              >
                <Button
                  size="lg"
                  className="font-bold px-8 h-14 text-base shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  style={{
                    background: "oklch(0.78 0.18 160)",
                    color: "oklch(0.15 0.04 160)",
                  }}
                  onClick={() => {
                    if (triggerGate()) return;
                    void navigate({ to: "/post-task" });
                  }}
                >
                  {t.hero.ctaPost}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-white/35 text-white bg-white/10 hover:bg-white/18 font-semibold px-8 h-14 text-base backdrop-blur-sm"
                >
                  <Link to="/register">{t.hero.ctaPro}</Link>
                </Button>
              </motion.div>

              {/* Trust badges row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-wrap gap-3"
              >
                {[
                  {
                    icon: "🔒",
                    label: t.ui.uiSecurePaymentLc,
                  },
                  {
                    icon: "✅",
                    label: t.ui.uiVerifiedPros,
                  },
                  {
                    icon: "⭐",
                    label: t.ui.uiSatisfactionRate,
                  },
                ].map((badge) => (
                  <div
                    key={badge.label}
                    className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3.5 py-1.5 border border-white/15"
                  >
                    <span className="text-sm">{badge.icon}</span>
                    <span className="text-white/85 text-xs font-medium">
                      {badge.label}
                    </span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: iPhone illustration */}
            <motion.div
              initial={{ opacity: 0, x: 48, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.85, delay: 0.3, ease: "easeOut" }}
              className="relative flex justify-center items-center md:justify-end"
            >
              {/* Glow behind phone */}
              <div
                className="absolute inset-0 rounded-full blur-3xl opacity-30 scale-75"
                style={{
                  background:
                    "radial-gradient(circle, oklch(0.55 0.18 160) 0%, transparent 70%)",
                }}
              />

              {/* Floating pill decorations */}
              <motion.div
                animate={{ y: [-6, 6, -6] }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="absolute -top-4 -left-4 md:left-4 bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/20 shadow-lg hidden sm:flex items-center gap-2"
              >
                <span className="text-xl">🔧</span>
                <span className="text-white text-sm font-semibold">
                  {t.ui.uiNearbyHandyman}
                </span>
              </motion.div>

              <motion.div
                animate={{ y: [6, -6, 6] }}
                transition={{
                  duration: 3.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                className="absolute -bottom-2 -right-2 md:right-4 bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/20 shadow-lg hidden sm:flex items-center gap-2"
              >
                <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                <span className="text-white text-sm font-semibold">4.9 ★</span>
              </motion.div>

              {/* Hero photo with edge-blend mask */}
              <div
                className="relative z-10 w-full md:w-[480px] lg:w-[560px]"
                style={{
                  aspectRatio: "4/3",
                  maskImage:
                    "radial-gradient(ellipse 85% 85% at 55% 50%, black 40%, transparent 80%)",
                  WebkitMaskImage:
                    "radial-gradient(ellipse 85% 85% at 55% 50%, black 40%, transparent 80%)",
                }}
              >
                <img
                  src="/assets/uploads/generated-image-1.png"
                  alt={t.ui.uiLocalServicesTV}
                  className="w-full h-full object-cover"
                  loading="eager"
                  fetchPriority="high"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display =
                      "none";
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg
            viewBox="0 0 1440 56"
            preserveAspectRatio="none"
            className="w-full h-14"
            aria-hidden="true"
          >
            <path
              d="M0,56 L0,28 C240,56 480,0 720,28 C960,56 1200,8 1440,28 L1440,56 Z"
              fill="oklch(0.98 0.005 250)"
            />
          </svg>
        </div>
      </section>

      {/* ─────────────────── RÉALISATIONS AVANT/APRÈS (visible dès le début) ─────────────────── */}
      <RealisationsSection lang={lang} onGatedAction={triggerGate} />

      {/* ─────────────────── STATS BAR ─────────────────── */}
      <section className="bg-background py-10 border-b border-border/60">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 divide-x divide-border/60">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center px-4 sm:px-8 first:pl-0 last:pr-0"
              >
                <div
                  className="font-display text-3xl sm:text-4xl md:text-5xl font-black mb-1 leading-none tracking-tight"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.30 0.16 250), oklch(0.50 0.18 240))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground font-semibold mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── APP DOWNLOAD SECTION ─────────────────── */}
      <section className="py-14 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.20 0.18 258) 0%, oklch(0.28 0.16 250) 60%, oklch(0.36 0.14 240) 100%)",
            }}
          >
            <div className="relative px-8 py-10 md:px-14 md:py-12 overflow-hidden">
              {/* Background decorations */}
              <div className="absolute inset-0 pointer-events-none">
                <div
                  className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20 blur-3xl -translate-y-1/2 translate-x-1/4"
                  style={{ background: "oklch(0.55 0.18 160)" }}
                />
                <div
                  className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-15 blur-3xl translate-y-1/3 -translate-x-1/4"
                  style={{ background: "oklch(0.50 0.18 250)" }}
                />
              </div>

              <div className="relative grid md:grid-cols-2 gap-10 items-center">
                {/* Left: Text + store buttons */}
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 leading-tight">
                    {(() => {
                      const titles: Record<string, string> = {
                        fr: "Téléchargez l'application TaskVoilà",
                        ie: "Download the TaskVoilà App",
                        en: "Download the TaskVoilà App",
                        de: "Laden Sie die TaskVoilà App herunter",
                        es: "Descarga la aplicación TaskVoilà",
                        it: "Scarica l'app TaskVoilà",
                        pt: "Baixe o aplicativo TaskVoilà",
                        nl: "Download de TaskVoilà App",
                      };
                      return titles[lang] ?? "Download the TaskVoilà App";
                    })()}
                  </h2>
                  <p className="text-white/70 text-base md:text-lg mb-4 max-w-sm">
                    {(() => {
                      const descs: Record<string, string> = {
                        fr: "Trouvez un professionnel, suivez votre mission et payez en toute sécurité — où que vous soyez.",
                        ie: "Find a professional, track your mission and pay securely — wherever you are.",
                        en: "Find a professional, track your mission and pay securely — wherever you are.",
                        de: "Finden Sie einen Profi, verfolgen Sie Ihren Auftrag und zahlen Sie sicher — wo auch immer Sie sind.",
                        es: "Encuentra un profesional, sigue tu misión y paga de forma segura — estés donde estés.",
                        it: "Trova un professionista, segui la tua missione e paga in sicurezza — ovunque tu sia.",
                        pt: "Encontre um profissional, acompanhe sua missão e pague com segurança — onde quer que esteja.",
                        nl: "Vind een professional, volg je missie en betaal veilig — waar je ook bent.",
                      };
                      return (
                        descs[lang] ??
                        "Find a professional, track your mission and pay securely — wherever you are."
                      );
                    })()}
                  </p>

                  {/* Coming soon label — all 7 languages */}
                  {(() => {
                    const comingSoonLabels: Record<string, string> = {
                      fr: "Bientôt disponible",
                      ie: "Coming soon",
                      en: "Coming soon",
                      de: "Demnächst verfügbar",
                      es: "Próximamente",
                      it: "Prossimamente",
                      pt: "Em breve",
                      nl: "Binnenkort beschikbaar",
                    };
                    const comingSoonText =
                      comingSoonLabels[lang] ?? "Coming soon";
                    return (
                      <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex items-center gap-1.5 bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-full tracking-wide">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          {comingSoonText}
                        </span>
                      </div>
                    );
                  })()}

                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Apple App Store badge */}
                    <div className="flex flex-col gap-1.5">
                      <button
                        type="button"
                        className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl px-5 py-3 transition-all duration-200 group hover:scale-[1.02] opacity-80 cursor-default"
                        aria-label="App Store — coming soon"
                        onClick={(e) => e.preventDefault()}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="w-7 h-7 fill-white shrink-0"
                          aria-hidden="true"
                        >
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                        </svg>
                        <div>
                          <div className="text-white/60 text-[10px] font-medium leading-none mb-0.5">
                            {t.ui.uiDownloadOn}
                          </div>
                          <div className="text-white font-bold text-sm leading-tight">
                            App Store
                          </div>
                        </div>
                      </button>
                    </div>

                    {/* Google Play badge */}
                    <div className="flex flex-col gap-1.5">
                      <button
                        type="button"
                        className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl px-5 py-3 transition-all duration-200 group hover:scale-[1.02] opacity-80 cursor-default"
                        aria-label="Google Play — coming soon"
                        onClick={(e) => e.preventDefault()}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="w-7 h-7 fill-white shrink-0"
                          aria-hidden="true"
                        >
                          <path d="M3.18 23.87c-.34-.18-.58-.56-.58-1.12V1.25c0-.56.24-.94.58-1.12L13.1 11l-9.92 12.87zM14.38 11.9l-2.5 2.5-8.7 5.23 9.22-9.22 2 1.5zM20.13 11c.46.26.87.72.87 1.12 0 .4-.41.86-.87 1.12l-2.31 1.39-2.62-2.62 2.62-2.62L20.13 11zM3.18.13l8.7 5.23 2.5 2.5-2 1.5L3.18 0z" />
                        </svg>
                        <div>
                          <div className="text-white/60 text-[10px] font-medium leading-none mb-0.5">
                            {t.ui.uiGetItOn}
                          </div>
                          <div className="text-white font-bold text-sm leading-tight">
                            Google Play
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: QR code */}
                <div className="flex flex-col items-center md:items-end">
                  <div className="bg-white rounded-3xl p-4 shadow-2xl flex flex-col items-center gap-3 w-fit">
                    <img
                      src="/assets/generated/qr-code-app.dim_200x200.png"
                      alt="QR code TaskVoilà app"
                      className="w-36 h-36 sm:w-44 sm:h-44 object-contain rounded-xl"
                    />
                    <p className="text-center text-xs font-semibold text-gray-500 max-w-[140px] leading-snug">
                      {t.ui.uiScanDownload}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────── CATEGORIES ─────────────────── */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-8 sm:mb-10">
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="font-display text-3xl md:text-4xl font-black mb-2"
                style={{ color: "oklch(0.18 0.06 250)" }}
              >
                {t.ui.uiMostRequested}
              </motion.h2>
              <p className="text-muted-foreground text-base md:text-lg">
                {t.categories.subtitle}
              </p>
            </div>
            <Link
              to="/categories"
              className="hidden md:flex items-center gap-1 text-sm font-bold hover:underline shrink-0"
              style={{ color: "oklch(0.35 0.15 250)" }}
            >
              {t.categoriesPage.viewAll} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex md:grid md:grid-cols-6 gap-4 overflow-x-auto pb-3 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {topCategories.map((cat, i) => {
              const examples = lang === "fr" ? cat.examplesFR : cat.examplesEN;
              const label = lang === "fr" ? cat.labelFR : cat.labelEN;
              const iconBgClass = `category-icon-${cat.key}`;
              return (
                <motion.button
                  type="button"
                  key={cat.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  whileHover={{ y: -5 }}
                  onClick={() => {
                    if (triggerGate()) return;
                    void navigate({
                      to: "/post-task",
                      search: { n1: cat.key },
                    });
                  }}
                  className="group flex flex-col items-start gap-3.5 p-4 rounded-2xl bg-white border border-border/50 card-premium cursor-pointer text-left min-w-[170px] md:min-w-0 shrink-0 md:shrink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  {/* Colored icon container */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-105 transition-transform duration-200 shrink-0 ${iconBgClass}`}
                  >
                    <span
                      role="img"
                      aria-hidden="true"
                      className="leading-none"
                    >
                      {cat.emoji}
                    </span>
                  </div>
                  <div className="w-full">
                    <span
                      className="block text-sm font-black mb-1.5 leading-tight"
                      style={{ color: "oklch(0.20 0.08 250)" }}
                    >
                      {label}
                    </span>
                    <ul className="space-y-0.5">
                      {examples.slice(0, 3).map((ex) => (
                        <li
                          key={ex}
                          className="text-[11px] text-muted-foreground leading-snug"
                        >
                          · {ex}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-6 text-center md:hidden">
            <Link
              to="/categories"
              className="inline-flex items-center gap-1 font-bold text-sm hover:underline"
              style={{ color: "oklch(0.35 0.15 250)" }}
            >
              {t.categoriesPage.viewAll} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────── PREMIUM PROS CAROUSEL ─────────── */}
      {premiumPros.length > 0 && (
        <section
          className="py-16 sm:py-20"
          style={{ background: "oklch(0.97 0.01 250)" }}
        >
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex items-end justify-between mb-8"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">⭐</span>
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-semibold text-xs">
                    Premium
                  </Badge>
                </div>
                <h2
                  className="font-display text-3xl md:text-4xl font-black mb-1"
                  style={{ color: "oklch(0.18 0.06 250)" }}
                >
                  {t.ui.uiPremiumPros}
                </h2>
                <p className="text-muted-foreground text-base">
                  {t.ui.uiBestProfs}
                </p>
              </div>
              <Link
                to="/pros"
                className="hidden md:flex items-center gap-1 text-sm font-bold hover:underline shrink-0"
                style={{ color: "oklch(0.35 0.15 250)" }}
              >
                {t.ui.uiViewAll} <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>

            <div className="flex gap-5 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3">
              {premiumPros.map((pro, i) => {
                if (!pro) return null;
                const subId = `pro_${pro.id}`;
                const premiumProIds2 = premiumProIds;
                const idx2 = premiumProIds2.indexOf(subId);
                const planKey =
                  idx2 >= 0
                    ? ((premiumProIds2[idx2] === "pro_2"
                        ? "enterprise"
                        : "team") as keyof typeof PLAN_DETAILS)
                    : ("team" as keyof typeof PLAN_DETAILS);

                return (
                  <motion.div
                    key={pro.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="bg-white rounded-2xl border border-border/50 p-5 card-premium min-w-[280px] md:min-w-0 shrink-0 md:shrink hover:shadow-xl transition-all duration-300 group"
                    data-ocid={`landing.premium_pro.card.${i + 1}`}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <ProAvatar
                        proId={pro.id}
                        initials={`${pro.firstName[0]}${pro.lastName[0]}`}
                        size="sm"
                        index={i}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <h3 className="font-display font-bold text-sm text-foreground truncate">
                            {pro.companyName}
                          </h3>
                          {pro.isVerified && (
                            <BadgeCheck
                              className="h-4 w-4 shrink-0"
                              style={{ color: "oklch(0.55 0.18 160)" }}
                            />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {pro.firstName} {pro.lastName}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge
                        className={`text-[10px] font-semibold ${
                          planKey === "enterprise"
                            ? "bg-purple-100 text-purple-700 border-purple-200"
                            : "bg-blue-100 text-blue-700 border-blue-200"
                        }`}
                      >
                        {planKey === "enterprise" ? "👑 " : "⭐ "}
                        {lang === "fr"
                          ? PLAN_DETAILS[planKey].labelFR
                          : PLAN_DETAILS[planKey].labelEN}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        📍 {pro.city}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {(t.categories as Record<string, string>)[
                          pro.category
                        ] ?? pro.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3.5 w-3.5 ${
                              star <= Math.floor(pro.rating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                        <span className="text-xs font-bold ml-1">
                          {pro.rating}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {pro.totalMissions} missions
                      </span>
                    </div>

                    <Button
                      size="sm"
                      className="w-full bg-primary hover:bg-primary/90 text-white font-bold gap-2 group-hover:shadow-md transition-shadow"
                      onClick={() => {
                        if (triggerGate()) return;
                        void navigate({
                          to: "/pro/$id",
                          params: { id: String(pro.id) },
                        });
                      }}
                      data-ocid={`landing.premium_pro.view_button.${i + 1}`}
                    >
                      {t.ui.uiViewProfile}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────── HOW IT WORKS ─────────────────── */}
      <section className="py-20" style={{ background: "oklch(0.96 0.01 250)" }}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2
              className="font-display text-3xl md:text-4xl font-black mb-3"
              style={{ color: "oklch(0.18 0.06 250)" }}
            >
              {t.howItWorks.title}
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              {t.howItWorks.subtitle}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line desktop */}
            <div
              className="hidden md:block absolute top-10 left-[20%] right-[20%] h-0.5 z-0"
              style={{
                background:
                  "linear-gradient(90deg, oklch(0.35 0.15 250 / 0.15), oklch(0.35 0.15 250 / 0.5), oklch(0.35 0.15 250 / 0.15))",
              }}
            />
            {howItWorks.map((step, stepIdx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: stepIdx * 0.15 }}
                className="text-center relative z-10"
              >
                {/* Step circle */}
                <div className="relative w-24 h-24 mx-auto mb-6">
                  {/* Gradient ring */}
                  <div
                    className="absolute inset-0 rounded-full opacity-20 scale-110"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.35 0.15 250), oklch(0.55 0.18 160))",
                    }}
                  />
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center text-4xl bg-white shadow-lg border-2"
                    style={{ borderColor: "oklch(0.88 0.04 250)" }}
                  >
                    {step.icon}
                  </div>
                  {/* Number badge */}
                  <div
                    className="absolute -top-1 -right-1 w-8 h-8 rounded-full text-white text-sm font-black flex items-center justify-center shadow-md"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.35 0.15 250), oklch(0.28 0.18 258))",
                    }}
                  >
                    {stepIdx + 1}
                  </div>
                </div>
                <h3
                  className="font-display text-xl font-black mb-2"
                  style={{ color: "oklch(0.18 0.06 250)" }}
                >
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── FEATURED PROS ─────────────────── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2
                className="font-display text-3xl md:text-4xl font-black mb-2"
                style={{ color: "oklch(0.18 0.06 250)" }}
              >
                {t.featured.title}
              </h2>
              <p className="text-muted-foreground text-base md:text-lg">
                {t.featured.subtitle}
              </p>
            </motion.div>
            <Link
              to="/pros"
              className="hidden md:flex items-center gap-1 font-bold text-sm hover:underline shrink-0"
              style={{ color: "oklch(0.35 0.15 250)" }}
            >
              {t.common.seeAll} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredPros.map((pro, i) => (
              <motion.div
                key={pro.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden border border-border/50 card-premium cursor-pointer"
                onClick={() => {
                  if (triggerGate()) return;
                  void navigate({
                    to: "/pro/$id",
                    params: { id: String(pro.id) },
                  });
                }}
              >
                {/* Cover gradient bar – LinkedIn style */}
                <ProCover
                  proId={pro.id}
                  className="h-28"
                  style={{
                    background: `linear-gradient(135deg, oklch(${0.28 + i * 0.06} 0.16 ${250 - i * 15}) 0%, oklch(${0.22 + i * 0.05} 0.18 ${260 - i * 15}) 100%)`,
                  }}
                >
                  {/* Dot pattern (only when no cover img) */}
                  <svg
                    className="absolute inset-0 w-full h-full opacity-[0.18]"
                    aria-hidden="true"
                  >
                    <defs>
                      <pattern
                        id={`proPattern${i}`}
                        x="0"
                        y="0"
                        width="16"
                        height="16"
                        patternUnits="userSpaceOnUse"
                      >
                        <circle cx="2" cy="2" r="1.2" fill="white" />
                      </pattern>
                    </defs>
                    <rect
                      width="100%"
                      height="100%"
                      fill={`url(#proPattern${i})`}
                    />
                  </svg>

                  {/* Premium & verified badges in top-right */}
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    {pro.isPremium && (
                      <span className="inline-flex items-center gap-1 bg-amber-400/90 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                        ⭐ {t.common.premium}
                      </span>
                    )}
                    {pro.isVerified && (
                      <span className="inline-flex items-center gap-1 bg-emerald-400/90 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                        <Check className="h-2.5 w-2.5" />
                        {t.common.verified}
                      </span>
                    )}
                  </div>
                </ProCover>

                <div className="px-5 pb-5 pt-0">
                  {/* Avatar lifted from cover – LinkedIn style */}
                  <div
                    className="flex items-end justify-between -mt-7 mb-4 relative"
                    style={{ zIndex: 10 }}
                  >
                    <ProAvatar
                      proId={pro.id}
                      initials={`${pro.firstName[0]}${pro.lastName[0]}`}
                      size="md"
                      index={i}
                    />

                    {/* Rate badge */}
                    <div
                      className="flex items-center gap-1 text-xs font-black rounded-full px-3 py-1 mb-1"
                      style={{
                        background: "oklch(0.96 0.02 250)",
                        color: "oklch(0.30 0.14 250)",
                      }}
                    >
                      {pro.hourlyRate}€{t.common.per_hour}
                    </div>
                  </div>

                  <h3
                    className="font-display font-black text-base mb-0.5 truncate"
                    style={{ color: "oklch(0.18 0.06 250)" }}
                  >
                    {pro.companyName}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2.5 truncate">
                    {pro.firstName} {pro.lastName}
                  </p>

                  {/* Category + city */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="text-sm">
                      {categoryEmojis[pro.category]}
                    </span>
                    <span
                      className="text-xs font-semibold capitalize truncate"
                      style={{ color: "oklch(0.35 0.15 250)" }}
                    >
                      {(t.categories as Record<string, string>)[pro.category]}
                    </span>
                    <span className="text-muted-foreground text-xs shrink-0">
                      · {pro.city}
                    </span>
                  </div>

                  {/* Rating row */}
                  <div className="flex items-center gap-2 mb-4 p-2.5 rounded-xl bg-accent/40">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span
                        className="font-black text-sm"
                        style={{ color: "oklch(0.18 0.06 250)" }}
                      >
                        {pro.rating}
                      </span>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      · {pro.totalMissions} {t.featured.missions}
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {lang === "fr"
                        ? `${pro.yearsExperience} ans`
                        : `${pro.yearsExperience} yrs`}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    className="w-full font-bold text-white h-10"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.35 0.15 250), oklch(0.28 0.18 258))",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (triggerGate()) return;
                      void navigate({
                        to: "/pro/$id",
                        params: { id: String(pro.id) },
                      });
                    }}
                  >
                    {t.featured.viewProfile}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Button variant="outline" asChild>
              <Link to="/pros">{t.common.seeAll}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─────────────────── TRUST SECTION ─────────────────── */}
      <section className="py-20" style={{ background: "oklch(0.96 0.01 250)" }}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2
              className="font-display text-3xl md:text-4xl font-black mb-3"
              style={{ color: "oklch(0.18 0.06 250)" }}
            >
              {t.trust.title}
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trustItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  whileHover={{ y: -3 }}
                  className="bg-white rounded-2xl p-6 card-shadow hover:card-shadow-hover transition-all duration-200 border border-border/40"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center mb-4`}
                  >
                    <Icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <h3
                    className="font-display font-black text-base mb-2"
                    style={{ color: "oklch(0.18 0.06 250)" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────── TESTIMONIALS ─────────────────── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2
              className="font-display text-3xl md:text-4xl font-black mb-3"
              style={{ color: "oklch(0.18 0.06 250)" }}
            >
              {t.testimonials.title}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-3xl p-6 card-shadow border border-border/40 relative overflow-hidden"
              >
                {/* Quote accent */}
                <div
                  className="absolute -top-2 -right-2 text-7xl font-black opacity-[0.04] select-none"
                  style={{ color: "oklch(0.35 0.15 250)" }}
                  aria-hidden="true"
                >
                  "
                </div>

                <div className="flex items-center gap-0.5 mb-4">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-foreground/80 italic leading-relaxed mb-5 text-sm md:text-base">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.35 0.15 250), oklch(0.55 0.18 160))",
                    }}
                  >
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p
                      className="font-black text-sm"
                      style={{ color: "oklch(0.18 0.06 250)" }}
                    >
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role} · {testimonial.city}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── CTA BANNER ─────────────────── */}
      <section
        className="py-24 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.18 258) 0%, oklch(0.30 0.16 250) 50%, oklch(0.42 0.14 240) 100%)",
        }}
      >
        {/* BG decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-16 -right-16 w-96 h-96 rounded-full opacity-20 blur-3xl"
            style={{ background: "oklch(0.55 0.18 160)" }}
          />
          <div
            className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full opacity-15 blur-3xl"
            style={{ background: "oklch(0.45 0.20 260)" }}
          />
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.05]"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="ctaDots"
                x="0"
                y="0"
                width="28"
                height="28"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ctaDots)" />
          </svg>
        </div>

        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-black text-white mb-5 leading-tight">
              {t.cta.ready}
            </h2>
            <p className="text-white/75 text-lg md:text-xl mb-10 max-w-xl mx-auto">
              {t.cta.readySubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="font-black px-10 h-14 text-base shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform"
                style={{
                  background: "oklch(0.78 0.18 160)",
                  color: "oklch(0.15 0.04 160)",
                }}
                onClick={() => {
                  if (triggerGate()) return;
                  void navigate({ to: "/post-task" });
                }}
              >
                {t.cta.postMission}
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/35 text-white bg-white/10 hover:bg-white/20 font-semibold px-10 h-14 text-base backdrop-blur-sm"
              >
                <Link to="/register">{t.cta.registerPro}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

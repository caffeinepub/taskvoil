import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVisitorGate } from "@/components/visitor/VisitorGate";
import { getCountryMeta, matchesCountry } from "@/lib/country-filter";
import { useCountryStore } from "@/lib/country-store";
import { type DemoPro, categoryEmojis, n1Categories } from "@/lib/demo-data";
import { useTranslation } from "@/lib/i18n";
import { useProfileStore } from "@/lib/profile-store";
import { MapPage } from "@/pages/MapPage";
import { useNavigate } from "@tanstack/react-router";
import {
  Check,
  Filter,
  Globe,
  List,
  MapIcon,
  MapPin,
  Star,
} from "lucide-react";
import { useMemo, useState } from "react";

export function ProsListPage() {
  const { t, lang } = useTranslation();
  const { selectedCountry } = useCountryStore();
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("");
  const [minRating, setMinRating] = useState("0");
  const [isInternational, setIsInternational] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // Use the stored country (set at onboarding) — NEVER derived from the active language
  // so that switching to English does not shift the country filter to GB.
  const activeCountry = selectedCountry ?? "FR";
  const countryMeta = getCountryMeta(activeCountry, lang);

  // Real pros will come from the profile store once users register
  const filtered = useMemo(() => {
    return [];
  }, []);

  const internationalLabel: Record<string, string> = {
    fr: "Recherche internationale",
    en: "International search",
    ie: "International search",
    de: "Internationale Suche",
    es: "Búsqueda internacional",
    it: "Ricerca internazionale",
    pt: "Pesquisa internacional",
    nl: "Internationale zoekopdracht",
  };

  const prosInCountryLabel: Record<string, string> = {
    fr: `Professionnels en ${countryMeta.name}`,
    en: `Professionals in ${countryMeta.name}`,
    ie: `Professionals in ${countryMeta.name}`,
    de: `Fachleute in ${countryMeta.name}`,
    es: `Profesionales en ${countryMeta.name}`,
    it: `Professionisti in ${countryMeta.name}`,
    pt: `Profissionais em ${countryMeta.name}`,
    nl: `Professionals in ${countryMeta.name}`,
  };

  const noResultsIntlHint: Record<string, string> = {
    fr: "Aucun professionnel dans votre pays. Essayez la recherche internationale.",
    en: "No professionals in your country. Try international search.",
    ie: "No professionals in your country. Try international search.",
    de: "Keine Fachleute in Ihrem Land. Versuchen Sie die internationale Suche.",
    es: "No hay profesionales en tu país. Prueba la búsqueda internacional.",
    it: "Nessun professionista nel tuo paese. Prova la ricerca internazionale.",
    pt: "Nenhum profissional no seu país. Experimente a pesquisa internacional.",
    nl: "Geen professionals in uw land. Probeer de internationale zoekopdracht.",
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-white border-b border-border py-10">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl font-bold text-foreground">
            {t.prosList.title}
          </h1>
          <p className="text-muted-foreground mt-1">{t.prosList.subtitle}</p>
        </div>
      </section>

      {/* View toggle */}
      <div className="container mx-auto px-4 pt-4 flex items-center gap-2 justify-end">
        <div className="flex items-center border border-border rounded-xl overflow-hidden">
          <button
            type="button"
            data-ocid="pros.list_toggle"
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${viewMode === "list" ? "bg-amber-100 text-amber-800 font-semibold" : "text-muted-foreground hover:bg-muted/50"}`}
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">
              {lang === "fr" ||
              lang === "ie" ||
              lang === "nl" ||
              lang === "de" ||
              lang === "es" ||
              lang === "it" ||
              lang === "pt" ||
              lang === "el"
                ? lang === "fr"
                  ? "Liste"
                  : lang === "de"
                    ? "Liste"
                    : lang === "nl"
                      ? "Lijst"
                      : "List"
                : "List"}
            </span>
          </button>
          <button
            type="button"
            data-ocid="pros.map_toggle"
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${viewMode === "map" ? "bg-amber-100 text-amber-800 font-semibold" : "text-muted-foreground hover:bg-muted/50"}`}
          >
            <MapIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{t.nav.map}</span>
          </button>
        </div>
      </div>

      {viewMode === "map" && (
        <div className="mt-2">
          <MapPage />
        </div>
      )}

      {viewMode === "list" && (
        <div className="container mx-auto px-4 py-8">
          {/* Country scope indicator */}
          <div className="flex items-center justify-between mb-4 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{countryMeta.flag}</span>
              <span className="text-sm font-semibold text-primary">
                {isInternational
                  ? (internationalLabel[lang] ?? internationalLabel.en)
                  : (prosInCountryLabel[lang] ?? prosInCountryLabel.en)}
              </span>
              {!isInternational && (
                <Badge
                  variant="outline"
                  className="text-xs border-primary/30 text-primary bg-white"
                >
                  {activeCountry}
                </Badge>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsInternational((v) => !v)}
              className={`flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 transition-colors ${
                isInternational
                  ? "bg-primary text-white"
                  : "bg-white border border-border text-muted-foreground hover:text-primary hover:border-primary/40"
              }`}
              data-ocid="pros.international_toggle"
            >
              <Globe className="h-3.5 w-3.5" />
              {internationalLabel[lang] ?? internationalLabel.en}
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-4 card-shadow border border-border/50 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">
                {t.prosList.filters}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
                data-ocid="pros.category_filter.select"
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.prosList.category} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t.marketplace.allCategories}
                  </SelectItem>
                  {n1Categories
                    .sort((a, b) => a.order - b.order)
                    .map((cat) => (
                      <SelectItem key={cat.key} value={cat.key}>
                        {cat.emoji} {lang === "fr" ? cat.labelFR : cat.labelEN}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Input
                placeholder={t.marketplace.cityPlaceholder}
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                data-ocid="pros.city_filter.input"
              />

              <Select
                value={minRating}
                onValueChange={setMinRating}
                data-ocid="pros.rating_filter.select"
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.prosList.minRating} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">
                    {lang === "fr"
                      ? "Toutes les notes"
                      : lang === "de"
                        ? "Alle Bewertungen"
                        : lang === "es"
                          ? "Todas las valoraciones"
                          : lang === "it"
                            ? "Tutte le valutazioni"
                            : lang === "pt"
                              ? "Todas as avaliações"
                              : lang === "nl"
                                ? "Alle beoordelingen"
                                : "All ratings"}
                  </SelectItem>
                  <SelectItem value="4">4+ ⭐</SelectItem>
                  <SelectItem value="4.5">4.5+ ⭐</SelectItem>
                  <SelectItem value="4.8">4.8+ ⭐</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results count */}
          {filtered.length > 0 && (
            <p className="text-sm text-muted-foreground mb-4">
              {filtered.length}{" "}
              {lang === "fr"
                ? `professionnel${filtered.length > 1 ? "s" : ""} trouvé${filtered.length > 1 ? "s" : ""}`
                : `professional${filtered.length > 1 ? "s" : ""} found`}
              {!isInternational && (
                <span className="ml-1">
                  · {countryMeta.flag} {countryMeta.name}
                </span>
              )}
            </p>
          )}

          {/* Results */}
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">👷</p>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                {t.prosList.noResults}
              </h3>
              <p className="text-muted-foreground mb-4">
                {!isInternational
                  ? (noResultsIntlHint[lang] ?? noResultsIntlHint.en)
                  : t.prosList.noResultsDesc}
              </p>
              {!isInternational && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsInternational(true)}
                  className="gap-2"
                  data-ocid="pros.try_international.button"
                >
                  <Globe className="h-4 w-4" />
                  {internationalLabel[lang] ?? internationalLabel.en}
                </Button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(filtered as DemoPro[]).map((pro) => (
                <ProCard key={pro.id} pro={pro} />
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

function ProCard({ pro }: { pro: DemoPro }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { triggerGate } = useVisitorGate();
  const { getProfile } = useProfileStore();
  const images = getProfile(`pro_${pro.id}`);

  return (
    <div className="bg-white rounded-xl card-shadow border border-border/50 hover:card-shadow-hover hover:border-primary/20 transition-all duration-200 overflow-hidden group">
      {/* Cover image (LinkedIn-style) */}
      <div className="relative h-20 bg-primary-gradient overflow-hidden">
        {images.coverDataUrl ? (
          <img
            src={images.coverDataUrl}
            alt="cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-primary via-secondary to-primary/60" />
        )}
        {/* Badges top-right */}
        <div className="absolute top-2 right-2 flex gap-1">
          {pro.isPremium && (
            <Badge className="bg-warning/90 text-foreground border-warning/30 text-xs shadow">
              ⭐ {t.common.premium}
            </Badge>
          )}
          {pro.isVerified && (
            <Badge className="bg-secondary/90 text-white border-secondary/30 text-xs shadow">
              <Check className="h-3 w-3 mr-0.5" />
              {t.common.verified}
            </Badge>
          )}
        </div>
      </div>

      <div className="px-4 pb-4">
        {/* Avatar overlapping cover */}
        <div className="relative -mt-7 mb-3 flex items-end justify-between">
          <div
            className="w-14 h-14 rounded-full border-3 border-white shadow-lg overflow-hidden bg-gradient-to-br from-secondary to-primary flex items-center justify-center shrink-0"
            style={{ border: "3px solid white" }}
          >
            {images.avatarDataUrl ? (
              <img
                src={images.avatarDataUrl}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-base select-none">
                {pro.firstName[0]}
                {pro.lastName[0]}
              </span>
            )}
          </div>
          <span className="text-sm font-bold text-primary pb-1">
            {pro.hourlyRate}€{t.common.per_hour}
          </span>
        </div>

        <h3 className="font-display font-bold text-base text-foreground group-hover:text-primary transition-colors leading-tight">
          {pro.companyName}
        </h3>
        <p className="text-xs text-muted-foreground mb-2">
          {pro.firstName} {pro.lastName}
        </p>

        <div className="flex items-center gap-1.5 mb-1.5">
          <span>{categoryEmojis[pro.category]}</span>
          <span className="text-xs font-medium text-primary capitalize">
            {(t.categories as Record<string, string>)[pro.category]}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <MapPin className="h-3 w-3 shrink-0" />
          <span>{pro.city}</span>
          <span>• {pro.radius} km</span>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <Star className="h-3.5 w-3.5 fill-warning text-warning" />
          <span className="font-bold text-foreground">{pro.rating}</span>
          <span>
            ({pro.totalMissions} {t.prosList.missions})
          </span>
        </div>

        <Button
          size="sm"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => {
            if (triggerGate()) return;
            void navigate({ to: "/pro/$id", params: { id: String(pro.id) } });
          }}
          data-ocid="pros.view_profile.button"
        >
          {t.prosList.viewProfile}
        </Button>
      </div>
    </div>
  );
}

import { MissionComments } from "@/components/marketplace/MissionComments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useVisitorGate } from "@/components/visitor/VisitorGate";
import { useAuthStore } from "@/lib/auth-store";
import { useCommentStore } from "@/lib/comment-store";
import { getCountryMeta, matchesCountry } from "@/lib/country-filter";
import { useCountryStore } from "@/lib/country-store";
import { categoryEmojis, getN2ForN1, n1Categories } from "@/lib/demo-data";
import { useTranslation } from "@/lib/i18n";
import { type Mission, useMissionStore } from "@/lib/mission-store";
import { useOfferStore } from "@/lib/offer-store";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Briefcase,
  Check,
  ChevronDown,
  Clock,
  Euro,
  Filter,
  Globe,
  Grid3X3,
  Heart,
  LayoutList,
  Lock,
  MapPin,
  Plus,
  RotateCcw,
  Search,
  Users,
  X,
  Zap,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { toast } from "sonner";

// ─── Types & helpers ──────────────────────────────────────────────────────────

type SortKey =
  | "newest"
  | "budgetAsc"
  | "budgetDesc"
  | "leastOffers"
  | "mostPopular";
type DateFilter = "all" | "today" | "week" | "month";
type ViewMode = "grid" | "list";

function isUrgent(task: Mission): boolean {
  const created = new Date(task.createdAt);
  const now = new Date();
  const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
  return diffHours < 48 && task.status === "open";
}

function timeAgo(dateStr: string, lang: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  const isFr = lang === "fr";
  const isDe = lang === "de";
  const isEs = lang === "es";
  const isIt = lang === "it";
  const isPt = lang === "pt";
  const isNl = lang === "nl";

  if (diffHours < 1) {
    if (isFr) return "À l'instant";
    if (isDe) return "Gerade eben";
    if (isEs) return "Ahora mismo";
    if (isIt) return "Adesso";
    if (isPt) return "Agora";
    if (isNl) return "Zojuist";
    return "Just now";
  }
  if (diffHours < 24) {
    if (isFr) return `il y a ${diffHours}h`;
    if (isDe) return `vor ${diffHours}h`;
    if (isEs) return `hace ${diffHours}h`;
    if (isIt) return `${diffHours}h fa`;
    if (isPt) return `há ${diffHours}h`;
    if (isNl) return `${diffHours}u geleden`;
    return `${diffHours}h ago`;
  }
  if (diffDays < 7) {
    if (isFr) return `il y a ${diffDays}j`;
    if (isDe) return `vor ${diffDays}T`;
    if (isEs) return `hace ${diffDays}d`;
    if (isIt) return `${diffDays}g fa`;
    if (isPt) return `há ${diffDays}d`;
    if (isNl) return `${diffDays}d geleden`;
    return `${diffDays}d ago`;
  }
  const weeks = Math.floor(diffDays / 7);
  if (isFr) return `il y a ${weeks}sem`;
  if (isDe) return `vor ${weeks}W`;
  if (isEs) return `hace ${weeks}sem`;
  if (isIt) return `${weeks}sett fa`;
  if (isPt) return `há ${weeks}sem`;
  if (isNl) return `${weeks}w geleden`;
  return `${weeks}w ago`;
}

function avatarColor(id: number): string {
  const colors = [
    "bg-violet-500",
    "bg-blue-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-fuchsia-500",
    "bg-orange-500",
  ];
  return colors[id % colors.length];
}

function getCategoryLabel(cat: (typeof n1Categories)[0], lang: string): string {
  if (lang === "fr") return cat.labelFR;
  return cat.labelEN;
}

// ─── Filter state ─────────────────────────────────────────────────────────────

interface FilterState {
  search: string;
  category: string;
  subCategories: string[];
  budgetRange: [number, number];
  statuses: string[];
  dateFilter: DateFilter;
  city: string;
  radius: string;
  isInternational: boolean;
}

const DEFAULT_FILTERS: FilterState = {
  search: "",
  category: "all",
  subCategories: [],
  budgetRange: [0, 5000],
  statuses: [],
  dateFilter: "all",
  city: "",
  radius: "50",
  isInternational: false,
};

function countActiveFilters(f: FilterState): number {
  let count = 0;
  if (f.search) count++;
  if (f.category !== "all") count++;
  if (f.subCategories.length > 0) count++;
  if (f.budgetRange[0] > 0 || f.budgetRange[1] < 5000) count++;
  if (f.statuses.length > 0) count++;
  if (f.dateFilter !== "all") count++;
  if (f.city) count++;
  if (f.isInternational) count++;
  return count;
}

interface SidebarProps {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onReset: () => void;
  isMobile?: boolean;
  onApply?: () => void;
}

// ─── Sidebar section label ────────────────────────────────────────────────────
function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground/70 mb-2">
      {children}
    </p>
  );
}

function ThinSep() {
  return <div className="border-t border-border/30 my-3.5" />;
}

// ─── Filter sidebar ───────────────────────────────────────────────────────────
function FilterSidebar({
  filters,
  onChange,
  onReset,
  isMobile,
  onApply,
}: SidebarProps) {
  const { t, lang } = useTranslation();
  const mp = t.marketplace;
  const [categoryOpen, setCategoryOpen] = useState(false);

  const selectedCategory = n1Categories.find((c) => c.key === filters.category);

  const n2ForCategory = useMemo(() => {
    if (!selectedCategory) return [];
    return getN2ForN1(selectedCategory.key).map((n2) => n2.key);
  }, [selectedCategory]);

  function toggleStatus(s: string) {
    const next = filters.statuses.includes(s)
      ? filters.statuses.filter((x) => x !== s)
      : [...filters.statuses, s];
    onChange({ ...filters, statuses: next });
  }

  function toggleSubCat(s: string) {
    const next = filters.subCategories.includes(s)
      ? filters.subCategories.filter((x) => x !== s)
      : [...filters.subCategories, s];
    onChange({ ...filters, subCategories: next });
  }

  function selectCategory(key: string) {
    onChange({ ...filters, category: key, subCategories: [] });
    setCategoryOpen(false);
  }

  const statusOptions = [
    { key: "open", label: t.mission.status.open, dot: "bg-emerald-500" },
    {
      key: "inProgress",
      label: t.mission.status.inProgress,
      dot: "bg-blue-500",
    },
    { key: "completed", label: t.mission.status.completed, dot: "bg-gray-400" },
  ];

  const dateOptions: { key: DateFilter; label: string }[] = [
    { key: "all", label: mp.allTime },
    { key: "today", label: mp.today },
    { key: "week", label: mp.thisWeek },
    { key: "month", label: mp.thisMonth },
  ];

  const radiusOptions = [
    { key: "10", label: mp.radius10 },
    { key: "25", label: mp.radius25 },
    { key: "50", label: mp.radius50 },
    { key: "100", label: mp.radius100 },
  ];

  const categoryTriggerLabel = selectedCategory
    ? getCategoryLabel(selectedCategory, lang)
    : mp.allCategories;

  const subCatLabel =
    lang === "fr"
      ? "Sous-catégories"
      : lang === "de"
        ? "Unterkategorien"
        : lang === "es"
          ? "Subcategorías"
          : lang === "it"
            ? "Sottocategorie"
            : lang === "pt"
              ? "Subcategorias"
              : lang === "nl"
                ? "Subcategorieën"
                : "Subcategories";

  const internationalLabel =
    lang === "fr"
      ? "International"
      : lang === "de"
        ? "International"
        : lang === "es"
          ? "Internacional"
          : lang === "it"
            ? "Internazionale"
            : lang === "pt"
              ? "Internacional"
              : lang === "nl"
                ? "Internationaal"
                : "International";

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-sm font-semibold text-foreground leading-none">
          {mp.filterButton}
        </span>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          data-ocid="marketplace.sidebar.button"
        >
          <RotateCcw className="h-3 w-3" />
          {mp.resetFilters}
        </button>
      </div>

      <ThinSep />

      {/* N1 Category dropdown */}
      <div>
        <SectionLabel>{mp.category}</SectionLabel>

        <button
          type="button"
          onClick={() => setCategoryOpen((o) => !o)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-md border border-border/60 bg-background hover:border-primary/50 hover:bg-muted/30 transition-all text-sm text-foreground"
          data-ocid="marketplace.category.button"
          aria-expanded={categoryOpen}
        >
          <span
            className={
              filters.category === "all"
                ? "text-muted-foreground text-xs"
                : "text-foreground text-xs font-medium"
            }
          >
            {categoryTriggerLabel}
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${
              categoryOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown list */}
        <div
          className={`overflow-hidden transition-all duration-200 ${
            categoryOpen ? "max-h-[360px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="mt-1 rounded-md border border-border/40 bg-background shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => selectCategory("all")}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted/50 transition-colors group"
              data-ocid="marketplace.category.button"
            >
              <span
                className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border transition-colors shrink-0 ${
                  filters.category === "all"
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/40 group-hover:border-muted-foreground"
                }`}
              >
                {filters.category === "all" && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </span>
              <span
                className={
                  filters.category === "all"
                    ? "text-primary font-medium text-xs"
                    : "text-foreground text-xs"
                }
              >
                {mp.allCategories}
              </span>
            </button>

            {n1Categories
              .sort((a, b) => a.order - b.order)
              .map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => selectCategory(cat.key)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted/50 transition-colors group border-t border-border/20"
                >
                  <span
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border transition-colors shrink-0 ${
                      filters.category === cat.key
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/40 group-hover:border-muted-foreground"
                    }`}
                  >
                    {filters.category === cat.key && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </span>
                  <span
                    className={
                      filters.category === cat.key
                        ? "text-primary font-medium text-xs"
                        : "text-foreground text-xs"
                    }
                  >
                    {getCategoryLabel(cat, lang)}
                  </span>
                </button>
              ))}
          </div>
        </div>

        {/* N2 sub-categories */}
        <div
          className={`overflow-hidden transition-all duration-200 ${
            selectedCategory && n2ForCategory.length > 0
              ? "max-h-48 opacity-100 mt-3"
              : "max-h-0 opacity-0"
          }`}
        >
          <SectionLabel>{subCatLabel}</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {n2ForCategory.map((sub) => {
              const active = filters.subCategories.includes(sub);
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => toggleSubCat(sub)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-all ${
                    active
                      ? "bg-primary/10 border-primary/30 text-primary font-medium"
                      : "border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground hover:bg-muted/40"
                  }`}
                  data-ocid="marketplace.subcategory.checkbox"
                >
                  {active && <Check className="h-2.5 w-2.5" />}
                  {sub.replace(/-/g, " ")}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <ThinSep />

      {/* Budget */}
      <div>
        <SectionLabel>{mp.budgetRange}</SectionLabel>
        <div className="px-0.5">
          <Slider
            min={0}
            max={5000}
            step={25}
            value={filters.budgetRange}
            onValueChange={(v) =>
              onChange({ ...filters, budgetRange: v as [number, number] })
            }
            className="mb-3"
            data-ocid="marketplace.budget.toggle"
          />
          <div className="flex justify-between">
            <span className="text-xs text-foreground tabular-nums font-medium">
              {filters.budgetRange[0]}€
            </span>
            <span className="text-xs text-foreground tabular-nums font-medium">
              {filters.budgetRange[1] >= 5000
                ? "5 000€+"
                : `${filters.budgetRange[1]}€`}
            </span>
          </div>
        </div>
      </div>

      <ThinSep />

      {/* Status */}
      <div>
        <SectionLabel>{mp.status}</SectionLabel>
        <div className="space-y-2">
          {statusOptions.map(({ key, label, dot }) => (
            <div key={key} className="flex items-center gap-2.5">
              <Checkbox
                id={`status-${key}`}
                checked={filters.statuses.includes(key)}
                onCheckedChange={() => toggleStatus(key)}
                className="h-3.5 w-3.5"
                data-ocid="marketplace.status.checkbox"
              />
              <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dot}`} />
              <Label
                htmlFor={`status-${key}`}
                className="text-sm text-foreground cursor-pointer leading-none"
              >
                {label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <ThinSep />

      {/* Date posted */}
      <div>
        <SectionLabel>{mp.datePosted}</SectionLabel>
        <div className="space-y-0.5">
          {dateOptions.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => onChange({ ...filters, dateFilter: key })}
              className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-colors ${
                filters.dateFilter === key
                  ? "text-primary font-medium"
                  : "text-foreground hover:bg-muted/50"
              }`}
              data-ocid="marketplace.date.button"
            >
              <span>{label}</span>
              {filters.dateFilter === key && (
                <Check className="h-3 w-3 text-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      <ThinSep />

      {/* Location */}
      <div>
        <SectionLabel>{mp.city}</SectionLabel>
        <div className="relative mb-3">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder={mp.cityPlaceholder}
            value={filters.city}
            onChange={(e) => onChange({ ...filters, city: e.target.value })}
            className="pl-8 h-9 text-sm border-border/60 focus:border-primary/50"
            data-ocid="marketplace.city.input"
          />
        </div>
        {filters.city && (
          <div>
            <p className="text-[11px] text-muted-foreground/70 mb-2 uppercase tracking-widest font-semibold">
              {mp.radius}
            </p>
            <div className="grid grid-cols-2 gap-1">
              {radiusOptions.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onChange({ ...filters, radius: key })}
                  className={`text-xs py-1.5 px-2 rounded-md transition-colors border ${
                    filters.radius === key
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  }`}
                  data-ocid="marketplace.radius.button"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <ThinSep />

      {/* International toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-3.5 w-3.5 text-muted-foreground" />
          <Label className="text-sm text-foreground cursor-pointer">
            {internationalLabel}
          </Label>
        </div>
        <Switch
          checked={filters.isInternational}
          onCheckedChange={(v) => onChange({ ...filters, isInternational: v })}
          data-ocid="marketplace.international.switch"
        />
      </div>

      {isMobile && onApply && (
        <div className="pt-4">
          <Button
            className="w-full"
            onClick={onApply}
            data-ocid="marketplace.apply.primary_button"
          >
            {mp.applyFilters}
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Active filter chips ──────────────────────────────────────────────────────

function FilterChips({
  filters,
  onChange,
  onReset,
}: {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onReset: () => void;
}) {
  const { t, lang } = useTranslation();
  const mp = t.marketplace;
  const chips: { label: string; onRemove: () => void }[] = [];

  if (filters.search) {
    chips.push({
      label: `"${filters.search}"`,
      onRemove: () => onChange({ ...filters, search: "" }),
    });
  }
  if (filters.category !== "all") {
    const cat = n1Categories.find((c) => c.key === filters.category);
    chips.push({
      label: cat ? getCategoryLabel(cat, lang) : filters.category,
      onRemove: () =>
        onChange({ ...filters, category: "all", subCategories: [] }),
    });
  }
  for (const s of filters.statuses) {
    chips.push({
      label: (t.mission.status as Record<string, string>)[s] ?? s,
      onRemove: () =>
        onChange({
          ...filters,
          statuses: filters.statuses.filter((x) => x !== s),
        }),
    });
  }
  if (filters.budgetRange[0] > 0 || filters.budgetRange[1] < 5000) {
    chips.push({
      label: `${filters.budgetRange[0]}€ – ${filters.budgetRange[1] >= 5000 ? "5000€+" : `${filters.budgetRange[1]}€`}`,
      onRemove: () => onChange({ ...filters, budgetRange: [0, 5000] }),
    });
  }
  if (filters.dateFilter !== "all") {
    const labels: Record<DateFilter, string> = {
      all: "",
      today: mp.today,
      week: mp.thisWeek,
      month: mp.thisMonth,
    };
    chips.push({
      label: labels[filters.dateFilter],
      onRemove: () => onChange({ ...filters, dateFilter: "all" }),
    });
  }
  if (filters.city) {
    chips.push({
      label: filters.city,
      onRemove: () => onChange({ ...filters, city: "", radius: "50" }),
    });
  }
  if (filters.isInternational) {
    chips.push({
      label: "International",
      onRemove: () => onChange({ ...filters, isInternational: false }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap pt-2">
      {chips.map((chip) => (
        <span
          key={chip.label}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/8 text-primary text-xs font-medium border border-primary/15"
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            className="hover:text-primary/60 transition-colors"
            aria-label="Remove filter"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onReset}
        className="text-xs text-muted-foreground hover:text-destructive transition-colors underline ml-1"
        data-ocid="marketplace.chips.button"
      >
        {mp.clearAll}
      </button>
    </div>
  );
}

// ─── Competition badge ────────────────────────────────────────────────────────

function CompetitionBadge({
  count,
  t,
}: { count: number; t: { low: string; medium: string; high: string } }) {
  if (count <= 2)
    return (
      <span className="text-xs text-emerald-600 font-medium">{t.low}</span>
    );
  if (count <= 6)
    return (
      <span className="text-xs text-amber-500 font-medium">{t.medium}</span>
    );
  return <span className="text-xs text-rose-500 font-medium">{t.high}</span>;
}

// ─── Task card ────────────────────────────────────────────────────────────────

function TaskCard({
  task,
  viewMode,
}: {
  task: Mission;
  viewMode: ViewMode;
}) {
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const { triggerGate } = useVisitorGate();
  const { getMissionLikes, toggleMissionLike } = useCommentStore();
  const { currentUser } = useAuthStore();
  const missionLikedBy = getMissionLikes(String(task.id));
  const missionLiked =
    currentUser !== null && missionLikedBy.includes(currentUser.id as number);

  function handleMissionLike(e: { stopPropagation: () => void }) {
    e.stopPropagation();
    if (!currentUser) {
      toast.error(t.common.error);
      return;
    }
    toggleMissionLike(String(task.id), currentUser.id as number);
  }
  const mp = t.marketplace;
  const urgent = isUrgent(task);

  const statusConfig: Record<string, { label: string; cls: string }> = {
    open: {
      label: t.mission.status.open,
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    in_progress: {
      label: t.mission.status.inProgress,
      cls: "bg-blue-50 text-blue-700 border-blue-200",
    },
    accepted: {
      label: t.mission.status.inProgress,
      cls: "bg-blue-50 text-blue-700 border-blue-200",
    },
    paid: {
      label: t.mission.status.completed,
      cls: "bg-gray-100 text-gray-600 border-gray-200",
    },
    completed: {
      label: t.mission.status.completed,
      cls: "bg-gray-100 text-gray-600 border-gray-200",
    },
    cancelled: {
      label: t.mission.status.cancelled,
      cls: "bg-rose-50 text-rose-600 border-rose-200",
    },
  };

  const cat = n1Categories.find((c) => c.key === task.category);
  const emoji = cat?.emoji ?? categoryEmojis[task.category] ?? "📋";
  const catLabel = cat ? getCategoryLabel(cat, lang) : task.category;
  const statusInfo = statusConfig[task.status] ?? {
    label: task.status,
    cls: "bg-gray-100 text-gray-600 border-gray-200",
  };
  const initials = task.authorPseudo
    ? task.authorPseudo.slice(0, 2).toUpperCase()
    : "?";
  const bgColor = avatarColor(task.authorId.charCodeAt(0) % 8);
  const popularityPct = 0;
  const competitionT = {
    low: mp.competitionLow,
    medium: mp.competitionMedium,
    high: mp.competitionHigh,
  };
  const BUDGET_LABEL: Record<string, string> = {
    fr: "budget estimé",
    en: "estimated budget",
    de: "geschätztes Budget",
    es: "presupuesto estimado",
    it: "budget stimato",
    pt: "orçamento estimado",
    nl: "geschat budget",
    el: "εκτιμώμενος προϋπολογισμός",
  };
  const budgetLabel = BUDGET_LABEL[lang] ?? BUDGET_LABEL.en;

  function handleClick() {
    if (triggerGate()) return;
    void navigate({ to: "/mission/$id", params: { id: String(task.id) } });
  }

  // ── List view ────────────────────────────────────────────────────────────────
  if (viewMode === "list") {
    return (
      <button
        type="button"
        className="w-full text-left bg-card rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all duration-200 cursor-pointer group"
        onClick={handleClick}
        data-ocid="marketplace.mission.card"
      >
        <div className="flex items-start gap-4 p-4">
          {/* Avatar */}
          <div
            className={`shrink-0 h-10 w-10 rounded-full ${bgColor} flex items-center justify-center text-white font-bold text-xs`}
          >
            {initials}
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Row 1: title + badges */}
            <div className="flex flex-wrap items-start gap-2 mb-1.5">
              <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1 flex-1 leading-snug">
                {task.title}
              </h3>
              <div className="flex items-center gap-1.5 shrink-0">
                {urgent && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[11px] font-semibold">
                    <Zap className="h-2.5 w-2.5" />
                    {mp.urgent}
                  </span>
                )}
                <Badge
                  className={`text-[11px] border ${statusInfo.cls} px-2 py-0.5`}
                  variant="outline"
                >
                  {statusInfo.label}
                </Badge>
              </div>
            </div>

            {/* Row 2: category pill */}
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 rounded-full px-2 py-0.5 mb-2">
              {emoji} {catLabel}
            </span>

            {/* Row 3: description */}
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-2.5">
              {task.description}
            </p>

            {/* Row 4: meta row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {task.city}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo(task.createdAt, lang)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {0} {mp.offerCount}
              </span>
              <CompetitionBadge count={0} t={competitionT} />
            </div>
          </div>

          {/* Budget */}
          <div className="shrink-0 text-right pl-2">
            <div className="flex items-baseline gap-0.5 text-primary font-bold text-sm justify-end">
              <Euro className="h-3 w-3 mt-0.5" />
              <span className="tabular-nums">
                {task.budgetMin}–{task.budgetMax}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {budgetLabel}
            </p>
            <div className="mt-2">
              <Progress value={popularityPct} className="h-1 w-16" />
            </div>
          </div>
        </div>
      </button>
    );
  }

  // ── Grid view ────────────────────────────────────────────────────────────────
  return (
    <div
      className="w-full bg-card rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-200 group overflow-hidden relative"
      data-ocid="marketplace.mission.card"
    >
      {/* Status stripe */}
      <div
        className={`h-0.5 w-full ${
          task.status === "open"
            ? "bg-emerald-400"
            : task.status === "in_progress"
              ? "bg-blue-400"
              : "bg-gray-300"
        }`}
      />

      {/* Work in progress overlay badge */}
      {(task.status === "accepted" ||
        task.status === "in_progress" ||
        task.status === "paid") && (
        <div className="absolute inset-x-0 top-0.5 bg-gray-900/90 text-amber-400 text-xs font-semibold px-3 py-1.5 flex items-center gap-2 z-10">
          <span>🔒</span>
          <span>{mp.missionClosed}</span>
        </div>
      )}

      {/* Clickable area */}
      <button
        type="button"
        onClick={handleClick}
        className="w-full text-left cursor-pointer"
      >
        <div className="p-4 flex flex-col flex-1">
          {/* Row 1: avatar + category + status badges */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div
                className={`h-8 w-8 rounded-full ${bgColor} flex items-center justify-center text-white font-bold text-xs shrink-0`}
              >
                {initials}
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 rounded-full px-2 py-0.5">
                {emoji} {catLabel}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {urgent && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                  <Zap className="h-2.5 w-2.5" />
                </span>
              )}
              <Badge
                className={`text-[11px] border ${statusInfo.cls} px-2 py-0.5`}
                variant="outline"
              >
                {statusInfo.label}
              </Badge>
            </div>
          </div>

          {/* Row 2: title */}
          <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1.5 leading-snug">
            {task.title}
          </h3>

          {/* Row 3: description */}
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3 flex-1">
            {task.description}
          </p>

          {/* Row 4: budget */}
          <div className="flex items-baseline gap-0.5 text-primary font-bold text-sm mb-3">
            <Euro className="h-3 w-3 mt-0.5" />
            <span className="tabular-nums">
              {task.budgetMin} – {task.budgetMax}
            </span>
          </div>

          {/* Row 5: offers + competition */}
          <div className="mb-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                {0} {mp.offerCount}
              </span>
              <CompetitionBadge count={0} t={competitionT} />
            </div>
            <Progress value={popularityPct} className="h-1" />
          </div>

          {/* Row 6: location + time */}
          <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/30 pt-2.5">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {task.city}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo(task.createdAt, lang)}
            </span>
          </div>
        </div>
      </button>
      {/* Mission likes + comments */}
      <div className="border-t border-border/30 px-4 py-2 flex items-center gap-3">
        <button
          type="button"
          onClick={handleMissionLike}
          className={`flex items-center gap-1.5 text-xs transition-colors ${
            missionLiked
              ? "text-rose-500 font-medium"
              : "text-muted-foreground hover:text-rose-400"
          }`}
          data-ocid="marketplace.mission.toggle"
        >
          <Heart
            className={`h-3.5 w-3.5 ${missionLiked ? "fill-rose-500" : ""}`}
          />
          <span>{missionLikedBy.length}</span>
        </button>
      </div>
      <MissionComments missionId={String(task.id)} />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function MarketplacePage() {
  const { t, lang } = useTranslation();
  const { currentUser } = useAuthStore();
  const { listAllMissions } = useMissionStore();
  const { selectedCountry } = useCountryStore();
  const mp = t.marketplace;

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const activeCountry = selectedCountry ?? "FR";
  const countryMeta = getCountryMeta(activeCountry, lang);
  const activeFilterCount = countActiveFilters(filters);

  const filtered = useMemo(() => {
    let tasks = [...listAllMissions()];

    tasks = tasks.filter((task) =>
      matchesCountry(task.country, activeCountry, filters.isInternational),
    );

    // Role-based filtering: particulier sees pro listings, pro sees client listings
    if (currentUser?.role === "client") {
      tasks = tasks.filter((task) => task.authorRole === "pro");
    } else if (currentUser?.role === "pro") {
      tasks = tasks.filter((task) => task.authorRole === "client");
    }
    // Not connected or admin: show all (BlurGate handles access restriction)

    if (filters.search) {
      const q = filters.search.toLowerCase();
      tasks = tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(q) ||
          task.description.toLowerCase().includes(q),
      );
    }

    if (filters.category !== "all") {
      tasks = tasks.filter((task) => task.category === filters.category);
    }

    if (filters.subCategories.length > 0) {
      tasks = tasks.filter(
        (task) =>
          task.subcategory && filters.subCategories.includes(task.subcategory),
      );
    }

    tasks = tasks.filter(
      (task) =>
        task.budgetMax >= filters.budgetRange[0] &&
        task.budgetMin <= filters.budgetRange[1],
    );

    if (filters.statuses.length > 0) {
      tasks = tasks.filter((task) => filters.statuses.includes(task.status));
    }

    if (filters.dateFilter !== "all") {
      const now = new Date();
      tasks = tasks.filter((task) => {
        const created = new Date(task.createdAt);
        const diffDays =
          (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        if (filters.dateFilter === "today") return diffDays < 1;
        if (filters.dateFilter === "week") return diffDays < 7;
        if (filters.dateFilter === "month") return diffDays < 30;
        return true;
      });
    }

    if (filters.city) {
      tasks = tasks.filter((task) =>
        task.city.toLowerCase().includes(filters.city.toLowerCase()),
      );
    }

    switch (sortBy) {
      case "budgetDesc":
        tasks.sort((a, b) => b.budgetMax - a.budgetMax);
        break;
      case "budgetAsc":
        tasks.sort((a, b) => a.budgetMin - b.budgetMin);
        break;
      case "leastOffers":
        // no offerCount in real Mission
        break;
      case "mostPopular":
        // no offerCount in real Mission
        break;
      default:
        tasks.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    return tasks;
  }, [filters, sortBy, activeCountry, listAllMissions, currentUser]);

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "newest", label: mp.sortRelevance },
    { key: "budgetDesc", label: mp.sortBudgetDesc },
    { key: "budgetAsc", label: mp.sortBudgetAsc },
    { key: "leastOffers", label: mp.sortLeastOffers },
    { key: "mostPopular", label: mp.sortMostPopular },
  ];

  // Auth guard — marketplace is members-only
  if (!currentUser) {
    return (
      <main
        className="min-h-screen bg-background flex items-center justify-center"
        data-ocid="marketplace.locked.section"
      >
        <div className="max-w-md w-full mx-4 text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {mp.title}
            </h2>
            <p className="text-muted-foreground text-sm">{mp.subtitle}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              size="lg"
              data-ocid="marketplace.locked.primary_button"
            >
              <Link to="/register">{t.nav.register}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              data-ocid="marketplace.locked.secondary_button"
            >
              <Link to="/login">{t.nav.login}</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }
  return (
    <main className="min-h-screen bg-background">
      {/* ── Page header ───────────────────────────────────────────── */}
      <section className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <h1 className="text-xl font-bold text-foreground leading-tight">
                {mp.title}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {mp.subtitle}
              </p>
            </div>
            {currentUser?.role === "client" && (
              <Button
                asChild
                size="sm"
                className="gap-1.5 shrink-0 h-9 px-4 text-sm"
                data-ocid="marketplace.post.primary_button"
              >
                <Link to="/dashboard/client">
                  <Plus className="h-3.5 w-3.5" />
                  {mp.postMission}
                </Link>
              </Button>
            )}
          </div>

          {/* Search bar row */}
          <div className="flex items-center gap-2">
            {/* Mobile filter trigger */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="md:hidden shrink-0 gap-1.5 relative h-9 px-3 text-sm"
                  data-ocid="marketplace.filters.open_modal_button"
                >
                  <Filter className="h-3.5 w-3.5" />
                  {mp.filterButton}
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="px-5 pt-5 pb-0">
                  <SheetTitle className="text-sm font-semibold">
                    {mp.filterButton}
                  </SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-72px)] px-5 py-4">
                  <FilterSidebar
                    filters={filters}
                    onChange={setFilters}
                    onReset={resetFilters}
                    isMobile
                    onApply={() => setMobileFiltersOpen(false)}
                  />
                </ScrollArea>
              </SheetContent>
            </Sheet>

            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder={mp.searchPlaceholder}
                value={filters.search}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, search: e.target.value }))
                }
                className="pl-9 h-9 text-sm bg-background"
                data-ocid="marketplace.search.input"
              />
              {filters.search && (
                <button
                  type="button"
                  onClick={() => setFilters((f) => ({ ...f, search: "" }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="hidden sm:block h-9 rounded-lg border border-input bg-background px-2.5 text-sm text-foreground shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
              data-ocid="marketplace.sort.select"
            >
              {sortOptions.map(({ key, label }) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            {/* View toggle */}
            <div className="hidden md:flex items-center border border-border rounded-lg overflow-hidden shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-2 transition-colors ${
                  viewMode === "grid"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
                title={mp.viewGrid}
                data-ocid="marketplace.view.toggle"
              >
                <Grid3X3 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-2 transition-colors ${
                  viewMode === "list"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
                title={mp.viewList}
                data-ocid="marketplace.listview.toggle"
              >
                <LayoutList className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Active chips */}
          <FilterChips
            filters={filters}
            onChange={setFilters}
            onReset={resetFilters}
          />
        </div>
      </section>

      {/* ── Body ──────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 py-5">
        <div className="flex gap-5">
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-56 shrink-0">
            <div className="sticky top-20">
              <div className="bg-card rounded-xl border border-border/40 p-4 shadow-xs">
                <ScrollArea className="max-h-[calc(100vh-180px)]">
                  <FilterSidebar
                    filters={filters}
                    onChange={setFilters}
                    onReset={resetFilters}
                  />
                </ScrollArea>
              </div>
            </div>
          </aside>

          {/* Results area */}
          <div className="flex-1 min-w-0">
            {/* Results count bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground tabular-nums">
                  {filtered.length}
                </span>
                <span className="text-sm text-muted-foreground">
                  {mp.resultsCount}
                </span>
                {!filters.isInternational && (
                  <Badge
                    variant="outline"
                    className="text-xs border-primary/20 text-primary bg-primary/5 px-2 py-0.5"
                  >
                    {countryMeta.flag} {countryMeta.name}
                  </Badge>
                )}
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="sm:hidden h-8 rounded-lg border border-input bg-background px-2 text-xs text-foreground cursor-pointer focus:outline-none"
                data-ocid="marketplace.mobile-sort.select"
              >
                {sortOptions.map(({ key, label }) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Cards grid or empty state */}
            {filtered.length === 0 ? (
              <EmptyState
                label={mp.noResults}
                desc={mp.noResultsDesc}
                onReset={resetFilters}
                resetLabel={mp.noResultsReset}
              />
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3"
                    : "flex flex-col gap-2"
                }
              >
                {filtered.map((task, idx) => (
                  <TaskCardWrapper key={task.id} index={idx + 1}>
                    <TaskCard task={task} viewMode={viewMode} />
                  </TaskCardWrapper>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function TaskCardWrapper({
  children,
  index,
}: {
  children: ReactNode;
  index: number;
}) {
  return (
    <div
      data-ocid={`marketplace.mission.item.${index}`}
      className="animate-fade-in"
    >
      {children}
    </div>
  );
}

function EmptyState({
  label,
  desc,
  onReset,
  resetLabel,
}: {
  label: string;
  desc: string;
  onReset: () => void;
  resetLabel: string;
}) {
  return (
    <div
      className="text-center py-16 px-8"
      data-ocid="marketplace.missions.empty_state"
    >
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <Briefcase className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-base text-foreground mb-1.5">
        {label}
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-5">
        {desc}
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
        className="gap-1.5 text-sm"
        data-ocid="marketplace.reset.button"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        {resetLabel}
      </Button>
    </div>
  );
}

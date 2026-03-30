import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuthStore } from "@/lib/auth-store";
import { useTranslation } from "@/lib/i18n";
import { useLocation, useNavigate } from "@tanstack/react-router";
import {
  ChevronRight,
  Clock,
  Heart,
  Map as MapIcon,
  PlusCircle,
  Search,
  User,
  Wrench,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const RECENT_SEARCHES_BY_LANG: Record<string, string[]> = {
  fr: ["Plombier Paris", "Électricien Lyon", "Ménage à domicile"],
  en: ["Plumber London", "Electrician Manchester", "Home cleaning"],
  de: ["Klempner Berlin", "Elektriker München", "Hausreinigung"],
  es: ["Fontanero Madrid", "Electricista Barcelona", "Limpieza hogar"],
  it: ["Idraulico Roma", "Elettricista Milano", "Pulizia casa"],
  pt: ["Canalizador Lisboa", "Eletricista Porto", "Limpeza doméstica"],
  nl: ["Loodgieter Amsterdam", "Elektricien Rotterdam", "Huishoudelijke hulp"],
  el: ["Υδραυλικός Αθήνα", "Ηλεκτρολόγος Θεσσαλονίκη", "Καθαρισμός σπιτιού"],
};

const SUGGESTED_CATEGORY_KEYS = [
  { icon: "🔧", key: "handytask" },
  { icon: "🧹", key: "nettoyage" },
  { icon: "🌿", key: "jardin" },
  { icon: "🚚", key: "demenagement" },
  { icon: "💻", key: "informatique" },
  { icon: "🐾", key: "animaux" },
];

export function BottomNav() {
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuthStore();

  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 60) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY.current + 5) {
        setVisible(false);
      } else if (currentScrollY < lastScrollY.current - 5) {
        setVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentPath = location.pathname;

  function isActive(path: string) {
    return currentPath === path;
  }

  function getDashboardPath() {
    if (!currentUser) return null;
    if (currentUser.role === "admin") return "/dashboard/admin";
    if (currentUser.role === "pro") return "/dashboard/pro";
    return "/dashboard/client";
  }

  function handleAccountClick() {
    if (currentUser) {
      const path = getDashboardPath();
      if (path) navigate({ to: path as any });
    } else {
      setAccountOpen(true);
    }
  }

  function handleAddClick() {
    if (currentUser) {
      navigate({ to: "/post-task" });
    } else {
      setAccountOpen(true);
    }
  }

  const dashPath = getDashboardPath();

  const navItems = [
    {
      id: "search",
      label: t.nav.bottomSearch,
      icon: Search,
      path: null,
      onClick: () => setSearchOpen(true),
    },
    {
      id: "map",
      label: t.nav.bottomMap,
      icon: MapIcon,
      path: "/map",
      onClick: () => navigate({ to: "/map" }),
    },
    null, // center button placeholder
    {
      id: "rental",
      label: t.nav.rental,
      icon: Wrench,
      path: "/rental",
      onClick: () => navigate({ to: "/rental" }),
    },
    {
      id: "account",
      label: t.nav.bottomAccount,
      icon: User,
      path: dashPath,
      onClick: handleAccountClick,
    },
  ];

  return (
    <>
      {/* Bottom Nav Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border transition-transform duration-300 ease-in-out"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          boxShadow: "0 -2px 16px rgba(0,0,0,0.08)",
          transform: visible ? "translateY(0)" : "translateY(100%)",
        }}
        data-ocid="bottom_nav.panel"
      >
        <div className="flex items-end h-16 px-2">
          {navItems.map((item) => {
            if (item === null) {
              return (
                <div
                  key="add"
                  className="flex-1 flex justify-center items-end pb-2"
                >
                  <button
                    type="button"
                    onClick={handleAddClick}
                    data-ocid="bottom_nav.add_button"
                    className="relative -mt-4 h-14 w-14 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.72 0.18 65), oklch(0.65 0.20 55))",
                      boxShadow: "0 4px 16px oklch(0.65 0.20 55 / 0.4)",
                    }}
                    aria-label={t.nav.bottomAdd}
                  >
                    <PlusCircle
                      className="h-7 w-7 text-white"
                      strokeWidth={2}
                    />
                  </button>
                </div>
              );
            }

            const Icon = item.icon;
            const active = item.path ? isActive(item.path) : false;

            return (
              <button
                type="button"
                key={item.id}
                onClick={item.onClick}
                data-ocid={`bottom_nav.${item.id}_link`}
                className="flex-1 flex flex-col items-center justify-end pb-2 pt-1 gap-0.5 min-h-[56px] active:scale-95 transition-transform"
                aria-label={item.label}
              >
                <div className="relative">
                  <Icon
                    className="h-5 w-5 transition-colors"
                    style={{
                      color: active
                        ? "oklch(0.50 0.22 258)"
                        : "oklch(0.55 0.01 0)",
                    }}
                    fill={active ? "oklch(0.50 0.22 258)" : "none"}
                    strokeWidth={active ? 2.5 : 1.8}
                  />
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full"
                      style={{ background: "oklch(0.50 0.22 258)" }}
                    />
                  )}
                </div>
                <span
                  className="text-[10px] font-medium leading-none transition-colors"
                  style={{
                    color: active
                      ? "oklch(0.50 0.22 258)"
                      : "oklch(0.55 0.01 0)",
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Search Sheet */}
      <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
        <SheetContent
          side="bottom"
          className="md:hidden rounded-t-2xl max-h-[85vh]"
          data-ocid="bottom_nav.search_sheet"
        >
          <SheetHeader className="pb-3">
            <SheetTitle className="text-left text-base font-semibold">
              {t.nav.bottomSearch}
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                data-ocid="bottom_nav.search_input"
                placeholder={`${t.nav.bottomSearch}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-11 text-sm"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {!searchQuery && (
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {lang === "fr"
                    ? "Recherches récentes"
                    : lang === "de"
                      ? "Letzte Suchen"
                      : lang === "es"
                        ? "Búsquedas recientes"
                        : lang === "it"
                          ? "Ricerche recenti"
                          : lang === "pt"
                            ? "Pesquisas recentes"
                            : lang === "nl"
                              ? "Recente zoekopdrachten"
                              : "Recent searches"}
                </p>
                <div className="space-y-1">
                  {(
                    RECENT_SEARCHES_BY_LANG[lang] ?? RECENT_SEARCHES_BY_LANG.en
                  ).map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setSearchQuery(s)}
                      className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                    >
                      <Clock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{s}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {lang === "fr"
                  ? "Catégories populaires"
                  : lang === "de"
                    ? "Beliebte Kategorien"
                    : lang === "es"
                      ? "Categorías populares"
                      : lang === "it"
                        ? "Categorie popolari"
                        : lang === "pt"
                          ? "Categorias populares"
                          : lang === "nl"
                            ? "Populaire categorieën"
                            : "Popular categories"}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {SUGGESTED_CATEGORY_KEYS.map((cat) => (
                  <button
                    type="button"
                    key={cat.key}
                    onClick={() => {
                      setSearchOpen(false);
                      navigate({ to: "/categories" });
                    }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 transition-colors text-left"
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span className="text-xs font-medium text-foreground/80 line-clamp-1">
                      {t.categories[cat.key as keyof typeof t.categories] ??
                        cat.key}
                    </span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Account Sheet (not logged in) */}
      <AnimatePresence>
        {accountOpen && (
          <Sheet open={accountOpen} onOpenChange={setAccountOpen}>
            <SheetContent
              side="bottom"
              className="md:hidden rounded-t-2xl"
              data-ocid="bottom_nav.account_sheet"
            >
              <SheetHeader className="pb-4">
                <SheetTitle className="text-center text-base font-semibold">
                  Bienvenue sur TaskVoilà
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-3 pb-4">
                <Button
                  data-ocid="bottom_nav.login_button"
                  className="w-full h-12 text-base font-semibold rounded-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.72 0.18 65), oklch(0.65 0.20 55))",
                  }}
                  onClick={() => {
                    setAccountOpen(false);
                    navigate({ to: "/login" });
                  }}
                >
                  {t.nav.login}
                </Button>
                <Button
                  data-ocid="bottom_nav.register_button"
                  variant="outline"
                  className="w-full h-12 text-base font-semibold rounded-xl"
                  onClick={() => {
                    setAccountOpen(false);
                    navigate({ to: "/register" });
                  }}
                >
                  {t.nav.register}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </AnimatePresence>
    </>
  );
}

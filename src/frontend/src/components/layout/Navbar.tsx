import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuthStore } from "@/lib/auth-store";
import { useChatStore } from "@/lib/chat-store";
import { useCountryStore } from "@/lib/country-store";
import { LANGUAGE_META, type Language, useTranslation } from "@/lib/i18n";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Award,
  Bell,
  ChevronDown,
  Crown,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  PlusCircle,
  Settings,
  User,
  X,
} from "lucide-react";
import React from "react";
import { useEffect, useState } from "react";

// Switzerland is the ONLY country with a language toggle (FR ↔ DE)
const SWITZERLAND_CODE = "CH";
const SWISS_LANGS: Language[] = ["fr", "de"];

const LOGO_SRC =
  "/assets/generated/logo-proposal-3-squirrel-helmet-clipboard.dim_600x600.png";

function LogoImage({ className }: { className?: string }) {
  const [err, setErr] = React.useState(false);
  if (err) {
    return (
      <span
        className={`inline-flex items-center justify-center font-black text-amber-500 bg-amber-500/10 rounded-full ${className ?? ""}`}
      >
        TV
      </span>
    );
  }
  return (
    <img
      src={LOGO_SRC}
      alt="TaskVoilà"
      className={className}
      loading="eager"
      fetchPriority="high"
      onError={() => setErr(true)}
    />
  );
}

// Per-language texts for the mobile user popover
const USER_POPOVER_TEXTS: Record<
  Language,
  {
    notRegistered: string;
    login: string;
    register: string;
    hello: string;
    clientArea: string;
    logout: string;
  }
> = {
  fr: {
    notRegistered: "Pas encore inscrit ?",
    login: "Se connecter",
    register: "S'inscrire",
    hello: "Bonjour",
    clientArea: "Espace client",
    logout: "Déconnexion",
  },
  en: {
    notRegistered: "Not registered yet?",
    login: "Log in",
    register: "Sign up",
    hello: "Hello",
    clientArea: "Client area",
    logout: "Log out",
  },
  de: {
    notRegistered: "Noch nicht registriert?",
    login: "Anmelden",
    register: "Registrieren",
    hello: "Hallo",
    clientArea: "Kundenbereich",
    logout: "Abmelden",
  },
  es: {
    notRegistered: "¿Aún no registrado?",
    login: "Iniciar sesión",
    register: "Registrarse",
    hello: "Hola",
    clientArea: "Área de cliente",
    logout: "Cerrar sesión",
  },
  it: {
    notRegistered: "Non ancora registrato?",
    login: "Accedi",
    register: "Iscriviti",
    hello: "Ciao",
    clientArea: "Area cliente",
    logout: "Disconnettersi",
  },
  pt: {
    notRegistered: "Ainda não registado?",
    login: "Entrar",
    register: "Registar",
    hello: "Olá",
    clientArea: "Área do cliente",
    logout: "Terminar sessão",
  },
  nl: {
    notRegistered: "Nog niet geregistreerd?",
    login: "Inloggen",
    register: "Registreren",
    hello: "Hallo",
    clientArea: "Klantenruimte",
    logout: "Uitloggen",
  },
  ie: {
    notRegistered: "Not registered yet?",
    login: "Log in",
    register: "Sign up",
    hello: "Hello",
    clientArea: "Client area",
    logout: "Log out",
  },
  el: {
    notRegistered: "Δεν έχετε εγγραφεί;",
    login: "Σύνδεση",
    register: "Εγγραφή",
    hello: "Γεια",
    clientArea: "Περιοχή πελάτη",
    logout: "Αποσύνδεση",
  },
};

export function Navbar() {
  const { t, lang, setLang } = useTranslation();
  const { selectedCountry } = useCountryStore();
  const { currentUser, logoutUser } = useAuthStore();

  const isSwiss = selectedCountry === SWITZERLAND_CODE;
  const { getConversationsForUser } = useChatStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const userId = currentUser ? String(currentUser.id) : "";
  const convCount = currentUser ? getConversationsForUser(userId).length : 0;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally watching pathname
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isLoggedIn = !!currentUser;
  const currentLangMeta = LANGUAGE_META[lang];
  const userTexts = USER_POPOVER_TEXTS[lang] ?? USER_POPOVER_TEXTS.en;

  function getDashboardPath() {
    if (!currentUser) return "/dashboard/client" as const;
    if (currentUser.role === "admin") return "/dashboard/admin" as const;
    if (currentUser.role === "pro") return "/dashboard/pro" as const;
    return "/dashboard/client" as const;
  }

  function getDisplayName() {
    if (!currentUser) return "";
    return currentUser.pseudo || currentUser.firstName || "User";
  }

  function getInitial() {
    if (!currentUser) return "?";
    const name = currentUser.pseudo || currentUser.firstName || "U";
    return name[0].toUpperCase();
  }

  function handleLogout() {
    logoutUser();
    void navigate({ to: "/" });
  }

  const navLinks = [
    { href: "/" as const, label: t.nav.home },
    { href: "/marketplace" as const, label: t.nav.marketplace },
    { href: "/pros" as const, label: t.nav.professionals },
    {
      href: "/categories" as const,
      label: t.categoriesPage.title,
    },
    { href: "/map" as const, label: t.nav.map },
    { href: "/rental" as const, label: t.nav.rental },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      {/* Dim backdrop — rendered outside <nav> so it covers the full viewport */}
      {mobileOpen && (
        <button
          type="button"
          className="md:hidden fixed inset-0 w-full h-full bg-black/45 backdrop-blur-[1px] transition-opacity duration-200 cursor-default border-0 p-0"
          style={{ zIndex: 40 }}
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          data-ocid="nav.mobile.backdrop"
        />
      )}

      <nav
        className={`fixed top-0 left-0 right-0 w-full bg-white border-b border-border transition-all duration-300 ${
          scrolled ? "nav-shadow-scroll" : "nav-shadow"
        }`}
        style={{ zIndex: 50 }}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Hamburger button — mobile only, LEFT side, before logo */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-accent/70 transition-all duration-150 shrink-0"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            data-ocid="nav.mobile.menu.button"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 shrink-0"
            data-ocid="nav.home.link"
          >
            <LogoImage className="w-9 h-9 object-contain" />
            <span className="font-display font-bold text-xl text-foreground tracking-tight">
              Task
              <span style={{ color: "oklch(0.35 0.15 250)" }}>Voilà</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive(link.href)
                    ? "bg-primary/8 text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/70"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-2">
            {/* Language indicator / toggle (Switzerland only: FR ↔ DE) */}
            {isSwiss ? (
              <div className="flex items-center gap-1 border border-border rounded-lg overflow-hidden">
                {SWISS_LANGS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLang(l)}
                    className={`flex items-center justify-center w-9 h-9 text-base transition-all duration-150 ${
                      lang === l
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-accent/70 text-muted-foreground"
                    }`}
                    title={LANGUAGE_META[l].labelNative}
                    aria-label={LANGUAGE_META[l].labelNative}
                    data-ocid={`nav.lang.${l}.toggle`}
                  >
                    <span className="leading-none">
                      {LANGUAGE_META[l].flag}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div
                className="flex items-center justify-center w-9 h-9 rounded-lg text-base border border-border/50 bg-accent/30 cursor-default"
                title={currentLangMeta.labelNative}
                aria-label={currentLangMeta.labelNative}
                data-ocid="nav.lang.indicator"
              >
                <span className="leading-none">{currentLangMeta.flag}</span>
              </div>
            )}

            {/* Post a task CTA */}
            <Button
              size="sm"
              asChild
              className="gap-1.5 font-bold text-sm h-9 px-4 shadow-sm hover:shadow-md transition-all duration-150"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.18 160), oklch(0.48 0.20 155))",
                color: "white",
              }}
            >
              <Link to="/post-task" data-ocid="nav.post.task.button">
                <PlusCircle className="h-4 w-4" />
                {t.nav.postMission}
              </Link>
            </Button>

            {isLoggedIn && currentUser ? (
              <>
                {/* Notification bell */}
                <button
                  type="button"
                  className="relative flex items-center justify-center w-9 h-9 rounded-lg border border-border/60 hover:bg-accent/70 transition-all duration-150"
                  data-ocid="nav.notifications.button"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </button>

                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 h-9 border-border/60 hover:bg-accent/70 transition-all duration-150"
                      data-ocid="nav.user.menu.button"
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{
                          background:
                            "linear-gradient(135deg, oklch(0.35 0.15 250), oklch(0.55 0.18 160))",
                        }}
                      >
                        {getInitial()}
                      </div>
                      <span className="max-w-[80px] truncate font-medium text-sm">
                        {getDisplayName()}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem
                      onClick={() => void navigate({ to: getDashboardPath() })}
                      className="cursor-pointer gap-2"
                      data-ocid="nav.dashboard.link"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      {t.nav.myDashboard}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => void navigate({ to: "/messages" })}
                      className="cursor-pointer gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      {"Messages"}
                      {convCount > 0 && (
                        <span className="ml-auto text-xs bg-primary text-white rounded-full px-1.5 py-0.5 font-bold">
                          {convCount}
                        </span>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => void navigate({ to: "/documents" })}
                      className="cursor-pointer gap-2"
                      data-ocid="nav.documents.link"
                    >
                      <FileText className="h-4 w-4" />
                      {"Documents"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => void navigate({ to: "/nfts" })}
                      className="cursor-pointer gap-2"
                      data-ocid="nav.nfts.link"
                    >
                      <Award className="h-4 w-4" />
                      {(
                        {
                          fr: "Mes NFT",
                          en: "My NFTs",
                          de: "Meine NFTs",
                          es: "Mis NFTs",
                          it: "I miei NFT",
                          pt: "Os meus NFTs",
                          nl: "Mijn NFTs",
                          el: "Τα NFT μου",
                        } as Record<string, string>
                      )[lang] ?? "My NFTs"}
                    </DropdownMenuItem>
                    {currentUser.role === "pro" && (
                      <DropdownMenuItem
                        onClick={() => void navigate({ to: "/subscription" })}
                        className="cursor-pointer gap-2"
                        data-ocid="nav.subscription.link"
                      >
                        <Crown className="h-4 w-4" />
                        {(
                          {
                            fr: "Abonnement",
                            en: "Subscription",
                            de: "Abonnement",
                            es: "Suscripción",
                            it: "Abbonamento",
                            pt: "Subscrição",
                            nl: "Abonnement",
                            el: "Συνδρομή",
                          } as Record<string, string>
                        )[lang] ?? "Subscription"}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => void navigate({ to: "/profile/edit" })}
                      className="cursor-pointer gap-2"
                      data-ocid="nav.profile.link"
                    >
                      <User className="h-4 w-4" />
                      {(
                        {
                          fr: "Mon profil",
                          en: "My profile",
                          de: "Mein Profil",
                          es: "Mi perfil",
                          it: "Il mio profilo",
                          pt: "O meu perfil",
                          nl: "Mijn profiel",
                          el: "Το προφίλ μου",
                          ie: "My profile",
                        } as Record<string, string>
                      )[lang] ?? "My profile"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => void navigate({ to: "/settings" })}
                      className="cursor-pointer gap-2"
                      data-ocid="nav.settings.link"
                    >
                      <Settings className="h-4 w-4" />
                      {t.settings.title}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive flex items-center gap-2 cursor-pointer"
                      data-ocid="nav.logout.button"
                    >
                      <LogOut className="h-4 w-4" />
                      {t.nav.logout}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-9 font-medium text-muted-foreground hover:text-foreground"
                >
                  <Link to="/login" data-ocid="nav.login.button">
                    {t.nav.login}
                  </Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="h-9 px-4 font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Link to="/register" data-ocid="nav.register.button">
                    {t.nav.register}
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Right Controls — flag + user icon */}
          <div className="md:hidden flex items-center gap-1.5">
            {/* Language flag */}
            {isSwiss ? (
              <div className="flex items-center gap-0.5 border border-border rounded-lg overflow-hidden">
                {SWISS_LANGS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLang(l)}
                    className={`flex items-center justify-center w-9 h-9 text-base transition-all duration-150 ${
                      lang === l ? "bg-primary/10" : "hover:bg-accent/70"
                    }`}
                    aria-label={LANGUAGE_META[l].labelNative}
                    data-ocid={`nav.lang.${l}.mobile.toggle`}
                  >
                    <span>{LANGUAGE_META[l].flag}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div
                className="flex items-center justify-center w-9 h-9 rounded-lg text-base border border-border/50 bg-accent/30 cursor-default"
                aria-label={currentLangMeta.labelNative}
                data-ocid="nav.lang.mobile.indicator"
              >
                <span>{currentLangMeta.flag}</span>
              </div>
            )}

            {/* User icon — permanent, mobile only */}
            {isLoggedIn && currentUser ? (
              /* Connected: greeting text + icon → popover with Espace client + Déconnexion */
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1 rounded-lg hover:bg-accent/70 transition-all duration-150 pl-1 pr-1.5 h-9"
                    aria-label={`${userTexts.hello}, ${getDisplayName()}`}
                    data-ocid="nav.mobile.user.dashboard.button"
                  >
                    <span className="text-xs font-medium text-foreground max-w-[72px] truncate leading-none">
                      {userTexts.hello},&nbsp;{getDisplayName()}
                    </span>
                    <div className="flex items-center justify-center w-7 h-7 rounded-full border border-border/50 bg-accent/30 shrink-0">
                      <User className="h-3.5 w-3.5 text-foreground" />
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  sideOffset={8}
                  className="w-48 p-2 flex flex-col gap-1"
                  data-ocid="nav.mobile.user.popover"
                >
                  <button
                    type="button"
                    onClick={() => void navigate({ to: getDashboardPath() })}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent/70 transition-colors text-left"
                    data-ocid="nav.mobile.user.client_area.button"
                  >
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{userTexts.clientArea}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-destructive/8 transition-colors text-left text-destructive"
                    data-ocid="nav.mobile.user.logout.button"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    <span>{userTexts.logout}</span>
                  </button>
                </PopoverContent>
              </Popover>
            ) : (
              /* Not connected: popover with login / register */
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center justify-center w-9 h-9 rounded-full border border-border/50 bg-accent/30 hover:bg-accent/60 transition-all duration-150 shrink-0"
                    aria-label="User account"
                    data-ocid="nav.mobile.user.popover.button"
                  >
                    <User className="h-4 w-4 text-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  sideOffset={8}
                  className="w-52 p-3 flex flex-col gap-2"
                  data-ocid="nav.mobile.user.popover"
                >
                  <p className="text-xs text-muted-foreground text-center pb-1">
                    {userTexts.notRegistered}
                  </p>
                  <Button
                    size="sm"
                    className="w-full font-bold bg-primary hover:bg-primary/90 text-primary-foreground h-9"
                    asChild
                    data-ocid="nav.mobile.user.login.button"
                  >
                    <Link to="/login">{userTexts.login}</Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full font-medium h-9"
                    asChild
                    data-ocid="nav.mobile.user.register.button"
                  >
                    <Link to="/register">{userTexts.register}</Link>
                  </Button>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        {/* Mobile Menu Panel — sits above the backdrop */}
        {mobileOpen && (
          <div
            className="md:hidden border-t border-border bg-white relative"
            style={{ zIndex: 50 }}
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-150 min-h-[44px] ${
                    isActive(link.href)
                      ? "bg-primary/8 text-primary font-semibold"
                      : "text-foreground hover:bg-accent/70"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <Link
                to="/post-task"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-bold min-h-[44px] text-white shadow-sm mt-1"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.55 0.18 160), oklch(0.48 0.20 155))",
                }}
                data-ocid="nav.mobile.post.task.button"
              >
                <PlusCircle className="h-4 w-4" />
                {t.nav.postMission}
              </Link>

              <div className="pt-3 mt-1 border-t border-border flex flex-col gap-1">
                {isLoggedIn && currentUser ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent/40 mb-1">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                        style={{
                          background:
                            "linear-gradient(135deg, oklch(0.35 0.15 250), oklch(0.55 0.18 160))",
                        }}
                      >
                        {getInitial()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {getDisplayName()}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {currentUser.role}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        void navigate({ to: getDashboardPath() });
                        setMobileOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium hover:bg-accent/70 text-left min-h-[44px] transition-all duration-150"
                      data-ocid="nav.mobile.dashboard.link"
                    >
                      <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                      {t.nav.myDashboard}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void navigate({ to: "/messages" });
                        setMobileOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium hover:bg-accent/70 text-left min-h-[44px] transition-all duration-150"
                    >
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      {"Messages"}
                      {convCount > 0 && (
                        <span className="ml-auto text-xs bg-primary text-white rounded-full px-1.5 py-0.5 font-bold">
                          {convCount}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void navigate({ to: "/documents" });
                        setMobileOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium hover:bg-accent/70 text-left min-h-[44px] transition-all duration-150"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {"Documents"}
                    </button>
                    {currentUser.role === "pro" && (
                      <button
                        type="button"
                        onClick={() => {
                          void navigate({ to: "/subscription" });
                          setMobileOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium hover:bg-accent/70 text-left min-h-[44px] transition-all duration-150"
                      >
                        <Crown className="h-4 w-4 text-muted-foreground" />
                        {(
                          {
                            fr: "Abonnement",
                            en: "Subscription",
                            de: "Abonnement",
                            es: "Suscripción",
                            it: "Abbonamento",
                            pt: "Subscrição",
                            nl: "Abonnement",
                            el: "Συνδρομή",
                          } as Record<string, string>
                        )[lang] ?? "Subscription"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        handleLogout();
                        setMobileOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/8 text-left min-h-[44px] transition-all duration-150"
                      data-ocid="nav.mobile.logout.button"
                    >
                      <LogOut className="h-4 w-4" />
                      {t.nav.logout}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center px-4 py-3.5 rounded-xl text-sm font-medium hover:bg-accent/70 min-h-[44px] transition-all duration-150"
                      data-ocid="nav.mobile.login.button"
                    >
                      {t.nav.login}
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center px-4 py-3.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground min-h-[44px] transition-all duration-150"
                      data-ocid="nav.mobile.register.button"
                    >
                      {t.nav.register}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

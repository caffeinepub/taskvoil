import { useTranslation } from "@/lib/i18n";
import { Link } from "@tanstack/react-router";
import { Heart, Mail } from "lucide-react";

const LOGO_SRC =
  "/assets/generated/logo-proposal-3-squirrel-helmet-clipboard.dim_600x600.png";

function FooterLogo() {
  return (
    <img src={LOGO_SRC} alt="TaskVoilà" className="w-8 h-8 object-contain" />
  );
}

const LEGAL_LABELS: Record<
  string,
  {
    cgu: string;
    privacy: string;
    cookies: string;
    contact: string;
    legalTitle: string;
  }
> = {
  fr: {
    cgu: "CGU",
    privacy: "Politique de confidentialité",
    cookies: "Politique de cookies",
    contact: "Contact",
    legalTitle: "Légal",
  },
  en: {
    cgu: "Terms",
    privacy: "Privacy Policy",
    cookies: "Cookie Policy",
    contact: "Contact",
    legalTitle: "Legal",
  },
  de: {
    cgu: "AGB",
    privacy: "Datenschutzrichtlinie",
    cookies: "Cookie-Richtlinie",
    contact: "Kontakt",
    legalTitle: "Rechtliches",
  },
  es: {
    cgu: "CGU",
    privacy: "Política de privacidad",
    cookies: "Política de cookies",
    contact: "Contacto",
    legalTitle: "Legal",
  },
  it: {
    cgu: "CGU",
    privacy: "Informativa sulla privacy",
    cookies: "Politica sui cookie",
    contact: "Contatto",
    legalTitle: "Legale",
  },
  pt: {
    cgu: "CGU",
    privacy: "Política de privacidade",
    cookies: "Política de cookies",
    contact: "Contacto",
    legalTitle: "Legal",
  },
  nl: {
    cgu: "AGV",
    privacy: "Privacybeleid",
    cookies: "Cookiebeleid",
    contact: "Contact",
    legalTitle: "Juridisch",
  },
  el: {
    cgu: "ΓΟΧ",
    privacy: "Πολιτική απορρήτου",
    cookies: "Πολιτική Cookies",
    contact: "Επικοινωνία",
    legalTitle: "Νομικά",
  },
};

export function Footer() {
  const { t, lang } = useTranslation();
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;
  const legal = LEGAL_LABELS[lang] ?? LEGAL_LABELS.en;

  return (
    <footer className="bg-foreground text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <FooterLogo />
              <span className="font-display font-bold text-xl">
                Task<span className="text-secondary">Voilà</span>
              </span>
            </div>
            <p className="text-white/60 text-sm">{t.footer.tagline}</p>
          </div>

          {/* Plateforme */}
          <div>
            <h4 className="font-semibold mb-4 text-white/90">
              {(
                {
                  fr: "Plateforme",
                  en: "Platform",
                  de: "Plattform",
                  es: "Plataforma",
                  it: "Piattaforma",
                  pt: "Plataforma",
                  nl: "Platform",
                  el: "Πλατφόρμα",
                } as Record<string, string>
              )[lang] ?? "Platform"}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/marketplace"
                  className="text-white/60 hover:text-white text-sm transition-colors"
                  data-ocid="footer.marketplace.link"
                >
                  {t.nav.marketplace}
                </Link>
              </li>
              <li>
                <Link
                  to="/pros"
                  className="text-white/60 hover:text-white text-sm transition-colors"
                  data-ocid="footer.pros.link"
                >
                  {t.nav.professionals}
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-white/60 hover:text-white text-sm transition-colors"
                  data-ocid="footer.register.link"
                >
                  {t.footer.forPros}
                </Link>
              </li>
            </ul>
          </div>

          {/* Informations */}
          <div>
            <h4 className="font-semibold mb-4 text-white/90">
              {(
                {
                  fr: "Informations",
                  en: "Information",
                  de: "Informationen",
                  es: "Información",
                  it: "Informazioni",
                  pt: "Informações",
                  nl: "Informatie",
                  el: "Πληροφορίες",
                } as Record<string, string>
              )[lang] ?? "Information"}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-white/60 hover:text-white text-sm transition-colors"
                  data-ocid="footer.about.link"
                >
                  {t.footer.about}
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-white/60 hover:text-white text-sm transition-colors"
                  data-ocid="footer.faq.link"
                >
                  {t.footer.faq}
                </Link>
              </li>
            </ul>
          </div>

          {/* Légal & Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-white/90">
              {legal.legalTitle}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/terms"
                  className="text-white/60 hover:text-white text-sm transition-colors"
                  data-ocid="footer.cgu.link"
                >
                  {legal.cgu}
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-white/60 hover:text-white text-sm transition-colors"
                  data-ocid="footer.privacy.link"
                >
                  {legal.privacy}
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies"
                  className="text-white/60 hover:text-white text-sm transition-colors"
                  data-ocid="footer.cookies.link"
                >
                  {legal.cookies}
                </Link>
              </li>
              <li>
                <a
                  href="mailto:hello@taskvoila.com"
                  className="text-white/60 hover:text-white text-sm transition-colors inline-flex items-center gap-1.5"
                  data-ocid="footer.contact.link"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {legal.contact}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-white/50 text-sm">
            © {year} TaskVoilà. {t.footer.copyright}
          </p>
          <p className="text-white/50 text-sm flex items-center gap-1">
            {t.footer.builtWith}{" "}
            <Heart className="h-3 w-3 text-red-400 fill-red-400" />{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/80 transition-colors underline underline-offset-2"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

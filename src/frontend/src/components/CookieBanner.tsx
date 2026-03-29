import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { Link } from "@tanstack/react-router";
import { ChevronUp, Cookie, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Lang = "fr" | "en" | "de" | "es" | "it" | "pt" | "nl" | "el";

const TEXTS: Record<
  Lang,
  {
    title: string;
    message: string;
    acceptAll: string;
    rejectAll: string;
    manage: string;
    save: string;
    essential: string;
    essentialDesc: string;
    analytics: string;
    analyticsDesc: string;
    marketing: string;
    marketingDesc: string;
    personalisation: string;
    personalisationDesc: string;
    alwaysOn: string;
    privacyLink: string;
  }
> = {
  fr: {
    title: "Nous respectons votre vie privée",
    message:
      "TaskVoilà utilise des cookies pour assurer le bon fonctionnement du service, analyser l'utilisation et personnaliser votre expérience.",
    acceptAll: "Tout accepter",
    rejectAll: "Tout refuser",
    manage: "Gérer les préférences",
    save: "Enregistrer mes préférences",
    essential: "Cookies essentiels",
    essentialDesc: "Nécessaires au fonctionnement du service. Toujours actifs.",
    analytics: "Cookies analytiques",
    analyticsDesc: "Nous aident à comprendre comment vous utilisez TaskVoilà.",
    marketing: "Cookies marketing",
    marketingDesc: "Utilisés pour vous proposer des publicités pertinentes.",
    personalisation: "Cookies de personnalisation",
    personalisationDesc:
      "Mémorisent vos préférences pour une expérience sur mesure.",
    alwaysOn: "Toujours actif",
    privacyLink: "Politique de confidentialité",
  },
  en: {
    title: "We respect your privacy",
    message:
      "TaskVoilà uses cookies to ensure the service works properly, analyse usage, and personalise your experience.",
    acceptAll: "Accept all",
    rejectAll: "Reject all",
    manage: "Manage preferences",
    save: "Save preferences",
    essential: "Essential cookies",
    essentialDesc: "Required for the service to work. Always active.",
    analytics: "Analytics cookies",
    analyticsDesc: "Help us understand how you use TaskVoilà.",
    marketing: "Marketing cookies",
    marketingDesc: "Used to show you relevant adverts.",
    personalisation: "Personalisation cookies",
    personalisationDesc: "Remember your preferences for a tailored experience.",
    alwaysOn: "Always on",
    privacyLink: "Privacy Policy",
  },
  de: {
    title: "Wir respektieren Ihre Privatsphäre",
    message:
      "TaskVoilà verwendet Cookies für den ordnungsgemäßen Betrieb, die Nutzungsanalyse und die Personalisierung.",
    acceptAll: "Alle akzeptieren",
    rejectAll: "Alle ablehnen",
    manage: "Einstellungen verwalten",
    save: "Einstellungen speichern",
    essential: "Essentielle Cookies",
    essentialDesc: "Für den Betrieb des Dienstes erforderlich. Immer aktiv.",
    analytics: "Analyse-Cookies",
    analyticsDesc: "Helfen uns zu verstehen, wie Sie TaskVoilà nutzen.",
    marketing: "Marketing-Cookies",
    marketingDesc: "Werden verwendet, um Ihnen relevante Werbung anzuzeigen.",
    personalisation: "Personalisierungs-Cookies",
    personalisationDesc:
      "Speichern Ihre Einstellungen für ein maßgeschneidertes Erlebnis.",
    alwaysOn: "Immer aktiv",
    privacyLink: "Datenschutzrichtlinie",
  },
  es: {
    title: "Respetamos tu privacidad",
    message:
      "TaskVoilà usa cookies para el correcto funcionamiento, análisis y personalización.",
    acceptAll: "Aceptar todo",
    rejectAll: "Rechazar todo",
    manage: "Gestionar preferencias",
    save: "Guardar preferencias",
    essential: "Cookies esenciales",
    essentialDesc: "Necesarias para el servicio. Siempre activas.",
    analytics: "Cookies analíticas",
    analyticsDesc: "Nos ayudan a entender cómo usas TaskVoilà.",
    marketing: "Cookies de marketing",
    marketingDesc: "Se usan para mostrarte anuncios relevantes.",
    personalisation: "Cookies de personalización",
    personalisationDesc: "Recuerdan tus preferencias.",
    alwaysOn: "Siempre activo",
    privacyLink: "Política de privacidad",
  },
  it: {
    title: "Rispettiamo la tua privacy",
    message:
      "TaskVoilà usa i cookie per il corretto funzionamento, l'analisi e la personalizzazione.",
    acceptAll: "Accetta tutto",
    rejectAll: "Rifiuta tutto",
    manage: "Gestisci preferenze",
    save: "Salva preferenze",
    essential: "Cookie essenziali",
    essentialDesc: "Necessari per il funzionamento. Sempre attivi.",
    analytics: "Cookie analitici",
    analyticsDesc: "Ci aiutano a capire come usi TaskVoilà.",
    marketing: "Cookie di marketing",
    marketingDesc: "Usati per mostrarti pubblicità pertinenti.",
    personalisation: "Cookie di personalizzazione",
    personalisationDesc: "Ricordano le tue preferenze.",
    alwaysOn: "Sempre attivo",
    privacyLink: "Informativa sulla privacy",
  },
  pt: {
    title: "Respeitamos a sua privacidade",
    message:
      "TaskVoilà usa cookies para o correto funcionamento, análise e personalização.",
    acceptAll: "Aceitar tudo",
    rejectAll: "Rejeitar tudo",
    manage: "Gerir preferências",
    save: "Guardar preferências",
    essential: "Cookies essenciais",
    essentialDesc: "Necessários para o serviço. Sempre ativos.",
    analytics: "Cookies analíticos",
    analyticsDesc: "Ajudam-nos a perceber como usa o TaskVoilà.",
    marketing: "Cookies de marketing",
    marketingDesc: "Usados para mostrar anúncios relevantes.",
    personalisation: "Cookies de personalização",
    personalisationDesc: "Memorizam as suas preferências.",
    alwaysOn: "Sempre ativo",
    privacyLink: "Política de privacidade",
  },
  nl: {
    title: "We respecteren uw privacy",
    message:
      "TaskVoilà gebruikt cookies voor goede werking, analyse en personalisatie.",
    acceptAll: "Alles accepteren",
    rejectAll: "Alles weigeren",
    manage: "Voorkeuren beheren",
    save: "Voorkeuren opslaan",
    essential: "Essentiële cookies",
    essentialDesc: "Noodzakelijk voor de dienst. Altijd actief.",
    analytics: "Analytische cookies",
    analyticsDesc: "Helpen ons begrijpen hoe u TaskVoilà gebruikt.",
    marketing: "Marketingcookies",
    marketingDesc: "Worden gebruikt voor relevante advertenties.",
    personalisation: "Personalisatiecookies",
    personalisationDesc: "Onthouden uw voorkeuren.",
    alwaysOn: "Altijd aan",
    privacyLink: "Privacybeleid",
  },
  el: {
    title: "Σεβόμαστε την ιδιωτικότητά σας",
    message:
      "Το TaskVoilà χρησιμοποιεί cookies για τη σωστή λειτουργία, ανάλυση και εξατομίκευση.",
    acceptAll: "Αποδοχή όλων",
    rejectAll: "Απόρριψη όλων",
    manage: "Διαχείριση προτιμήσεων",
    save: "Αποθήκευση προτιμήσεων",
    essential: "Απαραίτητα cookies",
    essentialDesc: "Απαιτούνται για τη λειτουργία. Πάντα ενεργά.",
    analytics: "Αναλυτικά cookies",
    analyticsDesc: "Μας βοηθούν να κατανοούμε πώς χρησιμοποιείτε το TaskVoilà.",
    marketing: "Cookies μάρκετινγκ",
    marketingDesc: "Χρησιμοποιούνται για σχετικές διαφημίσεις.",
    personalisation: "Cookies εξατομίκευσης",
    personalisationDesc: "Θυμούνται τις προτιμήσεις σας.",
    alwaysOn: "Πάντα ενεργό",
    privacyLink: "Πολιτική απορρήτου",
  },
};

const COUNTRY_TO_LANG: Record<string, Lang> = {
  FR: "fr",
  BE: "fr",
  LU: "fr",
  GB: "en",
  IE: "en",
  DE: "de",
  CH: "de",
  ES: "es",
  IT: "it",
  PT: "pt",
  NL: "nl",
  GR: "el",
};

function getLang(): Lang {
  try {
    const country = localStorage.getItem("taskvoila_country_v6") ?? "";
    return COUNTRY_TO_LANG[country.toUpperCase()] ?? "en";
  } catch {
    return "en";
  }
}

export function CookieBanner() {
  const { hasDecided, acceptAll, rejectAll, savePreferences, consent } =
    useCookieConsent();
  const [showPanel, setShowPanel] = useState(false);
  const [analytics, setAnalytics] = useState(consent.analytics);
  const [marketing, setMarketing] = useState(consent.marketing);
  const [personalisation, setPersonalisation] = useState(
    consent.personalisation,
  );

  const lang = getLang();
  const t = TEXTS[lang];

  const handleSave = () => {
    savePreferences({ analytics, marketing, personalisation });
  };

  return (
    <AnimatePresence>
      {!hasDecided && (
        <>
          {/* Preferences Panel Overlay */}
          <AnimatePresence>
            {showPanel && (
              <motion.div
                key="cookie-panel-overlay"
                className="fixed inset-0 bg-black/40 z-[200]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPanel(false)}
              />
            )}
          </AnimatePresence>

          {/* Preferences Panel */}
          <AnimatePresence>
            {showPanel && (
              <motion.div
                key="cookie-panel"
                data-ocid="cookie.panel"
                className="fixed bottom-0 left-0 right-0 z-[210] bg-white rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
              >
                <div className="sticky top-0 bg-white border-b border-amber-100 px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cookie className="w-5 h-5 text-amber-500" />
                    <span className="font-semibold text-gray-900">
                      {t.manage}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowPanel(false)}
                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    type="button"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  {/* Essential */}
                  <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-100">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {t.essential}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {t.essentialDesc}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full shrink-0 mt-0.5">
                      {t.alwaysOn}
                    </span>
                  </div>

                  {/* Analytics */}
                  <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-100">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {t.analytics}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {t.analyticsDesc}
                      </p>
                    </div>
                    <Switch
                      data-ocid="cookie.analytics.toggle"
                      checked={analytics}
                      onCheckedChange={setAnalytics}
                      className="shrink-0 mt-0.5"
                    />
                  </div>

                  {/* Marketing */}
                  <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-100">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {t.marketing}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {t.marketingDesc}
                      </p>
                    </div>
                    <Switch
                      data-ocid="cookie.marketing.toggle"
                      checked={marketing}
                      onCheckedChange={setMarketing}
                      className="shrink-0 mt-0.5"
                    />
                  </div>

                  {/* Personalisation */}
                  <div className="flex items-start justify-between gap-4 py-3">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {t.personalisation}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {t.personalisationDesc}
                      </p>
                    </div>
                    <Switch
                      data-ocid="cookie.personalisation.toggle"
                      checked={personalisation}
                      onCheckedChange={setPersonalisation}
                      className="shrink-0 mt-0.5"
                    />
                  </div>
                </div>

                <div className="sticky bottom-0 bg-white border-t border-amber-100 p-4 space-y-2">
                  <Button
                    data-ocid="cookie.save_button"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                    onClick={handleSave}
                  >
                    {t.save}
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      data-ocid="cookie.panel.accept_button"
                      variant="outline"
                      className="flex-1 text-sm border-amber-300 text-amber-700 hover:bg-amber-50"
                      onClick={acceptAll}
                    >
                      {t.acceptAll}
                    </Button>
                    <Button
                      data-ocid="cookie.panel.reject_button"
                      variant="outline"
                      className="flex-1 text-sm"
                      onClick={rejectAll}
                    >
                      {t.rejectAll}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Banner */}
          {!showPanel && (
            <motion.div
              key="cookie-banner"
              data-ocid="cookie.dialog"
              className="fixed bottom-0 left-0 right-0 z-[190] bg-white border-t-2 border-amber-400 shadow-2xl"
              style={{
                paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 5rem)",
              }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 300,
                delay: 0.5,
              }}
            >
              <div className="max-w-4xl mx-auto px-4 py-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-amber-50 rounded-xl shrink-0">
                    <Cookie className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">
                      {t.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      {t.message}{" "}
                      <Link
                        to="/privacy"
                        className="text-amber-600 underline underline-offset-2 hover:text-amber-700"
                      >
                        {t.privacyLink}
                      </Link>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    data-ocid="cookie.accept_button"
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs px-4"
                    onClick={acceptAll}
                  >
                    {t.acceptAll}
                  </Button>
                  <Button
                    data-ocid="cookie.reject_button"
                    size="sm"
                    variant="outline"
                    className="border-gray-300 text-gray-700 text-xs px-4 hover:bg-gray-50"
                    onClick={rejectAll}
                  >
                    {t.rejectAll}
                  </Button>
                  <button
                    data-ocid="cookie.open_modal_button"
                    type="button"
                    className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 underline underline-offset-2 font-medium ml-auto"
                    onClick={() => setShowPanel(true)}
                  >
                    <ChevronUp className="w-3 h-3" />
                    {t.manage}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

import { useCountryStore } from "@/lib/country-store";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BarChart3,
  Cookie,
  Settings,
  Shield,
  Target,
} from "lucide-react";
import { motion } from "motion/react";

const LANG_MAP: Record<string, string> = {
  FR: "fr",
  BE: "fr",
  GB: "en",
  IE: "en",
  DE: "de",
  CH: "de",
  ES: "es",
  IT: "it",
  PT: "pt",
  NL: "nl",
  GR: "el",
  LU: "fr",
};

const TEXTS: Record<
  string,
  {
    title: string;
    intro: string;
    back: string;
    whatAreCookies: string;
    whatAreCookiesDesc: string;
    essential: string;
    essentialDesc: string;
    essentialExamples: string[];
    analytics: string;
    analyticsDesc: string;
    analyticsExamples: string[];
    marketing: string;
    marketingDesc: string;
    marketingExamples: string[];
    personalisation: string;
    personalisationDesc: string;
    personalisationExamples: string[];
    manageTitle: string;
    manageDesc: string;
    manage1: string;
    manage2: string;
    manage3: string;
    contactTitle: string;
    contactDesc: string;
    lastUpdated: string;
    alwaysOn: string;
    examplesLabel: string;
  }
> = {
  fr: {
    title: "Politique de cookies",
    intro:
      "Cette politique explique comment TaskVoilà utilise les cookies sur sa plateforme, pourquoi nous les utilisons et comment vous pouvez gérer vos préférences.",
    back: "Retour",
    whatAreCookies: "Qu'est-ce qu'un cookie ?",
    whatAreCookiesDesc:
      "Un cookie est un petit fichier texte stocké dans votre navigateur lorsque vous visitez un site web. Il permet au site de mémoriser vos actions et préférences pendant une durée déterminée, afin que vous n'ayez pas à les saisir à chaque visite.",
    essential: "Cookies essentiels",
    essentialDesc:
      "Ces cookies sont indispensables au fonctionnement de la plateforme. Ils gèrent votre session de connexion, vos préférences de langue et de pays, et la sécurité de votre compte. Ils ne peuvent pas être désactivés.",
    essentialExamples: [
      "Gestion de la session utilisateur",
      "Préférences de langue et pays",
      "Sécurité (protection CSRF)",
      "Consentement cookies",
    ],
    analytics: "Cookies analytiques",
    analyticsDesc:
      "Ces cookies nous aident à comprendre comment les visiteurs utilisent la plateforme, quelles pages sont les plus visitées et comment améliorer l'expérience utilisateur. Les données sont collectées de façon anonyme et agrégée.",
    analyticsExamples: [
      "Pages vues et durée de visite",
      "Parcours de navigation",
      "Détection des erreurs et crashs",
    ],
    marketing: "Cookies marketing",
    marketingDesc:
      "Ces cookies sont utilisés pour vous proposer des publicités et contenus pertinents en dehors de la plateforme. Ils permettent de mesurer l'efficacité de nos campagnes publicitaires.",
    marketingExamples: [
      "Publicités personnalisées",
      "Suivi des conversions",
      "Partage sur réseaux sociaux",
    ],
    personalisation: "Cookies de personnalisation",
    personalisationDesc:
      "Ces cookies mémorisent vos préférences pour personnaliser votre expérience sur TaskVoilà : vos recherches récentes, vos filtres préférés et vos paramètres d'affichage.",
    personalisationExamples: [
      "Recherches et filtres récents",
      "Préférences d'affichage",
      "Contenu recommandé",
    ],
    manageTitle: "Gérer vos préférences",
    manageDesc:
      "Vous pouvez à tout moment modifier vos préférences de cookies de trois façons :",
    manage1: "Via la bannière cookies affichée lors de votre première visite",
    manage2:
      "Via les paramètres de votre navigateur (bloquer ou supprimer les cookies)",
    manage3: "En nous contactant à hello@taskvoila.com",
    contactTitle: "Contact",
    contactDesc:
      "Pour toute question relative à notre utilisation des cookies, contactez-nous à",
    lastUpdated: "Dernière mise à jour : Mars 2026",
    alwaysOn: "Toujours actif",
    examplesLabel: "Exemples :",
  },
  en: {
    title: "Cookie Policy",
    intro:
      "This policy explains how TaskVoilà uses cookies on its platform, why we use them and how you can manage your preferences.",
    back: "Back",
    whatAreCookies: "What is a cookie?",
    whatAreCookiesDesc:
      "A cookie is a small text file stored in your browser when you visit a website. It allows the site to remember your actions and preferences for a set period of time, so you don't have to enter them again every time you visit.",
    essential: "Essential cookies",
    essentialDesc:
      "These cookies are necessary for the platform to work. They manage your login session, language and country preferences, and account security. They cannot be disabled.",
    essentialExamples: [
      "User session management",
      "Language and country preferences",
      "Security (CSRF protection)",
      "Cookie consent",
    ],
    analytics: "Analytics cookies",
    analyticsDesc:
      "These cookies help us understand how visitors use the platform, which pages are most visited and how to improve the user experience. Data is collected anonymously and aggregated.",
    analyticsExamples: [
      "Page views and visit duration",
      "Navigation paths",
      "Error and crash detection",
    ],
    marketing: "Marketing cookies",
    marketingDesc:
      "These cookies are used to show you relevant adverts and content outside the platform. They help us measure the effectiveness of our advertising campaigns.",
    marketingExamples: [
      "Personalised adverts",
      "Conversion tracking",
      "Social media sharing",
    ],
    personalisation: "Personalisation cookies",
    personalisationDesc:
      "These cookies remember your preferences to personalise your TaskVoilà experience: your recent searches, favourite filters and display settings.",
    personalisationExamples: [
      "Recent searches and filters",
      "Display preferences",
      "Recommended content",
    ],
    manageTitle: "Manage your preferences",
    manageDesc:
      "You can change your cookie preferences at any time in three ways:",
    manage1: "Via the cookie banner displayed on your first visit",
    manage2: "Via your browser settings (block or delete cookies)",
    manage3: "By contacting us at hello@taskvoila.com",
    contactTitle: "Contact",
    contactDesc: "For any questions about our use of cookies, contact us at",
    lastUpdated: "Last updated: March 2026",
    alwaysOn: "Always on",
    examplesLabel: "Examples:",
  },
  de: {
    title: "Cookie-Richtlinie",
    intro:
      "Diese Richtlinie erklärt, wie TaskVoilà Cookies auf seiner Plattform verwendet, warum wir sie verwenden und wie Sie Ihre Präferenzen verwalten können.",
    back: "Zurück",
    whatAreCookies: "Was ist ein Cookie?",
    whatAreCookiesDesc:
      "Ein Cookie ist eine kleine Textdatei, die in Ihrem Browser gespeichert wird, wenn Sie eine Website besuchen. Sie ermöglicht es der Website, Ihre Aktionen und Präferenzen für einen bestimmten Zeitraum zu speichern, damit Sie diese nicht bei jedem Besuch erneut eingeben müssen.",
    essential: "Notwendige Cookies",
    essentialDesc:
      "Diese Cookies sind für den Betrieb der Plattform unerlässlich. Sie verwalten Ihre Anmeldesitzung, Sprach- und Länderpräferenzen sowie die Sicherheit Ihres Kontos. Sie können nicht deaktiviert werden.",
    essentialExamples: [
      "Verwaltung der Benutzersitzung",
      "Sprach- und Länderpräferenzen",
      "Sicherheit (CSRF-Schutz)",
      "Cookie-Einwilligung",
    ],
    analytics: "Analyse-Cookies",
    analyticsDesc:
      "Diese Cookies helfen uns zu verstehen, wie Besucher die Plattform nutzen, welche Seiten am häufigsten besucht werden und wie die Benutzererfahrung verbessert werden kann. Daten werden anonym und aggregiert erfasst.",
    analyticsExamples: [
      "Seitenaufrufe und Besuchsdauer",
      "Navigationspfade",
      "Fehler- und Absturzerkennung",
    ],
    marketing: "Marketing-Cookies",
    marketingDesc:
      "Diese Cookies werden verwendet, um Ihnen relevante Werbung und Inhalte außerhalb der Plattform anzuzeigen. Sie helfen uns, die Wirksamkeit unserer Werbekampagnen zu messen.",
    marketingExamples: [
      "Personalisierte Werbung",
      "Conversion-Tracking",
      "Social-Media-Teilen",
    ],
    personalisation: "Personalisierungs-Cookies",
    personalisationDesc:
      "Diese Cookies speichern Ihre Präferenzen, um Ihre TaskVoilà-Erfahrung zu personalisieren: Ihre letzten Suchanfragen, bevorzugten Filter und Anzeigeeinstellungen.",
    personalisationExamples: [
      "Letzte Suchanfragen und Filter",
      "Anzeigeeinstellungen",
      "Empfohlene Inhalte",
    ],
    manageTitle: "Ihre Präferenzen verwalten",
    manageDesc:
      "Sie können Ihre Cookie-Präferenzen jederzeit auf drei Arten ändern:",
    manage1: "Über das Cookie-Banner bei Ihrem ersten Besuch",
    manage2: "Über Ihre Browsereinstellungen (Cookies blockieren oder löschen)",
    manage3: "Indem Sie uns unter hello@taskvoila.com kontaktieren",
    contactTitle: "Kontakt",
    contactDesc:
      "Für Fragen zu unserer Cookie-Nutzung kontaktieren Sie uns unter",
    lastUpdated: "Letzte Aktualisierung: März 2026",
    alwaysOn: "Immer aktiv",
    examplesLabel: "Beispiele:",
  },
  es: {
    title: "Política de cookies",
    intro:
      "Esta política explica cómo TaskVoilà utiliza las cookies en su plataforma, por qué las usamos y cómo puede gestionar sus preferencias.",
    back: "Volver",
    whatAreCookies: "¿Qué es una cookie?",
    whatAreCookiesDesc:
      "Una cookie es un pequeño archivo de texto almacenado en su navegador cuando visita un sitio web. Permite al sitio recordar sus acciones y preferencias durante un período determinado para que no tenga que introducirlas de nuevo en cada visita.",
    essential: "Cookies esenciales",
    essentialDesc:
      "Estas cookies son necesarias para el funcionamiento de la plataforma. Gestionan su sesión de inicio de sesión, preferencias de idioma y país, y la seguridad de su cuenta. No pueden desactivarse.",
    essentialExamples: [
      "Gestión de la sesión del usuario",
      "Preferencias de idioma y país",
      "Seguridad (protección CSRF)",
      "Consentimiento de cookies",
    ],
    analytics: "Cookies analíticas",
    analyticsDesc:
      "Estas cookies nos ayudan a entender cómo los visitantes usan la plataforma, qué páginas son más visitadas y cómo mejorar la experiencia del usuario. Los datos se recopilan de forma anónima y agregada.",
    analyticsExamples: [
      "Páginas vistas y duración de la visita",
      "Rutas de navegación",
      "Detección de errores y fallos",
    ],
    marketing: "Cookies de marketing",
    marketingDesc:
      "Estas cookies se usan para mostrarle anuncios y contenidos relevantes fuera de la plataforma. Nos ayudan a medir la eficacia de nuestras campañas publicitarias.",
    marketingExamples: [
      "Anuncios personalizados",
      "Seguimiento de conversiones",
      "Compartir en redes sociales",
    ],
    personalisation: "Cookies de personalización",
    personalisationDesc:
      "Estas cookies recuerdan sus preferencias para personalizar su experiencia en TaskVoilà: sus búsquedas recientes, filtros favoritos y configuración de pantalla.",
    personalisationExamples: [
      "Búsquedas y filtros recientes",
      "Preferencias de visualización",
      "Contenido recomendado",
    ],
    manageTitle: "Gestionar sus preferencias",
    manageDesc:
      "Puede cambiar sus preferencias de cookies en cualquier momento de tres formas:",
    manage1: "A través del banner de cookies que aparece en su primera visita",
    manage2:
      "A través de la configuración de su navegador (bloquear o eliminar cookies)",
    manage3: "Contactándonos en hello@taskvoila.com",
    contactTitle: "Contacto",
    contactDesc:
      "Para cualquier pregunta sobre nuestro uso de cookies, contáctenos en",
    lastUpdated: "Última actualización: Marzo 2026",
    alwaysOn: "Siempre activo",
    examplesLabel: "Ejemplos:",
  },
  it: {
    title: "Politica sui cookie",
    intro:
      "Questa politica spiega come TaskVoilà utilizza i cookie sulla sua piattaforma, perché li utilizziamo e come è possibile gestire le proprie preferenze.",
    back: "Indietro",
    whatAreCookies: "Cos'è un cookie?",
    whatAreCookiesDesc:
      "Un cookie è un piccolo file di testo memorizzato nel browser quando si visita un sito web. Consente al sito di ricordare le azioni e le preferenze per un periodo determinato, in modo da non doverle reinserire ad ogni visita.",
    essential: "Cookie essenziali",
    essentialDesc:
      "Questi cookie sono indispensabili per il funzionamento della piattaforma. Gestiscono la sessione di accesso, le preferenze di lingua e paese e la sicurezza dell'account. Non possono essere disattivati.",
    essentialExamples: [
      "Gestione della sessione utente",
      "Preferenze di lingua e paese",
      "Sicurezza (protezione CSRF)",
      "Consenso ai cookie",
    ],
    analytics: "Cookie analitici",
    analyticsDesc:
      "Questi cookie ci aiutano a capire come i visitatori utilizzano la piattaforma, quali pagine sono più visitate e come migliorare l'esperienza utente. I dati vengono raccolti in modo anonimo e aggregato.",
    analyticsExamples: [
      "Pagine visitate e durata della visita",
      "Percorsi di navigazione",
      "Rilevamento di errori e crash",
    ],
    marketing: "Cookie di marketing",
    marketingDesc:
      "Questi cookie vengono utilizzati per mostrare annunci e contenuti pertinenti al di fuori della piattaforma. Ci aiutano a misurare l'efficacia delle nostre campagne pubblicitarie.",
    marketingExamples: [
      "Annunci personalizzati",
      "Tracciamento delle conversioni",
      "Condivisione sui social media",
    ],
    personalisation: "Cookie di personalizzazione",
    personalisationDesc:
      "Questi cookie memorizzano le preferenze per personalizzare l'esperienza su TaskVoilà: le ricerche recenti, i filtri preferiti e le impostazioni di visualizzazione.",
    personalisationExamples: [
      "Ricerche e filtri recenti",
      "Preferenze di visualizzazione",
      "Contenuti consigliati",
    ],
    manageTitle: "Gestire le preferenze",
    manageDesc:
      "È possibile modificare le preferenze sui cookie in qualsiasi momento in tre modi:",
    manage1: "Tramite il banner cookie visualizzato alla prima visita",
    manage2:
      "Tramite le impostazioni del browser (bloccare o eliminare i cookie)",
    manage3: "Contattandoci all'indirizzo hello@taskvoila.com",
    contactTitle: "Contatto",
    contactDesc: "Per domande sull'uso dei cookie, contattarci a",
    lastUpdated: "Ultimo aggiornamento: Marzo 2026",
    alwaysOn: "Sempre attivo",
    examplesLabel: "Esempi:",
  },
  pt: {
    title: "Política de cookies",
    intro:
      "Esta política explica como a TaskVoilà usa cookies na sua plataforma, por que os usamos e como pode gerir as suas preferências.",
    back: "Voltar",
    whatAreCookies: "O que é um cookie?",
    whatAreCookiesDesc:
      "Um cookie é um pequeno ficheiro de texto armazenado no seu navegador quando visita um website. Permite ao site lembrar as suas ações e preferências durante um período definido, para que não precise de as introduzir novamente em cada visita.",
    essential: "Cookies essenciais",
    essentialDesc:
      "Estes cookies são indispensáveis para o funcionamento da plataforma. Gerem a sua sessão de início de sessão, preferências de idioma e país, e a segurança da sua conta. Não podem ser desativados.",
    essentialExamples: [
      "Gestão da sessão do utilizador",
      "Preferências de idioma e país",
      "Segurança (proteção CSRF)",
      "Consentimento de cookies",
    ],
    analytics: "Cookies analíticos",
    analyticsDesc:
      "Estes cookies ajudam-nos a perceber como os visitantes utilizam a plataforma, quais as páginas mais visitadas e como melhorar a experiência do utilizador. Os dados são recolhidos de forma anónima e agregada.",
    analyticsExamples: [
      "Páginas vistas e duração da visita",
      "Percursos de navegação",
      "Deteção de erros e falhas",
    ],
    marketing: "Cookies de marketing",
    marketingDesc:
      "Estes cookies são utilizados para mostrar anúncios e conteúdos relevantes fora da plataforma. Ajudam-nos a medir a eficácia das nossas campanhas publicitárias.",
    marketingExamples: [
      "Anúncios personalizados",
      "Rastreamento de conversões",
      "Partilha em redes sociais",
    ],
    personalisation: "Cookies de personalização",
    personalisationDesc:
      "Estes cookies memorizam as suas preferências para personalizar a sua experiência na TaskVoilà: as suas pesquisas recentes, filtros favoritos e configurações de exibição.",
    personalisationExamples: [
      "Pesquisas e filtros recentes",
      "Preferências de visualização",
      "Conteúdo recomendado",
    ],
    manageTitle: "Gerir as suas preferências",
    manageDesc:
      "Pode alterar as suas preferências de cookies a qualquer momento de três formas:",
    manage1: "Através do banner de cookies exibido na sua primeira visita",
    manage2:
      "Através das definições do seu navegador (bloquear ou eliminar cookies)",
    manage3: "Contactando-nos em hello@taskvoila.com",
    contactTitle: "Contacto",
    contactDesc:
      "Para qualquer questão sobre a nossa utilização de cookies, contacte-nos em",
    lastUpdated: "Última atualização: Março de 2026",
    alwaysOn: "Sempre ativo",
    examplesLabel: "Exemplos:",
  },
  nl: {
    title: "Cookiebeleid",
    intro:
      "Dit beleid legt uit hoe TaskVoilà cookies gebruikt op zijn platform, waarom we ze gebruiken en hoe u uw voorkeuren kunt beheren.",
    back: "Terug",
    whatAreCookies: "Wat is een cookie?",
    whatAreCookiesDesc:
      "Een cookie is een klein tekstbestand dat in uw browser wordt opgeslagen wanneer u een website bezoekt. Het stelt de website in staat uw acties en voorkeuren gedurende een bepaalde periode te onthouden, zodat u ze niet elke keer opnieuw hoeft in te voeren.",
    essential: "Essentiële cookies",
    essentialDesc:
      "Deze cookies zijn noodzakelijk voor het functioneren van het platform. Ze beheren uw inlogsessie, taal- en landvoorkeuren en de beveiliging van uw account. Ze kunnen niet worden uitgeschakeld.",
    essentialExamples: [
      "Beheer van gebruikerssessie",
      "Taal- en landvoorkeuren",
      "Beveiliging (CSRF-bescherming)",
      "Cookie-toestemming",
    ],
    analytics: "Analytische cookies",
    analyticsDesc:
      "Deze cookies helpen ons te begrijpen hoe bezoekers het platform gebruiken, welke pagina's het meest worden bezocht en hoe de gebruikerservaring kan worden verbeterd. Gegevens worden anoniem en geaggregeerd verzameld.",
    analyticsExamples: [
      "Paginaweergaven en bezoekduur",
      "Navigatiepaden",
      "Detectie van fouten en crashes",
    ],
    marketing: "Marketingcookies",
    marketingDesc:
      "Deze cookies worden gebruikt om u relevante advertenties en inhoud buiten het platform te tonen. Ze helpen ons de effectiviteit van onze reclamecampagnes te meten.",
    marketingExamples: [
      "Gepersonaliseerde advertenties",
      "Conversietracking",
      "Delen op sociale media",
    ],
    personalisation: "Personalisatiecookies",
    personalisationDesc:
      "Deze cookies onthouden uw voorkeuren om uw TaskVoilà-ervaring te personaliseren: uw recente zoekopdrachten, favoriete filters en weergave-instellingen.",
    personalisationExamples: [
      "Recente zoekopdrachten en filters",
      "Weergavevoorkeuren",
      "Aanbevolen inhoud",
    ],
    manageTitle: "Uw voorkeuren beheren",
    manageDesc:
      "U kunt uw cookievoorkeuren op elk moment op drie manieren wijzigen:",
    manage1: "Via de cookiebanner die wordt weergegeven bij uw eerste bezoek",
    manage2: "Via uw browserinstellingen (cookies blokkeren of verwijderen)",
    manage3: "Door contact met ons op te nemen via hello@taskvoila.com",
    contactTitle: "Contact",
    contactDesc:
      "Voor vragen over ons gebruik van cookies kunt u contact met ons opnemen via",
    lastUpdated: "Laatste update: Maart 2026",
    alwaysOn: "Altijd actief",
    examplesLabel: "Voorbeelden:",
  },
  el: {
    title: "Πολιτική Cookies",
    intro:
      "Αυτή η πολιτική εξηγεί πώς η TaskVoilà χρησιμοποιεί cookies στην πλατφόρμα της, γιατί τα χρησιμοποιούμε και πώς μπορείτε να διαχειριστείτε τις προτιμήσεις σας.",
    back: "Πίσω",
    whatAreCookies: "Τι είναι ένα cookie;",
    whatAreCookiesDesc:
      "Ένα cookie είναι ένα μικρό αρχείο κειμένου που αποθηκεύεται στο πρόγραμμα περιήγησής σας όταν επισκέπτεστε έναν ιστότοπο. Επιτρέπει στον ιστότοπο να θυμάται τις ενέργειες και τις προτιμήσεις σας για ορισμένο χρονικό διάστημα.",
    essential: "Απαραίτητα cookies",
    essentialDesc:
      "Αυτά τα cookies είναι απαραίτητα για τη λειτουργία της πλατφόρμας. Διαχειρίζονται τη σύνδεσή σας, τις προτιμήσεις γλώσσας και χώρας και την ασφάλεια του λογαριασμού σας. Δεν μπορούν να απενεργοποιηθούν.",
    essentialExamples: [
      "Διαχείριση σύνδεσης χρήστη",
      "Προτιμήσεις γλώσσας και χώρας",
      "Ασφάλεια (προστασία CSRF)",
      "Συγκατάθεση cookies",
    ],
    analytics: "Αναλυτικά cookies",
    analyticsDesc:
      "Αυτά τα cookies μας βοηθούν να κατανοήσουμε πώς χρησιμοποιούν την πλατφόρμα οι επισκέπτες. Τα δεδομένα συλλέγονται ανώνυμα και συγκεντρωτικά.",
    analyticsExamples: [
      "Προβολές σελίδων και διάρκεια επίσκεψης",
      "Διαδρομές πλοήγησης",
      "Ανίχνευση σφαλμάτων",
    ],
    marketing: "Cookies μάρκετινγκ",
    marketingDesc:
      "Αυτά τα cookies χρησιμοποιούνται για να σας εμφανίζουν σχετικές διαφημίσεις εκτός πλατφόρμας και να μετρούν την αποτελεσματικότητα των διαφημιστικών καμπανιών μας.",
    marketingExamples: [
      "Εξατομικευμένες διαφημίσεις",
      "Παρακολούθηση μετατροπών",
      "Κοινή χρήση σε μέσα κοινωνικής δικτύωσης",
    ],
    personalisation: "Cookies εξατομίκευσης",
    personalisationDesc:
      "Αυτά τα cookies αποθηκεύουν τις προτιμήσεις σας για να εξατομικεύσουν την εμπειρία σας στο TaskVoilà.",
    personalisationExamples: [
      "Πρόσφατες αναζητήσεις και φίλτρα",
      "Προτιμήσεις εμφάνισης",
      "Προτεινόμενο περιεχόμενο",
    ],
    manageTitle: "Διαχείριση προτιμήσεων",
    manageDesc:
      "Μπορείτε να αλλάξετε τις προτιμήσεις cookies ανά πάσα στιγμή με τρεις τρόπους:",
    manage1: "Μέσω του banner cookies κατά την πρώτη επίσκεψή σας",
    manage2: "Μέσω των ρυθμίσεων του προγράμματος περιήγησής σας",
    manage3: "Επικοινωνώντας μαζί μας στο hello@taskvoila.com",
    contactTitle: "Επικοινωνία",
    contactDesc:
      "Για ερωτήσεις σχετικά με τη χρήση cookies, επικοινωνήστε μαζί μας στο",
    lastUpdated: "Τελευταία ενημέρωση: Μάρτιος 2026",
    alwaysOn: "Πάντα ενεργό",
    examplesLabel: "Παραδείγματα:",
  },
};

type CookieCategory = {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
  title: string;
  desc: string;
  examples: string[];
  alwaysOn?: boolean;
};

export function CookiePolicyPage() {
  const { selectedCountry } = useCountryStore();
  const lang = LANG_MAP[selectedCountry ?? "FR"] ?? "fr";
  const t = TEXTS[lang] ?? TEXTS.en;

  const categories: CookieCategory[] = [
    {
      icon: Shield,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      title: t.essential,
      desc: t.essentialDesc,
      examples: t.essentialExamples,
      alwaysOn: true,
    },
    {
      icon: BarChart3,
      color: "text-blue-700",
      bg: "bg-blue-50",
      border: "border-blue-200",
      title: t.analytics,
      desc: t.analyticsDesc,
      examples: t.analyticsExamples,
    },
    {
      icon: Target,
      color: "text-rose-700",
      bg: "bg-rose-50",
      border: "border-rose-200",
      title: t.marketing,
      desc: t.marketingDesc,
      examples: t.marketingExamples,
    },
    {
      icon: Settings,
      color: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
      title: t.personalisation,
      desc: t.personalisationDesc,
      examples: t.personalisationExamples,
    },
  ];

  return (
    <main className="min-h-screen bg-background" data-ocid="cookies.page">
      {/* Hero header */}
      <section className="bg-foreground text-white py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors"
            data-ocid="cookies.back.link"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.back}
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <Cookie className="h-6 w-6 text-white" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold">
                {t.title}
              </h1>
            </div>
            <p className="text-white/70 text-lg leading-relaxed max-w-2xl">
              {t.intro}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 max-w-3xl py-12 space-y-6">
        {/* What are cookies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden"
        >
          <div className="flex items-center gap-3 px-6 py-5 border-b border-border bg-gray-50">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
              <Cookie className="h-5 w-5 text-gray-600" />
            </div>
            <h2 className="font-display font-bold text-lg text-foreground">
              {t.whatAreCookies}
            </h2>
          </div>
          <div className="px-6 py-5">
            <p className="text-muted-foreground leading-relaxed">
              {t.whatAreCookiesDesc}
            </p>
          </div>
        </motion.div>

        {/* Cookie categories */}
        {categories.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (i + 1) * 0.1 }}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${cat.border}`}
              data-ocid={`cookies.category.${i + 1}`}
            >
              <div
                className={`flex items-center gap-3 px-6 py-5 border-b ${cat.border} ${cat.bg}`}
              >
                <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shrink-0">
                  <Icon className={`h-5 w-5 ${cat.color}`} />
                </div>
                <h2 className="font-display font-bold text-lg text-foreground flex-1">
                  {cat.title}
                </h2>
                {cat.alwaysOn && (
                  <span className="text-xs font-semibold bg-emerald-600 text-white px-2.5 py-1 rounded-full">
                    {t.alwaysOn}
                  </span>
                )}
              </div>
              <div className="px-6 py-5">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {cat.desc}
                </p>
                <p className="text-sm font-medium text-foreground mb-2">
                  {t.examplesLabel}
                </p>
                <ul className="space-y-1.5">
                  {cat.examples.map((ex) => (
                    <li
                      key={ex}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span
                        className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${cat.bg.replace("bg-", "bg-").replace("-50", "-400")}`}
                      />
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })}

        {/* Manage preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden"
          data-ocid="cookies.manage.panel"
        >
          <div className="flex items-center gap-3 px-6 py-5 border-b border-border bg-amber-50">
            <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shrink-0">
              <Settings className="h-5 w-5 text-amber-700" />
            </div>
            <h2 className="font-display font-bold text-lg text-foreground">
              {t.manageTitle}
            </h2>
          </div>
          <div className="px-6 py-5">
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t.manageDesc}
            </p>
            <ol className="space-y-2">
              {[t.manage1, t.manage2, t.manage3].map((item, idx) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-foreground"
                >
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden"
          data-ocid="cookies.contact.panel"
        >
          <div className="px-6 py-5">
            <p className="text-muted-foreground">
              {t.contactDesc}{" "}
              <a
                href="mailto:hello@taskvoila.com"
                className="font-semibold text-primary hover:text-primary/80 transition-colors"
                data-ocid="cookies.contact.link"
              >
                hello@taskvoila.com
              </a>
            </p>
          </div>
        </motion.div>

        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground">{t.lastUpdated}</p>
        </div>
      </section>
    </main>
  );
}

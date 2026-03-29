import { WeeklyBookingCalendar } from "@/components/calendar/WeeklyBookingCalendar";
import { CountrySelector } from "@/components/onboarding/CountrySelector";
import { IncompleteProfileBanner } from "@/components/profile/IncompleteProfileBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/lib/auth-store";
import { useCalendarStore } from "@/lib/calendar-store";
import { useChatStore } from "@/lib/chat-store";
import { getCountryByCode } from "@/lib/countries-data";
import { useCountryStore } from "@/lib/country-store";
import { categoryEmojis } from "@/lib/demo-data";
import { useDocumentStore } from "@/lib/document-store";
import { useTranslation } from "@/lib/i18n";
import { COUNTRY_KYC_MAP, KYC_VALIDATION, useKYCStore } from "@/lib/kyc-store";
import { useMissionStore } from "@/lib/mission-store";
import { useNFTStore } from "@/lib/nft-store";
import { useOfferStore } from "@/lib/offer-store";
import { detectContactInfo, useProfileStore } from "@/lib/profile-store";
import { MAX_LENGTHS, sanitizeText } from "@/lib/sanitize";
import { useSubscriptionStore } from "@/lib/subscription-store";
import { validateUpload } from "@/lib/upload-validation";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  AlertTriangle,
  Award,
  BadgeCheck,
  Bot,
  Briefcase,
  Calendar,
  CalendarDays,
  Camera,
  CheckCircle,
  ChevronRight,
  Crown,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Image,
  List,
  Lock,
  MessageSquare,
  PenLine,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── KYC Tab Component ───────────────────────────────────────────────────────

function KYCTab() {
  const { t, lang } = useTranslation();
  const dl = DASH_PRO_L[lang] ?? DASH_PRO_L.en;
  const numLocale = NUM_LOCALE[lang] ?? "en-GB";
  const { currentUser } = useAuthStore();
  const { selectedCountry } = useCountryStore();
  const { myKYC, submitKYC } = useKYCStore();

  const countryCode = selectedCountry ?? "FR";
  const idType = COUNTRY_KYC_MAP[countryCode] ?? "SIRET";
  const idLabel =
    (t.kyc.countryCodes as Record<string, string>)[countryCode] ?? idType;

  const [idNumber, setIdNumber] = useState("");
  const [docName, setDocName] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleIdChange(val: string) {
    setIdNumber(val);
    const regex = KYC_VALIDATION[idType];
    if (val && !regex.test(val)) {
      setValidationError(`${dl.invalidFormat} ${idLabel}`);
    } else {
      setValidationError(null);
    }
  }

  function handleSubmit() {
    if (!idNumber.trim() || validationError) return;
    submitKYC({
      userId: currentUser ? String(currentUser.id) : String(Date.now()),
      idType,
      idNumber: idNumber.trim(),
      country: countryCode,
    });
    setSubmitted(true);
  }

  // Verified state
  if (myKYC?.status === "verified") {
    const masked =
      myKYC.idNumber.length > 4
        ? "•".repeat(myKYC.idNumber.length - 4) + myKYC.idNumber.slice(-4)
        : myKYC.idNumber;
    const verifiedIdLabel =
      (t.kyc.countryCodes as Record<string, string>)[myKYC.country] ??
      myKYC.idType;
    return (
      <div
        className="bg-white rounded-xl card-shadow border border-border/50 p-6 max-w-2xl"
        data-ocid="pro.kyc.verified.panel"
      >
        <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/10 border border-secondary/30 mb-4">
          <ShieldCheck className="h-7 w-7 text-secondary shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-display font-bold text-foreground text-base">
                {t.kyc.title}
              </h3>
              <Badge className="bg-secondary/20 text-secondary border-secondary/30 gap-1 text-xs">
                <ShieldCheck className="h-3 w-3" />
                {t.kyc.badge}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {t.kyc.proVerifiedInfo}
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-foreground/70">
              <span>
                <strong>{t.kyc.idType} :</strong> {verifiedIdLabel}
              </span>
              <span>
                <strong>{t.kyc.idNumber} :</strong>{" "}
                <span className="font-mono">{masked}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pending state
  if (myKYC?.status === "pending" && !submitted) {
    return (
      <div
        className="bg-white rounded-xl card-shadow border border-border/50 p-6 max-w-2xl"
        data-ocid="pro.kyc.pending.panel"
      >
        <div className="flex items-start gap-4 p-4 rounded-xl bg-warning/10 border border-warning/30">
          <ShieldAlert className="h-7 w-7 text-warning shrink-0 mt-0.5" />
          <div>
            <h3 className="font-display font-bold text-foreground text-base mb-1">
              {t.kyc.status.pending}
            </h3>
            <p className="text-sm text-muted-foreground">{t.kyc.submitted}</p>
            {myKYC.submittedAt && (
              <p className="text-xs text-muted-foreground mt-2">
                {t.kyc.adminSubmittedAt}{" "}
                {new Date(myKYC.submittedAt).toLocaleDateString(numLocale)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Rejected state
  if (myKYC?.status === "rejected" && !submitted) {
    return (
      <div
        className="bg-white rounded-xl card-shadow border border-border/50 p-6 max-w-2xl space-y-4"
        data-ocid="pro.kyc.rejected.panel"
      >
        <div className="flex items-start gap-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30">
          <AlertCircle className="h-7 w-7 text-destructive shrink-0 mt-0.5" />
          <div>
            <h3 className="font-display font-bold text-foreground text-base mb-1">
              {t.kyc.status.rejected}
            </h3>
            <p className="text-sm text-destructive/80">
              {t.kyc.proRejectedInfo}
            </p>
          </div>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90 text-white gap-2"
          onClick={() => {
            // Reset to form by clearing — parent store keeps state, but we show form again
          }}
          data-ocid="pro.kyc.resubmit.button"
        >
          <ShieldCheck className="h-4 w-4" />
          {t.kyc.editRequest}
        </Button>
      </div>
    );
  }

  // Unverified / null — show submission form
  return (
    <div
      className="bg-white rounded-xl card-shadow border border-border/50 p-6 max-w-2xl"
      data-ocid="pro.kyc.form.panel"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
          <ShieldCheck className="h-5 w-5 text-secondary" />
        </div>
        <div>
          <h2 className="font-display font-bold text-base text-foreground">
            {t.kyc.title}
          </h2>
          <p className="text-xs text-muted-foreground">{t.kyc.subtitle}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Country / ID type display */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border text-sm">
          <span className="font-semibold text-foreground/70">
            {t.kyc.idType} :
          </span>
          <span className="font-bold text-primary">{idLabel}</span>
          <span className="ml-auto text-muted-foreground text-xs">
            ({countryCode})
          </span>
        </div>

        {/* ID Number input */}
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">{t.kyc.idNumber}</Label>
          <Input
            value={idNumber}
            onChange={(e) => handleIdChange(e.target.value)}
            placeholder={t.kyc.idNumberPlaceholder}
            className={`h-10 ${validationError ? "border-destructive/50 focus-visible:ring-destructive/30" : ""}`}
            data-ocid="pro.kyc.id_number.input"
          />
          {validationError && (
            <p
              className="text-xs text-destructive flex items-center gap-1"
              data-ocid="pro.kyc.id_number.error_state"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {validationError}
            </p>
          )}
        </div>

        {/* Document upload (optional) */}
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">{t.kyc.uploadDoc}</Label>
          <p className="text-xs text-muted-foreground">{t.kyc.uploadDocHint}</p>
          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setDocName(file.name);
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 border-primary/30 text-primary"
              onClick={() => fileRef.current?.click()}
              data-ocid="pro.kyc.upload.button"
            >
              <Upload className="h-3.5 w-3.5" />
              {docName
                ? lang === "fr" || lang === "lu"
                  ? "Changer"
                  : "Change file"
                : lang === "fr" || lang === "lu"
                  ? "Choisir un fichier"
                  : "Choose file"}
            </Button>
            {docName && (
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                {docName}
              </span>
            )}
          </div>
        </div>

        {/* Submit */}
        <Button
          className="w-full bg-primary hover:bg-primary/90 text-white gap-2 h-10 mt-2"
          disabled={!idNumber.trim() || !!validationError}
          onClick={handleSubmit}
          data-ocid="pro.kyc.submit.button"
        >
          <ShieldCheck className="h-4 w-4" />
          {t.kyc.submit}
        </Button>

        {/* After submit — show pending banner inline */}
        {submitted && (
          <div
            className="flex items-start gap-3 p-3 rounded-xl bg-secondary/10 border border-secondary/30"
            data-ocid="pro.kyc.submitted.success_state"
          >
            <CheckCircle className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/80">{t.kyc.submitted}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

// ─── AI canned responses ──────────────────────────────────────────────────────
const AI_RESPONSES_FR: Record<string, string> = {
  rdv: "📅 Pour gérer vos rendez-vous, accédez à votre calendrier depuis votre dashboard et proposez vos disponibilités directement dans vos offres.",
  devis:
    "📝 Rédigez des devis clairs et détaillés : titre, description précise, budget, délais. Un devis professionnel augmente vos chances d'acceptation.",
  client:
    "👥 Conseil : répondez rapidement aux nouvelles missions dans votre domaine. La réactivité est un facteur clé de succès sur TaskVoilà.",
};
const AI_RESPONSES_EN: Record<string, string> = {
  rdv: "📅 To manage your appointments, share your availability directly in your offers and keep your calendar up to date.",
  appointment:
    "📅 Add your availability in your profile so clients can see when you're free. Clear scheduling helps win more missions.",
  quote:
    "📝 Write detailed, professional quotes with clear scope, timeline, and pricing. Transparency builds trust with clients.",
  client:
    "👥 Tip: respond quickly to new missions in your area. Fast response time is one of the most important factors for winning work.",
};

function getAIResponse(input: string, lang: string): string {
  const lower = input.toLowerCase();
  const responses = lang === "fr" ? AI_RESPONSES_FR : AI_RESPONSES_EN;
  for (const [key, response] of Object.entries(responses)) {
    if (lower.includes(key)) return response;
  }
  return lang === "fr"
    ? "Comment puis-je vous aider aujourd'hui ? Posez-moi vos questions sur vos missions, devis ou profil."
    : "How can I help you today? Ask me about your missions, quotes, or profile.";
}

// Inline i18n for strings not yet in translation files
const DASH_PRO_L: Record<
  string,
  {
    active: string;
    completed: string;
    revenue: string;
    rating: string;
    tabMissions: string;
    tabMessages: string;
    tabDocuments: string;
    tabAI: string;
    tabSubscription: string;
    tabProfile: string;
    explore: string;
    invalidFormat: string;
    inactive: string;
    tabBookings: string;
    noMissions: string;
    exploreRequests: string;
    offerSent: string;
    makeOffer: string;
    noOffers: string;
    you: string;
    docsTitle: string;
    signed: string;
    invoiced: string;
    createDoc: string;
    nftTitle: string;
    fullGallery: string;
    noNFTs: string;
    viewTasks: string;
    aiTitle: string;
    aiEnabled: string;
    aiDisabled: string;
    aiUpgradeTitle: string;
    aiUpgradeDesc: string;
    aiUpgradeBtn: string;
    aiThinking: string;
    aiPlaceholder: string;
    mySubscription: string;
    subPlanNote: string;
    changePlan: string;
    planSolo: string;
    planTeam: string;
    planEnterprise: string;
    subActive: string;
    subTrial: string;
    subCancelled: string;
    startedOn: string;
    renewsOn: string;
    aiIncludedIn: string;
    aiActivated: string;
    aiDeactivated: string;
    noSubscription: string;
    viewPlans: string;
    noBookings: string;
    offerStatusPending: string;
    offerStatusAccepted: string;
    offerStatusRejected: string;
    bookingStatusPending: string;
    bookingStatusAccepted: string;
    bookingStatusDeclined: string;
    bookingStatusCounterProposed: string;
    bookingStatusConfirmed: string;
    bookingStatusCancelled: string;
    awaitingClientConfirm: string;
    acceptedBookingToast: string;
    acceptBooking: string;
    detailsBtn: string;
    monthlyRevenue: string;
    noRevenue: string;
    recentMessages: string;
    noMessages: string;
    missionLabel: string;
    warningTitle: string;
    warningDesc: string;
    coverImageTitle: string;
    coverImageHint: string;
    noImage: string;
    changePhoto: string;
    removePhoto: string;
    profilePhotoTitle: string;
    profilePhotoHint: string;
    photoVisibility: string;
    photoTrust: string;
    descTitle: string;
    descHint: string;
    descPlaceholder: string;
    descSavedMsg: string;
    saveBtn: string;
    fileTooLarge: string;
    fileFormat: string;
    weeklyView: string;
    listView: string;
    bookingDetail: string;
  }
> = {
  fr: {
    active: "Actives",
    completed: "Terminées",
    revenue: "Revenus",
    rating: "Note",
    tabMissions: "Missions",
    tabMessages: "Messages",
    tabDocuments: "Documents",
    tabAI: "Assistant IA",
    tabSubscription: "Abonnement",
    tabProfile: "Mon Profil",
    explore: "Explorer",
    invalidFormat: "Format invalide pour",
    inactive: "Inactif",
    tabBookings: "Réservations",
    noMissions: "Aucune mission disponible pour l'instant.",
    exploreRequests: "Explorer les demandes ouvertes",
    offerSent: "Offre envoyée",
    makeOffer: "Faire une offre",
    noOffers: "Aucune offre soumise.",
    you: "Vous : ",
    docsTitle: "Documents & Factures",
    signed: "Signés",
    invoiced: "Facturé",
    createDoc: "Créer un document",
    nftTitle: "NFT & Preuves de travaux",
    fullGallery: "Galerie complète",
    noNFTs:
      "Aucun NFT de preuve pour l'instant. Mintez des photos depuis les jalons de vos missions.",
    viewTasks: "Voir les missions",
    aiTitle: "Assistant IA TaskVoilà",
    aiEnabled: "Assistant IA activé",
    aiDisabled: "Assistant IA désactivé",
    aiUpgradeTitle: "Assistant IA disponible avec Pro Équipe",
    aiUpgradeDesc:
      "Réponses automatiques, gestion de RDV, suggestions d'offres et transcription d'appels inclus.",
    aiUpgradeBtn: "Passer à Pro Équipe",
    aiThinking: "En train de réfléchir...",
    aiPlaceholder: "Posez une question à votre assistant...",
    mySubscription: "Mon abonnement",
    subPlanNote: "Plan actuel et renouvellement",
    changePlan: "Changer de plan",
    planSolo: "Indépendant",
    planTeam: "Pro Équipe",
    planEnterprise: "Grand Groupe",
    subActive: "Actif",
    subTrial: "Essai",
    subCancelled: "Annulé",
    startedOn: "Démarré le",
    renewsOn: "Renouvellement le",
    aiIncludedIn: "Inclus dans Pro Équipe",
    aiActivated: "Activé",
    aiDeactivated: "Désactivé",
    noSubscription: "Vous n'avez pas d'abonnement actif.",
    viewPlans: "Voir les plans",
    noBookings: "Aucune réservation pour l'instant.",
    offerStatusPending: "En attente",
    offerStatusAccepted: "Acceptée",
    offerStatusRejected: "Refusée",
    bookingStatusPending: "En attente",
    bookingStatusAccepted: "Acceptée",
    bookingStatusDeclined: "Refusée",
    bookingStatusCounterProposed: "Contre-proposition",
    bookingStatusConfirmed: "Confirmée",
    bookingStatusCancelled: "Annulée",
    awaitingClientConfirm: "En attente de confirmation du client",
    acceptedBookingToast: "Acceptée !",
    acceptBooking: "Accepter",
    detailsBtn: "Détails",
    monthlyRevenue: "Revenus mensuels",
    noRevenue: "Aucune donnée pour le moment",
    recentMessages: "Messages récents",
    noMessages: "Aucun message",
    missionLabel: "Mission",
    warningTitle: "⚠️ Ne partagez jamais vos coordonnées sur votre profil",
    warningDesc:
      "Numéros de téléphone, adresses email et liens externes sont interdits sur les profils. Toute communication doit passer par la messagerie TaskVoilà. Les profils contenant ces informations seront automatiquement signalés et suspendus.",
    coverImageTitle: "Image de couverture",
    coverImageHint:
      "Représente votre enseigne ou vos réalisations. Format JPG/PNG, recommandé 1200×300px.",
    noImage: "Aucune image",
    changePhoto: "Changer la photo",
    removePhoto: "Supprimer",
    profilePhotoTitle: "Photo de profil",
    profilePhotoHint:
      "Votre photo s'affiche en avant sur votre profil. Format JPG/PNG, recommandé 400×400px.",
    photoVisibility: "Cette photo sera visible par tous les utilisateurs.",
    photoTrust:
      "Utilisez une vraie photo professionnelle pour plus de confiance.",
    descTitle: "Description & bio",
    descHint:
      "Décrivez vos services. ⚠️ Aucun numéro, email ou lien externe autorisé.",
    descPlaceholder:
      "Ex: Expert en plomberie depuis 15 ans, je réalise tous types de travaux de dépannage et rénovation...",
    descSavedMsg: "Description sauvegardée !",
    saveBtn: "Sauvegarder",
    fileTooLarge: "Le fichier dépasse 10 Mo.",
    fileFormat: "Format non autorisé. Utilisez JPG, PNG ou WebP.",
    weeklyView: "Vue semaine",
    listView: "Liste",
    bookingDetail: "Détails de la réservation",
  },
  en: {
    active: "Active",
    completed: "Completed",
    revenue: "Revenue",
    rating: "Rating",
    tabMissions: "Tasks",
    tabMessages: "Messages",
    tabDocuments: "Documents",
    tabAI: "AI Assistant",
    tabSubscription: "Subscription",
    tabProfile: "My Profile",
    explore: "Browse",
    invalidFormat: "Invalid format for",
    inactive: "Inactive",
    tabBookings: "Bookings",
    noMissions: "No available tasks yet.",
    exploreRequests: "Browse open requests",
    offerSent: "Offer sent",
    makeOffer: "Make offer",
    noOffers: "No offers submitted yet.",
    you: "You: ",
    docsTitle: "Documents & Invoices",
    signed: "Signed",
    invoiced: "Invoiced",
    createDoc: "Create document",
    nftTitle: "NFT Proof Collection",
    fullGallery: "Full gallery",
    noNFTs: "No proof NFTs yet. Mint photos from your task milestones.",
    viewTasks: "View tasks",
    aiTitle: "TaskVoilà AI Assistant",
    aiEnabled: "AI Assistant enabled",
    aiDisabled: "AI Assistant disabled",
    aiUpgradeTitle: "AI Assistant available with Pro Team",
    aiUpgradeDesc:
      "Automatic replies, appointment management, offer suggestions and call transcription included.",
    aiUpgradeBtn: "Upgrade to Pro Team",
    aiThinking: "Thinking...",
    aiPlaceholder: "Ask your assistant a question...",
    mySubscription: "My subscription",
    subPlanNote: "Current plan and renewal",
    changePlan: "Change plan",
    planSolo: "Solo",
    planTeam: "Pro Team",
    planEnterprise: "Enterprise",
    subActive: "Active",
    subTrial: "Trial",
    subCancelled: "Cancelled",
    startedOn: "Started",
    renewsOn: "Renews on",
    aiIncludedIn: "Included in Pro Team",
    aiActivated: "Enabled",
    aiDeactivated: "Disabled",
    noSubscription: "You don't have an active subscription.",
    viewPlans: "View plans",
    noBookings: "No bookings yet.",
    offerStatusPending: "Pending",
    offerStatusAccepted: "Accepted",
    offerStatusRejected: "Rejected",
    bookingStatusPending: "Pending",
    bookingStatusAccepted: "Accepted",
    bookingStatusDeclined: "Declined",
    bookingStatusCounterProposed: "Counter-proposal",
    bookingStatusConfirmed: "Confirmed",
    bookingStatusCancelled: "Cancelled",
    awaitingClientConfirm: "Awaiting client confirmation",
    acceptedBookingToast: "Accepted!",
    acceptBooking: "Accept",
    detailsBtn: "Details",
    monthlyRevenue: "Monthly revenue",
    noRevenue: "No data yet",
    recentMessages: "Recent messages",
    noMessages: "No messages yet",
    missionLabel: "Task",
    warningTitle: "⚠️ Never share your contact details on your profile",
    warningDesc:
      "Phone numbers, email addresses and external links are not allowed on profiles. All communication must go through TaskVoilà messaging. Profiles containing this information will be automatically flagged and suspended.",
    coverImageTitle: "Cover image",
    coverImageHint:
      "Represents your brand or achievements. JPG/PNG format, recommended 1200×300px.",
    noImage: "No image",
    changePhoto: "Change photo",
    removePhoto: "Remove",
    profilePhotoTitle: "Profile photo",
    profilePhotoHint:
      "Your photo appears in front on your profile. JPG/PNG format, recommended 400×400px.",
    photoVisibility: "This photo will be visible to all users.",
    photoTrust: "Use a real professional photo for more trust.",
    descTitle: "Description & bio",
    descHint:
      "Describe your services. ⚠️ No phone numbers, emails or external links allowed.",
    descPlaceholder:
      "Ex: Expert in plumbing for 15 years, I carry out all types of emergency repairs and renovations...",
    descSavedMsg: "Description saved!",
    saveBtn: "Save",
    fileTooLarge: "File exceeds 10 MB.",
    fileFormat: "Format not allowed. Use JPG, PNG or WebP.",
    weeklyView: "Week view",
    listView: "List",
    bookingDetail: "Booking details",
  },
  de: {
    active: "Aktive",
    completed: "Abgeschlossen",
    revenue: "Einnahmen",
    rating: "Bewertung",
    tabMissions: "Aufgaben",
    tabMessages: "Nachrichten",
    tabDocuments: "Dokumente",
    tabAI: "KI-Assistent",
    tabSubscription: "Abonnement",
    tabProfile: "Mein Profil",
    explore: "Durchsuchen",
    invalidFormat: "Ungültiges Format für",
    inactive: "Inaktiv",
    tabBookings: "Buchungen",
    noMissions: "Noch keine verfügbaren Aufgaben.",
    exploreRequests: "Offene Anfragen durchsuchen",
    offerSent: "Angebot gesendet",
    makeOffer: "Angebot machen",
    noOffers: "Noch keine Angebote eingereicht.",
    you: "Sie: ",
    docsTitle: "Dokumente & Rechnungen",
    signed: "Unterzeichnet",
    invoiced: "Fakturiert",
    createDoc: "Dokument erstellen",
    nftTitle: "NFT & Arbeitsnachweise",
    fullGallery: "Vollständige Galerie",
    noNFTs:
      "Noch keine Nachweis-NFTs. Prägen Sie Fotos aus Ihren Auftragsmaßnahmen.",
    viewTasks: "Aufgaben ansehen",
    aiTitle: "TaskVoilà KI-Assistent",
    aiEnabled: "KI-Assistent aktiviert",
    aiDisabled: "KI-Assistent deaktiviert",
    aiUpgradeTitle: "KI-Assistent im Pro Team-Plan",
    aiUpgradeDesc:
      "Automatische Antworten, Terminverwaltung, Angebotsvorschläge und Anruftranskription inklusive.",
    aiUpgradeBtn: "Auf Pro Team upgraden",
    aiThinking: "Denke nach...",
    aiPlaceholder: "Stellen Sie Ihrem Assistenten eine Frage...",
    mySubscription: "Mein Abonnement",
    subPlanNote: "Aktueller Plan und Verlängerung",
    changePlan: "Plan ändern",
    planSolo: "Solo",
    planTeam: "Pro Team",
    planEnterprise: "Enterprise",
    subActive: "Aktiv",
    subTrial: "Test",
    subCancelled: "Storniert",
    startedOn: "Gestartet am",
    renewsOn: "Erneuerung am",
    aiIncludedIn: "Im Pro Team enthalten",
    aiActivated: "Aktiviert",
    aiDeactivated: "Deaktiviert",
    noSubscription: "Sie haben kein aktives Abonnement.",
    viewPlans: "Pläne ansehen",
    noBookings: "Noch keine Buchungen.",
    offerStatusPending: "Ausstehend",
    offerStatusAccepted: "Angenommen",
    offerStatusRejected: "Abgelehnt",
    bookingStatusPending: "Ausstehend",
    bookingStatusAccepted: "Angenommen",
    bookingStatusDeclined: "Abgelehnt",
    bookingStatusCounterProposed: "Gegenvorschlag",
    bookingStatusConfirmed: "Bestätigt",
    bookingStatusCancelled: "Storniert",
    awaitingClientConfirm: "Wartet auf Kundenbestätigung",
    acceptedBookingToast: "Angenommen!",
    acceptBooking: "Annehmen",
    detailsBtn: "Details",
    monthlyRevenue: "Monatliche Einnahmen",
    noRevenue: "Noch keine Daten",
    recentMessages: "Aktuelle Nachrichten",
    noMessages: "Noch keine Nachrichten",
    missionLabel: "Auftrag",
    warningTitle: "⚠️ Teilen Sie niemals Ihre Kontaktdaten in Ihrem Profil",
    warningDesc:
      "Telefonnummern, E-Mail-Adressen und externe Links sind in Profilen nicht erlaubt.",
    coverImageTitle: "Titelbild",
    coverImageHint:
      "Repräsentiert Ihr Unternehmen oder Ihre Arbeit. JPG/PNG, empfohlen 1200×300px.",
    noImage: "Kein Bild",
    changePhoto: "Foto ändern",
    removePhoto: "Entfernen",
    profilePhotoTitle: "Profilfoto",
    profilePhotoHint:
      "Ihr Foto wird in Ihrem Profil angezeigt. JPG/PNG, empfohlen 400×400px.",
    photoVisibility: "Dieses Foto wird für alle Nutzer sichtbar sein.",
    photoTrust:
      "Verwenden Sie ein echtes professionelles Foto für mehr Vertrauen.",
    descTitle: "Beschreibung & Bio",
    descHint:
      "Beschreiben Sie Ihre Dienstleistungen. ⚠️ Keine Telefonnummern, E-Mails oder externen Links.",
    descPlaceholder: "Beispiel: Klempnerexperte seit 15 Jahren...",
    descSavedMsg: "Beschreibung gespeichert!",
    saveBtn: "Speichern",
    fileTooLarge: "Datei zu groß (max. 10 MB).",
    fileFormat: "Format nicht erlaubt. Verwenden Sie JPG, PNG oder WebP.",
    weeklyView: "Wochenansicht",
    listView: "Liste",
    bookingDetail: "Buchungsdetails",
  },
  es: {
    active: "Activas",
    completed: "Completadas",
    revenue: "Ingresos",
    rating: "Valoración",
    tabMissions: "Tareas",
    tabMessages: "Mensajes",
    tabDocuments: "Documentos",
    tabAI: "Asistente IA",
    tabSubscription: "Suscripción",
    tabProfile: "Mi Perfil",
    explore: "Explorar",
    invalidFormat: "Formato no válido para",
    inactive: "Inactivo",
    tabBookings: "Reservas",
    noMissions: "No hay tareas disponibles.",
    exploreRequests: "Ver solicitudes abiertas",
    offerSent: "Oferta enviada",
    makeOffer: "Hacer una oferta",
    noOffers: "Ninguna oferta enviada.",
    you: "Tú: ",
    docsTitle: "Documentos y Facturas",
    signed: "Firmados",
    invoiced: "Facturado",
    createDoc: "Crear documento",
    nftTitle: "NFT & Pruebas de trabajo",
    fullGallery: "Galería completa",
    noNFTs: "No hay NFTs de prueba. Acuña fotos desde los hitos de tus tareas.",
    viewTasks: "Ver tareas",
    aiTitle: "Asistente IA TaskVoilà",
    aiEnabled: "Asistente IA activado",
    aiDisabled: "Asistente IA desactivado",
    aiUpgradeTitle: "Asistente IA disponible con Pro Team",
    aiUpgradeDesc:
      "Respuestas automáticas, gestión de citas, sugerencias de ofertas y transcripción incluidas.",
    aiUpgradeBtn: "Cambiar a Pro Team",
    aiThinking: "Pensando...",
    aiPlaceholder: "Haz una pregunta a tu asistente...",
    mySubscription: "Mi suscripción",
    subPlanNote: "Plan actual y renovación",
    changePlan: "Cambiar de plan",
    planSolo: "Solo",
    planTeam: "Pro Team",
    planEnterprise: "Enterprise",
    subActive: "Activo",
    subTrial: "Prueba",
    subCancelled: "Cancelado",
    startedOn: "Iniciado el",
    renewsOn: "Renovación el",
    aiIncludedIn: "Incluido en Pro Team",
    aiActivated: "Activado",
    aiDeactivated: "Desactivado",
    noSubscription: "No tienes una suscripción activa.",
    viewPlans: "Ver planes",
    noBookings: "Sin reservas aún.",
    offerStatusPending: "Pendiente",
    offerStatusAccepted: "Aceptada",
    offerStatusRejected: "Rechazada",
    bookingStatusPending: "Pendiente",
    bookingStatusAccepted: "Aceptada",
    bookingStatusDeclined: "Rechazada",
    bookingStatusCounterProposed: "Contrapropuesta",
    bookingStatusConfirmed: "Confirmada",
    bookingStatusCancelled: "Cancelada",
    awaitingClientConfirm: "Esperando confirmación del cliente",
    acceptedBookingToast: "¡Aceptada!",
    acceptBooking: "Aceptar",
    detailsBtn: "Detalles",
    monthlyRevenue: "Ingresos mensuales",
    noRevenue: "Sin datos todavía",
    recentMessages: "Mensajes recientes",
    noMessages: "Sin mensajes",
    missionLabel: "Tarea",
    warningTitle: "⚠️ Nunca compartas tus datos de contacto en tu perfil",
    warningDesc:
      "Los números de teléfono, correos electrónicos y enlaces externos no están permitidos en los perfiles.",
    coverImageTitle: "Imagen de portada",
    coverImageHint:
      "Representa tu marca o logros. JPG/PNG, recomendado 1200×300px.",
    noImage: "Sin imagen",
    changePhoto: "Cambiar foto",
    removePhoto: "Eliminar",
    profilePhotoTitle: "Foto de perfil",
    profilePhotoHint:
      "Tu foto aparece en tu perfil. JPG/PNG, recomendado 400×400px.",
    photoVisibility: "Esta foto será visible para todos los usuarios.",
    photoTrust: "Usa una foto profesional real para generar más confianza.",
    descTitle: "Descripción & bio",
    descHint:
      "Describe tus servicios. ⚠️ Sin números de teléfono, emails ni enlaces externos.",
    descPlaceholder: "Ej: Experto en fontanería desde hace 15 años...",
    descSavedMsg: "¡Descripción guardada!",
    saveBtn: "Guardar",
    fileTooLarge: "El archivo supera 10 MB.",
    fileFormat: "Formato no permitido. Usa JPG, PNG o WebP.",
    weeklyView: "Vista semanal",
    listView: "Lista",
    bookingDetail: "Detalles de la reserva",
  },
  it: {
    active: "Attive",
    completed: "Completate",
    revenue: "Entrate",
    rating: "Valutazione",
    tabMissions: "Missioni",
    tabMessages: "Messaggi",
    tabDocuments: "Documenti",
    tabAI: "Assistente IA",
    tabSubscription: "Abbonamento",
    tabProfile: "Il mio Profilo",
    explore: "Esplora",
    invalidFormat: "Formato non valido per",
    inactive: "Inattivo",
    tabBookings: "Prenotazioni",
    noMissions: "Nessun incarico disponibile.",
    exploreRequests: "Esplora richieste aperte",
    offerSent: "Offerta inviata",
    makeOffer: "Fai un'offerta",
    noOffers: "Nessuna offerta inviata.",
    you: "Tu: ",
    docsTitle: "Documenti & Fatture",
    signed: "Firmati",
    invoiced: "Fatturato",
    createDoc: "Crea documento",
    nftTitle: "NFT & Prove di lavoro",
    fullGallery: "Galleria completa",
    noNFTs: "Nessun NFT prova. Crea NFT dalle foto dei tuoi incarichi.",
    viewTasks: "Vedi incarichi",
    aiTitle: "Assistente IA TaskVoilà",
    aiEnabled: "Assistente IA attivato",
    aiDisabled: "Assistente IA disattivato",
    aiUpgradeTitle: "Assistente IA disponibile con Pro Team",
    aiUpgradeDesc:
      "Risposte automatiche, gestione appuntamenti, suggerimenti offerte e trascrizione inclusi.",
    aiUpgradeBtn: "Passa a Pro Team",
    aiThinking: "Sto pensando...",
    aiPlaceholder: "Fai una domanda al tuo assistente...",
    mySubscription: "Il mio abbonamento",
    subPlanNote: "Piano attuale e rinnovo",
    changePlan: "Cambia piano",
    planSolo: "Solo",
    planTeam: "Pro Team",
    planEnterprise: "Enterprise",
    subActive: "Attivo",
    subTrial: "Prova",
    subCancelled: "Annullato",
    startedOn: "Iniziato il",
    renewsOn: "Rinnovo il",
    aiIncludedIn: "Incluso in Pro Team",
    aiActivated: "Attivato",
    aiDeactivated: "Disattivato",
    noSubscription: "Non hai un abbonamento attivo.",
    viewPlans: "Vedi piani",
    noBookings: "Nessuna prenotazione.",
    offerStatusPending: "In attesa",
    offerStatusAccepted: "Accettata",
    offerStatusRejected: "Rifiutata",
    bookingStatusPending: "In attesa",
    bookingStatusAccepted: "Accettata",
    bookingStatusDeclined: "Rifiutata",
    bookingStatusCounterProposed: "Controproposta",
    bookingStatusConfirmed: "Confermata",
    bookingStatusCancelled: "Annullata",
    awaitingClientConfirm: "In attesa conferma cliente",
    acceptedBookingToast: "Accettata!",
    acceptBooking: "Accetta",
    detailsBtn: "Dettagli",
    monthlyRevenue: "Entrate mensili",
    noRevenue: "Nessun dato disponibile",
    recentMessages: "Messaggi recenti",
    noMessages: "Nessun messaggio",
    missionLabel: "Missione",
    warningTitle: "⚠️ Non condividere mai i tuoi dati di contatto nel profilo",
    warningDesc:
      "Numeri di telefono, email e link esterni non sono consentiti nei profili.",
    coverImageTitle: "Immagine di copertina",
    coverImageHint:
      "Rappresenta il tuo brand o le tue realizzazioni. JPG/PNG, consigliato 1200×300px.",
    noImage: "Nessuna immagine",
    changePhoto: "Cambia foto",
    removePhoto: "Rimuovi",
    profilePhotoTitle: "Foto profilo",
    profilePhotoHint:
      "La tua foto appare nel profilo. JPG/PNG, consigliato 400×400px.",
    photoVisibility: "Questa foto sarà visibile a tutti gli utenti.",
    photoTrust: "Usa una foto professionale reale per più fiducia.",
    descTitle: "Descrizione & bio",
    descHint:
      "Descrivi i tuoi servizi. ⚠️ Nessun numero, email o link esterno consentiti.",
    descPlaceholder: "Es: Esperto di idraulica da 15 anni...",
    descSavedMsg: "Descrizione salvata!",
    saveBtn: "Salva",
    fileTooLarge: "Il file supera 10 MB.",
    fileFormat: "Formato non consentito. Usa JPG, PNG o WebP.",
    weeklyView: "Vista settimanale",
    listView: "Lista",
    bookingDetail: "Dettagli prenotazione",
  },
  pt: {
    active: "Ativas",
    completed: "Concluídas",
    revenue: "Receitas",
    rating: "Avaliação",
    tabMissions: "Tarefas",
    tabMessages: "Mensagens",
    tabDocuments: "Documentos",
    tabAI: "Assistente IA",
    tabSubscription: "Subscrição",
    tabProfile: "O meu Perfil",
    explore: "Explorar",
    invalidFormat: "Formato inválido para",
    inactive: "Inativo",
    tabBookings: "Reservas",
    noMissions: "Sem tarefas disponíveis.",
    exploreRequests: "Ver pedidos abertos",
    offerSent: "Oferta enviada",
    makeOffer: "Fazer oferta",
    noOffers: "Sem ofertas submetidas.",
    you: "Tu: ",
    docsTitle: "Documentos e Faturas",
    signed: "Assinados",
    invoiced: "Faturado",
    createDoc: "Criar documento",
    nftTitle: "NFT & Provas de trabalho",
    fullGallery: "Galeria completa",
    noNFTs: "Sem NFTs de prova. Cunhe fotos dos marcos das suas tarefas.",
    viewTasks: "Ver tarefas",
    aiTitle: "Assistente IA TaskVoilà",
    aiEnabled: "Assistente IA ativado",
    aiDisabled: "Assistente IA desativado",
    aiUpgradeTitle: "Assistente IA disponível com Pro Team",
    aiUpgradeDesc:
      "Respostas automáticas, gestão de compromissos, sugestões de ofertas e transcrição incluídas.",
    aiUpgradeBtn: "Atualizar para Pro Team",
    aiThinking: "A pensar...",
    aiPlaceholder: "Coloca uma pergunta ao teu assistente...",
    mySubscription: "A minha subscrição",
    subPlanNote: "Plano atual e renovação",
    changePlan: "Mudar de plano",
    planSolo: "Solo",
    planTeam: "Pro Team",
    planEnterprise: "Enterprise",
    subActive: "Ativo",
    subTrial: "Experiência",
    subCancelled: "Cancelado",
    startedOn: "Iniciado em",
    renewsOn: "Renovação em",
    aiIncludedIn: "Incluído no Pro Team",
    aiActivated: "Ativado",
    aiDeactivated: "Desativado",
    noSubscription: "Não tens uma subscrição ativa.",
    viewPlans: "Ver planos",
    noBookings: "Sem reservas ainda.",
    offerStatusPending: "Pendente",
    offerStatusAccepted: "Aceite",
    offerStatusRejected: "Recusada",
    bookingStatusPending: "Pendente",
    bookingStatusAccepted: "Aceite",
    bookingStatusDeclined: "Recusada",
    bookingStatusCounterProposed: "Contraproposta",
    bookingStatusConfirmed: "Confirmada",
    bookingStatusCancelled: "Cancelada",
    awaitingClientConfirm: "Aguardando confirmação do cliente",
    acceptedBookingToast: "Aceite!",
    acceptBooking: "Aceitar",
    detailsBtn: "Detalhes",
    monthlyRevenue: "Receitas mensais",
    noRevenue: "Sem dados ainda",
    recentMessages: "Mensagens recentes",
    noMessages: "Sem mensagens",
    missionLabel: "Tarefa",
    warningTitle: "⚠️ Nunca partilhes os teus dados de contacto no perfil",
    warningDesc:
      "Números de telefone, emails e links externos não são permitidos nos perfis.",
    coverImageTitle: "Imagem de capa",
    coverImageHint:
      "Representa a tua marca ou realizações. JPG/PNG, recomendado 1200×300px.",
    noImage: "Sem imagem",
    changePhoto: "Alterar foto",
    removePhoto: "Remover",
    profilePhotoTitle: "Foto de perfil",
    profilePhotoHint:
      "A tua foto aparece no perfil. JPG/PNG, recomendado 400×400px.",
    photoVisibility: "Esta foto será visível para todos os utilizadores.",
    photoTrust: "Usa uma foto profissional real para mais confiança.",
    descTitle: "Descrição & bio",
    descHint:
      "Descreve os teus serviços. ⚠️ Sem números, emails ou links externos.",
    descPlaceholder: "Ex: Especialista em canalizações há 15 anos...",
    descSavedMsg: "Descrição guardada!",
    saveBtn: "Guardar",
    fileTooLarge: "O ficheiro excede 10 MB.",
    fileFormat: "Formato não permitido. Usa JPG, PNG ou WebP.",
    weeklyView: "Vista semanal",
    listView: "Lista",
    bookingDetail: "Detalhes da reserva",
  },
  nl: {
    active: "Actieve",
    completed: "Voltooid",
    revenue: "Inkomsten",
    rating: "Beoordeling",
    tabMissions: "Taken",
    tabMessages: "Berichten",
    tabDocuments: "Documenten",
    tabAI: "AI-Assistent",
    tabSubscription: "Abonnement",
    tabProfile: "Mijn Profiel",
    explore: "Verkennen",
    invalidFormat: "Ongeldig formaat voor",
    inactive: "Inactief",
    tabBookings: "Boekingen",
    noMissions: "Nog geen beschikbare taken.",
    exploreRequests: "Open aanvragen bekijken",
    offerSent: "Aanbieding verzonden",
    makeOffer: "Aanbieding doen",
    noOffers: "Nog geen offertes ingediend.",
    you: "Jij: ",
    docsTitle: "Documenten & Facturen",
    signed: "Ondertekend",
    invoiced: "Gefactureerd",
    createDoc: "Document aanmaken",
    nftTitle: "NFT & Werkbewijzen",
    fullGallery: "Volledige galerij",
    noNFTs: "Nog geen bewijs-NFTs. Mint foto's van je taakmijlpalen.",
    viewTasks: "Taken bekijken",
    aiTitle: "TaskVoilà AI-Assistent",
    aiEnabled: "AI-assistent ingeschakeld",
    aiDisabled: "AI-assistent uitgeschakeld",
    aiUpgradeTitle: "AI-assistent beschikbaar in Pro Team",
    aiUpgradeDesc:
      "Automatische antwoorden, agendabeheer, aanbiedingssuggesties en gespreksoverzichten inbegrepen.",
    aiUpgradeBtn: "Upgraden naar Pro Team",
    aiThinking: "Aan het nadenken...",
    aiPlaceholder: "Stel uw assistent een vraag...",
    mySubscription: "Mijn abonnement",
    subPlanNote: "Huidig plan en verlenging",
    changePlan: "Plan wijzigen",
    planSolo: "Solo",
    planTeam: "Pro Team",
    planEnterprise: "Enterprise",
    subActive: "Actief",
    subTrial: "Proef",
    subCancelled: "Geannuleerd",
    startedOn: "Gestart op",
    renewsOn: "Verlengt op",
    aiIncludedIn: "Inbegrepen in Pro Team",
    aiActivated: "Ingeschakeld",
    aiDeactivated: "Uitgeschakeld",
    noSubscription: "U heeft geen actief abonnement.",
    viewPlans: "Plannen bekijken",
    noBookings: "Nog geen boekingen.",
    offerStatusPending: "In behandeling",
    offerStatusAccepted: "Geaccepteerd",
    offerStatusRejected: "Afgewezen",
    bookingStatusPending: "In afwachting",
    bookingStatusAccepted: "Geaccepteerd",
    bookingStatusDeclined: "Geweigerd",
    bookingStatusCounterProposed: "Tegenvoorstel",
    bookingStatusConfirmed: "Bevestigd",
    bookingStatusCancelled: "Geannuleerd",
    awaitingClientConfirm: "Wacht op bevestiging klant",
    acceptedBookingToast: "Geaccepteerd!",
    acceptBooking: "Accepteren",
    detailsBtn: "Details",
    monthlyRevenue: "Maandelijkse inkomsten",
    noRevenue: "Nog geen gegevens",
    recentMessages: "Recente berichten",
    noMessages: "Nog geen berichten",
    missionLabel: "Taak",
    warningTitle: "⚠️ Deel nooit uw contactgegevens in uw profiel",
    warningDesc:
      "Telefoonnummers, e-mailadressen en externe links zijn niet toegestaan in profielen.",
    coverImageTitle: "Omslagafbeelding",
    coverImageHint:
      "Vertegenwoordigt uw merk of prestaties. JPG/PNG, aanbevolen 1200×300px.",
    noImage: "Geen afbeelding",
    changePhoto: "Foto wijzigen",
    removePhoto: "Verwijderen",
    profilePhotoTitle: "Profielfoto",
    profilePhotoHint:
      "Uw foto verschijnt in uw profiel. JPG/PNG, aanbevolen 400×400px.",
    photoVisibility: "Deze foto is zichtbaar voor alle gebruikers.",
    photoTrust: "Gebruik een echte professionele foto voor meer vertrouwen.",
    descTitle: "Beschrijving & bio",
    descHint:
      "Beschrijf uw diensten. ⚠️ Geen telefoonnummers, e-mails of externe links.",
    descPlaceholder: "Bijv: Loodgieterexpert al 15 jaar...",
    descSavedMsg: "Beschrijving opgeslagen!",
    saveBtn: "Opslaan",
    fileTooLarge: "Bestand te groot (max. 10 MB).",
    fileFormat: "Formaat niet toegestaan. Gebruik JPG, PNG of WebP.",
    weeklyView: "Weekweergave",
    listView: "Lijst",
    bookingDetail: "Boekingsdetails",
  },
  el: {
    active: "Ενεργές",
    completed: "Ολοκληρωμένες",
    revenue: "Έσοδα",
    rating: "Βαθμολογία",
    tabMissions: "Αποστολές",
    tabMessages: "Μηνύματα",
    tabDocuments: "Έγγραφα",
    tabAI: "AI Βοηθός",
    tabSubscription: "Συνδρομή",
    tabProfile: "Το Προφίλ μου",
    explore: "Εξερεύνηση",
    invalidFormat: "Μη έγκυρη μορφή για",
    inactive: "Ανενεργό",
    tabBookings: "Κρατήσεις",
    noMissions: "Δεν υπάρχουν διαθέσιμες αποστολές.",
    exploreRequests: "Εξερεύνηση ανοιχτών αιτημάτων",
    offerSent: "Προσφορά εστάλη",
    makeOffer: "Κάνε προσφορά",
    noOffers: "Δεν έχουν υποβληθεί προσφορές.",
    you: "Εσείς: ",
    docsTitle: "Έγγραφα & Τιμολόγια",
    signed: "Υπογεγραμμένα",
    invoiced: "Τιμολογημένο",
    createDoc: "Δημιουργία εγγράφου",
    nftTitle: "NFT & Αποδείξεις εργασίας",
    fullGallery: "Πλήρης γκαλερί",
    noNFTs:
      "Δεν υπάρχουν NFTs απόδειξης. Δημιουργήστε NFTs από τα ορόσημα των αποστολών σας.",
    viewTasks: "Δείτε τις αποστολές",
    aiTitle: "TaskVoilà AI Βοηθός",
    aiEnabled: "Ο AI Βοηθός ενεργοποιήθηκε",
    aiDisabled: "Ο AI Βοηθός απενεργοποιήθηκε",
    aiUpgradeTitle: "AI Βοηθός διαθέσιμος με Pro Team",
    aiUpgradeDesc:
      "Αυτόματες απαντήσεις, διαχείριση ραντεβού, προτάσεις προσφορών και μεταγραφή κλήσεων.",
    aiUpgradeBtn: "Αναβάθμιση σε Pro Team",
    aiThinking: "Σκέφτομαι...",
    aiPlaceholder: "Κάντε μια ερώτηση στον βοηθό σας...",
    mySubscription: "Η συνδρομή μου",
    subPlanNote: "Τρέχον πλάνο και ανανέωση",
    changePlan: "Αλλαγή πλάνου",
    planSolo: "Solo",
    planTeam: "Pro Team",
    planEnterprise: "Enterprise",
    subActive: "Ενεργό",
    subTrial: "Δοκιμή",
    subCancelled: "Ακυρωμένο",
    startedOn: "Ξεκίνησε",
    renewsOn: "Ανανεώνεται",
    aiIncludedIn: "Συμπεριλαμβάνεται στο Pro Team",
    aiActivated: "Ενεργοποιημένο",
    aiDeactivated: "Απενεργοποιημένο",
    noSubscription: "Δεν έχετε ενεργή συνδρομή.",
    viewPlans: "Δείτε τα πλάνα",
    noBookings: "Δεν υπάρχουν κρατήσεις.",
    offerStatusPending: "Σε αναμονή",
    offerStatusAccepted: "Αποδεκτή",
    offerStatusRejected: "Απορρίφθηκε",
    bookingStatusPending: "Σε αναμονή",
    bookingStatusAccepted: "Αποδεκτή",
    bookingStatusDeclined: "Απορρίφθηκε",
    bookingStatusCounterProposed: "Αντιπρόταση",
    bookingStatusConfirmed: "Επιβεβαιωμένη",
    bookingStatusCancelled: "Ακυρωμένη",
    awaitingClientConfirm: "Αναμονή επιβεβαίωσης πελάτη",
    acceptedBookingToast: "Αποδεκτή!",
    acceptBooking: "Αποδοχή",
    detailsBtn: "Λεπτομέρειες",
    monthlyRevenue: "Μηνιαία έσοδα",
    noRevenue: "Δεν υπάρχουν δεδομένα",
    recentMessages: "Πρόσφατα μηνύματα",
    noMessages: "Δεν υπάρχουν μηνύματα",
    missionLabel: "Αποστολή",
    warningTitle:
      "⚠️ Μην μοιράζεστε ποτέ τα στοιχεία επικοινωνίας σας στο προφίλ",
    warningDesc:
      "Αριθμοί τηλεφώνου, email και εξωτερικοί σύνδεσμοι δεν επιτρέπονται στα προφίλ.",
    coverImageTitle: "Εικόνα εξωφύλλου",
    coverImageHint:
      "Εκπροσωπεί την επιχείρησή σας. JPG/PNG, συνιστάται 1200×300px.",
    noImage: "Καμία εικόνα",
    changePhoto: "Αλλαγή φωτογραφίας",
    removePhoto: "Αφαίρεση",
    profilePhotoTitle: "Φωτογραφία προφίλ",
    profilePhotoHint:
      "Η φωτογραφία σας εμφανίζεται στο προφίλ. JPG/PNG, συνιστάται 400×400px.",
    photoVisibility: "Αυτή η φωτογραφία θα είναι ορατή σε όλους τους χρήστες.",
    photoTrust: "Χρησιμοποιήστε μια πραγματική επαγγελματική φωτογραφία.",
    descTitle: "Περιγραφή & bio",
    descHint:
      "Περιγράψτε τις υπηρεσίες σας. ⚠️ Χωρίς αριθμούς, email ή εξωτερικούς συνδέσμους.",
    descPlaceholder: "Π.χ. Ειδικός στην υδραυλική εδώ και 15 χρόνια...",
    descSavedMsg: "Η περιγραφή αποθηκεύτηκε!",
    saveBtn: "Αποθήκευση",
    fileTooLarge: "Το αρχείο υπερβαίνει τα 10 MB.",
    fileFormat: "Μη επιτρεπόμενη μορφή. Χρησιμοποιήστε JPG, PNG ή WebP.",
    weeklyView: "Εβδομαδιαία προβολή",
    listView: "Λίστα",
    bookingDetail: "Λεπτομέρειες κράτησης",
  },
  lu: {
    active: "Actives",
    completed: "Terminées",
    revenue: "Revenus",
    rating: "Note",
    tabMissions: "Missions",
    tabMessages: "Messages",
    tabDocuments: "Documents",
    tabAI: "Assistant IA",
    tabSubscription: "Abonnement",
    tabProfile: "Mon Profil",
    explore: "Explorer",
    invalidFormat: "Format invalide pour",
    inactive: "Inactif",
    tabBookings: "Réservations",
    noMissions: "Aucune mission disponible pour l'instant.",
    exploreRequests: "Explorer les demandes ouvertes",
    offerSent: "Offre envoyée",
    makeOffer: "Faire une offre",
    noOffers: "Aucune offre soumise.",
    you: "Vous : ",
    docsTitle: "Documents & Factures",
    signed: "Signés",
    invoiced: "Facturé",
    createDoc: "Créer un document",
    nftTitle: "NFT & Preuves de travaux",
    fullGallery: "Galerie complète",
    noNFTs:
      "Aucun NFT de preuve pour l'instant. Mintez des photos depuis les jalons de vos missions.",
    viewTasks: "Voir les missions",
    aiTitle: "Assistant IA TaskVoilà",
    aiEnabled: "Assistant IA activé",
    aiDisabled: "Assistant IA désactivé",
    aiUpgradeTitle: "Assistant IA disponible avec Pro Équipe",
    aiUpgradeDesc:
      "Réponses automatiques, gestion de RDV, suggestions d'offres et transcription d'appels inclus.",
    aiUpgradeBtn: "Passer à Pro Équipe",
    aiThinking: "En train de réfléchir...",
    aiPlaceholder: "Posez une question à votre assistant...",
    mySubscription: "Mon abonnement",
    subPlanNote: "Plan actuel et renouvellement",
    changePlan: "Changer de plan",
    planSolo: "Indépendant",
    planTeam: "Pro Équipe",
    planEnterprise: "Grand Groupe",
    subActive: "Actif",
    subTrial: "Essai",
    subCancelled: "Annulé",
    startedOn: "Démarré le",
    renewsOn: "Renouvellement le",
    aiIncludedIn: "Inclus dans Pro Équipe",
    aiActivated: "Activé",
    aiDeactivated: "Désactivé",
    noSubscription: "Vous n'avez pas d'abonnement actif.",
    viewPlans: "Voir les plans",
    noBookings: "Aucune réservation pour l'instant.",
    offerStatusPending: "En attente",
    offerStatusAccepted: "Acceptée",
    offerStatusRejected: "Refusée",
    bookingStatusPending: "En attente",
    bookingStatusAccepted: "Acceptée",
    bookingStatusDeclined: "Refusée",
    bookingStatusCounterProposed: "Contre-proposition",
    bookingStatusConfirmed: "Confirmée",
    bookingStatusCancelled: "Annulée",
    awaitingClientConfirm: "En attente de confirmation du client",
    acceptedBookingToast: "Acceptée !",
    acceptBooking: "Accepter",
    detailsBtn: "Détails",
    monthlyRevenue: "Revenus mensuels",
    noRevenue: "Aucune donnée pour le moment",
    recentMessages: "Messages récents",
    noMessages: "Aucun message",
    missionLabel: "Mission",
    warningTitle: "⚠️ Ne partagez jamais vos coordonnées sur votre profil",
    warningDesc:
      "Numéros de téléphone, adresses email et liens externes sont interdits sur les profils. Toute communication doit passer par la messagerie TaskVoilà.",
    coverImageTitle: "Image de couverture",
    coverImageHint:
      "Représente votre enseigne ou vos réalisations. Format JPG/PNG, recommandé 1200×300px.",
    noImage: "Aucune image",
    changePhoto: "Changer la photo",
    removePhoto: "Supprimer",
    profilePhotoTitle: "Photo de profil",
    profilePhotoHint:
      "Votre photo s'affiche en avant sur votre profil. Format JPG/PNG, recommandé 400×400px.",
    photoVisibility: "Cette photo sera visible par tous les utilisateurs.",
    photoTrust:
      "Utilisez une vraie photo professionnelle pour plus de confiance.",
    descTitle: "Description & bio",
    descHint:
      "Décrivez vos services. ⚠️ Aucun numéro, email ou lien externe autorisé.",
    descPlaceholder: "Ex: Expert en plomberie depuis 15 ans...",
    descSavedMsg: "Description sauvegardée !",
    saveBtn: "Sauvegarder",
    fileTooLarge: "Le fichier dépasse 10 Mo.",
    fileFormat: "Format non autorisé. Utilisez JPG, PNG ou WebP.",
    weeklyView: "Vue semaine",
    listView: "Liste",
    bookingDetail: "Détails de la réservation",
  },
};

// Number locale mapping
const NUM_LOCALE: Record<string, string> = {
  fr: "fr-FR",
  en: "en-GB",
  de: "de-DE",
  es: "es-ES",
  it: "it-IT",
  pt: "pt-PT",
  nl: "nl-NL",
  el: "el-GR",
  ie: "en-IE",
  lu: "fr-LU",
};

export function ProDashboard() {
  const { t, lang } = useTranslation();
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (!currentUser) void navigate({ to: "/login" });
  }, [currentUser, navigate]);
  const proUserId = currentUser ? String(currentUser.id) : "";
  const { getBookingsForPro, respondToBooking: respondToProBooking } =
    useCalendarStore();
  const dl = DASH_PRO_L[lang] ?? DASH_PRO_L.en;
  const numLocale = NUM_LOCALE[lang] ?? "en-GB";
  const { getConversationsForUser } = useChatStore();
  const myConversations = getConversationsForUser(proUserId);
  const { getNFTsByUser } = useNFTStore();
  const { getMySubscription, toggleAiAssistant } = useSubscriptionStore();
  const mySub = getMySubscription(proUserId);
  const myNFTs = getNFTsByUser(proUserId);
  // Mission and offer stores
  const { listAllMissions } = useMissionStore();
  const { getOffersByPro, hasProSubmittedOffer } = useOfferStore();
  const allMissions = listAllMissions();
  const availableMissions = allMissions.filter(
    (m) =>
      m.status === "open" &&
      m.authorId !== proUserId &&
      m.country === (currentUser?.country ?? ""),
  );
  const myOffers = getOffersByPro(proUserId);
  const myBookings = getBookingsForPro(proUserId);
  const pendingBookingsCount = myBookings.filter(
    (b) => b.status === "pending",
  ).length;
  // offer counts for stats
  void myOffers.filter((o) => o.status === "pending").length;
  const { myKYC } = useKYCStore();

  // AI Chat state
  const [aiMessages, setAiMessages] = useState<
    { id: number; role: "ai" | "user"; text: string }[]
  >([
    {
      id: 1,
      role: "ai",
      text:
        lang === "fr"
          ? `Bonjour ${currentUser?.firstName ?? ""} ! J'ai analysé vos missions. Vous avez de nouveaux créneaux disponibles cette semaine.`
          : `Hello ${currentUser?.firstName ?? ""}! I've analyzed your missions. You have new available slots this week.`,
    },
    {
      id: 2,
      role: "ai",
      text: t.ui.uiAIGreeting,
    },
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const [bookingsView, setBookingsView] = useState<"list" | "week">("list");
  const [selectedBooking, setSelectedBooking] = useState<
    import("@/lib/calendar-store").Booking | null
  >(null);
  const aiEndRef = useRef<HTMLDivElement>(null);

  const proActiveOffers = myOffers.filter((o) => o.status === "pending").length;
  const proCompletedOffers = myOffers.filter(
    (o) => o.status === "accepted",
  ).length;
  const proTotalRevenue = myOffers
    .filter((o) => o.status === "accepted")
    .reduce((sum, o) => sum + o.price, 0);

  const isVerified = currentUser?.status === "verified";
  const { getDocumentsByUser } = useDocumentStore();
  const myDocs = getDocumentsByUser(proUserId, "pro");
  const totalInvoiced = myDocs
    .filter((d) => d.docType === "facture")
    .reduce((sum, d) => sum + d.amount * (1 + d.vatRate / 100), 0);

  function handleDownloadDoc(doc: (typeof myDocs)[0]) {
    const el = document.createElement("a");
    el.href = "#";
    el.click();
    toast.success(
      lang === "fr"
        ? `Téléchargement de ${doc.docNumber}...`
        : `Downloading ${doc.docNumber}...`,
    );
  }
  void handleDownloadDoc;

  function handleSendAI() {
    const trimmed = aiInput.trim();
    if (!trimmed || aiTyping) return;
    const userMsgId = Date.now();
    setAiMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", text: trimmed },
    ]);
    setAiInput("");
    setAiTyping(true);
    setTimeout(() => {
      setAiMessages((prev) => [
        ...prev,
        { id: userMsgId + 1, role: "ai", text: getAIResponse(trimmed, lang) },
      ]);
      setAiTyping(false);
      setTimeout(() => {
        aiEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }, 1500);
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <IncompleteProfileBanner />
        {/* Welcome */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              {t.dashboard.welcome}, {currentUser?.firstName ?? ""} 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              {t.dashboard.pro.title}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            {isVerified ? (
              <Badge className="bg-secondary/20 text-secondary border-secondary/30 gap-1 px-3 py-1.5">
                <BadgeCheck className="h-4 w-4" />
                {t.dashboard.pro.profileVerified}
              </Badge>
            ) : (
              <Badge className="bg-warning/20 text-foreground border-warning/30 gap-1 px-3 py-1.5">
                <AlertCircle className="h-4 w-4" />
                {t.dashboard.pro.profilePending}
              </Badge>
            )}
            {myKYC?.status === "verified" && (
              <Badge className="bg-secondary/20 text-secondary border-secondary/30 gap-1 px-3 py-1.5">
                <ShieldCheck className="h-4 w-4" />
                {t.kyc.badge}
              </Badge>
            )}
          </div>
        </div>

        {/* Stats — 4 card rectangles */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          data-ocid="pro.stats.panel"
        >
          <div className="rounded-xl bg-white border border-border/50 card-shadow p-4 flex flex-col items-center justify-center text-center gap-1">
            <span className="text-xl">✅</span>
            <p className="text-2xl font-bold text-foreground">
              {proActiveOffers}
            </p>
            <p className="text-xs text-muted-foreground">{dl.active}</p>
          </div>
          <div className="rounded-xl bg-white border border-border/50 card-shadow p-4 flex flex-col items-center justify-center text-center gap-1">
            <span className="text-xl">🏁</span>
            <p className="text-2xl font-bold text-foreground">
              {proCompletedOffers}
            </p>
            <p className="text-xs text-muted-foreground">{dl.completed}</p>
          </div>
          <div className="rounded-xl bg-white border border-border/50 card-shadow p-4 flex flex-col items-center justify-center text-center gap-1">
            <span className="text-xl">💶</span>
            <p className="text-2xl font-bold text-foreground">
              {proTotalRevenue}€
            </p>
            <p className="text-xs text-muted-foreground">{dl.revenue}</p>
          </div>
          <div className="rounded-xl bg-white border border-border/50 card-shadow p-4 flex flex-col items-center justify-center text-center gap-1">
            <span className="text-xl">⭐</span>
            <p className="text-2xl font-bold text-foreground">–</p>
            <p className="text-xs text-muted-foreground">{dl.rating}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="missions">
          <div className="overflow-x-auto pb-1 mb-6">
            <TabsList className="bg-white border border-border rounded-xl p-1 h-auto flex gap-1 min-w-max shadow-sm">
              <TabsTrigger
                value="missions"
                className="rounded-lg text-xs sm:text-sm gap-1.5"
                data-ocid="pro.missions.tab"
              >
                <Briefcase className="h-3.5 w-3.5" />
                {dl.tabMissions}
              </TabsTrigger>
              <TabsTrigger
                value="messages"
                className="rounded-lg text-xs sm:text-sm gap-1.5"
                data-ocid="pro.messages.tab"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                {dl.tabMessages}
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className="rounded-lg text-xs sm:text-sm gap-1.5"
                data-ocid="pro.documents.tab"
              >
                <FileText className="h-3.5 w-3.5" />
                {dl.tabDocuments}
              </TabsTrigger>
              <TabsTrigger
                value="nft"
                className="rounded-lg text-xs sm:text-sm gap-1.5"
                data-ocid="pro.nft.tab"
              >
                <Award className="h-3.5 w-3.5" />
                NFT
              </TabsTrigger>
              <TabsTrigger
                value="ai"
                className="rounded-lg text-xs sm:text-sm gap-1.5"
                data-ocid="pro.ai.tab"
              >
                <Bot className="h-3.5 w-3.5" />
                {dl.tabAI}
              </TabsTrigger>
              <TabsTrigger
                value="kyc"
                className="rounded-lg text-xs sm:text-sm gap-1.5"
                data-ocid="pro.kyc.tab"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                KYC
                {myKYC?.status === "verified" && (
                  <span className="ml-0.5 w-2 h-2 rounded-full bg-secondary inline-block" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="subscription"
                className="rounded-lg text-xs sm:text-sm gap-1.5"
                data-ocid="pro.subscription.tab"
              >
                <Crown className="h-3.5 w-3.5" />
                {dl.tabSubscription}
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="rounded-lg text-xs sm:text-sm gap-1.5"
                data-ocid="pro.profile.tab"
              >
                <User className="h-3.5 w-3.5" />
                {dl.tabProfile}
              </TabsTrigger>
              <TabsTrigger
                value="bookings"
                className="rounded-lg text-xs sm:text-sm gap-1.5"
                data-ocid="pro.bookings.tab"
              >
                <Calendar className="h-3.5 w-3.5" />
                {dl.tabBookings}
                {pendingBookingsCount > 0 && (
                  <span className="ml-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                    {pendingBookingsCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ── Missions tab ─────────────────────────────────────────────── */}
          <TabsContent value="missions">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Available Missions */}
              <div className="bg-white rounded-xl card-shadow border border-border/50 overflow-hidden">
                <div className="p-5 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    <h2 className="font-display font-bold text-base text-foreground">
                      {t.dashboard.pro.availableMissions}
                    </h2>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-primary"
                    onClick={() => void navigate({ to: "/marketplace" })}
                  >
                    {t.common.seeAll}
                  </Button>
                </div>
                {availableMissions.length === 0 ? (
                  <div
                    className="p-8 text-center"
                    data-ocid="pro.tasks.empty_state"
                  >
                    <p className="text-3xl mb-3">🔍</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      {dl.noMissions}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void navigate({ to: "/marketplace" })}
                    >
                      {dl.exploreRequests}
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {availableMissions.slice(0, 5).map((mission, i) => {
                      const alreadyOffered = hasProSubmittedOffer(
                        mission.id,
                        proUserId,
                      );
                      return (
                        <div
                          key={mission.id}
                          className="p-4"
                          data-ocid={`pro.available_missions.item.${i + 1}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-foreground truncate">
                                {mission.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-muted-foreground">
                                {mission.city && <span>📍 {mission.city}</span>}
                                <span>
                                  {mission.budgetMin}€ – {mission.budgetMax}€
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              {alreadyOffered ? (
                                <span className="text-xs px-2 py-1 rounded-full bg-secondary/20 text-secondary border border-secondary/30">
                                  {dl.offerSent}
                                </span>
                              ) : (
                                <Button
                                  size="sm"
                                  className="h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                                  onClick={() =>
                                    void navigate({
                                      to: `/mission/${mission.id}`,
                                    })
                                  }
                                  data-ocid={`pro.available_missions.offer_button.${i + 1}`}
                                >
                                  {dl.makeOffer}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* My Offers */}
              <div className="bg-white rounded-xl card-shadow border border-border/50 overflow-hidden">
                <div className="p-5 border-b border-border">
                  <h2 className="font-display font-bold text-base text-foreground">
                    {t.dashboard.pro.myOffers}
                  </h2>
                </div>
                {myOffers.length === 0 ? (
                  <div
                    className="p-8 text-center"
                    data-ocid="pro.offers.empty_state"
                  >
                    <p className="text-3xl mb-3">💼</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      {dl.noOffers}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void navigate({ to: "/marketplace" })}
                    >
                      {dl.explore}
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {myOffers.slice(0, 5).map((offer, i) => {
                      const statusColor =
                        offer.status === "pending"
                          ? "bg-secondary/20 text-secondary border-secondary/30"
                          : offer.status === "accepted"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-muted text-muted-foreground border-border";
                      const statusLabel =
                        offer.status === "pending"
                          ? dl.offerStatusPending
                          : offer.status === "accepted"
                            ? dl.offerStatusAccepted
                            : dl.offerStatusRejected;
                      return (
                        <div
                          key={offer.id}
                          className="p-4"
                          data-ocid={`pro.offers.item.${i + 1}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">
                                {dl.missionLabel} #{offer.missionId.slice(-6)}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                {offer.description}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-bold text-primary">
                                {offer.price}€
                              </p>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full border ${statusColor}`}
                              >
                                {statusLabel}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Revenue chart */}
            <div
              className="bg-white rounded-xl card-shadow border border-border/50 p-6 mt-6"
              data-ocid="pro.revenue.panel"
            >
              <h2 className="font-display font-bold text-base text-foreground mb-4">
                📊 {dl.monthlyRevenue}
              </h2>
              <div
                className="flex flex-col items-center justify-center py-8 text-center"
                data-ocid="pro.revenue.empty_state"
              >
                <p className="text-3xl mb-3">📊</p>
                <p className="text-sm text-muted-foreground">{dl.noRevenue}</p>
              </div>
            </div>
          </TabsContent>

          {/* ── Messages tab ─────────────────────────────────────────────── */}
          <TabsContent value="messages">
            <div className="bg-white rounded-xl card-shadow border border-border/50 overflow-hidden">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <h2 className="font-display font-bold text-base text-foreground">
                    {dl.recentMessages}
                  </h2>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-primary"
                  onClick={() => void navigate({ to: "/messages" })}
                >
                  {t.common.seeAll}
                </Button>
              </div>
              {myConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-3xl mb-3">💬</p>
                  <p className="text-sm text-muted-foreground">
                    {dl.noMessages}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {myConversations.slice(0, 5).map((conv) => {
                    const other = conv.participants.find(
                      (p) => p.id !== proUserId,
                    );
                    const lastMsg = conv.messages[conv.messages.length - 1];
                    return (
                      <button
                        type="button"
                        key={conv.id}
                        className="w-full text-left p-4 hover:bg-muted/30 transition-colors"
                        onClick={() =>
                          void navigate({
                            to: "/messages",
                            search: { conv: conv.id },
                          })
                        }
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {other?.name.slice(0, 1) ?? "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground truncate">
                              {other?.name ?? "Client"}
                            </p>
                            {lastMsg && (
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {lastMsg.senderId === proUserId ? dl.you : ""}
                                {lastMsg.text}
                              </p>
                            )}
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Documents tab ─────────────────────────────────────────────── */}
          <TabsContent value="documents">
            <div
              className="bg-white rounded-xl card-shadow border border-border/50 overflow-hidden"
              data-ocid="pro.documents.section"
            >
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <h2 className="font-display font-bold text-base text-foreground">
                    {dl.docsTitle}
                  </h2>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-primary text-xs"
                  onClick={() => void navigate({ to: "/documents" })}
                  data-ocid="pro.documents.see_all_button"
                >
                  {t.common.seeAll}
                </Button>
              </div>
              <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
                <div className="p-4 text-center">
                  <p className="text-xl font-bold text-foreground">
                    {myDocs.length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {dl.tabDocuments}
                  </p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-xl font-bold text-secondary">
                    {myDocs.filter((d) => d.status === "signed").length}
                  </p>
                  <p className="text-xs text-muted-foreground">{dl.signed}</p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-sm font-bold text-primary">
                    {new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    }).format(totalInvoiced)}
                  </p>
                  <p className="text-xs text-muted-foreground">{dl.invoiced}</p>
                </div>
              </div>
              {myDocs.length === 0 ? (
                <div
                  className="p-10 text-center"
                  data-ocid="pro.documents.empty_state"
                >
                  <p className="text-3xl mb-3">📄</p>
                  <Button
                    size="sm"
                    className="mt-3 bg-primary hover:bg-primary/90 text-white gap-2"
                    onClick={() => void navigate({ to: "/documents" })}
                    data-ocid="pro.documents.create_button"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    {dl.createDoc}
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {myDocs.slice(0, 4).map((doc, i) => {
                    const ttc = doc.amount * (1 + doc.vatRate / 100);
                    return (
                      <div
                        key={doc.id}
                        className="p-4 hover:bg-muted/20 transition-colors flex items-center gap-3"
                        data-ocid={`pro.documents.item.${i + 1}`}
                      >
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${doc.docType === "devis" ? "bg-primary/10" : doc.docType === "bonPourAccord" ? "bg-warning/15" : "bg-secondary/10"}`}
                        >
                          {doc.docType === "facture" ? (
                            <PenLine className="h-4 w-4 text-secondary" />
                          ) : (
                            <FileText className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground truncate">
                            {doc.missionTitle}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-sm text-primary">
                            {new Intl.NumberFormat("fr-FR", {
                              style: "currency",
                              currency: "EUR",
                            }).format(ttc)}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => void navigate({ to: "/documents" })}
                            data-ocid={`pro.documents.download_button.${i + 1}`}
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── NFT & Preuves tab ────────────────────────────────────────── */}
          <TabsContent value="nft">
            <div className="bg-white rounded-xl card-shadow border border-border/50 overflow-hidden">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-secondary" />
                  <h2 className="font-display font-bold text-base text-foreground">
                    {dl.nftTitle}
                  </h2>
                  <Badge className="bg-secondary/15 text-secondary border-secondary/30 text-xs">
                    ICRC7
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-primary text-xs gap-1"
                  asChild
                  data-ocid="pro.nft.gallery.button"
                >
                  <Link to="/nfts">
                    <ExternalLink className="h-3 w-3" />
                    {dl.fullGallery}
                  </Link>
                </Button>
              </div>

              {myNFTs.length === 0 ? (
                <div
                  className="p-12 text-center"
                  data-ocid="pro.nft.empty_state"
                >
                  <p className="text-3xl mb-3">🖼️</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    {dl.noNFTs}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void navigate({ to: "/marketplace" })}
                  >
                    {dl.viewTasks}
                  </Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                  {myNFTs.map((nft, i) => (
                    <div
                      key={nft.id}
                      className="rounded-xl border border-border/60 overflow-hidden hover:shadow-md transition-shadow"
                      data-ocid={`pro.nft.item.${i + 1}`}
                    >
                      <div className="aspect-video bg-muted/40 relative overflow-hidden">
                        <img
                          src={nft.imageUrl}
                          alt={nft.description}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (
                              e.currentTarget as HTMLImageElement
                            ).style.display = "none";
                          }}
                        />
                        <div className="absolute top-2 left-2">
                          <span className="font-mono text-[10px] font-bold bg-black/70 text-white px-1.5 py-0.5 rounded-full">
                            {nft.tokenId}
                          </span>
                        </div>
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-secondary/90 text-white px-1.5 py-0.5 rounded-full text-[10px] font-semibold">
                          <ShieldCheck className="h-2.5 w-2.5" />
                          ICP
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-xs text-foreground truncate">
                          {nft.missionTitle}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {nft.milestoneLabel}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── AI Assistant tab ────────────────────────────────────────── */}
          <TabsContent value="ai">
            <div className="bg-white rounded-xl card-shadow border border-border/50 overflow-hidden">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary" />
                  <h2 className="font-display font-bold text-base text-foreground">
                    {dl.aiTitle}
                  </h2>
                  {mySub?.aiAssistantEnabled ? (
                    <Badge className="bg-secondary/15 text-secondary border-secondary/30 text-xs gap-1">
                      <Sparkles className="h-2.5 w-2.5" />
                      {dl.subActive}
                    </Badge>
                  ) : (
                    <Badge className="bg-muted text-muted-foreground border-border text-xs">
                      {dl.inactive}
                    </Badge>
                  )}
                </div>
                {mySub?.aiAssistantEnabled !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {mySub.aiAssistantEnabled ? "ON" : "OFF"}
                    </span>
                    <Switch
                      checked={mySub.aiAssistantEnabled}
                      onCheckedChange={(val) => {
                        toggleAiAssistant(proUserId, val);
                        toast.success(val ? dl.aiEnabled : dl.aiDisabled);
                      }}
                      data-ocid="pro.ai.toggle"
                    />
                  </div>
                )}
              </div>

              {!mySub?.aiAssistantEnabled ? (
                <div
                  className="p-12 text-center"
                  data-ocid="pro.ai.upgrade.section"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Bot className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-foreground mb-2">
                    {dl.aiUpgradeTitle}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                    {dl.aiUpgradeDesc}
                  </p>
                  <Button
                    className="bg-primary hover:bg-primary/90 text-white gap-2"
                    asChild
                    data-ocid="pro.ai.upgrade.button"
                  >
                    <Link to="/subscription">
                      <Sparkles className="h-4 w-4" />
                      {dl.aiUpgradeBtn}
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col h-96">
                  {/* Chat messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {aiMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                            msg.role === "ai" ? "bg-primary" : "bg-secondary"
                          }`}
                        >
                          {msg.role === "ai"
                            ? "🤖"
                            : (currentUser?.firstName?.[0] ?? "")}
                        </div>
                        <div
                          className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                            msg.role === "user"
                              ? "bg-primary text-white rounded-tr-sm"
                              : "bg-muted/60 text-foreground border border-border rounded-tl-sm"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {aiTyping && (
                      <div className="flex gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs text-white shrink-0">
                          🤖
                        </div>
                        <div className="bg-muted/60 border border-border px-3 py-2 rounded-2xl rounded-tl-sm">
                          <span className="text-muted-foreground text-sm animate-pulse">
                            {dl.aiThinking}
                          </span>
                        </div>
                      </div>
                    )}
                    <div ref={aiEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-3 border-t border-border flex gap-2">
                    <Input
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendAI();
                        }
                      }}
                      placeholder={dl.aiPlaceholder}
                      className="h-9 text-sm"
                      data-ocid="pro.ai.input"
                    />
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-white shrink-0"
                      onClick={handleSendAI}
                      disabled={!aiInput.trim() || aiTyping}
                      data-ocid="pro.ai.send.button"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Subscription tab ────────────────────────────────────────── */}
          <TabsContent value="subscription">
            <div className="bg-white rounded-xl card-shadow border border-border/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-primary/20 flex items-center justify-center">
                    <Crown className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-lg text-foreground">
                      {dl.mySubscription}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {dl.subPlanNote}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-primary/30 text-primary"
                  asChild
                  data-ocid="pro.subscription.change.button"
                >
                  <Link to="/subscription">{dl.changePlan}</Link>
                </Button>
              </div>

              {mySub ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-semibold">
                          {mySub.plan === "team"
                            ? dl.planTeam
                            : mySub.plan === "enterprise"
                              ? dl.planEnterprise
                              : dl.planSolo}
                        </Badge>
                        <Badge
                          className={`text-xs ${mySub.status === "active" ? "bg-secondary/15 text-secondary border-secondary/30" : "bg-amber-100 text-amber-700 border-amber-200"}`}
                        >
                          {mySub.status === "active"
                            ? dl.subActive
                            : mySub.status === "trial"
                              ? dl.subTrial
                              : dl.subCancelled}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground font-bold">
                        {mySub.price}€/mois
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-muted/30 border border-border">
                      <p className="text-xs text-muted-foreground mb-1">
                        {dl.startedOn}
                      </p>
                      <p className="font-semibold text-sm text-foreground">
                        {new Date(mySub.startedAt).toLocaleDateString(
                          numLocale,
                        )}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/30 border border-border">
                      <p className="text-xs text-muted-foreground mb-1">
                        {dl.renewsOn}
                      </p>
                      <p className="font-semibold text-sm text-foreground">
                        {new Date(mySub.renewsAt).toLocaleDateString(numLocale)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border">
                    <div>
                      <p className="font-semibold text-sm text-foreground">
                        {dl.tabAI}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {dl.aiIncludedIn}
                      </p>
                    </div>
                    <Badge
                      className={`${mySub.aiAssistantEnabled ? "bg-secondary/15 text-secondary border-secondary/30" : "bg-muted text-muted-foreground border-border"}`}
                    >
                      {mySub.aiAssistantEnabled
                        ? dl.aiActivated
                        : dl.aiDeactivated}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm mb-4">
                    {dl.noSubscription}
                  </p>
                  <Button
                    className="bg-primary hover:bg-primary/90 text-white gap-2"
                    asChild
                  >
                    <Link to="/subscription">{dl.viewPlans}</Link>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          {/* ── KYC tab ─────────────────────────────────────────────────── */}
          <TabsContent value="kyc">
            <KYCTab />
          </TabsContent>

          {/* ── Profile tab ──────────────────────────────────────────────── */}
          <TabsContent value="profile">
            <ProCountrySection lang={lang} />
            <div className="mt-6">
              <ProfileEditTab lang={lang} userId={proUserId} />
            </div>
          </TabsContent>
          {/* ── Bookings tab ────────────────────────────────────────────── */}
          <TabsContent value="bookings">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-lg text-foreground">
                  {dl.tabBookings}
                </h2>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => void navigate({ to: "/pro/schedule" })}
                  data-ocid="pro.schedule.secondary_button"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  {lang === "fr" || lang === "lu"
                    ? "Gérer mon agenda"
                    : lang === "de"
                      ? "Terminplan verwalten"
                      : lang === "es"
                        ? "Gestionar agenda"
                        : lang === "it"
                          ? "Gestisci calendario"
                          : lang === "pt"
                            ? "Gerir calendário"
                            : lang === "nl"
                              ? "Agenda beheren"
                              : "Manage schedule"}
                </Button>
                {/* View toggle */}
                <div className="flex items-center gap-1 border border-border rounded-lg p-0.5 bg-muted/30">
                  <Button
                    size="sm"
                    variant={bookingsView === "list" ? "default" : "ghost"}
                    className="h-7 w-7 p-0"
                    onClick={() => setBookingsView("list")}
                    title={dl.listView}
                    data-ocid="pro.bookings.list.toggle"
                  >
                    <List className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant={bookingsView === "week" ? "default" : "ghost"}
                    className="h-7 w-7 p-0"
                    onClick={() => setBookingsView("week")}
                    title={dl.weeklyView}
                    data-ocid="pro.bookings.week.toggle"
                  >
                    <CalendarDays className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {/* Booking detail modal */}
              {selectedBooking && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
                  data-ocid="pro.booking_detail.modal"
                >
                  <div
                    className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="font-display font-bold text-lg text-foreground">
                        {dl.bookingDetail}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setSelectedBooking(null)}
                        className="text-muted-foreground hover:text-foreground p-1"
                        data-ocid="pro.booking_detail.close_button"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-foreground">
                          {selectedBooking.clientName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>📅 {selectedBooking.date}</span>
                        <span>🕐 {selectedBooking.timeSlot}</span>
                      </div>
                      {selectedBooking.description && (
                        <p className="text-sm text-foreground/80 bg-muted/30 rounded-lg p-3">
                          {selectedBooking.description}
                        </p>
                      )}
                      <div>
                        {(() => {
                          const statusColors: Record<string, string> = {
                            pending:
                              "bg-amber-100 text-amber-800 border-amber-200",
                            accepted:
                              "bg-green-100 text-green-800 border-green-200",
                            declined: "bg-red-100 text-red-700 border-red-200",
                            counter_proposed:
                              "bg-blue-100 text-blue-800 border-blue-200",
                            confirmed:
                              "bg-emerald-100 text-emerald-800 border-emerald-200",
                            cancelled:
                              "bg-gray-100 text-gray-500 border-gray-200",
                          };
                          const statusLabels: Record<string, string> = {
                            pending: dl.bookingStatusPending,
                            accepted: dl.bookingStatusAccepted,
                            declined: dl.bookingStatusDeclined,
                            counter_proposed: dl.bookingStatusCounterProposed,
                            confirmed: dl.bookingStatusConfirmed,
                            cancelled: dl.bookingStatusCancelled,
                          };
                          return (
                            <span
                              className={`text-xs px-2 py-1 rounded-full border font-medium ${statusColors[selectedBooking.status] ?? ""}`}
                            >
                              {statusLabels[selectedBooking.status] ??
                                selectedBooking.status}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                    {selectedBooking.status === "pending" && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => {
                            respondToProBooking(selectedBooking.id, "accepted");
                            toast.success(dl.acceptedBookingToast);
                            setSelectedBooking(null);
                          }}
                          data-ocid="pro.booking_detail.confirm_button"
                        >
                          {dl.acceptBooking}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            respondToProBooking(selectedBooking.id, "declined");
                            setSelectedBooking(null);
                          }}
                          data-ocid="pro.booking_detail.cancel_button"
                        >
                          ✕
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {bookingsView === "week" ? (
                <WeeklyBookingCalendar
                  bookings={myBookings}
                  lang={lang}
                  onBookingClick={setSelectedBooking}
                />
              ) : myBookings.length === 0 ? (
                <div
                  className="bg-white rounded-xl card-shadow border border-border/50 p-12 text-center"
                  data-ocid="pro.bookings.empty_state"
                >
                  <p className="text-3xl mb-3">📅</p>
                  <p className="text-sm text-muted-foreground">
                    {dl.noBookings}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myBookings.map((booking, i) => {
                    const statusColors: Record<string, string> = {
                      pending: "bg-amber-100 text-amber-800 border-amber-200",
                      accepted: "bg-green-100 text-green-800 border-green-200",
                      declined: "bg-red-100 text-red-700 border-red-200",
                      counter_proposed:
                        "bg-blue-100 text-blue-800 border-blue-200",
                      confirmed:
                        "bg-emerald-100 text-emerald-800 border-emerald-200",
                      cancelled: "bg-gray-100 text-gray-500 border-gray-200",
                    };
                    const statusLabels: Record<string, string> = {
                      pending: dl.bookingStatusPending,
                      accepted: dl.bookingStatusAccepted,
                      declined: dl.bookingStatusDeclined,
                      counter_proposed: dl.bookingStatusCounterProposed,
                      confirmed: dl.bookingStatusConfirmed,
                      cancelled: dl.bookingStatusCancelled,
                    };
                    return (
                      <div
                        key={booking.id}
                        className="bg-white rounded-xl card-shadow border border-border/50 p-4"
                        data-ocid={`pro.bookings.item.${i + 1}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground">
                              {booking.clientName}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <span>📅 {booking.date}</span>
                              <span>🕐 {booking.timeSlot}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {booking.description}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${statusColors[booking.status] ?? ""}`}
                          >
                            {statusLabels[booking.status] ?? booking.status}
                          </span>
                        </div>
                        {booking.status === "pending" && (
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => {
                                respondToProBooking(booking.id, "accepted");
                                toast.success(dl.acceptedBookingToast);
                              }}
                              data-ocid={`pro.bookings.accept.confirm_button.${i + 1}`}
                            >
                              {dl.acceptBooking}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs border-red-300 text-red-600"
                              onClick={() =>
                                void navigate({
                                  to: "/booking/$id",
                                  params: { id: booking.id },
                                })
                              }
                              data-ocid={`pro.bookings.detail.button.${i + 1}`}
                            >
                              {dl.detailsBtn}
                            </Button>
                          </div>
                        )}
                        {booking.status === "counter_proposed" && (
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            {dl.awaitingClientConfirm}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

// ─── Country Section ──────────────────────────────────────────────────────────

const COUNTRY_CHANGE_MESSAGES: Record<string, string> = {
  fr: "Pour modifier votre pays, contactez hi@taskvoila.com avec vos justificatifs.",
  ie: "To change your country, contact hi@taskvoila.com with supporting documents.",
  en: "To change your country, contact hi@taskvoila.com with supporting documents.",
  de: "Um Ihr Land zu ändern, kontaktieren Sie hi@taskvoila.com mit Ihren Belegen.",
  es: "Para cambiar su país, contacte hi@taskvoila.com con sus justificantes.",
  it: "Per modificare il paese, contattare hi@taskvoila.com con i documenti giustificativi.",
  pt: "Para alterar o seu país, contacte hi@taskvoila.com com os seus documentos.",
  nl: "Om uw land te wijzigen, neem contact op met hi@taskvoila.com met uw bewijsstukken.",
};

function LockedCountryMessage({ message }: { message: string }) {
  const parts = message.split("hi@taskvoila.com");
  return (
    <p className="text-xs text-muted-foreground max-w-xs">
      {parts[0]}
      <a
        href="mailto:hi@taskvoila.com"
        className="text-primary underline underline-offset-2 hover:text-primary/80"
      >
        hi@taskvoila.com
      </a>
      {parts[1]}
    </p>
  );
}

function ProCountrySection({ lang }: { lang: string }) {
  const { selectedCountry, canChangeCountry, changeCountry } =
    useCountryStore();
  const [showSelector, setShowSelector] = useState(false);
  const countryData = selectedCountry
    ? getCountryByCode(selectedCountry)
    : null;

  const lockedMessage =
    COUNTRY_CHANGE_MESSAGES[lang] ?? COUNTRY_CHANGE_MESSAGES.en;

  const changeLabel =
    lang === "fr"
      ? "Changer de pays"
      : lang === "de"
        ? "Land ändern"
        : lang === "es"
          ? "Cambiar de país"
          : lang === "it"
            ? "Cambia paese"
            : lang === "pt"
              ? "Alterar país"
              : lang === "nl"
                ? "Land wijzigen"
                : "Change country";

  const sectionTitle =
    lang === "fr" ? "Mon pays" : lang === "de" ? "Mein Land" : "My country";

  return (
    <>
      <div className="bg-white rounded-xl card-shadow border border-border/50 overflow-hidden max-w-2xl">
        <div className="p-5 border-b border-border flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <h3 className="font-display font-bold text-base text-foreground">
            {sectionTitle}
          </h3>
        </div>
        <div className="p-5">
          {countryData ? (
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="text-4xl leading-none">
                  {countryData.flag}
                </span>
                <div>
                  <p className="font-semibold text-foreground">
                    {countryData.nameFR}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {countryData.nameEN}
                  </p>
                </div>
                {!canChangeCountry && (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              {canChangeCountry ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-primary/30 text-primary"
                  onClick={() => setShowSelector(true)}
                  data-ocid="pro.country.edit_button"
                >
                  <Globe className="h-4 w-4" />
                  {changeLabel}
                </Button>
              ) : (
                <LockedCountryMessage message={lockedMessage} />
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {lang === "fr" || lang === "lu"
                ? "Aucun pays sélectionné."
                : "No country selected."}
            </p>
          )}
        </div>
      </div>

      {showSelector && (
        <CountrySelector
          onComplete={() => setShowSelector(false)}
          onCountryChange={changeCountry}
        />
      )}
    </>
  );
}

// ─── Profile Edit Tab ─────────────────────────────────────────────────────────

function ProfileEditTab({ lang, userId }: { lang: string; userId: string }) {
  const dl = DASH_PRO_L[lang] ?? DASH_PRO_L.en;
  const { getProfile, setAvatar, setCover, removeAvatar, removeCover } =
    useProfileStore();
  const images = getProfile(userId);

  const [descValue, setDescValue] = useState("");
  const [descError, setDescError] = useState<string | null>(null);
  const [descSaved, setDescSaved] = useState(false);

  function handleDescChange(val: string) {
    // Enforce max length
    const trimmed = val.slice(0, MAX_LENGTHS.proDescription);
    setDescValue(trimmed);
    setDescSaved(false);
    const { hasContact, violations } = detectContactInfo(trimmed);
    if (hasContact) {
      const vList = violations.join(", ");
      setDescError(
        lang === "fr"
          ? `⚠️ Informations de contact détectées (${vList}). Veuillez les retirer.`
          : `⚠️ Contact information detected (${vList}). Please remove them.`,
      );
    } else {
      // Also run profanity/sanitization check
      const sanitized = sanitizeText(trimmed, MAX_LENGTHS.proDescription);
      if (sanitized !== trimmed) {
        setDescValue(sanitized);
      }
      setDescError(null);
    }
  }

  function handleDescSave() {
    if (descError) return;
    setDescSaved(true);
  }

  function handleFileUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "cover",
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploadResult = validateUpload(file, {
      errorSize: dl.fileTooLarge,
      errorType: dl.fileFormat,
    });
    if (!uploadResult.valid) {
      toast.error(uploadResult.error);
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (type === "avatar") setAvatar(userId, dataUrl);
      else setCover(userId, dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Security warning */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4">
        <ShieldAlert className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800 mb-1">
            {dl.warningTitle}
          </p>
          <p className="text-xs text-amber-700">{dl.warningDesc}</p>
        </div>
      </div>

      {/* Cover image */}
      <div className="bg-white rounded-xl card-shadow border border-border/50 overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2">
            <Image className="h-4 w-4 text-primary" />
            {dl.coverImageTitle}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {dl.coverImageHint}
          </p>
        </div>
        <div className="p-5">
          {/* Preview */}
          <div className="relative h-28 rounded-xl overflow-hidden bg-primary-gradient mb-4">
            {images.coverDataUrl ? (
              <img
                src={images.coverDataUrl}
                alt="cover preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white/70 text-sm">{dl.noImage}</p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e, "cover")}
                data-ocid="pro.cover.upload_button"
              />
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer">
                <Camera className="h-4 w-4" />
                {dl.changePhoto}
              </span>
            </label>
            {images.coverDataUrl && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
                onClick={() => removeCover(userId)}
                data-ocid="pro.cover.delete_button"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {dl.removePhoto}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Profile photo */}
      <div className="bg-white rounded-xl card-shadow border border-border/50 overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            {dl.profilePhotoTitle}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {dl.profilePhotoHint}
          </p>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-5 mb-4">
            {/* Avatar preview */}
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-secondary to-primary flex items-center justify-center shrink-0">
              {images.avatarDataUrl ? (
                <img
                  src={images.avatarDataUrl}
                  alt="avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-2xl select-none">
                  MD
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-1">
                {dl.photoVisibility}
              </p>
              <p className="text-xs text-muted-foreground">{dl.photoTrust}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e, "avatar")}
                data-ocid="pro.avatar.upload_button"
              />
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer">
                <Camera className="h-4 w-4" />
                {dl.changePhoto}
              </span>
            </label>
            {images.avatarDataUrl && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
                onClick={() => removeAvatar(userId)}
                data-ocid="pro.avatar.delete_button"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {dl.removePhoto}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Description with live contact detection */}
      <div className="bg-white rounded-xl card-shadow border border-border/50 overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2">
            <PenLine className="h-4 w-4 text-primary" />
            {dl.descTitle}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">{dl.descHint}</p>
        </div>
        <div className="p-5">
          <textarea
            className={`w-full min-h-[120px] rounded-xl border p-3 text-sm resize-none focus:outline-none focus:ring-2 transition-colors ${
              descError
                ? "border-destructive/50 focus:ring-destructive/30 bg-destructive/5"
                : "border-border focus:ring-primary/30"
            }`}
            placeholder={dl.descPlaceholder}
            value={descValue}
            onChange={(e) => handleDescChange(e.target.value)}
            data-ocid="pro.description.textarea"
          />
          <div className="flex justify-end mt-1">
            <span
              className={`text-xs ${descValue.length >= MAX_LENGTHS.proDescription ? "text-destructive" : "text-muted-foreground"}`}
            >
              {descValue.length}/{MAX_LENGTHS.proDescription}
            </span>
          </div>
          {descError && (
            <div className="mt-2 flex items-start gap-2 text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{descError}</span>
            </div>
          )}
          {descSaved && !descError && (
            <div className="mt-2 flex items-center gap-2 text-xs text-secondary bg-secondary/10 rounded-lg px-3 py-2">
              <CheckCircle className="h-3.5 w-3.5" />
              {dl.descSavedMsg}
            </div>
          )}
          <Button
            size="sm"
            className="mt-3 bg-primary hover:bg-primary/90 text-white"
            disabled={!!descError || !descValue.trim()}
            onClick={handleDescSave}
            data-ocid="pro.description.save_button"
          >
            {dl.saveBtn}
          </Button>
        </div>
      </div>
    </div>
  );
}

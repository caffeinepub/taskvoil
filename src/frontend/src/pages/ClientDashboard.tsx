import { CountrySelector } from "@/components/onboarding/CountrySelector";
import { IncompleteProfileBanner } from "@/components/profile/IncompleteProfileBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/lib/auth-store";
import { useCalendarStore } from "@/lib/calendar-store";
import { useChatStore } from "@/lib/chat-store";
import { getCountryByCode } from "@/lib/countries-data";
import { useCountryStore } from "@/lib/country-store";
import { categoryEmojis, getN2ForN1, n1Categories } from "@/lib/demo-data";
import { useDocumentStore } from "@/lib/document-store";
import { useTranslation } from "@/lib/i18n";
import { useMissionStore } from "@/lib/mission-store";
import { useNFTStore } from "@/lib/nft-store";
import { useOfferStore } from "@/lib/offer-store";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Award,
  Calendar,
  CheckCircle,
  ChevronRight,
  CreditCard,
  ExternalLink,
  FileText,
  Film,
  Globe,
  ImageIcon,
  Lock,
  MapPin,
  MessageSquare,
  PenLine,
  Plus,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type MediaFile = {
  id: string;
  file: File;
  preview: string;
  type: "photo" | "video";
};

const DASH_CLIENT_L: Record<
  string,
  {
    active: string;
    completed: string;
    spent: string;
    rating: string;
    needPro: string;
    needProDesc: string;
    pay: string;
    viewOffers: string;
    missionCreated: string;
    missionCreatedDesc: string;
  }
> = {
  fr: {
    active: "Actives",
    completed: "Terminées",
    spent: "Dépensés",
    rating: "Note",
    needPro: "Besoin d'un pro ?",
    needProDesc:
      "Publiez votre mission et recevez des offres de professionnels vérifiés.",
    pay: "Payer",
    viewOffers: "Voir les offres",
    missionCreated: "Mission créée avec succès !",
    missionCreatedDesc: "Les professionnels vont bientôt vous contacter.",
  },
  en: {
    active: "Active",
    completed: "Completed",
    spent: "Spent",
    rating: "Rating",
    needPro: "Need a professional?",
    needProDesc:
      "Post your task and receive offers from verified professionals.",
    pay: "Pay",
    viewOffers: "View offers",
    missionCreated: "Task created successfully!",
    missionCreatedDesc: "Professionals will contact you shortly.",
  },
  de: {
    active: "Aktive",
    completed: "Abgeschlossen",
    spent: "Ausgegeben",
    rating: "Bewertung",
    needPro: "Einen Profi gesucht?",
    needProDesc:
      "Stellen Sie Ihre Aufgabe ein und erhalten Sie Angebote von verifizierten Profis.",
    pay: "Bezahlen",
    viewOffers: "Angebote ansehen",
    missionCreated: "Aufgabe erfolgreich erstellt!",
    missionCreatedDesc: "Profis werden sich bald bei Ihnen melden.",
  },
  es: {
    active: "Activas",
    completed: "Completadas",
    spent: "Gastados",
    rating: "Valoración",
    needPro: "¿Necesita un profesional?",
    needProDesc:
      "Publique su tarea y reciba ofertas de profesionales verificados.",
    pay: "Pagar",
    viewOffers: "Ver ofertas",
    missionCreated: "¡Tarea creada con éxito!",
    missionCreatedDesc: "Los profesionales se pondrán en contacto pronto.",
  },
  it: {
    active: "Attive",
    completed: "Completate",
    spent: "Spesi",
    rating: "Valutazione",
    needPro: "Hai bisogno di un professionista?",
    needProDesc:
      "Pubblica la tua missione e ricevi offerte da professionisti verificati.",
    pay: "Paga",
    viewOffers: "Vedi le offerte",
    missionCreated: "Missione creata con successo!",
    missionCreatedDesc: "I professionisti ti contatteranno presto.",
  },
  pt: {
    active: "Ativas",
    completed: "Concluídas",
    spent: "Gastos",
    rating: "Avaliação",
    needPro: "Precisa de um profissional?",
    needProDesc:
      "Publique a sua tarefa e receba propostas de profissionais verificados.",
    pay: "Pagar",
    viewOffers: "Ver propostas",
    missionCreated: "Tarefa criada com sucesso!",
    missionCreatedDesc: "Os profissionais entrarão em contacto em breve.",
  },
  nl: {
    active: "Actieve",
    completed: "Voltooid",
    spent: "Uitgegeven",
    rating: "Beoordeling",
    needPro: "Een professional nodig?",
    needProDesc:
      "Plaats uw taak en ontvang offertes van geverifieerde professionals.",
    pay: "Betalen",
    viewOffers: "Offertes bekijken",
    missionCreated: "Taak succesvol aangemaakt!",
    missionCreatedDesc: "Professionals nemen binnenkort contact met u op.",
  },
  el: {
    active: "Ενεργές",
    completed: "Ολοκληρωμένες",
    spent: "Δαπανήθηκαν",
    rating: "Βαθμολογία",
    needPro: "Χρειάζεστε επαγγελματία;",
    needProDesc: "Δημοσιεύστε την αποστολή σας και λάβετε προσφορές.",
    pay: "Πληρωμή",
    viewOffers: "Προβολή προσφορών",
    missionCreated: "Αποστολή δημιουργήθηκε!",
    missionCreatedDesc: "Οι επαγγελματίες θα επικοινωνήσουν σύντομα.",
  },
};

const NUM_LOCALE_CLIENT: Record<string, string> = {
  fr: "fr-FR",
  en: "en-GB",
  de: "de-DE",
  es: "es-ES",
  it: "it-IT",
  pt: "pt-PT",
  nl: "nl-NL",
  el: "el-GR",
  ie: "en-IE",
};

export function ClientDashboard() {
  const { t, lang } = useTranslation();
  const { currentUser } = useAuthStore();

  const dl = DASH_CLIENT_L[lang] ?? DASH_CLIENT_L.en;
  const _numLocale = NUM_LOCALE_CLIENT[lang] ?? "en-GB";
  const navigate = useNavigate();
  useEffect(() => {
    if (!currentUser) void navigate({ to: "/login" });
  }, [currentUser, navigate]);
  const { getConversationsForUser } = useChatStore();
  const userId = currentUser ? String(currentUser.id) : "";
  const { getBookingsForClient, confirmCounterProposal, cancelBooking } =
    useCalendarStore();
  const myClientBookings = userId ? getBookingsForClient(userId) : [];
  const myConversations = getConversationsForUser(userId);
  const { getNFTsByUser } = useNFTStore();
  const myNFTs = getNFTsByUser(userId);
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryN1: "",
    categoryN2: "",
    city: "",
    budgetMin: "",
    budgetMax: "",
    scheduledDate: "",
  });

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const { getDocumentsByUser } = useDocumentStore();
  const myDocs = getDocumentsByUser(userId, "client");
  const awaitingSignature = myDocs.filter(
    (d) => d.status === "sent" && d.docType === "bonPourAccord",
  );

  const { listMissionsByUser, createMission } = useMissionStore();
  const { getOffersForMission } = useOfferStore();
  const myMissions = userId ? listMissionsByUser(userId) : [];
  const activeTasks = myMissions.filter(
    (m) => m.status === "open" || m.status === "in_progress",
  ).length;
  const completedTasks = myMissions.filter(
    (m) => m.status === "paid" || m.status === "completed",
  ).length;

  // Derived: N2 options for selected N1
  const n2Options = form.categoryN1 ? getN2ForN1(form.categoryN1) : [];

  function updateForm(field: string, value: string) {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "categoryN1") updated.categoryN2 = "";
      return updated;
    });
  }

  function handleAddPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const newFiles: MediaFile[] = files
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 5 - mediaFiles.filter((m) => m.type === "photo").length)
      .map((file) => ({
        id: `${Date.now()}-${file.name}`,
        file,
        preview: URL.createObjectURL(file),
        type: "photo" as const,
      }));
    setMediaFiles((prev) => [...prev, ...newFiles]);
    if (photoInputRef.current) photoInputRef.current.value = "";
  }

  function handleAddVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("video/")) return;
    const newFile: MediaFile = {
      id: `${Date.now()}-${file.name}`,
      file,
      preview: URL.createObjectURL(file),
      type: "video",
    };
    setMediaFiles((prev) => [
      ...prev.filter((m) => m.type !== "video"),
      newFile,
    ]);
    if (videoInputRef.current) videoInputRef.current.value = "";
  }

  function removeMedia(id: string) {
    setMediaFiles((prev) => {
      const removed = prev.find((m) => m.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((m) => m.id !== id);
    });
  }

  function handleCreateMission(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;
    createMission({
      title: form.title,
      description: form.description,
      category: form.categoryN1,
      subcategory: form.categoryN2 || undefined,
      city: form.city,
      country: currentUser.country,
      budgetMin: Number(form.budgetMin) || 0,
      budgetMax: Number(form.budgetMax) || 0,
      date: form.scheduledDate || undefined,
      status: "open",
      authorId: String(currentUser.id),
      authorPseudo:
        currentUser.pseudo ?? currentUser.firstName ?? "Utilisateur",
      authorRole: "client",
    });
    setModalOpen(false);
    toast.success(dl.missionCreated, {
      description: dl.missionCreatedDesc,
    });
    for (const m of mediaFiles) URL.revokeObjectURL(m.preview);
    setMediaFiles([]);
    setForm({
      title: "",
      description: "",
      categoryN1: "",
      categoryN2: "",
      city: "",
      budgetMin: "",
      budgetMax: "",
      scheduledDate: "",
    });
  }

  function handleClose() {
    setModalOpen(false);
    for (const m of mediaFiles) URL.revokeObjectURL(m.preview);
    setMediaFiles([]);
  }

  // totalSpent: sum confirmed payments for user's missions
  const totalSpent = 0;

  const photoFiles = mediaFiles.filter((m) => m.type === "photo");
  const videoFile = mediaFiles.find((m) => m.type === "video");
  const canAddMorePhotos = photoFiles.length < 5;

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            {t.dashboard.welcome}, {currentUser?.firstName ?? ""} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {t.dashboard.client.title}
          </p>
        </div>

        <IncompleteProfileBanner />
        {/* Stats — 4 card rectangles */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          data-ocid="client.stats.panel"
        >
          <div className="rounded-xl bg-white border border-border/50 card-shadow p-4 flex flex-col items-center justify-center text-center gap-1">
            <span className="text-xl">✅</span>
            <p className="text-2xl font-bold text-foreground">{activeTasks}</p>
            <p className="text-xs text-muted-foreground">{dl.active}</p>
          </div>
          <div className="rounded-xl bg-white border border-border/50 card-shadow p-4 flex flex-col items-center justify-center text-center gap-1">
            <span className="text-xl">🏁</span>
            <p className="text-2xl font-bold text-foreground">
              {completedTasks}
            </p>
            <p className="text-xs text-muted-foreground">{dl.completed}</p>
          </div>
          <div className="rounded-xl bg-white border border-border/50 card-shadow p-4 flex flex-col items-center justify-center text-center gap-1">
            <span className="text-xl">💶</span>
            <p className="text-2xl font-bold text-foreground">{totalSpent}€</p>
            <p className="text-xs text-muted-foreground">{dl.spent}</p>
          </div>
          <div className="rounded-xl bg-white border border-border/50 card-shadow p-4 flex flex-col items-center justify-center text-center gap-1">
            <span className="text-xl">⭐</span>
            <p className="text-2xl font-bold text-foreground">–</p>
            <p className="text-xs text-muted-foreground">{dl.rating}</p>
          </div>
        </div>

        {/* Quick Action */}
        <div
          className="rounded-xl p-6 mb-8 text-white"
          style={{
            background: "linear-gradient(135deg, #b45309 0%, #92400e 100%)",
          }}
        >
          <h2 className="font-display text-lg font-bold mb-2">{dl.needPro}</h2>
          <p className="text-white text-sm mb-4 opacity-90">{dl.needProDesc}</p>
          <Button
            onClick={() => setModalOpen(true)}
            className="bg-white text-primary hover:bg-white/90 font-semibold gap-2"
            data-ocid="client.mission.open_modal_button"
          >
            <Plus className="h-4 w-4" />
            {t.dashboard.client.postNew}
          </Button>
        </div>

        {/* Missions List */}
        <div className="bg-white rounded-xl card-shadow border border-border/50 overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-foreground">
              {t.dashboard.client.myMissions}
            </h2>
            <Button
              size="sm"
              variant="ghost"
              className="text-primary"
              onClick={() => void navigate({ to: "/marketplace" })}
            >
              {t.common.seeAll}
            </Button>
          </div>

          {myMissions.length === 0 ? (
            <div
              className="p-12 text-center"
              data-ocid="client.missions.empty_state"
            >
              <p className="text-4xl mb-4">📋</p>
              <h3 className="font-display font-bold text-foreground mb-2">
                {t.dashboard.client.noMissions}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {t.dashboard.client.noMissionsDesc}
              </p>
              <Button
                onClick={() => setModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                data-ocid="client.missions.create_button"
              >
                <Plus className="h-4 w-4" />
                {t.dashboard.client.postNew}
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {myMissions.slice(0, 5).map((mission, i) => {
                const offers = getOffersForMission(mission.id);
                const statusColor =
                  mission.status === "open"
                    ? "bg-secondary/20 text-secondary border-secondary/30"
                    : mission.status === "in_progress"
                      ? "bg-warning/20 text-foreground border-warning/30"
                      : mission.status === "accepted"
                        ? "bg-primary/20 text-primary border-primary/30"
                        : mission.status === "paid"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-muted text-muted-foreground border-border";
                const statusLabel =
                  mission.status === "open"
                    ? lang === "fr"
                      ? "Ouverte"
                      : "Open"
                    : mission.status === "in_progress"
                      ? lang === "fr"
                        ? "En cours"
                        : "In progress"
                      : mission.status === "accepted"
                        ? lang === "fr"
                          ? "Acceptée"
                          : "Accepted"
                        : mission.status === "paid"
                          ? lang === "fr"
                            ? "Payée"
                            : "Paid"
                          : lang === "fr"
                            ? "Terminée"
                            : "Completed";
                return (
                  <div
                    key={mission.id}
                    className="p-4 hover:bg-muted/20 transition-colors"
                    data-ocid={`client.missions.item.${i + 1}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <button
                          type="button"
                          className="text-left w-full"
                          onClick={() =>
                            void navigate({ to: `/mission/${mission.id}` })
                          }
                        >
                          <p className="font-semibold text-foreground text-sm truncate hover:text-primary transition-colors">
                            {mission.title}
                          </p>
                        </button>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColor}`}
                          >
                            {statusLabel}
                          </span>
                          {mission.city && (
                            <span className="text-xs text-muted-foreground">
                              📍 {mission.city}
                            </span>
                          )}
                          {mission.status === "open" && offers.length > 0 && (
                            <span className="text-xs text-primary font-medium">
                              {offers.length}{" "}
                              {lang === "fr"
                                ? "offre(s) reçue(s)"
                                : "offer(s) received"}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {mission.budgetMin}€ - {mission.budgetMax}€
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {mission.status === "accepted" && (
                          <Button
                            size="sm"
                            className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1"
                            onClick={() =>
                              void navigate({ to: `/payment/${mission.id}` })
                            }
                            data-ocid={`client.missions.pay_button.${i + 1}`}
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            {dl.pay}
                          </Button>
                        )}
                        {mission.status === "open" && offers.length > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs border-primary/30 text-primary gap-1"
                            onClick={() =>
                              void navigate({ to: `/mission/${mission.id}` })
                            }
                            data-ocid={`client.missions.view_offers_button.${i + 1}`}
                          >
                            {dl.viewOffers}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            void navigate({ to: `/mission/${mission.id}` })
                          }
                        >
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Messages section */}
        <div className="bg-white rounded-xl card-shadow border border-border/50 overflow-hidden mt-6">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h2 className="font-display font-bold text-lg text-foreground">
                {"Messages"}
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
            <div className="p-12 text-center">
              <p className="text-4xl mb-4">💬</p>
              <p className="text-sm text-muted-foreground">
                {lang === "fr"
                  ? "Aucun message pour l'instant."
                  : "No messages yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {myConversations.slice(0, 3).map((conv) => {
                const other = conv.participants.find((p) => p.id !== userId);
                const lastMsg = conv.messages[conv.messages.length - 1];
                return (
                  <button
                    type="button"
                    key={conv.id}
                    className="w-full text-left p-5 hover:bg-muted/30 transition-colors"
                    onClick={() =>
                      void navigate({
                        to: "/messages",
                        search: { conv: conv.id },
                      })
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {other?.name.slice(0, 1) ?? "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-foreground truncate">
                            {other?.name ?? "Professionnel"}
                          </p>
                          {conv.taskTitle && (
                            <span className="text-xs text-primary shrink-0 truncate max-w-[140px]">
                              📋 {conv.taskTitle}
                            </span>
                          )}
                        </div>
                        {lastMsg && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {lastMsg.senderId === userId
                              ? lang === "fr"
                                ? "Vous : "
                                : "You: "
                              : ""}
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

        {/* Documents section */}
        <div
          className="bg-white rounded-xl card-shadow border border-border/50 overflow-hidden mt-6"
          data-ocid="client.documents.section"
        >
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h2 className="font-display font-bold text-lg text-foreground">
                {"Documents"}
              </h2>
              {awaitingSignature.length > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-warning text-white rounded-full">
                  {awaitingSignature.length}
                </span>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-primary"
              onClick={() => void navigate({ to: "/documents" })}
              data-ocid="client.documents.see_all_button"
            >
              {t.common.seeAll}
            </Button>
          </div>

          {myDocs.length === 0 ? (
            <div
              className="p-12 text-center"
              data-ocid="client.documents.empty_state"
            >
              <p className="text-4xl mb-4">📄</p>
              <p className="text-sm text-muted-foreground">
                {lang === "fr"
                  ? "Aucun document pour l'instant."
                  : "No documents yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {/* Awaiting signature highlight */}
              {awaitingSignature.length > 0 && (
                <div className="p-4 bg-warning/5 border-b border-warning/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
                      <PenLine className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-foreground">
                        {awaitingSignature.length}{" "}
                        {lang === "fr"
                          ? "document(s) en attente de signature"
                          : "document(s) awaiting signature"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {awaitingSignature[0].missionTitle}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-warning hover:bg-warning/90 text-white gap-1 shrink-0 h-8 text-xs"
                      onClick={() => void navigate({ to: "/documents" })}
                      data-ocid="client.documents.sign_button"
                    >
                      <PenLine className="h-3.5 w-3.5" />
                      {lang === "fr" ? "Signer" : "Sign"}
                    </Button>
                  </div>
                </div>
              )}

              {myDocs.slice(0, 3).map((doc, i) => (
                <div
                  key={doc.id}
                  className="p-4 hover:bg-muted/20 transition-colors flex items-center gap-3"
                  data-ocid={`client.documents.item.${i + 1}`}
                >
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {doc.missionTitle}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        {doc.docType === "devis"
                          ? lang === "fr"
                            ? "Devis"
                            : "Quote"
                          : doc.docType === "bonPourAccord"
                            ? lang === "fr"
                              ? "Bon pour accord"
                              : "Agreement"
                            : lang === "fr"
                              ? "Facture"
                              : "Invoice"}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span
                        className={`text-xs font-medium ${
                          doc.status === "signed"
                            ? "text-secondary"
                            : doc.status === "sent"
                              ? "text-primary"
                              : "text-muted-foreground"
                        }`}
                      >
                        {doc.status === "signed"
                          ? lang === "fr"
                            ? "Signé"
                            : "Signed"
                          : doc.status === "sent"
                            ? lang === "fr"
                              ? "Envoyé"
                              : "Sent"
                            : lang === "fr"
                              ? "Brouillon"
                              : "Draft"}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0 h-8 text-xs text-primary"
                    onClick={() => void navigate({ to: "/documents" })}
                    data-ocid={`client.documents.view_button.${i + 1}`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* NFT Proofs section */}
      <div className="bg-white rounded-xl card-shadow border border-border/50 overflow-hidden mt-6">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-secondary" />
            <h2 className="font-display font-bold text-lg text-foreground">
              {"NFT Proofs"}
            </h2>
            {myNFTs.length > 0 && (
              <Badge className="bg-secondary/15 text-secondary border-secondary/30 text-xs">
                {myNFTs.length}
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-primary text-xs gap-1"
            asChild
            data-ocid="client.nft.gallery.button"
          >
            <Link to="/nfts">
              <ExternalLink className="h-3 w-3" />
              {lang === "fr" ? "Voir tout" : "See all"}
            </Link>
          </Button>
        </div>

        {myNFTs.length === 0 ? (
          <div className="p-12 text-center" data-ocid="client.nft.empty_state">
            <p className="text-3xl mb-3">🖼️</p>
            <p className="text-sm text-muted-foreground">
              {lang === "fr"
                ? "Vos preuves NFT apparaîtront ici après validation des jalons."
                : "Your NFT proofs will appear here after milestone validation."}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
            {myNFTs.slice(0, 3).map((nft, i) => (
              <div
                key={nft.id}
                className="rounded-xl border border-border/60 overflow-hidden hover:shadow-md transition-shadow"
                data-ocid={`client.nft.item.${i + 1}`}
              >
                <div className="aspect-video bg-muted/40 relative overflow-hidden">
                  <img
                    src={nft.imageUrl}
                    alt={nft.description}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
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

      {/* Country Section */}
      {/* Bookings Section */}
      <div className="container mx-auto px-4 pb-2">
        <div className="bg-white rounded-xl card-shadow border border-border/50 overflow-hidden mt-6">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <h2 className="font-display font-bold text-lg text-foreground">
                {lang === "fr"
                  ? "Mes ru00e9servations"
                  : lang === "de"
                    ? "Meine Buchungen"
                    : lang === "es"
                      ? "Mis reservas"
                      : lang === "it"
                        ? "Le mie prenotazioni"
                        : lang === "pt"
                          ? "As minhas reservas"
                          : lang === "nl"
                            ? "Mijn boekingen"
                            : "My Bookings"}
              </h2>
            </div>
          </div>
          {myClientBookings.length === 0 ? (
            <div
              className="p-12 text-center"
              data-ocid="client.bookings.empty_state"
            >
              <p className="text-4xl mb-4">ud83dudcc5</p>
              <p className="text-sm text-muted-foreground">
                {lang === "fr"
                  ? "Aucune ru00e9servation pour l'instant."
                  : "No bookings yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {myClientBookings.slice(0, 5).map((booking, i) => {
                const statusColors: Record<string, string> = {
                  pending: "bg-amber-100 text-amber-800 border-amber-200",
                  accepted: "bg-green-100 text-green-800 border-green-200",
                  declined: "bg-red-100 text-red-700 border-red-200",
                  counter_proposed: "bg-blue-100 text-blue-800 border-blue-200",
                  confirmed:
                    "bg-emerald-100 text-emerald-800 border-emerald-200",
                  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
                };
                const statusLabels: Record<string, string> = {
                  pending: lang === "fr" ? "En attente" : "Pending",
                  accepted: lang === "fr" ? "Acceptu00e9e" : "Accepted",
                  declined: lang === "fr" ? "Refusu00e9e" : "Declined",
                  counter_proposed:
                    lang === "fr" ? "Contre-proposition" : "Counter-proposal",
                  confirmed: lang === "fr" ? "Confirmu00e9e" : "Confirmed",
                  cancelled: lang === "fr" ? "Annulu00e9e" : "Cancelled",
                };
                return (
                  <div
                    key={booking.id}
                    className="p-4 hover:bg-muted/20 transition-colors"
                    data-ocid={`client.bookings.item.${i + 1}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground">
                          {booking.proName}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>ud83dudcc5 {booking.date}</span>
                          <span>ud83dudd50 {booking.timeSlot}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {booking.description}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${statusColors[booking.status] ?? ""}`}
                      >
                        {statusLabels[booking.status] ?? booking.status}
                      </span>
                    </div>
                    {booking.status === "counter_proposed" && (
                      <div className="mt-2 space-y-2">
                        <p className="text-xs text-blue-700 font-medium">
                          {lang === "fr"
                            ? "Nouvelle date proposu00e9e"
                            : "New date proposed"}
                          : {booking.counterDate} u00e0 {booking.counterTime}
                        </p>
                        <Button
                          size="sm"
                          className="h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                          onClick={() => {
                            confirmCounterProposal(booking.id);
                            toast.success(
                              lang === "fr"
                                ? "Nouvelle date confirmu00e9e !"
                                : "New date confirmed!",
                            );
                          }}
                          data-ocid={`client.bookings.confirm.confirm_button.${i + 1}`}
                        >
                          {lang === "fr"
                            ? "Confirmer la nouvelle date"
                            : "Confirm new date"}
                        </Button>
                      </div>
                    )}
                    {(booking.status === "pending" ||
                      booking.status === "counter_proposed") && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-destructive mt-2"
                        onClick={() => {
                          cancelBooking(booking.id);
                          toast.success(
                            lang === "fr" ? "Annulu00e9e." : "Cancelled.",
                          );
                        }}
                        data-ocid={`client.bookings.cancel.delete_button.${i + 1}`}
                      >
                        {lang === "fr"
                          ? "Annuler la ru00e9servation"
                          : "Cancel booking"}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="container mx-auto px-4 pb-2">
        <ClientCountrySection lang={lang} />
      </div>

      {/* Create Mission Modal */}
      <Dialog open={modalOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {t.dashboard.client.newMissionTitle}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateMission} className="space-y-4 mt-2">
            {/* Title */}
            <div className="space-y-1.5">
              <Label>{t.dashboard.client.missionTitle}</Label>
              <Input
                required
                value={form.title}
                onChange={(e) => updateForm("title", e.target.value)}
                placeholder={t.dashboard.client.missionTitlePlaceholder}
                data-ocid="client.mission.title_input"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label>{t.dashboard.client.description}</Label>
              <Textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                placeholder={t.dashboard.client.descriptionPlaceholder}
                data-ocid="client.mission.description_textarea"
              />
            </div>

            {/* Category N1 */}
            <div className="space-y-1.5">
              <Label>{t.dashboard.client.category}</Label>
              <Select
                value={form.categoryN1}
                onValueChange={(v) => updateForm("categoryN1", v)}
              >
                <SelectTrigger data-ocid="client.mission.category_select">
                  <SelectValue
                    placeholder={t.dashboard.client.selectCategory}
                  />
                </SelectTrigger>
                <SelectContent>
                  {n1Categories
                    .sort((a, b) => a.order - b.order)
                    .map((cat) => (
                      <SelectItem key={cat.key} value={cat.key}>
                        <span className="flex items-center gap-2">
                          <span>{cat.emoji}</span>
                          <span>
                            {lang === "fr" ? cat.labelFR : cat.labelEN}
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category N2 */}
            {form.categoryN1 && n2Options.length > 0 && (
              <div className="space-y-1.5">
                <Label>{t.dashboard.client.subCategory}</Label>
                <Select
                  value={form.categoryN2}
                  onValueChange={(v) => updateForm("categoryN2", v)}
                >
                  <SelectTrigger data-ocid="client.mission.subcategory_select">
                    <SelectValue
                      placeholder={t.dashboard.client.selectSubCategory}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {n2Options.map((n2) => (
                      <SelectItem key={n2.key} value={n2.key}>
                        {lang === "fr" ? n2.labelFR : n2.labelEN}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* City */}
            <div className="space-y-1.5">
              <Label>{t.dashboard.client.city}</Label>
              <Input
                value={form.city}
                onChange={(e) => updateForm("city", e.target.value)}
                placeholder="Paris"
                data-ocid="client.mission.city_input"
              />
            </div>

            {/* Budget */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t.dashboard.client.budgetMin}</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.budgetMin}
                  onChange={(e) => updateForm("budgetMin", e.target.value)}
                  placeholder="50"
                  data-ocid="client.mission.budget_min_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t.dashboard.client.budgetMax}</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.budgetMax}
                  onChange={(e) => updateForm("budgetMax", e.target.value)}
                  placeholder="200"
                  data-ocid="client.mission.budget_max_input"
                />
              </div>
            </div>

            {/* Scheduled Date */}
            <div className="space-y-1.5">
              <Label>{t.dashboard.client.scheduledDate}</Label>
              <Input
                type="date"
                value={form.scheduledDate}
                onChange={(e) => updateForm("scheduledDate", e.target.value)}
                data-ocid="client.mission.date_input"
              />
            </div>

            {/* Media Upload Section */}
            <div className="space-y-3 rounded-xl border border-dashed border-border bg-muted/30 p-4">
              <div>
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  {t.dashboard.client.mediaTitle}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t.dashboard.client.mediaHint}
                </p>
              </div>

              {/* Photo previews */}
              {photoFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {photoFiles.map((m) => (
                    <div key={m.id} className="relative group">
                      <img
                        src={m.preview}
                        alt="preview"
                        className="w-16 h-16 object-cover rounded-lg border border-border"
                      />
                      <button
                        type="button"
                        onClick={() => removeMedia(m.id)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Video preview */}
              {videoFile && (
                <div className="flex items-center gap-3 bg-white rounded-lg p-2.5 border border-border">
                  <Film className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {videoFile.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(videoFile.file.size / 1024 / 1024).toFixed(1)} Mo
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMedia(videoFile.id)}
                    className="text-destructive hover:text-destructive/80 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Upload buttons */}
              <div className="flex flex-wrap gap-2">
                {canAddMorePhotos && (
                  <>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="hidden"
                      onChange={handleAddPhotos}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2 text-xs"
                      onClick={() => photoInputRef.current?.click()}
                      data-ocid="client.mission.photo_upload_button"
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                      {t.dashboard.client.addPhotos}
                      {photoFiles.length > 0 && (
                        <span className="text-muted-foreground">
                          ({photoFiles.length}/5)
                        </span>
                      )}
                    </Button>
                  </>
                )}

                {!videoFile && (
                  <>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/mp4,video/quicktime,video/avi,video/*"
                      className="hidden"
                      onChange={handleAddVideo}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2 text-xs"
                      onClick={() => videoInputRef.current?.click()}
                      data-ocid="client.mission.video_upload_button"
                    >
                      <Film className="h-3.5 w-3.5" />
                      {t.dashboard.client.addVideo}
                    </Button>
                  </>
                )}
              </div>

              <p className="text-xs text-muted-foreground/70 italic">
                {lang === "fr"
                  ? "💡 Une photo ou vidéo aide le professionnel à évaluer les travaux avant de se déplacer."
                  : "💡 A photo or video helps the professional estimate the work before visiting."}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                data-ocid="client.mission.cancel_button"
              >
                <X className="h-4 w-4 mr-2" />
                {t.dashboard.client.cancel}
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                data-ocid="client.mission.submit_button"
              >
                {t.dashboard.client.create}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}

// ── Country Section ──────────────────────────────────────────────────────────

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
  // Split around "hi@taskvoila.com" to render it as a mailto link
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

function ClientCountrySection({ lang }: { lang: string }) {
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
      <div className="bg-white rounded-xl card-shadow border border-border/50 overflow-hidden mt-6 mb-6">
        <div className="p-5 border-b border-border flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <h2 className="font-display font-bold text-lg text-foreground">
            {sectionTitle}
          </h2>
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
                  data-ocid="client.country.edit_button"
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
              {lang === "fr"
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

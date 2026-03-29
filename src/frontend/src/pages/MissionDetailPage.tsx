import { CallModal } from "@/components/call/CallModal";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/lib/auth-store";
import { containsContactInfo, useChatStore } from "@/lib/chat-store";
import { categoryEmojis } from "@/lib/demo-data";
import { useDocumentStore } from "@/lib/document-store";
import { useTranslation } from "@/lib/i18n";
import { useMissionStore } from "@/lib/mission-store";
import { type Offer, useOfferStore } from "@/lib/offer-store";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  CreditCard,
  FileText,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  ShieldAlert,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function MissionDetailPage() {
  const { id } = useParams({ strict: false }) as { id?: string };
  const navigate = useNavigate();
  const { lang, t } = useTranslation();
  const { currentUser } = useAuthStore();
  const { getMissionById, updateMissionStatus } = useMissionStore();
  const {
    getOffersForMission,
    getAcceptedOffer,
    submitOffer,
    acceptOffer,
    hasProSubmittedOffer,
  } = useOfferStore();
  const { getOrCreateConversation, getConversation, sendMessage } =
    useChatStore();
  const { createDocument } = useDocumentStore();

  const mission = id ? getMissionById(id) : undefined;
  const offers = id ? getOffersForMission(id) : [];
  const acceptedOffer = id ? getAcceptedOffer(id) : undefined;

  const userId = currentUser ? String(currentUser.id) : "";
  const userName =
    currentUser?.pseudo ??
    (`${currentUser?.firstName ?? ""} ${currentUser?.lastName ?? ""}`.trim() ||
      (lang === "fr" ? "Vous" : "You"));

  const isAuthor = mission ? mission.authorId === userId : false;
  const isPro = currentUser?.role === "pro";
  const proAlreadyOffered =
    id && userId ? hasProSubmittedOffer(id, userId) : false;

  // Chat setup
  const convId =
    mission && userId
      ? getOrCreateConversation(
          Math.abs(
            Number.parseInt(mission.id.replace(/\D/g, "").slice(-8), 10),
          ) || undefined,
          isAuthor ? userId : mission.authorId,
          isAuthor ? (offers[0]?.proId ?? userId) : userId,
          mission.title,
          isAuthor ? userName : mission.authorPseudo,
          isAuthor ? (offers[0]?.proPseudo ?? "Professionnel") : userName,
        )
      : null;
  const conversation = convId ? getConversation(convId) : null;

  const [newMessage, setNewMessage] = useState("");
  const [blockedWarning, setBlockedWarning] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Offer form state (for pros)
  const [offerForm, setOfferForm] = useState({
    price: "",
    description: "",
    timeline: "",
  });
  const [submittingOffer, setSubmittingOffer] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages.length]);

  if (!currentUser) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            {lang === "fr" ? "Veuillez vous connecter." : "Please log in."}
          </p>
          <Button onClick={() => void navigate({ to: "/login" })}>
            {lang === "fr" ? "Se connecter" : "Log in"}
          </Button>
        </div>
      </main>
    );
  }

  if (!mission) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🔍</p>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {lang === "fr" ? "Mission introuvable" : "Mission not found"}
          </h1>
          <p className="text-muted-foreground mb-6">
            {lang === "fr"
              ? "Cette mission n'existe pas ou a été supprimée."
              : "This mission does not exist or has been deleted."}
          </p>
          <Button
            onClick={() => void navigate({ to: "/marketplace" })}
            data-ocid="mission.back_button"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {lang === "fr" ? "Retour" : "Back"}
          </Button>
        </div>
      </main>
    );
  }

  const emoji =
    (categoryEmojis as Record<string, string>)[mission.category] ?? "📋";
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

  function handleSendMessage() {
    const trimmed = newMessage.trim();
    if (!trimmed || !convId) return;

    if (containsContactInfo(trimmed)) {
      setBlockedWarning(true);
      setTimeout(() => setBlockedWarning(false), 4000);
      return;
    }

    const role = isPro ? "pro" : "client";
    const sent = sendMessage(convId, userId, userName, role, trimmed);
    if (!sent) {
      toast.error(
        lang === "fr"
          ? "Message bloqué pour votre sécurité."
          : "Message blocked for safety.",
      );
      return;
    }
    setNewMessage("");
  }

  function handleAcceptOffer(offer: Offer) {
    if (!mission) return;
    acceptOffer(offer.id);
    updateMissionStatus(mission.id, "accepted", offer.id);
    // Create a devis document
    createDocument({
      missionId:
        Math.abs(
          Number.parseInt(mission.id.replace(/\D/g, "").slice(-8), 10),
        ) || Date.now(),
      missionTitle: mission.title,
      clientId: mission.authorId,
      proId: offer.proId,
      proName: offer.proCompany ?? offer.proPseudo,
      docType: "devis",
      amount: offer.price,
      status: "sent",
    });
    toast.success(
      lang === "fr"
        ? `Offre de ${offer.proPseudo} acceptée ! Vous pouvez maintenant procéder au paiement.`
        : `Offer from ${offer.proPseudo} accepted! You can now proceed to payment.`,
    );
    void navigate({ to: `/payment/${mission.id}` });
  }

  function handleSubmitOffer(e: React.FormEvent) {
    e.preventDefault();
    if (!mission || !currentUser) return;
    // Guard: pro must be approved before submitting offers
    if (
      currentUser.role === "pro" &&
      currentUser.approvalStatus === "pending_approval"
    ) {
      toast.error(
        lang === "fr"
          ? "Votre compte est en attente d'approbation par un administrateur."
          : lang === "de"
            ? "Ihr Konto wartet auf die Genehmigung durch einen Administrator."
            : lang === "es"
              ? "Su cuenta está pendiente de aprobación por un administrador."
              : "Your account is pending approval by an administrator.",
      );
      return;
    }
    if (!offerForm.price || !offerForm.description || !offerForm.timeline) {
      toast.error(
        lang === "fr" ? "Remplissez tous les champs." : "Fill in all fields.",
      );
      return;
    }
    setSubmittingOffer(true);
    submitOffer({
      missionId: mission.id,
      proId: userId,
      proPseudo: currentUser.pseudo ?? currentUser.firstName ?? "Pro",
      proCompany: (currentUser as any).companyName ?? undefined,
      price: Number(offerForm.price),
      description: offerForm.description,
      timeline: offerForm.timeline,
      status: "pending",
    });
    setSubmittingOffer(false);
    setOfferForm({ price: "", description: "", timeline: "" });
    toast.success(
      lang === "fr"
        ? "Votre offre a été soumise avec succès !"
        : "Your offer has been submitted!",
    );
  }

  const timelineOptions = [
    { value: "under_24h", labelFR: "Sous 24h", labelEN: "Within 24h" },
    { value: "2_3_days", labelFR: "2-3 jours", labelEN: "2-3 days" },
    { value: "1_week", labelFR: "1 semaine", labelEN: "1 week" },
    { value: "2_weeks", labelFR: "2 semaines", labelEN: "2 weeks" },
    { value: "tbd", labelFR: "À définir", labelEN: "To be defined" },
  ];

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back button */}
        <button
          type="button"
          onClick={() => void navigate({ to: -1 as unknown as string })}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          data-ocid="mission.back_button"
        >
          <ArrowLeft className="h-4 w-4" />
          {lang === "fr" ? "Retour" : "Back"}
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mission header */}
            <div className="bg-white rounded-xl card-shadow border border-border/50 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                    {emoji}
                  </div>
                  <div>
                    <h1 className="font-display text-xl font-bold text-foreground">
                      {mission.title}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {lang === "fr" ? "Publié par" : "Posted by"}{" "}
                      <span className="font-medium text-foreground">
                        {mission.authorPseudo}
                      </span>
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full border font-medium whitespace-nowrap ${statusColor}`}
                >
                  {statusLabel}
                </span>
              </div>

              <Separator className="my-4" />

              <p className="text-foreground/80 text-sm leading-relaxed">
                {mission.description}
              </p>

              <div className="grid grid-cols-2 gap-3 mt-4">
                {mission.city && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0 text-primary" />
                    {mission.city}
                  </div>
                )}
                {mission.date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 shrink-0 text-primary" />
                    {new Date(mission.date).toLocaleDateString(
                      lang === "fr" ? "fr-FR" : "en-GB",
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {mission.budgetMin}€ – {mission.budgetMax}€
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4 shrink-0 text-primary" />
                  {offers.length} {lang === "fr" ? "offre(s)" : "offer(s)"}
                </div>
              </div>
            </div>

            {/* Offers section — visible to mission author (client) */}
            {isAuthor && (
              <div className="bg-white rounded-xl card-shadow border border-border/50 overflow-hidden">
                <div className="p-5 border-b border-border">
                  <h2 className="font-display font-bold text-foreground">
                    {lang === "fr" ? "Offres reçues" : "Received offers"} (
                    {offers.length})
                  </h2>
                </div>

                {offers.length === 0 ? (
                  <div
                    className="p-12 text-center"
                    data-ocid="mission.offers.empty_state"
                  >
                    <p className="text-4xl mb-3">⏳</p>
                    <p className="text-muted-foreground text-sm">
                      {lang === "fr"
                        ? "Aucune offre pour l'instant. Les professionnels vont vous contacter."
                        : "No offers yet. Professionals will contact you."}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {offers.map((offer, i) => {
                      const offerStatusColor =
                        offer.status === "pending"
                          ? "bg-secondary/20 text-secondary border-secondary/30"
                          : offer.status === "accepted"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-muted text-muted-foreground border-border";
                      const offerStatusLabel =
                        offer.status === "pending"
                          ? lang === "fr"
                            ? "En attente"
                            : "Pending"
                          : offer.status === "accepted"
                            ? lang === "fr"
                              ? "Acceptée"
                              : "Accepted"
                            : lang === "fr"
                              ? "Refusée"
                              : "Rejected";

                      return (
                        <div
                          key={offer.id}
                          className="p-5"
                          data-ocid={`mission.offers.item.${i + 1}`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                                  {(offer.proCompany ?? offer.proPseudo)
                                    .slice(0, 1)
                                    .toUpperCase()}
                                </div>
                                <p className="font-semibold text-foreground text-sm">
                                  {offer.proCompany ?? offer.proPseudo}
                                </p>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full border ${offerStatusColor}`}
                                >
                                  {offerStatusLabel}
                                </span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xl font-bold text-primary">
                                {offer.price}€
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {timelineOptions.find(
                                  (t) => t.value === offer.timeline,
                                )?.[lang === "fr" ? "labelFR" : "labelEN"] ??
                                  offer.timeline}
                              </p>
                            </div>
                          </div>

                          <p className="text-sm text-foreground/80 mb-3">
                            {offer.description}
                          </p>

                          {offer.status === "pending" &&
                            mission.status === "open" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1"
                                  onClick={() => handleAcceptOffer(offer)}
                                  data-ocid={`mission.offers.accept_button.${i + 1}`}
                                >
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  {lang === "fr"
                                    ? "Accepter cette offre"
                                    : "Accept this offer"}
                                </Button>
                              </div>
                            )}

                          {offer.status === "accepted" && (
                            <Button
                              size="sm"
                              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1"
                              onClick={() =>
                                void navigate({
                                  to: `/payment/${mission.id}`,
                                })
                              }
                              data-ocid={`mission.offers.pay_button.${i + 1}`}
                            >
                              <CreditCard className="h-3.5 w-3.5" />
                              {lang === "fr"
                                ? "Procéder au paiement"
                                : "Proceed to payment"}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Pro offer form — blocked when mission is no longer open */}
            {isPro && !isAuthor && mission.status !== "open" && (
              <div
                className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center"
                data-ocid="mission.closed.section"
              >
                <div className="text-3xl mb-3">🔒</div>
                <p className="font-semibold text-gray-800 text-lg">
                  {lang === "fr"
                    ? t.marketplace.tooLate
                    : t.marketplace.tooLate}
                </p>
                <p className="text-sm text-gray-600 mt-2 mb-4">
                  {t.marketplace.workInProgress}
                </p>
                <button
                  type="button"
                  onClick={() => void navigate({ to: "/marketplace" })}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors"
                  data-ocid="mission.see_open_requests.button"
                >
                  {t.marketplace.seeOtherRequests}
                </button>
              </div>
            )}

            {/* Pro offer form */}
            {isPro && !isAuthor && mission.status === "open" && (
              <div className="bg-white rounded-xl card-shadow border border-border/50 p-6">
                <h2 className="font-display font-bold text-foreground mb-4">
                  {lang === "fr" ? "Faire une offre" : "Submit an offer"}
                </h2>

                {proAlreadyOffered ? (
                  <div className="p-4 bg-secondary/10 rounded-xl border border-secondary/30 text-center">
                    <CheckCircle className="h-8 w-8 text-secondary mx-auto mb-2" />
                    <p className="font-semibold text-foreground">
                      {lang === "fr" ? "Offre soumise !" : "Offer submitted!"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {lang === "fr"
                        ? "Le client examinera votre offre et vous contactera."
                        : "The client will review your offer and contact you."}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitOffer} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>
                        {lang === "fr" ? "Prix total (€)" : "Total price (€)"}
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        required
                        value={offerForm.price}
                        onChange={(e) =>
                          setOfferForm((p) => ({ ...p, price: e.target.value }))
                        }
                        placeholder="150"
                        data-ocid="mission.offer.price_input"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>
                        {lang === "fr"
                          ? "Description de votre offre"
                          : "Description of your offer"}
                      </Label>
                      <Textarea
                        required
                        rows={3}
                        maxLength={500}
                        value={offerForm.description}
                        onChange={(e) =>
                          setOfferForm((p) => ({
                            ...p,
                            description: e.target.value,
                          }))
                        }
                        placeholder={
                          lang === "fr"
                            ? "Décrivez votre approche, votre expérience..."
                            : "Describe your approach, experience..."
                        }
                        data-ocid="mission.offer.description_textarea"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>
                        {lang === "fr" ? "Délai d'intervention" : "Timeline"}
                      </Label>
                      <Select
                        value={offerForm.timeline}
                        onValueChange={(v) =>
                          setOfferForm((p) => ({ ...p, timeline: v }))
                        }
                      >
                        <SelectTrigger data-ocid="mission.offer.timeline_select">
                          <SelectValue
                            placeholder={lang === "fr" ? "Choisir" : "Select"}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {timelineOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {lang === "fr" ? opt.labelFR : opt.labelEN}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      type="submit"
                      disabled={submittingOffer}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      data-ocid="mission.offer.submit_button"
                    >
                      {submittingOffer
                        ? lang === "fr"
                          ? "Envoi..."
                          : "Sending..."
                        : lang === "fr"
                          ? "Envoyer mon offre"
                          : "Send my offer"}
                    </Button>
                  </form>
                )}
              </div>
            )}

            {/* Payment status for accepted missions */}
            {isAuthor && mission.status === "accepted" && acceptedOffer && (
              <div className="bg-white rounded-xl card-shadow border border-border/50 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-foreground">
                      {lang === "fr" ? "Paiement requis" : "Payment required"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {lang === "fr"
                        ? `Montant : ${acceptedOffer.price}€`
                        : `Amount: ${acceptedOffer.price}€`}
                    </p>
                  </div>
                </div>
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                  onClick={() =>
                    void navigate({ to: `/payment/${mission.id}` })
                  }
                  data-ocid="mission.payment.button"
                >
                  <CreditCard className="h-4 w-4" />
                  {lang === "fr"
                    ? "Procéder au paiement"
                    : "Proceed to payment"}
                </Button>
              </div>
            )}

            {/* Messaging */}
            <div className="bg-white rounded-xl card-shadow border border-border/50 overflow-hidden">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <h2 className="font-display font-bold text-foreground">
                    {lang === "fr" ? "Messagerie" : "Messages"}
                  </h2>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1 text-muted-foreground"
                  onClick={() => setCallOpen(true)}
                  data-ocid="mission.call_button"
                >
                  <Phone className="h-4 w-4" />
                  {lang === "fr" ? "Appel" : "Call"}
                </Button>
              </div>

              {/* Messages */}
              <div className="h-64 overflow-y-auto p-4 space-y-3">
                {!conversation || conversation.messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground text-sm text-center">
                      {lang === "fr"
                        ? "Démarrez la conversation pour discuter des détails de la mission."
                        : "Start a conversation to discuss the mission details."}
                    </p>
                  </div>
                ) : (
                  conversation.messages.map((msg) => {
                    const isMine = msg.senderId === userId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${
                          isMine ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                            isMine
                              ? "bg-primary text-primary-foreground rounded-tr-sm"
                              : "bg-muted text-foreground rounded-tl-sm"
                          }`}
                        >
                          {!isMine && (
                            <p className="text-xs font-semibold mb-1 opacity-70">
                              {msg.senderName}
                            </p>
                          )}
                          <p className="text-sm">{msg.text}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Blocked warning */}
              {blockedWarning && (
                <div className="mx-4 mb-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-destructive shrink-0" />
                  <p className="text-xs text-destructive">
                    {lang === "fr"
                      ? "Coordonnées personnelles détectées et bloquées pour votre sécurité."
                      : "Personal contact info detected and blocked for your safety."}
                  </p>
                </div>
              )}

              {/* Message input */}
              <div className="p-4 border-t border-border">
                {isPro && !isAuthor && mission.status !== "open" ? (
                  <div
                    className="text-center py-2 text-sm text-amber-700 bg-amber-50 rounded-lg border border-amber-200"
                    data-ocid="mission.chat.closed_state"
                  >
                    🔒{" "}
                    {lang === "fr"
                      ? "Cette demande n'accepte plus de messages de nouveaux prestataires."
                      : "This request no longer accepts messages from new providers."}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && !e.shiftKey && handleSendMessage()
                      }
                      placeholder={
                        lang === "fr" ? "Votre message..." : "Your message..."
                      }
                      className="flex-1 h-10 px-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                      data-ocid="mission.chat.input"
                    />
                    <Button
                      size="sm"
                      className="h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      data-ocid="mission.chat.send_button"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Mission summary */}
            <div className="bg-white rounded-xl card-shadow border border-border/50 p-5">
              <h3 className="font-display font-bold text-foreground mb-3">
                {lang === "fr" ? "Résumé" : "Summary"}
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {lang === "fr" ? "Budget" : "Budget"}
                  </span>
                  <span className="font-medium">
                    {mission.budgetMin}€ – {mission.budgetMax}€
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {lang === "fr" ? "Catégorie" : "Category"}
                  </span>
                  <span className="font-medium">
                    {emoji} {mission.category}
                  </span>
                </div>
                {mission.city && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {lang === "fr" ? "Ville" : "City"}
                    </span>
                    <span className="font-medium">{mission.city}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {lang === "fr" ? "Statut" : "Status"}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColor}`}
                  >
                    {statusLabel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {lang === "fr" ? "Publié" : "Posted"}
                  </span>
                  <span className="font-medium">
                    {new Date(mission.createdAt).toLocaleDateString(
                      lang === "fr" ? "fr-FR" : "en-GB",
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Documents link */}
            <div className="bg-white rounded-xl card-shadow border border-border/50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="font-display font-bold text-foreground">
                  {lang === "fr" ? "Documents" : "Documents"}
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 border-primary/30 text-primary"
                asChild
                data-ocid="mission.documents.link"
              >
                <Link to="/documents">
                  <FileText className="h-4 w-4" />
                  {lang === "fr" ? "Voir les documents" : "View documents"}
                </Link>
              </Button>
            </div>

            {/* Pro: see all missions */}
            {isPro && (
              <div className="bg-white rounded-xl card-shadow border border-border/50 p-5">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => void navigate({ to: "/marketplace" })}
                  data-ocid="mission.marketplace_link"
                >
                  {lang === "fr"
                    ? "Voir toutes les missions"
                    : "See all missions"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Call Modal */}
      <CallModal
        isOpen={callOpen}
        onClose={() => setCallOpen(false)}
        contactName={
          isAuthor
            ? (offers[0]?.proCompany ?? offers[0]?.proPseudo ?? "Professionnel")
            : mission.authorPseudo
        }
        contactRole={isAuthor ? "pro" : "client"}
      />
    </main>
  );
}

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth-store";
import { useCalendarStore } from "@/lib/calendar-store";
import { useTranslation } from "@/lib/i18n";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const LABELS: Record<
  string,
  {
    title: string;
    date: string;
    time: string;
    description: string;
    client: string;
    pro: string;
    accept: string;
    decline: string;
    counterPropose: string;
    confirmNewDate: string;
    cancel: string;
    newDateProposed: string;
    awaitingClient: string;
    counterDate: string;
    counterTime: string;
    sendCounter: string;
    acceptedToast: string;
    declinedToast: string;
    counterToast: string;
    confirmedToast: string;
    cancelledToast: string;
    notFound: string;
    statusLabels: Record<string, string>;
  }
> = {
  fr: {
    title: "Détail de la réservation",
    date: "Date",
    time: "Créneau",
    description: "Description de la mission",
    client: "Client",
    pro: "Professionnel",
    accept: "Accepter",
    decline: "Refuser",
    counterPropose: "Proposer une autre date",
    confirmNewDate: "Confirmer la nouvelle date",
    cancel: "Annuler",
    newDateProposed: "Nouvelle date proposée",
    awaitingClient: "En attente de confirmation du client",
    counterDate: "Nouvelle date",
    counterTime: "Nouveau créneau",
    sendCounter: "Envoyer la contre-proposition",
    acceptedToast: "Réservation acceptée !",
    declinedToast: "Réservation refusée.",
    counterToast: "Contre-proposition envoyée !",
    confirmedToast: "Nouvelle date confirmée !",
    cancelledToast: "Réservation annulée.",
    notFound: "Réservation introuvable.",
    statusLabels: {
      pending: "En attente",
      accepted: "Acceptée",
      declined: "Refusée",
      counter_proposed: "Contre-proposition",
      confirmed: "Confirmée",
      cancelled: "Annulée",
    },
  },
  en: {
    title: "Booking Detail",
    date: "Date",
    time: "Time Slot",
    description: "Task Description",
    client: "Client",
    pro: "Professional",
    accept: "Accept",
    decline: "Decline",
    counterPropose: "Propose another date",
    confirmNewDate: "Confirm new date",
    cancel: "Cancel booking",
    newDateProposed: "New date proposed",
    awaitingClient: "Awaiting client confirmation",
    counterDate: "New date",
    counterTime: "New time slot",
    sendCounter: "Send counter-proposal",
    acceptedToast: "Booking accepted!",
    declinedToast: "Booking declined.",
    counterToast: "Counter-proposal sent!",
    confirmedToast: "New date confirmed!",
    cancelledToast: "Booking cancelled.",
    notFound: "Booking not found.",
    statusLabels: {
      pending: "Pending",
      accepted: "Accepted",
      declined: "Declined",
      counter_proposed: "Counter-proposal",
      confirmed: "Confirmed",
      cancelled: "Cancelled",
    },
  },
  de: {
    title: "Buchungsdetails",
    date: "Datum",
    time: "Zeitfenster",
    description: "Auftragsbeschreibung",
    client: "Kunde",
    pro: "Profi",
    accept: "Annehmen",
    decline: "Ablehnen",
    counterPropose: "Anderen Termin vorschlagen",
    confirmNewDate: "Neues Datum bestätigen",
    cancel: "Stornieren",
    newDateProposed: "Neues Datum vorgeschlagen",
    awaitingClient: "Wartet auf Kundenbestätigung",
    counterDate: "Neues Datum",
    counterTime: "Neues Zeitfenster",
    sendCounter: "Gegenvorschlag senden",
    acceptedToast: "Buchung angenommen!",
    declinedToast: "Buchung abgelehnt.",
    counterToast: "Gegenvorschlag gesendet!",
    confirmedToast: "Neues Datum bestätigt!",
    cancelledToast: "Buchung storniert.",
    notFound: "Buchung nicht gefunden.",
    statusLabels: {
      pending: "Ausstehend",
      accepted: "Angenommen",
      declined: "Abgelehnt",
      counter_proposed: "Gegenvorschlag",
      confirmed: "Bestätigt",
      cancelled: "Storniert",
    },
  },
  es: {
    title: "Detalle de reserva",
    date: "Fecha",
    time: "Horario",
    description: "Descripción de la tarea",
    client: "Cliente",
    pro: "Profesional",
    accept: "Aceptar",
    decline: "Rechazar",
    counterPropose: "Proponer otra fecha",
    confirmNewDate: "Confirmar nueva fecha",
    cancel: "Cancelar",
    newDateProposed: "Nueva fecha propuesta",
    awaitingClient: "Esperando confirmación del cliente",
    counterDate: "Nueva fecha",
    counterTime: "Nuevo horario",
    sendCounter: "Enviar contrapropuesta",
    acceptedToast: "¡Reserva aceptada!",
    declinedToast: "Reserva rechazada.",
    counterToast: "¡Contrapropuesta enviada!",
    confirmedToast: "¡Nueva fecha confirmada!",
    cancelledToast: "Reserva cancelada.",
    notFound: "Reserva no encontrada.",
    statusLabels: {
      pending: "Pendiente",
      accepted: "Aceptada",
      declined: "Rechazada",
      counter_proposed: "Contrapropuesta",
      confirmed: "Confirmada",
      cancelled: "Cancelada",
    },
  },
  it: {
    title: "Dettaglio prenotazione",
    date: "Data",
    time: "Fascia oraria",
    description: "Descrizione missione",
    client: "Cliente",
    pro: "Professionista",
    accept: "Accetta",
    decline: "Rifiuta",
    counterPropose: "Proponi altra data",
    confirmNewDate: "Conferma nuova data",
    cancel: "Annulla",
    newDateProposed: "Nuova data proposta",
    awaitingClient: "In attesa conferma cliente",
    counterDate: "Nuova data",
    counterTime: "Nuova fascia oraria",
    sendCounter: "Invia controproposta",
    acceptedToast: "Prenotazione accettata!",
    declinedToast: "Prenotazione rifiutata.",
    counterToast: "Controproposta inviata!",
    confirmedToast: "Nuova data confermata!",
    cancelledToast: "Prenotazione annullata.",
    notFound: "Prenotazione non trovata.",
    statusLabels: {
      pending: "In attesa",
      accepted: "Accettata",
      declined: "Rifiutata",
      counter_proposed: "Controproposta",
      confirmed: "Confermata",
      cancelled: "Annullata",
    },
  },
  pt: {
    title: "Detalhe da reserva",
    date: "Data",
    time: "Horário",
    description: "Descrição da tarefa",
    client: "Cliente",
    pro: "Profissional",
    accept: "Aceitar",
    decline: "Recusar",
    counterPropose: "Propor outra data",
    confirmNewDate: "Confirmar nova data",
    cancel: "Cancelar",
    newDateProposed: "Nova data proposta",
    awaitingClient: "Aguardando confirmação do cliente",
    counterDate: "Nova data",
    counterTime: "Novo horário",
    sendCounter: "Enviar contraproposta",
    acceptedToast: "Reserva aceite!",
    declinedToast: "Reserva recusada.",
    counterToast: "Contraproposta enviada!",
    confirmedToast: "Nova data confirmada!",
    cancelledToast: "Reserva cancelada.",
    notFound: "Reserva não encontrada.",
    statusLabels: {
      pending: "Pendente",
      accepted: "Aceite",
      declined: "Recusada",
      counter_proposed: "Contraproposta",
      confirmed: "Confirmada",
      cancelled: "Cancelada",
    },
  },
  nl: {
    title: "Boekingsdetails",
    date: "Datum",
    time: "Tijdslot",
    description: "Taakomschrijving",
    client: "Klant",
    pro: "Professional",
    accept: "Accepteren",
    decline: "Weigeren",
    counterPropose: "Andere datum voorstellen",
    confirmNewDate: "Nieuwe datum bevestigen",
    cancel: "Annuleren",
    newDateProposed: "Nieuwe datum voorgesteld",
    awaitingClient: "Wacht op bevestiging klant",
    counterDate: "Nieuwe datum",
    counterTime: "Nieuw tijdslot",
    sendCounter: "Tegenvoorstel sturen",
    acceptedToast: "Boeking geaccepteerd!",
    declinedToast: "Boeking geweigerd.",
    counterToast: "Tegenvoorstel verzonden!",
    confirmedToast: "Nieuwe datum bevestigd!",
    cancelledToast: "Boeking geannuleerd.",
    notFound: "Boeking niet gevonden.",
    statusLabels: {
      pending: "In afwachting",
      accepted: "Geaccepteerd",
      declined: "Geweigerd",
      counter_proposed: "Tegenvoorstel",
      confirmed: "Bevestigd",
      cancelled: "Geannuleerd",
    },
  },
  el: {
    title: "Λεπτομέρειες κράτησης",
    date: "Ημερομηνία",
    time: "Χρονοθυρίδα",
    description: "Περιγραφή αποστολής",
    client: "Πελάτης",
    pro: "Επαγγελματίας",
    accept: "Αποδοχή",
    decline: "Απόρριψη",
    counterPropose: "Πρόταση άλλης ημερομηνίας",
    confirmNewDate: "Επιβεβαίωση νέας ημερομηνίας",
    cancel: "Ακύρωση",
    newDateProposed: "Νέα ημερομηνία προτάθηκε",
    awaitingClient: "Αναμονή επιβεβαίωσης πελάτη",
    counterDate: "Νέα ημερομηνία",
    counterTime: "Νέα χρονοθυρίδα",
    sendCounter: "Αποστολή αντιπρότασης",
    acceptedToast: "Κράτηση αποδεκτή!",
    declinedToast: "Κράτηση απορρίφθηκε.",
    counterToast: "Αντιπρόταση εστάλη!",
    confirmedToast: "Νέα ημερομηνία επιβεβαιώθηκε!",
    cancelledToast: "Κράτηση ακυρώθηκε.",
    notFound: "Η κράτηση δεν βρέθηκε.",
    statusLabels: {
      pending: "Σε αναμονή",
      accepted: "Αποδεκτή",
      declined: "Απορριφθείσα",
      counter_proposed: "Αντιπρόταση",
      confirmed: "Επιβεβαιωμένη",
      cancelled: "Ακυρωμένη",
    },
  },
  ie: {
    title: "Booking Detail",
    date: "Date",
    time: "Time Slot",
    description: "Task Description",
    client: "Client",
    pro: "Professional",
    accept: "Accept",
    decline: "Decline",
    counterPropose: "Propose another date",
    confirmNewDate: "Confirm new date",
    cancel: "Cancel booking",
    newDateProposed: "New date proposed",
    awaitingClient: "Awaiting client confirmation",
    counterDate: "New date",
    counterTime: "New time slot",
    sendCounter: "Send counter-proposal",
    acceptedToast: "Booking accepted!",
    declinedToast: "Booking declined.",
    counterToast: "Counter-proposal sent!",
    confirmedToast: "New date confirmed!",
    cancelledToast: "Booking cancelled.",
    notFound: "Booking not found.",
    statusLabels: {
      pending: "Pending",
      accepted: "Accepted",
      declined: "Declined",
      counter_proposed: "Counter-proposal",
      confirmed: "Confirmed",
      cancelled: "Cancelled",
    },
  },
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  accepted: "bg-green-100 text-green-800 border-green-200",
  declined: "bg-red-100 text-red-700 border-red-200",
  counter_proposed: "bg-blue-100 text-blue-800 border-blue-200",
  confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
};

export function BookingDetailPage() {
  const { id } = useParams({ strict: false }) as { id?: string };
  const { lang } = useTranslation();
  const { currentUser } = useAuthStore();
  const {
    getBookingById,
    respondToBooking,
    confirmCounterProposal,
    cancelBooking,
  } = useCalendarStore();
  const navigate = useNavigate();
  const l = LABELS[lang] ?? LABELS.en;

  const booking = id ? getBookingById(id) : null;
  const [showCounter, setShowCounter] = useState(false);
  const [counterDate, setCounterDate] = useState("");
  const [counterTime, setCounterTime] = useState("");

  if (!booking) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">📅</p>
          <p className="text-muted-foreground">{l.notFound}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => void navigate({ to: "/" })}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {lang === "fr" ? "Retour" : "Back"}
          </Button>
        </div>
      </main>
    );
  }

  const isPro = currentUser && String(currentUser.id) === booking.proId;
  const isClient = currentUser && String(currentUser.id) === booking.clientId;
  const canAct =
    booking.status !== "cancelled" && booking.status !== "declined";

  function handleAccept() {
    respondToBooking(booking!.id, "accepted");
    toast.success(l.acceptedToast);
  }

  function handleDecline() {
    respondToBooking(booking!.id, "declined");
    toast.success(l.declinedToast);
  }

  function handleCounter() {
    if (!counterDate || !counterTime) return;
    respondToBooking(booking!.id, "counter_proposed", counterDate, counterTime);
    toast.success(l.counterToast);
    setShowCounter(false);
  }

  function handleConfirmCounter() {
    confirmCounterProposal(booking!.id);
    toast.success(l.confirmedToast);
  }

  function handleCancel() {
    cancelBooking(booking!.id);
    toast.success(l.cancelledToast);
  }

  const statusLabel = l.statusLabels[booking.status] ?? booking.status;
  const statusColor =
    STATUS_COLORS[booking.status] ?? "bg-muted text-muted-foreground";

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void navigate({ to: -1 as any })}
            className="h-9 w-9 p-0 rounded-full"
            data-ocid="booking.back.button"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-display text-xl font-bold text-foreground">
            {l.title}
          </h1>
        </div>

        <div className="space-y-4">
          {/* Status badge */}
          <div className="flex items-center justify-between">
            <span
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${statusColor}`}
              data-ocid="booking.status.panel"
            >
              {statusLabel}
            </span>
            <span className="text-xs text-muted-foreground">
              #{booking.id.slice(-8)}
            </span>
          </div>

          {/* Details card */}
          <div className="bg-white rounded-xl card-shadow border border-border/50 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{l.date}</p>
                <p className="font-semibold text-foreground">{booking.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{l.time}</p>
                <p className="font-semibold text-foreground">
                  {booking.timeSlot}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">
                  {isPro ? l.client : l.pro}
                </p>
                <p className="font-semibold text-foreground">
                  {isPro ? booking.clientName : booking.proName}
                </p>
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted-foreground mb-1">
                {l.description}
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                {booking.description}
              </p>
            </div>
          </div>

          {/* Counter-proposal info */}
          {booking.status === "counter_proposed" && booking.counterDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-blue-800 mb-2">
                {l.newDateProposed}
              </p>
              <div className="flex gap-4 text-sm text-blue-700">
                <span>📅 {booking.counterDate}</span>
                <span>🕐 {booking.counterTime}</span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {canAct && (
            <div className="space-y-3">
              {/* Pro actions on pending booking */}
              {isPro && booking.status === "pending" && (
                <div className="space-y-2">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                    onClick={handleAccept}
                    data-ocid="booking.accept.confirm_button"
                  >
                    {l.accept}
                  </Button>
                  {!showCounter ? (
                    <Button
                      variant="outline"
                      className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 gap-2"
                      onClick={() => setShowCounter(true)}
                      data-ocid="booking.counter.open_modal_button"
                    >
                      {l.counterPropose}
                    </Button>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                      <div className="flex gap-3">
                        <div className="flex-1 space-y-1">
                          <label
                            htmlFor="counter-date"
                            className="text-xs font-semibold text-blue-800"
                          >
                            {l.counterDate}
                          </label>
                          <input
                            id="counter-date"
                            type="date"
                            value={counterDate}
                            onChange={(e) => setCounterDate(e.target.value)}
                            className="w-full rounded-lg border border-blue-200 bg-white text-sm px-3 py-2 focus:outline-none"
                            data-ocid="booking.counter_date.input"
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <label
                            htmlFor="counter-time"
                            className="text-xs font-semibold text-blue-800"
                          >
                            {l.counterTime}
                          </label>
                          <input
                            type="time"
                            id="counter-time"
                            value={counterTime}
                            onChange={(e) => setCounterTime(e.target.value)}
                            className="w-full rounded-lg border border-blue-200 bg-white text-sm px-3 py-2 focus:outline-none"
                            data-ocid="booking.counter_time.input"
                          />
                        </div>
                      </div>
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={handleCounter}
                        disabled={!counterDate || !counterTime}
                        data-ocid="booking.counter.submit_button"
                      >
                        {l.sendCounter}
                      </Button>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full border-red-300 text-red-600 hover:bg-red-50"
                    onClick={handleDecline}
                    data-ocid="booking.decline.delete_button"
                  >
                    {l.decline}
                  </Button>
                </div>
              )}

              {/* Pro: counter_proposed — show waiting message */}
              {isPro && booking.status === "counter_proposed" && (
                <div className="bg-muted/30 rounded-xl p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    {l.awaitingClient}
                  </p>
                </div>
              )}

              {/* Client: confirm counter-proposal */}
              {isClient && booking.status === "counter_proposed" && (
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                  onClick={handleConfirmCounter}
                  data-ocid="booking.confirm_new_date.confirm_button"
                >
                  {l.confirmNewDate}
                </Button>
              )}

              {/* Cancel button for both parties */}
              {(isPro || isClient) &&
                (booking.status === "pending" ||
                  booking.status === "counter_proposed") && (
                  <Button
                    variant="outline"
                    className="w-full border-border text-muted-foreground"
                    onClick={handleCancel}
                    data-ocid="booking.cancel.secondary_button"
                  >
                    {l.cancel}
                  </Button>
                )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

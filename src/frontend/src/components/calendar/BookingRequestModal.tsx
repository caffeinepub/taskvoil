import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCalendarStore } from "@/lib/calendar-store";
import { useTranslation } from "@/lib/i18n";
import { Calendar, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface BookingRequestModalProps {
  proId: string;
  proName: string;
  clientId: string;
  clientName: string;
  selectedDate: string;
  selectedTime: string;
  onClose: () => void;
}

const LABELS: Record<
  string,
  {
    title: string;
    desc: string;
    submit: string;
    success: string;
    placeholder: string;
  }
> = {
  fr: {
    title: "Envoyer une demande de réservation",
    desc: "Description de la mission",
    submit: "Envoyer la demande",
    success: "Demande envoyée !",
    placeholder: "Décrivez votre besoin en détail...",
  },
  en: {
    title: "Send a booking request",
    desc: "Task description",
    submit: "Send request",
    success: "Request sent!",
    placeholder: "Describe your needs in detail...",
  },
  de: {
    title: "Buchungsanfrage senden",
    desc: "Beschreibung des Auftrags",
    submit: "Anfrage senden",
    success: "Anfrage gesendet!",
    placeholder: "Beschreiben Sie Ihr Anliegen im Detail...",
  },
  es: {
    title: "Enviar solicitud de reserva",
    desc: "Descripción de la tarea",
    submit: "Enviar solicitud",
    success: "¡Solicitud enviada!",
    placeholder: "Describa su necesidad en detalle...",
  },
  it: {
    title: "Invia una richiesta di prenotazione",
    desc: "Descrizione della missione",
    submit: "Invia richiesta",
    success: "Richiesta inviata!",
    placeholder: "Descrivi le tue esigenze nel dettaglio...",
  },
  pt: {
    title: "Enviar pedido de reserva",
    desc: "Descrição da tarefa",
    submit: "Enviar pedido",
    success: "Pedido enviado!",
    placeholder: "Descreva a sua necessidade em detalhe...",
  },
  nl: {
    title: "Boekingsverzoek sturen",
    desc: "Taakomschrijving",
    submit: "Verzoek sturen",
    success: "Verzoek verzonden!",
    placeholder: "Beschrijf uw behoefte in detail...",
  },
  el: {
    title: "Αποστολή αιτήματος κράτησης",
    desc: "Περιγραφή αποστολής",
    submit: "Αποστολή αιτήματος",
    success: "Αίτημα απεστάλη!",
    placeholder: "Περιγράψτε τις ανάγκες σας λεπτομερώς...",
  },
  ie: {
    title: "Send a booking request",
    desc: "Task description",
    submit: "Send request",
    success: "Request sent!",
    placeholder: "Describe your needs in detail...",
  },
  lu: {
    title: "Buchungsufro schécken",
    desc: "Beschreiwung vun der Aufgab",
    submit: "Ufro schécken",
    success: "Ufro geschéckt!",
    placeholder: "Beschreiwt Är Bedierfnisser am Detail...",
  },
};

export function BookingRequestModal({
  proId,
  proName,
  clientId,
  clientName,
  selectedDate,
  selectedTime,
  onClose,
}: BookingRequestModalProps) {
  const { t, lang } = useTranslation();
  const { createBooking } = useCalendarStore();
  const l = LABELS[lang] ?? LABELS.en;
  const [description, setDescription] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    createBooking({
      clientId,
      proId,
      clientName,
      proName,
      date: selectedDate,
      timeSlot: selectedTime,
      description: description.trim(),
      status: "pending",
    });
    toast.success(l.success);
    onClose();
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md" data-ocid="booking.dialog">
        <DialogHeader>
          <DialogTitle className="font-display">{l.title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Pro name + date + time */}
          <div className="bg-muted/30 rounded-xl p-4 space-y-2 border border-border">
            <p className="text-sm font-semibold text-foreground">{proName}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {selectedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {selectedTime}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">{l.desc}</Label>
            <Textarea
              required
              rows={4}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={l.placeholder}
              data-ocid="booking.textarea"
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/500
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              data-ocid="booking.cancel_button"
            >
              {t.common.cancel}
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!description.trim()}
              data-ocid="booking.submit_button"
            >
              {l.submit}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

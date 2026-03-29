import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/lib/auth-store";
import {
  type DaySchedule,
  type ProSchedule,
  useCalendarStore,
} from "@/lib/calendar-store";
import { useCountryStore } from "@/lib/country-store";
import { useTranslation } from "@/lib/i18n";
import { useNotificationStore } from "@/lib/notification-store";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bell,
  BellOff,
  Calendar,
  CheckCircle,
  Save,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const DAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DAY_LABELS: Record<string, string[]> = {
  fr: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
  en: [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ],
  de: [
    "Montag",
    "Dienstag",
    "Mittwoch",
    "Donnerstag",
    "Freitag",
    "Samstag",
    "Sonntag",
  ],
  es: [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ],
  it: [
    "Lunedì",
    "Martedì",
    "Mercoledì",
    "Giovedì",
    "Venerdì",
    "Sabato",
    "Domenica",
  ],
  pt: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"],
  nl: [
    "Maandag",
    "Dinsdag",
    "Woensdag",
    "Donderdag",
    "Vrijdag",
    "Zaterdag",
    "Zondag",
  ],
  el: [
    "Δευτέρα",
    "Τρίτη",
    "Τετάρτη",
    "Πέμπτη",
    "Παρασκευή",
    "Σάββατο",
    "Κυριακή",
  ],
  ie: [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ],
};

const STATUS_LABELS: Record<
  string,
  { available: string; on_request: string; unavailable: string }
> = {
  fr: {
    available: "Disponible",
    on_request: "Sur demande",
    unavailable: "Indisponible",
  },
  en: {
    available: "Available",
    on_request: "On Request",
    unavailable: "Unavailable",
  },
  de: {
    available: "Verfügbar",
    on_request: "Auf Anfrage",
    unavailable: "Nicht verfügbar",
  },
  es: {
    available: "Disponible",
    on_request: "Bajo petición",
    unavailable: "No disponible",
  },
  it: {
    available: "Disponibile",
    on_request: "Su richiesta",
    unavailable: "Non disponibile",
  },
  pt: {
    available: "Disponível",
    on_request: "A pedido",
    unavailable: "Indisponível",
  },
  nl: {
    available: "Beschikbaar",
    on_request: "Op aanvraag",
    unavailable: "Niet beschikbaar",
  },
  el: {
    available: "Διαθέσιμος",
    on_request: "Κατόπιν αιτήματος",
    unavailable: "Μη διαθέσιμος",
  },
  ie: {
    available: "Available",
    on_request: "On Request",
    unavailable: "Unavailable",
  },
};

const PAGE_LABELS: Record<
  string,
  {
    title: string;
    quickStatus: string;
    workingDays: string;
    blockedDates: string;
    addBlockedDate: string;
    publicHolidays: string;
    save: string;
    saved: string;
    openTime: string;
    closeTime: string;
    notifTitle: string;
    notifPush: string;
    notifEmail: string;
    notifWeeklyDigest: string;
    notif72h: string;
    notif24h: string;
    notif8h: string;
    notif4h: string;
    notif2h: string;
    enablePush: string;
    notifSaved: string;
  }
> = {
  fr: {
    title: "Mon agenda",
    quickStatus: "Statut rapide",
    workingDays: "Jours de travail",
    blockedDates: "Dates bloquées",
    addBlockedDate: "Ajouter une date bloquée",
    publicHolidays: "Inclure les jours fériés du pays",
    save: "Enregistrer l'agenda",
    saved: "Agenda enregistré avec succès !",
    openTime: "Ouverture",
    closeTime: "Fermeture",
    notifTitle: "Notifications de rappel",
    notifPush: "Notifications push",
    notifEmail: "Email",
    notifWeeklyDigest: "Résumé hebdomadaire (lundi matin)",
    notif72h: "72h avant le RDV",
    notif24h: "24h avant le RDV",
    notif8h: "8h avant le RDV",
    notif4h: "4h avant le RDV",
    notif2h: "2h avant le RDV",
    enablePush: "Activer les notifications push",
    notifSaved: "Préférences de notifications enregistrées !",
  },
  en: {
    title: "My Schedule",
    quickStatus: "Quick Status",
    workingDays: "Working Days",
    blockedDates: "Blocked Dates",
    addBlockedDate: "Add a blocked date",
    publicHolidays: "Include country public holidays",
    save: "Save Schedule",
    saved: "Schedule saved successfully!",
    openTime: "Open",
    closeTime: "Close",
    notifTitle: "Reminder Notifications",
    notifPush: "Push notifications",
    notifEmail: "Email",
    notifWeeklyDigest: "Weekly digest (Monday morning)",
    notif72h: "72h before appointment",
    notif24h: "24h before appointment",
    notif8h: "8h before appointment",
    notif4h: "4h before appointment",
    notif2h: "2h before appointment",
    enablePush: "Enable push notifications",
    notifSaved: "Notification preferences saved!",
  },
  de: {
    title: "Mein Terminplan",
    quickStatus: "Schnellstatus",
    workingDays: "Arbeitstage",
    blockedDates: "Gesperrte Termine",
    addBlockedDate: "Gesperrtes Datum hinzufügen",
    publicHolidays: "Feiertage des Landes einbeziehen",
    save: "Terminplan speichern",
    saved: "Terminplan gespeichert!",
    openTime: "Öffnung",
    closeTime: "Schließung",
    notifTitle: "Erinnerungsbenachrichtigungen",
    notifPush: "Push-Benachrichtigungen",
    notifEmail: "E-Mail",
    notifWeeklyDigest: "Wöchentliche Zusammenfassung (Montag)",
    notif72h: "72h vor dem Termin",
    notif24h: "24h vor dem Termin",
    notif8h: "8h vor dem Termin",
    notif4h: "4h vor dem Termin",
    notif2h: "2h vor dem Termin",
    enablePush: "Push-Benachrichtigungen aktivieren",
    notifSaved: "Benachrichtigungseinstellungen gespeichert!",
  },
  es: {
    title: "Mi agenda",
    quickStatus: "Estado rápido",
    workingDays: "Días laborables",
    blockedDates: "Fechas bloqueadas",
    addBlockedDate: "Añadir fecha bloqueada",
    publicHolidays: "Incluir festivos del país",
    save: "Guardar agenda",
    saved: "¡Agenda guardada!",
    openTime: "Apertura",
    closeTime: "Cierre",
    notifTitle: "Notificaciones de recordatorio",
    notifPush: "Notificaciones push",
    notifEmail: "Correo electrónico",
    notifWeeklyDigest: "Resumen semanal (lunes por la mañana)",
    notif72h: "72h antes de la cita",
    notif24h: "24h antes de la cita",
    notif8h: "8h antes de la cita",
    notif4h: "4h antes de la cita",
    notif2h: "2h antes de la cita",
    enablePush: "Activar notificaciones push",
    notifSaved: "¡Preferencias de notificación guardadas!",
  },
  it: {
    title: "Il mio calendario",
    quickStatus: "Stato rapido",
    workingDays: "Giorni lavorativi",
    blockedDates: "Date bloccate",
    addBlockedDate: "Aggiungi data bloccata",
    publicHolidays: "Includi festività nazionali",
    save: "Salva calendario",
    saved: "Calendario salvato!",
    openTime: "Apertura",
    closeTime: "Chiusura",
    notifTitle: "Notifiche di promemoria",
    notifPush: "Notifiche push",
    notifEmail: "Email",
    notifWeeklyDigest: "Riepilogo settimanale (lunedì mattina)",
    notif72h: "72h prima dell'appuntamento",
    notif24h: "24h prima dell'appuntamento",
    notif8h: "8h prima dell'appuntamento",
    notif4h: "4h prima dell'appuntamento",
    notif2h: "2h prima dell'appuntamento",
    enablePush: "Attiva notifiche push",
    notifSaved: "Preferenze di notifica salvate!",
  },
  pt: {
    title: "O meu calendário",
    quickStatus: "Estado rápido",
    workingDays: "Dias de trabalho",
    blockedDates: "Datas bloqueadas",
    addBlockedDate: "Adicionar data bloqueada",
    publicHolidays: "Incluir feriados nacionais",
    save: "Guardar calendário",
    saved: "Calendário guardado!",
    openTime: "Abertura",
    closeTime: "Fecho",
    notifTitle: "Notificações de lembrete",
    notifPush: "Notificações push",
    notifEmail: "Email",
    notifWeeklyDigest: "Resumo semanal (segunda de manhã)",
    notif72h: "72h antes da consulta",
    notif24h: "24h antes da consulta",
    notif8h: "8h antes da consulta",
    notif4h: "4h antes da consulta",
    notif2h: "2h antes da consulta",
    enablePush: "Ativar notificações push",
    notifSaved: "Preferências de notificação guardadas!",
  },
  nl: {
    title: "Mijn agenda",
    quickStatus: "Snelle status",
    workingDays: "Werkdagen",
    blockedDates: "Geblokkeerde datums",
    addBlockedDate: "Geblokkeerde datum toevoegen",
    publicHolidays: "Nationale feestdagen opnemen",
    save: "Agenda opslaan",
    saved: "Agenda opgeslagen!",
    openTime: "Openen",
    closeTime: "Sluiten",
    notifTitle: "Herinneringsmeldingen",
    notifPush: "Pushmeldingen",
    notifEmail: "E-mail",
    notifWeeklyDigest: "Wekelijkse samenvatting (maandagochtend)",
    notif72h: "72u voor de afspraak",
    notif24h: "24u voor de afspraak",
    notif8h: "8u voor de afspraak",
    notif4h: "4u voor de afspraak",
    notif2h: "2u voor de afspraak",
    enablePush: "Pushmeldingen inschakelen",
    notifSaved: "Meldingsvoorkeuren opgeslagen!",
  },
  el: {
    title: "Το ημερολόγιό μου",
    quickStatus: "Γρήγορη κατάσταση",
    workingDays: "Εργάσιμες μέρες",
    blockedDates: "Αποκλεισμένες ημερομηνίες",
    addBlockedDate: "Προσθήκη αποκλεισμένης ημερομηνίας",
    publicHolidays: "Συμπερίληψη εθνικών αργιών",
    save: "Αποθήκευση ημερολογίου",
    saved: "Ημερολόγιο αποθηκεύτηκε!",
    openTime: "Άνοιγμα",
    closeTime: "Κλείσιμο",
    notifTitle: "Ειδοποιήσεις υπενθύμισης",
    notifPush: "Ειδοποιήσεις push",
    notifEmail: "Email",
    notifWeeklyDigest: "Εβδομαδιαία σύνοψη (Δευτέρα πρωί)",
    notif72h: "72ω πριν το ραντεβού",
    notif24h: "24ω πριν το ραντεβού",
    notif8h: "8ω πριν το ραντεβού",
    notif4h: "4ω πριν το ραντεβού",
    notif2h: "2ω πριν το ραντεβού",
    enablePush: "Ενεργοποίηση ειδοποιήσεων push",
    notifSaved: "Προτιμήσεις ειδοποιήσεων αποθηκεύτηκαν!",
  },
  ie: {
    title: "My Schedule",
    quickStatus: "Quick Status",
    workingDays: "Working Days",
    blockedDates: "Blocked Dates",
    addBlockedDate: "Add a blocked date",
    publicHolidays: "Include country public holidays",
    save: "Save Schedule",
    saved: "Schedule saved successfully!",
    openTime: "Open",
    closeTime: "Close",
    notifTitle: "Reminder Notifications",
    notifPush: "Push notifications",
    notifEmail: "Email",
    notifWeeklyDigest: "Weekly digest (Monday morning)",
    notif72h: "72h before appointment",
    notif24h: "24h before appointment",
    notif8h: "8h before appointment",
    notif4h: "4h before appointment",
    notif2h: "2h before appointment",
    enablePush: "Enable push notifications",
    notifSaved: "Notification preferences saved!",
  },
};

function generateHours(): string[] {
  const slots: string[] = [];
  for (let h = 0; h < 24; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots;
}

const HOURS = generateHours();

function buildDefaultDays(): Record<string, DaySchedule> {
  const result: Record<string, DaySchedule> = {};
  for (const key of DAY_KEYS) {
    result[key] = {
      enabled: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
      ].includes(key),
      openTime: "08:00",
      closeTime: "18:00",
    };
  }
  return result;
}

export function ProSchedulePage() {
  const { lang } = useTranslation();
  const { currentUser } = useAuthStore();
  const { selectedCountry } = useCountryStore();
  const { getSchedule, saveSchedule } = useCalendarStore();
  const navigate = useNavigate();

  const l = PAGE_LABELS[lang] ?? PAGE_LABELS.en;
  const sl = STATUS_LABELS[lang] ?? STATUS_LABELS.en;
  const { prefs: notifPrefs, updatePrefs: updateNotifPrefs } =
    useNotificationStore(currentUser?.id ? String(currentUser.id) : "guest");
  const [pushPermission, setPushPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default",
  );

  const requestPush = () => {
    if (typeof Notification !== "undefined") {
      Notification.requestPermission()
        .then((perm) => {
          setPushPermission(perm);
          if (perm === "granted") {
            updateNotifPrefs({
              channels: { ...notifPrefs.channels, push: true },
            });
          }
        })
        .catch(() => {});
    }
  };
  const dayLabels = DAY_LABELS[lang] ?? DAY_LABELS.en;

  const proId = currentUser ? String(currentUser.id) : "";
  const country = selectedCountry ?? "FR";
  const existing = getSchedule(proId);

  const [status, setStatus] = useState<
    "available" | "on_request" | "unavailable"
  >(existing?.status ?? "available");
  const [workingDays, setWorkingDays] = useState<Record<string, DaySchedule>>(
    existing?.workingDays ?? buildDefaultDays(),
  );
  const [blockedDates, setBlockedDates] = useState<string[]>(
    existing?.blockedDates ?? [],
  );
  const [publicHolidaysEnabled, setPublicHolidaysEnabled] = useState(
    existing?.publicHolidaysEnabled ?? true,
  );
  const [newBlockedDate, setNewBlockedDate] = useState("");

  useEffect(() => {
    if (!currentUser) void navigate({ to: "/login" });
    else if (currentUser.role !== "pro")
      void navigate({ to: "/dashboard/client" });
  }, [currentUser, navigate]);

  function toggleDay(key: string) {
    setWorkingDays((prev) => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled },
    }));
  }

  function setTime(
    key: string,
    field: "openTime" | "closeTime",
    value: string,
  ) {
    setWorkingDays((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  }

  function addBlockedDate() {
    if (!newBlockedDate || blockedDates.includes(newBlockedDate)) return;
    setBlockedDates((prev) => [...prev, newBlockedDate].sort());
    setNewBlockedDate("");
  }

  function removeBlockedDate(date: string) {
    setBlockedDates((prev) => prev.filter((d) => d !== date));
  }

  function handleSave() {
    const schedule: ProSchedule = {
      proId,
      workingDays,
      blockedDates,
      publicHolidaysEnabled,
      country,
      status,
      updatedAt: Date.now(),
    };
    saveSchedule(schedule);
    toast.success(l.saved);
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void navigate({ to: "/dashboard/pro" })}
            className="h-9 w-9 p-0 rounded-full"
            data-ocid="schedule.back.button"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h1 className="font-display text-2xl font-bold text-foreground">
              {l.title}
            </h1>
          </div>
        </div>

        <div className="space-y-6">
          {/* Quick Status */}
          <div className="bg-white rounded-xl card-shadow border border-border/50 p-5">
            <h2 className="font-display font-bold text-base text-foreground mb-4">
              {l.quickStatus}
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setStatus("available")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border-2 ${
                  status === "available"
                    ? "bg-green-100 text-green-800 border-green-400"
                    : "bg-white text-muted-foreground border-border hover:border-green-300"
                }`}
                data-ocid="schedule.available.toggle"
              >
                {status === "available" && (
                  <CheckCircle className="h-4 w-4 inline mr-1.5" />
                )}
                {sl.available}
              </button>
              <button
                type="button"
                onClick={() => setStatus("on_request")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border-2 ${
                  status === "on_request"
                    ? "bg-amber-100 text-amber-800 border-amber-400"
                    : "bg-white text-muted-foreground border-border hover:border-amber-300"
                }`}
                data-ocid="schedule.on_request.toggle"
              >
                {status === "on_request" && (
                  <CheckCircle className="h-4 w-4 inline mr-1.5" />
                )}
                {sl.on_request}
              </button>
              <button
                type="button"
                onClick={() => setStatus("unavailable")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border-2 ${
                  status === "unavailable"
                    ? "bg-red-100 text-red-800 border-red-400"
                    : "bg-white text-muted-foreground border-border hover:border-red-300"
                }`}
                data-ocid="schedule.unavailable.toggle"
              >
                {status === "unavailable" && (
                  <CheckCircle className="h-4 w-4 inline mr-1.5" />
                )}
                {sl.unavailable}
              </button>
            </div>
          </div>

          {/* Working Days */}
          <div className="bg-white rounded-xl card-shadow border border-border/50 p-5">
            <h2 className="font-display font-bold text-base text-foreground mb-4">
              {l.workingDays}
            </h2>
            <div className="space-y-4">
              {DAY_KEYS.map((key, i) => {
                const day = workingDays[key] ?? {
                  enabled: false,
                  openTime: "08:00",
                  closeTime: "18:00",
                };
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold text-foreground">
                        {dayLabels[i]}
                      </Label>
                      <Switch
                        checked={day.enabled}
                        onCheckedChange={() => toggleDay(key)}
                        data-ocid={`schedule.day_${key}.switch`}
                      />
                    </div>
                    {day.enabled && (
                      <div className="flex items-center gap-3 ml-0 pl-0">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xs text-muted-foreground w-14">
                            {l.openTime}
                          </span>
                          <select
                            className="flex-1 rounded-lg border border-border bg-background text-sm px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring"
                            value={day.openTime}
                            onChange={(e) =>
                              setTime(key, "openTime", e.target.value)
                            }
                            data-ocid={`schedule.day_${key}.open.select`}
                          >
                            {HOURS.map((h) => (
                              <option key={h} value={h}>
                                {h}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xs text-muted-foreground w-14">
                            {l.closeTime}
                          </span>
                          <select
                            className="flex-1 rounded-lg border border-border bg-background text-sm px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring"
                            value={day.closeTime}
                            onChange={(e) =>
                              setTime(key, "closeTime", e.target.value)
                            }
                            data-ocid={`schedule.day_${key}.close.select`}
                          >
                            {HOURS.map((h) => (
                              <option key={h} value={h}>
                                {h}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Blocked Dates */}
          <div className="bg-white rounded-xl card-shadow border border-border/50 p-5">
            <h2 className="font-display font-bold text-base text-foreground mb-4">
              {l.blockedDates}
            </h2>

            {/* Public holidays toggle */}
            <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-muted/30 border border-border">
              <Label className="text-sm font-medium text-foreground cursor-pointer">
                {l.publicHolidays}
              </Label>
              <Switch
                checked={publicHolidaysEnabled}
                onCheckedChange={setPublicHolidaysEnabled}
                data-ocid="schedule.public_holidays.switch"
              />
            </div>

            {/* Add blocked date */}
            <div className="flex gap-2 mb-4">
              <input
                type="date"
                value={newBlockedDate}
                onChange={(e) => setNewBlockedDate(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-background text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                data-ocid="schedule.blocked_date.input"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addBlockedDate}
                disabled={!newBlockedDate}
                data-ocid="schedule.blocked_date.add_button"
              >
                {l.addBlockedDate}
              </Button>
            </div>

            {/* List of blocked dates */}
            {blockedDates.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {blockedDates.map((date) => (
                  <span
                    key={date}
                    className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 rounded-full px-3 py-1 text-xs font-medium"
                    data-ocid="schedule.blocked_date.item"
                  >
                    {date}
                    <button
                      type="button"
                      onClick={() => removeBlockedDate(date)}
                      className="hover:text-red-900 ml-0.5"
                      data-ocid="schedule.blocked_date.delete_button"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-xl card-shadow border border-border/50 p-5 space-y-4">
            <h2 className="font-display font-bold text-base text-foreground flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              {l.notifTitle}
            </h2>

            {/* Channels */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground">
                  {l.notifPush}
                </Label>
                <Switch
                  checked={notifPrefs.channels.push}
                  onCheckedChange={(v) =>
                    updateNotifPrefs({
                      channels: { ...notifPrefs.channels, push: v },
                    })
                  }
                  data-ocid="schedule.notif_push.switch"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground">
                  {l.notifEmail}
                </Label>
                <Switch
                  checked={notifPrefs.channels.email}
                  onCheckedChange={(v) =>
                    updateNotifPrefs({
                      channels: { ...notifPrefs.channels, email: v },
                    })
                  }
                  data-ocid="schedule.notif_email.switch"
                />
              </div>
            </div>

            <div className="h-px bg-border/50" />

            {/* Reminder intervals */}
            <div className="space-y-3">
              {(
                [
                  { key: "weeklyDigest", label: l.notifWeeklyDigest },
                  { key: "h72", label: l.notif72h },
                  { key: "h24", label: l.notif24h },
                  { key: "h8", label: l.notif8h },
                  { key: "h4", label: l.notif4h },
                  { key: "h2", label: l.notif2h },
                ] as const
              ).map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <Label className="text-sm text-foreground/80">{label}</Label>
                  <Switch
                    checked={notifPrefs.reminders[key]}
                    onCheckedChange={(v) =>
                      updateNotifPrefs({
                        reminders: { ...notifPrefs.reminders, [key]: v },
                      })
                    }
                    data-ocid={`schedule.notif_${key}.switch`}
                  />
                </div>
              ))}
            </div>

            {/* Enable push button if not granted */}
            {pushPermission !== "granted" && (
              <button
                type="button"
                onClick={requestPush}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-primary/40 text-primary text-sm font-medium py-2.5 hover:bg-primary/5 transition-colors"
                data-ocid="schedule.enable_push.button"
              >
                {pushPermission === "denied" ? (
                  <BellOff className="h-4 w-4" />
                ) : (
                  <Bell className="h-4 w-4" />
                )}
                {l.enablePush}
              </button>
            )}
          </div>

          {/* Save button */}
          <Button
            onClick={() => {
              handleSave();
            }}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-12"
            data-ocid="schedule.save.primary_button"
          >
            <Save className="h-4 w-4" />
            {l.save}
          </Button>
        </div>
      </div>
    </main>
  );
}

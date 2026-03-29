import { Button } from "@/components/ui/button";
import { useCalendarStore } from "@/lib/calendar-store";
import { useTranslation } from "@/lib/i18n";
import { isPublicHoliday } from "@/lib/public-holidays";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface BookingCalendarProps {
  proId: string;
  proCountry: string;
  onSelectDate?: (date: string, timeSlot: string) => void;
  readOnly?: boolean;
}

const DAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DAY_HEADERS: Record<string, string[]> = {
  fr: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  de: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
  es: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
  it: ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"],
  pt: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
  nl: ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"],
  el: ["Δε", "Τρ", "Τε", "Πε", "Πα", "Σά", "Κυ"],
  ie: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};

const MONTH_NAMES: Record<string, string[]> = {
  fr: [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ],
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  de: [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ],
  es: [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ],
  it: [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ],
  pt: [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ],
  nl: [
    "Januari",
    "Februari",
    "Maart",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Augustus",
    "September",
    "Oktober",
    "November",
    "December",
  ],
  el: [
    "Ιανουάριος",
    "Φεβρουάριος",
    "Μάρτιος",
    "Απρίλιος",
    "Μάιος",
    "Ιούνιος",
    "Ιούλιος",
    "Αύγουστος",
    "Σεπτέμβριος",
    "Οκτώβριος",
    "Νοέμβριος",
    "Δεκέμβριος",
  ],
  ie: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
};

function formatDate(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function generateTimeSlots(openTime: string, closeTime: string): string[] {
  const slots: string[] = [];
  const [openH, openM] = openTime.split(":").map(Number);
  const [closeH, closeM] = closeTime.split(":").map(Number);
  let h = openH;
  let m = openM;
  while (h < closeH || (h === closeH && m < closeM)) {
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    m += 30;
    if (m >= 60) {
      m -= 60;
      h += 1;
    }
  }
  return slots;
}

export function BookingCalendar({
  proId,
  proCountry,
  onSelectDate,
  readOnly = false,
}: BookingCalendarProps) {
  const { lang } = useTranslation();
  const { getSchedule, getBookingsForPro } = useCalendarStore();
  const schedule = getSchedule(proId);
  const proBookings = getBookingsForPro(proId);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const headers = DAY_HEADERS[lang] ?? DAY_HEADERS.en;
  const months = MONTH_NAMES[lang] ?? MONTH_NAMES.en;

  // Build calendar grid (Mon-Sun)
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  // 0=Sun,1=Mon...6=Sat → shift to Mon-based
  let startDow = firstDayOfMonth.getDay() - 1;
  if (startDow < 0) startDow = 6;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function getDayStatus(
    day: number,
  ): "available" | "booked" | "closed" | "past" {
    const dateStr = formatDate(viewYear, viewMonth, day);
    const todayStr = formatDate(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    if (dateStr < todayStr) return "past";
    if (!schedule) return "closed";
    if (schedule.status === "unavailable") return "closed";

    // Public holiday
    if (
      schedule.publicHolidaysEnabled &&
      isPublicHoliday(schedule.country || proCountry, dateStr)
    )
      return "closed";

    // Blocked
    if (schedule.blockedDates.includes(dateStr)) return "closed";

    // Day of week
    const date = new Date(`${dateStr}T12:00:00`);
    const dow = date.getDay(); // 0=Sun
    // Convert to Mon-based index
    const dowIdx = dow === 0 ? 6 : dow - 1;
    const dayKey = DAY_KEYS[dowIdx];
    const daySchedule = schedule.workingDays[dayKey];
    if (!daySchedule?.enabled) return "closed";

    // Check bookings
    const isBooked = proBookings.some(
      (b) =>
        b.date === dateStr &&
        (b.status === "accepted" || b.status === "confirmed"),
    );
    if (isBooked) return "booked";

    return "available";
  }

  function getTimeSlots(dateStr: string): string[] {
    if (!schedule) return [];
    const date = new Date(`${dateStr}T12:00:00`);
    const dow = date.getDay();
    const dowIdx = dow === 0 ? 6 : dow - 1;
    const dayKey = DAY_KEYS[dowIdx];
    const daySchedule = schedule.workingDays[dayKey];
    if (!daySchedule?.enabled) return [];
    return generateTimeSlots(daySchedule.openTime, daySchedule.closeTime);
  }

  function handleDayClick(day: number) {
    if (readOnly || !onSelectDate) return;
    const status = getDayStatus(day);
    if (status !== "available") return;
    const dateStr = formatDate(viewYear, viewMonth, day);
    setSelectedDate(dateStr);
    setSelectedSlot(null);
  }

  function handleSlotSelect(slot: string) {
    setSelectedSlot(slot);
  }

  function handleConfirmSlot() {
    if (selectedDate && selectedSlot && onSelectDate) {
      onSelectDate(selectedDate, selectedSlot);
      setSelectedDate(null);
      setSelectedSlot(null);
    }
  }

  const bookLabel: Record<string, string> = {
    fr: "Réserver ce créneau",
    en: "Book this slot",
    de: "Diesen Slot buchen",
    es: "Reservar este horario",
    it: "Prenota questo slot",
    pt: "Reservar este horário",
    nl: "Dit tijdslot reserveren",
    el: "Κράτηση αυτής της ώρας",
    ie: "Book this slot",
  };

  const selectTimeLabel: Record<string, string> = {
    fr: "Choisir un créneau",
    en: "Choose a time slot",
    de: "Uhrzeit wählen",
    es: "Elegir horario",
    it: "Scegli un orario",
    pt: "Escolher horário",
    nl: "Tijdslot kiezen",
    el: "Επιλέξτε ώρα",
    ie: "Choose a time slot",
  };

  const noScheduleLabel: Record<string, string> = {
    fr: "Ce professionnel n'a pas encore configuré ses disponibilités.",
    en: "This professional hasn't set their availability yet.",
    de: "Dieser Profi hat seine Verfügbarkeit noch nicht eingestellt.",
    es: "Este profesional aún no ha configurado su disponibilidad.",
    it: "Questo professionista non ha ancora configurato la sua disponibilità.",
    pt: "Este profissional ainda não configurou a sua disponibilidade.",
    nl: "Deze professional heeft zijn beschikbaarheid nog niet ingesteld.",
    el: "Αυτός ο επαγγελματίας δεν έχει ρυθμίσει ακόμη τη διαθεσιμότητά του.",
    ie: "This professional hasn't set their availability yet.",
  };

  if (!schedule) {
    return (
      <div className="p-6 text-center text-muted-foreground text-sm rounded-xl border border-border bg-muted/20">
        <p className="text-2xl mb-2">📅</p>
        <p>{noScheduleLabel[lang] ?? noScheduleLabel.en}</p>
      </div>
    );
  }

  const timeSlots = selectedDate ? getTimeSlots(selectedDate) : [];

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (viewMonth === 0) {
              setViewMonth(11);
              setViewYear((y) => y - 1);
            } else {
              setViewMonth((m) => m - 1);
            }
          }}
          data-ocid="calendar.pagination_prev"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-semibold text-sm text-foreground">
          {months[viewMonth]} {viewYear}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (viewMonth === 11) {
              setViewMonth(0);
              setViewYear((y) => y + 1);
            } else {
              setViewMonth((m) => m + 1);
            }
          }}
          data-ocid="calendar.pagination_next"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0.5">
        {headers.map((h) => (
          <div
            key={h}
            className="text-center text-xs font-semibold text-muted-foreground py-1"
          >
            {h}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, cellIndex) => {
          const cellKey = day !== null ? `day-${day}` : `empty-${cellIndex}`;
          if (!day) {
            return <div key={cellKey} />;
          }
          const status = getDayStatus(day);
          const dateStr = formatDate(viewYear, viewMonth, day);
          const isSelected = selectedDate === dateStr;

          let cellClass =
            "w-full aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all ";
          if (status === "past" || status === "closed") {
            cellClass += "bg-gray-100 text-gray-400 cursor-default";
          } else if (status === "booked") {
            cellClass += "bg-red-100 text-red-700 cursor-default";
          } else if (isSelected) {
            cellClass += "bg-primary text-primary-foreground shadow-md";
          } else {
            cellClass +=
              "bg-green-100 text-green-800 cursor-pointer hover:bg-green-200 hover:shadow-sm";
          }

          return (
            <button
              key={cellKey}
              type="button"
              className={cellClass}
              onClick={() => handleDayClick(day)}
              disabled={readOnly || status !== "available"}
              data-ocid="calendar.chart_point"
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-100 border border-green-200" />
          {lang === "fr"
            ? "Disponible"
            : lang === "de"
              ? "Verfügbar"
              : lang === "es"
                ? "Disponible"
                : lang === "it"
                  ? "Disponibile"
                  : lang === "pt"
                    ? "Disponível"
                    : lang === "nl"
                      ? "Beschikbaar"
                      : "Available"}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-100 border border-red-200" />
          {lang === "fr"
            ? "Réservé"
            : lang === "de"
              ? "Gebucht"
              : lang === "es"
                ? "Reservado"
                : lang === "it"
                  ? "Prenotato"
                  : lang === "pt"
                    ? "Reservado"
                    : lang === "nl"
                      ? "Geboekt"
                      : "Booked"}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-gray-100 border border-gray-200" />
          {lang === "fr"
            ? "Fermé"
            : lang === "de"
              ? "Geschlossen"
              : lang === "es"
                ? "Cerrado"
                : lang === "it"
                  ? "Chiuso"
                  : lang === "pt"
                    ? "Fechado"
                    : lang === "nl"
                      ? "Gesloten"
                      : "Closed"}
        </span>
      </div>

      {/* Time slot picker */}
      {!readOnly && selectedDate && timeSlots.length > 0 && (
        <div className="bg-muted/30 rounded-xl p-4 space-y-3 border border-border">
          <p className="text-sm font-semibold text-foreground">
            {selectTimeLabel[lang] ?? selectTimeLabel.en} — {selectedDate}
          </p>
          <div className="flex flex-wrap gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => handleSlotSelect(slot)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedSlot === slot
                    ? "bg-primary text-primary-foreground"
                    : "bg-white border border-border text-foreground hover:border-primary hover:text-primary"
                }`}
                data-ocid="calendar.toggle"
              >
                {slot}
              </button>
            ))}
          </div>
          {selectedSlot && (
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleConfirmSlot}
              data-ocid="calendar.primary_button"
            >
              {bookLabel[lang] ?? bookLabel.en} — {selectedSlot}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

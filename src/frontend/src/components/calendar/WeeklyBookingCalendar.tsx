import { Button } from "@/components/ui/button";
import type { Booking } from "@/lib/calendar-store";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const DAY_ABBREV: Record<string, string[]> = {
  fr: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  de: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
  es: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
  it: ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"],
  pt: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
  nl: ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"],
  el: ["Δευ", "Τρι", "Τετ", "Πεμ", "Παρ", "Σαβ", "Κυρ"],
  lu: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
};

const MONTH_NAMES: Record<string, string[]> = {
  fr: [
    "Jan",
    "Fév",
    "Mar",
    "Avr",
    "Mai",
    "Juin",
    "Juil",
    "Août",
    "Sep",
    "Oct",
    "Nov",
    "Déc",
  ],
  en: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  de: [
    "Jan",
    "Feb",
    "Mär",
    "Apr",
    "Mai",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Okt",
    "Nov",
    "Dez",
  ],
  es: [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ],
  it: [
    "Gen",
    "Feb",
    "Mar",
    "Apr",
    "Mag",
    "Giu",
    "Lug",
    "Ago",
    "Set",
    "Ott",
    "Nov",
    "Dic",
  ],
  pt: [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ],
  nl: [
    "Jan",
    "Feb",
    "Mrt",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Okt",
    "Nov",
    "Dec",
  ],
  el: [
    "Ιαν",
    "Φεβ",
    "Μαρ",
    "Απρ",
    "Μαϊ",
    "Ιουν",
    "Ιουλ",
    "Αυγ",
    "Σεπ",
    "Οκτ",
    "Νοε",
    "Δεκ",
  ],
  lu: [
    "Jan",
    "Fév",
    "Mar",
    "Avr",
    "Mai",
    "Juin",
    "Juil",
    "Août",
    "Sep",
    "Oct",
    "Nov",
    "Déc",
  ],
};

/** Returns the Monday of the week containing `d` (ISO week: Mon=0) */
function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Sun => go back 6, else go to Mon
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
}

function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface WeeklyBookingCalendarProps {
  bookings: Booking[];
  lang: string;
  onBookingClick: (b: Booking) => void;
}

export function WeeklyBookingCalendar({
  bookings,
  lang,
  onBookingClick,
}: WeeklyBookingCalendarProps) {
  const [weekOffset, setWeekOffset] = useState(0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const baseMonday = getMonday(today);
  const weekStart = addDays(baseMonday, weekOffset * 7);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const abbrevs = DAY_ABBREV[lang] ?? DAY_ABBREV.en;
  const months = MONTH_NAMES[lang] ?? MONTH_NAMES.en;

  // Build lookup: ymd -> bookings[]
  const bookingsByDay: Record<string, Booking[]> = {};
  for (const b of bookings) {
    if (!bookingsByDay[b.date]) bookingsByDay[b.date] = [];
    bookingsByDay[b.date].push(b);
  }

  // Week range label e.g. "24 Mar – 30 Mar"
  const rangeStart = days[0];
  const rangeEnd = days[6];
  const rangeLabel = `${rangeStart.getDate()} ${months[rangeStart.getMonth()]} – ${rangeEnd.getDate()} ${months[rangeEnd.getMonth()]} ${rangeEnd.getFullYear()}`;

  return (
    <div className="space-y-3">
      {/* Navigation header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setWeekOffset((w) => w - 1)}
          data-ocid="pro.calendar.pagination_prev"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold text-foreground">
          {rangeLabel}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setWeekOffset((w) => w + 1)}
          data-ocid="pro.calendar.pagination_next"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Desktop: 7 columns — Mobile: 3 columns with hint */}
      <div className="grid grid-cols-3 sm:grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((day, idx) => {
          const ymd = toYMD(day);
          const isToday = ymd === toYMD(today);
          const dayBookings = (bookingsByDay[ymd] ?? []).sort((a, b) =>
            a.timeSlot.localeCompare(b.timeSlot),
          );

          // On mobile, show only Mon Tue Wed by default (first 3) or shift with weekOffset
          // We just show all 7 and let grid wrap naturally; CSS handles 3-col on mobile
          if (idx >= 3 && window.innerWidth < 640) {
            // Hidden on mobile beyond 3rd column – user can use prev/next
          }

          return (
            <div
              key={ymd}
              className={`flex flex-col rounded-xl border ${
                isToday
                  ? "border-primary bg-primary/5"
                  : "border-border/50 bg-white"
              } overflow-hidden min-h-[120px]`}
            >
              {/* Day header */}
              <div
                className={`px-1.5 py-1.5 text-center border-b ${
                  isToday
                    ? "bg-primary/10 border-primary/20"
                    : "bg-muted/30 border-border/30"
                }`}
              >
                <p
                  className={`text-xs font-bold uppercase tracking-wide ${isToday ? "text-primary" : "text-muted-foreground"}`}
                >
                  {abbrevs[idx]}
                </p>
                <p
                  className={`text-base font-bold leading-tight ${isToday ? "text-primary" : "text-foreground"}`}
                >
                  {day.getDate()}
                </p>
              </div>

              {/* Bookings */}
              <div className="flex-1 p-1 space-y-1 overflow-y-auto max-h-[160px]">
                {dayBookings.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    —
                  </p>
                ) : (
                  dayBookings.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => onBookingClick(b)}
                      className="w-full text-left rounded-md bg-orange-50 border border-orange-200 hover:bg-orange-100 hover:border-orange-400 transition-colors px-1.5 py-1 space-y-0.5 cursor-pointer group"
                      data-ocid="pro.calendar.item.1"
                    >
                      <p className="text-xs font-semibold text-orange-800 leading-tight truncate">
                        {b.timeSlot}
                      </p>
                      <p className="text-xs text-orange-700 truncate group-hover:text-orange-900">
                        {b.clientName}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile hint */}
      <p className="text-xs text-muted-foreground text-center sm:hidden">
        ←{" "}
        {lang === "fr" || lang === "lu"
          ? "Utilisez les flèches pour naviguer"
          : "Use arrows to navigate"}{" "}
        →
      </p>
    </div>
  );
}

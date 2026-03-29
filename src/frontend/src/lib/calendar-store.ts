import {
  type ReactNode,
  createContext,
  createElement,
  useCallback,
  useContext,
  useState,
} from "react";
import { isPublicHoliday } from "./public-holidays";

export type DaySchedule = {
  enabled: boolean;
  openTime: string; // "HH:MM"
  closeTime: string; // "HH:MM"
};

export type ProSchedule = {
  proId: string;
  workingDays: Record<string, DaySchedule>; // key: "monday"|...|"sunday"
  blockedDates: string[]; // "YYYY-MM-DD"
  publicHolidaysEnabled: boolean;
  country: string;
  status: "available" | "on_request" | "unavailable";
  updatedAt: number;
};

export type Booking = {
  id: string;
  clientId: string;
  proId: string;
  clientName: string;
  proName: string;
  date: string; // "YYYY-MM-DD"
  timeSlot: string; // "HH:MM"
  description: string;
  status:
    | "pending"
    | "accepted"
    | "declined"
    | "counter_proposed"
    | "confirmed"
    | "cancelled";
  counterDate?: string;
  counterTime?: string;
  createdAt: number;
  updatedAt: number;
};

const LS_SCHEDULES_KEY = "taskvoila_pro_schedules";
const LS_BOOKINGS_KEY = "taskvoila_bookings";

function loadSchedules(): Record<string, ProSchedule> {
  try {
    const raw = localStorage.getItem(LS_SCHEDULES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, ProSchedule>;
  } catch {
    return {};
  }
}

function saveSchedules(data: Record<string, ProSchedule>): void {
  try {
    localStorage.setItem(LS_SCHEDULES_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function loadBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(LS_BOOKINGS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Booking[];
  } catch {
    return [];
  }
}

function saveBookings(data: Booking[]): void {
  try {
    localStorage.setItem(LS_BOOKINGS_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

const DAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

type CalendarStoreContextType = {
  getSchedule: (proId: string) => ProSchedule | null;
  saveSchedule: (schedule: ProSchedule) => void;
  createBooking: (
    booking: Omit<Booking, "id" | "createdAt" | "updatedAt">,
  ) => Booking;
  respondToBooking: (
    bookingId: string,
    response: "accepted" | "declined" | "counter_proposed",
    counterDate?: string,
    counterTime?: string,
  ) => void;
  confirmCounterProposal: (bookingId: string) => void;
  cancelBooking: (bookingId: string) => void;
  getBookingsForPro: (proId: string) => Booking[];
  getBookingsForClient: (clientId: string) => Booking[];
  getBookingById: (id: string) => Booking | null;
  isDateAvailable: (proId: string, dateStr: string) => boolean;
};

const CalendarStoreContext = createContext<
  CalendarStoreContextType | undefined
>(undefined);

export function CalendarStoreProvider({ children }: { children: ReactNode }) {
  const [schedules, setSchedules] =
    useState<Record<string, ProSchedule>>(loadSchedules);
  const [bookings, setBookings] = useState<Booking[]>(loadBookings);

  const getSchedule = useCallback(
    (proId: string): ProSchedule | null => {
      return schedules[proId] ?? null;
    },
    [schedules],
  );

  const saveSchedule = useCallback((schedule: ProSchedule): void => {
    setSchedules((prev) => {
      const updated = { ...prev, [schedule.proId]: schedule };
      saveSchedules(updated);
      return updated;
    });
  }, []);

  const createBooking = useCallback(
    (booking: Omit<Booking, "id" | "createdAt" | "updatedAt">): Booking => {
      const now = Date.now();
      const newBooking: Booking = {
        ...booking,
        id: `booking_${now}_${Math.random().toString(36).slice(2, 7)}`,
        createdAt: now,
        updatedAt: now,
      };
      setBookings((prev) => {
        const updated = [newBooking, ...prev];
        saveBookings(updated);
        return updated;
      });
      return newBooking;
    },
    [],
  );

  const respondToBooking = useCallback(
    (
      bookingId: string,
      response: "accepted" | "declined" | "counter_proposed",
      counterDate?: string,
      counterTime?: string,
    ): void => {
      setBookings((prev) => {
        const updated = prev.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                status: response,
                counterDate,
                counterTime,
                updatedAt: Date.now(),
              }
            : b,
        );
        saveBookings(updated);
        return updated;
      });
    },
    [],
  );

  const confirmCounterProposal = useCallback((bookingId: string): void => {
    setBookings((prev) => {
      const updated = prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: "confirmed" as const,
              date: b.counterDate ?? b.date,
              timeSlot: b.counterTime ?? b.timeSlot,
              counterDate: undefined,
              counterTime: undefined,
              updatedAt: Date.now(),
            }
          : b,
      );
      saveBookings(updated);
      return updated;
    });
  }, []);

  const cancelBooking = useCallback((bookingId: string): void => {
    setBookings((prev) => {
      const updated = prev.map((b) =>
        b.id === bookingId
          ? { ...b, status: "cancelled" as const, updatedAt: Date.now() }
          : b,
      );
      saveBookings(updated);
      return updated;
    });
  }, []);

  const getBookingsForPro = useCallback(
    (proId: string): Booking[] => {
      return bookings
        .filter((b) => b.proId === proId)
        .sort((a, b) => b.createdAt - a.createdAt);
    },
    [bookings],
  );

  const getBookingsForClient = useCallback(
    (clientId: string): Booking[] => {
      return bookings
        .filter((b) => b.clientId === clientId)
        .sort((a, b) => b.createdAt - a.createdAt);
    },
    [bookings],
  );

  const getBookingById = useCallback(
    (id: string): Booking | null => {
      return bookings.find((b) => b.id === id) ?? null;
    },
    [bookings],
  );

  const isDateAvailable = useCallback(
    (proId: string, dateStr: string): boolean => {
      const schedule = schedules[proId];
      if (!schedule) return false;
      if (schedule.status === "unavailable") return false;

      // Check public holidays
      if (
        schedule.publicHolidaysEnabled &&
        isPublicHoliday(schedule.country, dateStr)
      )
        return false;

      // Check blocked dates
      if (schedule.blockedDates.includes(dateStr)) return false;

      // Check day of week
      const date = new Date(`${dateStr}T12:00:00`);
      const dayName = DAY_NAMES[date.getDay()];
      const daySchedule = schedule.workingDays[dayName];
      if (!daySchedule?.enabled) return false;

      // Check no accepted/confirmed booking on that date
      const conflictingBooking = bookings.find(
        (b) =>
          b.proId === proId &&
          b.date === dateStr &&
          (b.status === "accepted" || b.status === "confirmed"),
      );
      return !conflictingBooking;
    },
    [schedules, bookings],
  );

  return createElement(
    CalendarStoreContext.Provider,
    {
      value: {
        getSchedule,
        saveSchedule,
        createBooking,
        respondToBooking,
        confirmCounterProposal,
        cancelBooking,
        getBookingsForPro,
        getBookingsForClient,
        getBookingById,
        isDateAvailable,
      },
    },
    children,
  );
}

export function useCalendarStore() {
  const ctx = useContext(CalendarStoreContext);
  if (!ctx) {
    throw new Error(
      "useCalendarStore must be used within CalendarStoreProvider",
    );
  }
  return ctx;
}

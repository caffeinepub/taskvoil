import { useCallback, useEffect, useRef, useState } from "react";
import type { Booking } from "./calendar-store";

export type NotificationPrefs = {
  enabled: boolean;
  channels: { push: boolean; email: boolean };
  reminders: {
    weeklyDigest: boolean;
    h72: boolean;
    h24: boolean;
    h8: boolean;
    h4: boolean;
    h2: boolean;
  };
};

export const DEFAULT_NOTIF_PREFS: NotificationPrefs = {
  enabled: true,
  channels: { push: true, email: true },
  reminders: {
    weeklyDigest: true,
    h72: true,
    h24: true,
    h8: true,
    h4: true,
    h2: true,
  },
};

function getStorageKey(userId: string) {
  return `taskvoila_notif_prefs_${userId}`;
}

function loadPrefs(userId: string): NotificationPrefs {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return { ...DEFAULT_NOTIF_PREFS };
    return JSON.parse(raw) as NotificationPrefs;
  } catch {
    return { ...DEFAULT_NOTIF_PREFS };
  }
}

function savePrefs(userId: string, prefs: NotificationPrefs) {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

const REMINDER_INTERVALS: Array<{
  key: keyof NotificationPrefs["reminders"];
  ms: number;
  label: string;
}> = [
  { key: "h72", ms: 72 * 60 * 60 * 1000, label: "72h" },
  { key: "h24", ms: 24 * 60 * 60 * 1000, label: "24h" },
  { key: "h8", ms: 8 * 60 * 60 * 1000, label: "8h" },
  { key: "h4", ms: 4 * 60 * 60 * 1000, label: "4h" },
  { key: "h2", ms: 2 * 60 * 60 * 1000, label: "2h" },
];

export function useNotificationStore(userId = "guest") {
  const [prefs, setPrefs] = useState<NotificationPrefs>(() =>
    loadPrefs(userId),
  );
  const timeoutRefs = useRef<number[]>([]);

  // Reload prefs when userId changes
  useEffect(() => {
    setPrefs(loadPrefs(userId));
  }, [userId]);

  const updatePrefs = useCallback(
    (updates: Partial<NotificationPrefs>) => {
      setPrefs((prev) => {
        const next = { ...prev, ...updates };
        savePrefs(userId, next);
        return next;
      });
    },
    [userId],
  );

  const clearScheduledReminders = useCallback(() => {
    for (const id of timeoutRefs.current) {
      clearTimeout(id);
    }
    timeoutRefs.current = [];
  }, []);

  const scheduleRemindersForBookings = useCallback(
    (bookings: Booking[], currentPrefs: NotificationPrefs) => {
      clearScheduledReminders();

      if (!currentPrefs.enabled || !currentPrefs.channels.push) return;

      const now = Date.now();
      const upcomingBookings = bookings.filter(
        (b) => b.status === "accepted" || b.status === "confirmed",
      );

      for (const booking of upcomingBookings) {
        const bookingDateStr = `${booking.date}T${booking.timeSlot}:00`;
        const bookingTime = new Date(bookingDateStr).getTime();
        if (Number.isNaN(bookingTime)) continue;

        for (const interval of REMINDER_INTERVALS) {
          if (!currentPrefs.reminders[interval.key]) continue;
          const fireAt = bookingTime - interval.ms;
          const delay = fireAt - now;
          if (delay <= 0) continue;

          const id = window.setTimeout(() => {
            // Push notification
            if (Notification.permission === "granted") {
              try {
                new Notification(`⏰ Rappel RDV — ${interval.label} avant`, {
                  body: `${booking.clientName} · ${booking.date} à ${booking.timeSlot}`,
                  icon: "/assets/icons/icon-192.png",
                  tag: `booking-${booking.id}-${interval.key}`,
                });
              } catch {
                // Notification not supported
              }
            }

            // Email notification stub — will work once Caffeine email is stable
            if (currentPrefs.channels.email) {
              // Email sending is handled server-side via Caffeine email service
              // This stub is intentional: the structure is ready for when
              // the Caffeine email beta becomes stable
              console.error(
                `[TaskVoilà] Email reminder scheduled: booking ${booking.id}, interval ${interval.label}`,
              );
            }
          }, delay);

          timeoutRefs.current.push(id);
        }
      }
    },
    [clearScheduledReminders],
  );

  // Cleanup on unmount
  useEffect(() => {
    return clearScheduledReminders;
  }, [clearScheduledReminders]);

  return { prefs, updatePrefs, scheduleRemindersForBookings };
}

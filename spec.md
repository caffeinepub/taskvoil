# TaskVoilà

## Current State
- ProDashboard booking tab has `ud83dudcc5` (📅) and `ud83dudd50` (🕐) displayed as raw text due to Unicode encoding bug
- Bookings are shown as a simple list (no weekly calendar view)
- No reminder notification system exists beyond basic in-app notifications
- `push-notifications.ts` has basic permission request only
- `calendar-store.ts` has Booking type with date/timeSlot fields

## Requested Changes (Diff)

### Add
- Weekly calendar view in ProDashboard bookings tab (toggle between list and weekly views)
  - Current week displayed Mon-Sun, each day a column
  - Bookings shown as orange cards on their date
  - Click on a booking card → details modal
  - Navigation previous/next week
- Notification reminder system for pros:
  - Weekly digest (sent every Monday for the week's upcoming bookings)
  - 72h, 24h, 8h, 4h, 2h before each booking
  - Default: all enabled
  - Per-channel: push notification (Web Notifications API) + email
- Notification preferences UI in ProSchedulePage (new section "Notifications de rappel")
  - Toggle each reminder interval on/off
  - Toggle email on/off, push on/off
  - Saved to localStorage per user
- `notification-store.ts`: store for notification preferences + scheduling logic

### Modify
- `ProDashboard.tsx` lines 2343, 2381, 2382: replace `ud83dudcc5` with `📅` and `ud83dudd50` with `🕐`
- `ProDashboard.tsx` bookings tab: add weekly calendar view toggle (list/calendar icons), render WeeklyBookingCalendar component
- `ProSchedulePage.tsx`: add notification preferences section at the bottom
- `push-notifications.ts`: add `scheduleBookingReminders(bookings, prefs)` function

### Remove
- Nothing removed

## Implementation Plan
1. Fix emoji encoding in ProDashboard.tsx (3 lines)
2. Create `src/frontend/src/lib/notification-store.ts` with preferences type, default config, localStorage persistence, and reminder scheduling using setTimeout + Web Notifications API + email hooks
3. Create `src/frontend/src/components/calendar/WeeklyBookingCalendar.tsx` component showing Mon-Sun grid with orange booking cards
4. Add view toggle (list/weekly) in ProDashboard bookings tab, wire WeeklyBookingCalendar
5. Add notification preferences section in ProSchedulePage
6. Add translations for new UI strings in all 9 languages (fr, en, de, es, it, pt, nl, el, lu)

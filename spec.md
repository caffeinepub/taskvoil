# TaskVoilà — FAQ + Account Recovery

## Current State
- Settings page exists at /settings with security, notifications, account sections
- Footer has links but FAQ link goes to /
- No FAQ page exists
- No account recovery information shown anywhere in the app
- App.tsx has all routes defined

## Requested Changes (Diff)

### Add
- New page `/faq` with full FAQ in all 9 languages (FR, EN, DE, ES, IT, PT, NL, EL, LU)
- FAQ covers: how TaskVoilà works, how to sign up, how to post a task, how to find a pro, how to book, payments, security, account recovery (Internet Identity / NFID / Plug), DAC7 for pros, GDPR, equipment rental, calendar booking
- Account recovery section in Settings page: "Comment récupérer mon compte" with instructions per auth method (II, NFID, Plug) + link to identity.ic0.app
- Toast/modal after first login with message: "Sauvegardez votre méthode de connexion pour ne pas perdre l'accès à votre compte"
- FAQ route in App.tsx
- Footer FAQ link updated to point to /faq

### Modify
- Footer: FAQ link updated from / to /faq
- SettingsPage: add account recovery card section
- LoginPage: show one-time advice after login about saving credentials

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/pages/FAQPage.tsx` with accordion Q&A in 9 languages
2. Add `/faq` route in App.tsx
3. Update Footer.tsx FAQ link to /faq
4. Add account recovery card in SettingsPage.tsx
5. Add first-login advice in auth-store or LoginPage (localStorage flag `tv_recovery_shown`)

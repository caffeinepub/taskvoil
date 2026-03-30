# TaskVoilà — Triptyque Homes + Scénarios Guidés + i18n Global

## Current State
The platform has a single `LandingPage.tsx` displayed for all users regardless of authentication state. It contains country-specific slogans and a generic hero section. The i18n system supports 9 languages (FR, EN/IE, DE, ES, IT, PT, NL, EL, LU) via translation files in `/lib/translations/`. Some hardcoded language logic still exists in LandingPage (COUNTRY_SLOGANS, COUNTRY_HEADLINES as Records, plus `realisations` items with labelFR/labelEN only). Auth state is available via `useAuthStore` (currentUser with role: 'client' | 'pro' | 'admin').

## Requested Changes (Diff)

### Add
- `VisitorHomePage.tsx` — Public home for non-logged-in users: country-specific hero, 2 CTAs ("I need help" / "I offer services"), platform explainer, how-it-works section, fully i18n
- `ClientHomePage.tsx` — "Mon espace TaskVoilà" for logged-in clients: personalized greeting, dynamic blocks (trusted pros, nearby pros, requests around me, urgencies, inspirations); hybrid empty states (positive message + CTA + static fallback); access to Scenarios from the "Inspirations" block
- `ProHomePage.tsx` — Dashboard Pro for logged-in pros: actionable blocks (targeted requests, nearby missions, urgencies, already-served clients, pro tips); hybrid empty states for each block
- `ScenariosPage.tsx` — Grid of 5 scenario cards (infrastructure ready, placeholder content for now); route `/scenarios`
- `ScenarioDetailPage.tsx` — Detail page for a scenario: list of ~8 task ideas with "Add to selection" buttons + selection banner; route `/scenarios/:id`
- `ScenarioRecapPage.tsx` — Recap/publish page: selected tasks with quick edits before posting; route `/scenarios/recap`
- i18n keys for all new pages/blocks added to all 9 translation files (FR, EN, IE, DE, ES, IT, PT, NL, EL, LU)

### Modify
- `App.tsx` routing: `/` route dispatches based on auth state — visitor → VisitorHomePage, client → ClientHomePage, pro/admin → ProHomePage
- `LandingPage.tsx`: extract reusable hero/realisation components; COUNTRY_SLOGANS and COUNTRY_HEADLINES replaced with i18n keys from translation files (one per language, not per country)
- All translation files: add `home`, `scenarios`, `clientHome`, `proHome` key groups

### Remove
- Nothing removed; LandingPage kept for backward compat if needed

## Implementation Plan
1. Add i18n key groups (`home.visitor.*`, `home.client.*`, `home.pro.*`, `scenarios.*`) to all 9 translation files
2. Create `VisitorHomePage.tsx` with country hero, 2 CTAs, platform explainer, how-it-works
3. Create `ClientHomePage.tsx` with 5 dynamic blocks + hybrid empty states + Scenarios entry point
4. Create `ProHomePage.tsx` with 4 actionable blocks + hybrid empty states
5. Create `ScenariosPage.tsx`, `ScenarioDetailPage.tsx`, `ScenarioRecapPage.tsx` with placeholder scenario data
6. Update `App.tsx` to route `/` based on auth role
7. Fix COUNTRY_SLOGANS/COUNTRY_HEADLINES in LandingPage to use translation keys
8. Validate (lint + typecheck + build)

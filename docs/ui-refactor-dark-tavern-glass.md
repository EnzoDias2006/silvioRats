# Dark Tavern Glass UI Refactor

## Design Intent
- Move the web UI toward a dark premium minimalism inspired by Linear, Raycast, Vercel, and modern Telegram glass surfaces.
- Keep the Bar do Silvio identity present through moss green, amber, wood, and warm neutral accents.
- Favor soft glassmorphism, subtle borders, rounded interactive elements, and low-noise backgrounds.

## Tokens Introduced
- Added semantic color tokens in `apps/web/src/styles/main.css` for backgrounds, surfaces, borders, text, accents, and danger states.
- Added motion, blur, radius, and shadow tokens to standardize surfaces and interactions.
- Kept legacy aliases such as `--bg`, `--accent`, and `--text` for compatibility while the refactor settles.

## Files Changed
- `apps/web/src/styles/main.css`
- `apps/web/src/components/AppShell.vue`
- `apps/web/src/features/feed/FeedView.vue`
- `apps/web/src/features/hangouts/HangoutsView.vue`
- `apps/web/src/features/profile/ProfileView.vue`
- `apps/web/src/features/admin/AdminView.vue`
- `apps/web/src/components/InstallLanding.vue`

## What Changed
- Added a floating glass topbar with brand, route context, and quick navigation.
- Reworked the global shell, cards, buttons, inputs, badges, upload areas, and nav pills to share one visual language.
- Strengthened the background atmosphere with layered gradients and subtle light glows.
- Improved empty states and timestamp/chip treatment in feed, hangouts, admin, and profile views.
- Preserved existing feature logic, auth flow, and media upload behavior.

## Validation
- Pending: `bun --filter @silviorats/web typecheck`
- Pending: `bun --filter @silviorats/web test`
- Pending: `bun --filter @silviorats/web build`

## Risks and Follow-Ups
- Global CSS changes may expose small spacing or contrast regressions on less frequently used states.
- Mobile PWA shell still needs a visual pass in standalone mode and on wider desktop screens.
- If the topbar feels too dense on smaller devices, reduce its height and hide more actions behind the bottom nav.

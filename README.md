# DirectAsia (DA) PrimeVue Prototype

Mobile-first prototype of the **DirectAsia** car insurance quote flow, built with Vue 3 + Vite + PrimeVue v4 (Aura preset, DA teal token override).

This is the DirectAsia skin of the One Motor dual-brand product. It shares the same component library as the Budget Direct (BDI) prototype and differs only by: (1) the brand design system below, (2) the page sequence (DA shows the price **last**), and (3) a handful of DA-only fields and scenarios. See `00_Overview/One_Motor_PRD.md` §2–§6 for the product spec.

## Source of truth

Figma file `M0iwRMwawqrDrMHl61p6je` (One Motor Design System) — DirectAsia frames. Brand tokens follow the DirectAsia Singapore site (PRD §3.2). Steps 1–11 cover the full quote journey.

## Brand design system (DirectAsia)

DA's personality is **calm, trustworthy, detail-oriented** — the opposite of BDI's bold, price-forward energy.

| Token (`--da-*`) | Value | Use |
|---|---|---|
| `--da-green` (primary teal) | `#00B2A9` | Primary CTA, selected state, focus, active progress |
| `--da-green-dark` | `#009990` | Primary hover |
| `--da-green-darker` | `#007F78` | Primary active |
| `--da-carbon` (ink) | `#2D3748` | Primary text + outlines |
| `--da-cyan` | `#009990` | Links |
| `--da-accent` | `#FF6B35` | Accent / highlights |
| `--da-red` | `#E53E3E` | Error only |
| `--da-success` / `--da-success-bg` | `#38A169` / `#E6FBF8` | Eligible / positive states |
| `--da-grey-100` (surface) | `#F7F9FC` | Chip / callout background |
| `--da-grey-200` / `300` | `#E2E8F0` | Borders, input borders |
| `--da-grey-600` | `#718096` | Secondary text |
| `--da-bg` | `#F7F9FC` | Page background |
| `--da-radius-card` | `8px` | Buttons + inputs |
| `--da-radius-lg` | `16px` | Card surfaces (softer than BDI) |

Font: **Inter** (Google Fonts) — clean and professional. (BDI uses Nunito Sans.)

> Token NAMES are kept stable across both brand skins so the shared views never change between BDI and DA — only the values in `src/style.css` (`:root`) and the PrimeVue preset in `src/main.js` change.

## DA page sequence (price last)

DirectAsia is "bespoke / most-accurate-price-first": it personalises everything **before** revealing the price, unlike BDI which reveals it earlier.

```
1  Cover type            6  Main driver
2  Cover start date      7  Driving history (+ NCD60 if 50% NCD)
3  Year / make / model   8  Policyholder contact
4  Car usage (+ financing)   9  Additional drivers
5  Annual distance       10 Optional benefits + Drive Less, Pay Less
                         11 Your personalised quote  ← price shown LAST
```

## DA-only scenarios

- **Car under financing** (Step 4) — DA asks upfront for pricing accuracy; BDI defers it to payment.
- **NCD60** (Step 7) — when NCD is 50%, DA asks how long it's been held (qualifies for added NCD protection).
- **Drive Less, Pay Less** (Steps 5, 10, 11) — usage-based pricing for low-mileage drivers:
  1. **Eligible** when annual distance is *Less than 8,000km* (Step 5 shows a "you may qualify" badge and sets `driveLessEligible`).
  2. **Opt in** on the Optional Benefits step (the card only appears if eligible).
  3. Opting in **reveals a required odometer reading** field (with a photo-upload-for-verification note).
  4. The discount is then reflected in the final personalised quote.

## Local dev

```bash
npm install
npm run dev
```

Open the dev URL on a mobile viewport (375px) for the intended experience.

## Build

```bash
npm run build
```

## Deploy

Hosted on Vercel. `vercel.json` rewrites all paths to `/` so the SPA router can take over.

## Folder layout

```
src/
  components/
    AppHeader.vue                 # DirectAsia wordmark
    AppFooter.vue
    StepIndicator.vue
    StickyNext.vue
  views/
    Step01CoverType.vue           # OMP-87
    Step02CoverStartDate.vue      # OMP-88
    Step03YearMakeModel.vue       # OMP-89
    Step04CarUsage.vue            # OMP-90  (+ DA-only car financing)
    Step05AnnualDistance.vue      # OMP-91  (+ Drive Less eligibility badge)
    Step06MainDriver.vue          # OMP-92
    Step07DrivingHistory.vue      # OMP-93  (+ DA-only NCD60)
    Step08PolicyholderContact.vue # OMP-94
    Step09YourQuote.vue           # OMP-305 (rendered LAST in DA sequence)
    Step10AdditionalDrivers.vue   # OMP-361
    Step11OptionalBenefits.vue    # OMP-362 (+ Drive Less opt-in + odometer)
  store/quote.js
  router/index.js                 # DA sequence: price last
  style.css                       # DA design tokens
  main.js                         # PrimeVue teal preset
```

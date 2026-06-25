# DirectAsia (DA) PrimeVue Prototype

Mobile-first prototype of the **DirectAsia** car insurance quote flow, built with Vue 3 + Vite + PrimeVue v4 (Aura preset, DA teal token override).

This is the DirectAsia skin of the One Motor dual-brand product. It shares the same component library as the Budget Direct (BDI) prototype and differs only by: (1) the brand design system below, (2) the page sequence (DA shows the price **last**), and (3) a handful of DA-only fields and scenarios. See `00_Overview/One_Motor_PRD.md` §2–§6 for the product spec.

## Source of truth

Figma file `M0iwRMwawqrDrMHl61p6je` (One Motor Design System) — DirectAsia frames. Brand tokens follow the DirectAsia Singapore site (PRD §3.2). Steps 1–11 cover the full quote journey.

## Brand design system (DirectAsia)

Pulled directly from the One Motor Design System Figma (Step 1 frame `3936:791`,
DA side). DA uses a **yellow action/footer zone**, **red brand accents** (logo,
links, primary CTA), and a **blue** progress/selected accent on slate ink —
**not** the teal palette that earlier drafts of this file assumed.

| Token (`--da-*`) | Value | Use |
|---|---|---|
| `--da-yellow` | `#FCD900` | CTA zone + footer surface |
| `--da-yellow-chip` | `rgba(254,236,128,0.5)` | "Car Insurance" header chip |
| `--da-green` | `#75BB49` | Enabled primary CTA |
| `--da-red` | `#DC2B1E` | Logo, footer links, error |
| `--da-blue` | `#457CBF` | Progress-bar active + selected card state |
| `--da-blue-tint` | `#EAF1FA` | Selected card background tint |
| `--da-outline` | `#79747E` | Back-button outline |
| `--da-ink` | `#333F48` | Primary text + headings (Carbon) |
| `--da-card-line` | `#49454F` | Cover-card / control outline |
| `--da-radio-line` | `#999999` | Radio + checkbox stroke |
| `--da-step-off` / `--da-bar-off` | `#79747E` / `#CCCCCC` | Inactive progress label / bar |
| `--da-disabled-bg` / `--da-disabled-ink` | `#E8E8E8` / `#979797` | Blocked (looks-disabled) button |
| `--da-line` / `--da-line-soft` | `#D8D8D8` / `#E4E4E4` | Header dividers |
| `--da-bg` | `#FFFFFF` | Page background (white) |
| `--da-radius-card` | `8px` | Buttons + inputs + cards |
| `--da-radius-lg` | `16px` | Yellow CTA zone top corners |

Font: **Montserrat** (Google Fonts). (BDI uses Museo/Nunito Sans.)

The sticky CTA bar (Figma QuoteFooter / Main Button): yellow zone, rounded-top
16px. **Main Button states** (white text throughout): default `#75BB49` ·
hover `#75BB49` + `#6AFF00` ring · focus `#5FA236` · active/pressed `#8FDB5F` ·
disabled `#DCDCDD` bg / `#949396` text. **Back** button = yellow fill +
`#79747E` outline + soft shadow. All buttons 47px tall, 8px radius, shadow
`0 4px 4px rgba(0,0,0,.25)`.

> **Selected/active state = blue `#457CBF`** (border + radio + light blue tint),
> confirmed by Mikie. Green `#75BB49` is the enabled CTA only.

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

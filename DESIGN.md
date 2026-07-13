# Honors Learning Academy — DESIGN.md

Premium editorial, light. Institutional warmth a parent trusts; editorial confidence an ambitious student admires. Calm, generous, typographic. The opposite of the old "futuristic dark" build.

## Theme
Light. Scene that forces it: *a parent at the kitchen table on a laptop in the evening deciding whether to trust teenagers with their child's education, and a high-schooler glancing at it on their phone between classes.* Light + warm reads honest and safe; dark reads techy and uncertain. Light wins.

## Color strategy
**Committed** — a warm paper surface carries the identity; deep navy ink gives institutional gravity; a single refined gold is the accent; a deep scholarly green is the secondary signal color. No glass, no neon, no gradients-as-decoration.

OKLCH tokens (chroma kept low near the extremes):

| Role | Hex (ref) | OKLCH | Use |
|---|---|---|---|
| `--paper` | #FBF8F2 | oklch(97.6% 0.011 84) | page background, warm ivory |
| `--paper-2` | #F4EEE3 | oklch(94.3% 0.016 83) | alternating section, sand |
| `--surface` | #FFFFFF→warm | oklch(99.2% 0.005 84) | cards/raised, barely warm |
| `--ink` | #16243C | oklch(28% 0.045 256) | deep navy, headings + brand |
| `--ink-soft` | #3A4658 | oklch(43% 0.03 256) | body text |
| `--muted` | #6B7280→warm | oklch(56% 0.02 256) | secondary text, captions |
| `--gold` | #B0822F | oklch(62% 0.10 78) | accent, links, key marks |
| `--gold-soft` | #E8D9B5 | oklch(89% 0.05 86) | gold tint backgrounds |
| `--green` | #1F4D3A | oklch(40% 0.07 162) | secondary signal, "verified/free" |
| `--green-soft` | #DCE8E0 | oklch(91% 0.025 163) | green tint backgrounds |
| `--line` | #E6DECF | oklch(89% 0.014 84) | hairline borders |
| `--ink-invert` | #0E1A2C | oklch(22% 0.04 256) | the one dark section (impact), if used |

Never `#000`/`#fff`. Gold is muted (not bright "trophy" gold). Green is deep forest, not mint.

## Typography
- **Display / headings:** **Fraunces** (variable, soft optical serifs, high opsz). Weights 400–600, opsz high on large sizes for that editorial, almost literary feel. Tight-ish leading (1.02–1.08) on big headings.
- **Body / UI:** **Hanken Grotesk** (warm humanist grotesque). 400 body, 500 UI labels, 600 emphasis. Friendly + professional.
- **Eyebrows / labels:** Hanken Grotesk, 12–13px, uppercase, letter-spacing 0.14em, gold or muted. (No monospace — that reads "techy," wrong register.)
- Body line-length 62–72ch. Type scale ratio ≥1.25. Tabular figures for the hours dashboard + stats.

CSS imports:
`Fraunces:opsz,wght@9..144,400..600;Hanken+Grotesk:wght@400;500;600;700`

## Layout
- Generous, varied vertical rhythm (sections breathe at 96–140px desktop). Not uniform padding.
- Content max-width ~1180px; text columns capped ~68ch.
- Asymmetry over centered-everything. Editorial grid: oversized serif headlines, wide margins, the occasional full-bleed band.
- Cards used sparingly and only where they're the right affordance (subject list, tutor cards, dashboard). Never nested. No identical-card-grid wall.
- Hairline `--line` borders + warm tint blocks instead of heavy shadows. Elevation is subtle and consistent.

## Motion (Jakub-led, Emil for forms/nav)
- Subtle, fast-but-smooth: 200–480ms, ease-out-quart/expo. No bounce, no elastic, no scroll-hijacking (founder rejected it).
- Scroll reveals: short translateY (12–20px) + opacity, optional small blur-in, staggered 40–60ms. Animate transform/opacity only.
- Hover: gentle, 160–220ms. Links get an animated underline; buttons get a subtle lift + color shift. Cards lift 2–4px.
- Hero: a calm, tasteful entrance (staggered fade/slide), not a 3D set-piece.
- `prefers-reduced-motion`: all of it collapses to instant/opacity-only. Mandatory.

## Components
- **Buttons:** primary = navy ink fill, paper text, subtle lift on hover; secondary = ink outline on paper; tertiary = gold animated-underline link. 44px+ targets.
- **Forms:** visible labels, helper text, inline validation on blur, error below field, success state on submit, semantic input types. Generous spacing.
- **Nav:** sticky, paper with hairline bottom border on scroll; clear active state; "Get a tutor" as the one primary CTA in the bar. Mobile: clean slide-down sheet.
- **Hours portal:** guided conversational logger (no LLM needed — a friendly step flow) + a dashboard with running total in tabular Fraunces.
- **Admin:** calm form-based editor panel; sections for content, stats, contact, socials, colors, visibility. Saves via the data layer.

## Absolute bans (inherited + project)
No glassmorphism default, no gradient text, no side-stripe borders, no hero-metric template, no identical-card grids, no modal-first, no emoji icons (SVG only — a small custom/Lucide-style set), no em dashes in copy. If it could be guessed as "education → friendly teal," rework it.

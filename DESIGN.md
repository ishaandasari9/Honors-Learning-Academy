# Honors Learning Academy — DESIGN.md

Premium editorial, light. Institutional warmth a parent trusts; editorial confidence an ambitious student admires. Calm, generous, typographic. The opposite of the old "futuristic dark" build.

## Theme
Light. Scene that forces it: *a parent at the kitchen table on a laptop in the evening deciding whether to trust teenagers with their child's education, and a high-schooler glancing at it on their phone between classes.* Light + warm reads honest and safe; dark reads techy and uncertain. Light wins.

## Color strategy
**Committed, navy + gold on off-white** — a warm off-white paper surface is the canvas; **navy** (`--ink`, the same blue as the hero headline) is the box color: every filled card/box is navy — the "at a glance" cards, both audience doors, the Core-subjects pill, the portal note card — plus `--ink-invert` for the footer/dashboard, giving one consistent dark-blue surface. `--blue-soft` remains only as the light tint of the "careful with your kid" band, with `--blue` for that band's accents. **Gold** is the single action color, filling every button (nav CTA, hero, doors, forms, chat send) and appearing as splashes (3px top-accents, badges, door "logo" icons, the AP row, decorative shapes); a deep scholarly green survives only as a minor "verified" signal (form success, live status dot). The navy was lightened and shifted bluer (hue ~260) so it reads as blue, not near-black. Text on navy boxes is white / `--on-blue` (8–13:1) with gold accents; text on the light-blue band is navy `--ink`.

OKLCH tokens (chroma kept low near the extremes):

| Role | OKLCH | Use |
|---|---|---|
| `--paper` | oklch(97.6% 0.011 84) | page background, warm ivory (dominant canvas) |
| `--paper-2` | oklch(94.3% 0.016 83) | alternating section, sand |
| `--surface` | oklch(99.2% 0.005 84) | cards/raised, barely warm |
| `--ink` | oklch(29% 0.075 260) | deep navy blue: headings, brand, structure (13:1 on paper) |
| `--ink-soft` | oklch(43% 0.050 260) | body text |
| `--muted` | oklch(47% 0.030 260) | secondary text, captions |
| `--gold` | oklch(64% 0.135 80) | high-visibility accent: marks, dots, underlines, hover (3.2:1 on paper) |
| `--gold-bright` | oklch(74% 0.150 84) | small eye-catch highlights on navy/blue (~7.1:1 on ink-invert) |
| `--gold-deep` | oklch(54% 0.125 72) | gold CTA fill + door "logo" icons + 3px top-accents (near-white text = 5.0:1) |
| `--gold-ink` | oklch(52% 0.098 78) | gold *text* on paper only; holds 4.5:1 (5.2:1) |
| `--gold-soft` | oklch(90% 0.058 86) | gold tint backgrounds |
| `--gold-line` | oklch(76% 0.110 84) | gold hairline / accent borders (decorative reinforcement only) |
| `--blue` | oklch(44% 0.140 260) | medium-blue accent for the light band only (eyebrow, checks, link) |
| `--blue-soft` | oklch(93% 0.028 255) | the one light-blue tint band ("careful with your kid"); ink text = 12:1 |
| `--on-blue` | oklch(93% 0.020 250) | light text on navy boxes (labels 8.3:1 at 0.82 opacity on --ink) |
| `--green` | oklch(40% 0.075 162) | minor "verified" signal only (success, status dot, one pill) |
| `--green-soft` | oklch(91% 0.028 163) | green tint (success icon, admin chip) |
| `--line` | oklch(89% 0.014 84) | hairline borders |
| `--ink-invert` | oklch(24% 0.070 260) | dark navy-blue bands (footer, dashboard); lightened from near-black |

Never `#000`/`#fff`. Gold is a refined, vivid accent (warm brass, not neon and not a dull tan): used as splashes on high-priority elements — the tutor CTA, the door "logo" icons, 3px top-accent bars, the active-nav underline, open states, the AP feature row — never as body text (use `--gold-ink` for that). On blue-filled surfaces, text is white/`--on-blue` with gold used for the badge/icon/border splash (gold as *small* text can't clear 4.5:1 on this blue). Green is deep forest, not mint, and now minimal.

## Decorative accents
Bold navy + gold "splashes" sit behind content on **every off-white section** — the hero, inner-page heroes, closing CTA, the sand bands, and the plain content sections (`.section:not(.band-sand):not(.band-blue):not(.cta-band)`) — via layered `radial-gradient` shapes on one `::before` per section: a gold blob, a small navy soft-blob, a crisp navy ring, and solid dots. Decorative, `pointer-events:none`, behind a raised-content layer (`isolation:isolate` + `z-index`). Contrast rule that keeps them safe: **navy soft-blobs stay ≤0.13 opacity** (muted caption text fails at 0.22 over navy), so navy reads boldly through the crisp **rings and dots** (thin/small, in margins), while **gold blobs may go to ~0.24** (body text still ≥6:1). A deliberate, client-directed exception to the general "no gradients-as-decoration" rule. The dark filled bands (navy boxes, the light-blue trust band) stay shape-free so they don't get busy.

## Typography
- **Display / headings:** **Source Serif 4** (variable, opsz + wght, roman + italic). Runs heavier than Fraunces did — h1 545, h2 525, base 500, italic accent 520 — and clamps ~8% larger, because Source Serif 4 has lower stroke contrast and a smaller optical size; without that, the headings read flat. Tight-ish leading (1.0–1.05) and tracking on big headings. (Replaced Fraunces, whose descending `f` and calligraphic `j` read too quirky for the brand; the WONK axis does not remove them.)
- **Body / UI:** **Hanken Grotesk** (warm humanist grotesque). 400 body, 500 UI labels, 600 emphasis. Friendly + professional.
- **Eyebrows / labels:** Hanken Grotesk, 12–13px, uppercase, letter-spacing 0.14em, gold or muted. (No monospace — that reads "techy," wrong register.)
- Body line-length 62–72ch. Type scale ratio ≥1.25. Tabular figures for the hours dashboard + stats.

CSS imports:
`Source+Serif+4:ital,opsz,wght@0,8..60,400..600;1,8..60,400..600;Hanken+Grotesk:wght@400;500;600;700`

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
- **Buttons:** primary = **gold fill** (`--gold-deep`) with near-white text (5.0:1), subtle lift on hover; secondary = ink outline on paper (ghost); tertiary = animated-underline link. Gold is the single action color (nav CTA, hero, doors, forms, chat send). 44px+ targets. Blue/navy are surfaces/structure/text, never button fills. Interaction accents: the inline arrow slides `translateX(4px)` on hover; primary CTA clusters (`.hero__btns`, `.cta-band .cluster`) sit on a soft blurred blue+gold "contextual" blob (`::before`, behind content).
- **Links:** `.link-gold` = gold text, gold underline growing from the left. `.link-blue` (secondary link beside a gold button) = navy text, **blue underline growing from the center** on hover, with a sliding inline arrow.
- **Boxed step grids:** the "how it works" steps sit in light `--surface` boxes with a **crisp 1.5px outline alternating gold / blue** (`:nth-child(even)`), lifting on hover, to anchor otherwise-bare white space.
- **Forms:** visible labels, helper text, inline validation on blur, error below field, success state on submit, semantic input types. Generous spacing.
- **Nav:** sticky, paper with hairline bottom border on scroll; clear active state; "Get a tutor" as the one primary CTA in the bar. Mobile: clean slide-down sheet.
- **Hours portal:** guided conversational logger (no LLM needed — a friendly step flow) + a dashboard with running total in tabular Source Serif 4.
- **Admin:** calm form-based editor panel; sections for content, stats, contact, socials, colors, visibility. Saves via the data layer.

## Absolute bans (inherited + project)
No glassmorphism default, no gradient text, no side-stripe borders, no hero-metric template, no identical-card grids, no modal-first, no emoji icons (SVG only — a small custom/Lucide-style set), no em dashes in copy. If it could be guessed as "education → friendly teal," rework it.

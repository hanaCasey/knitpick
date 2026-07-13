---
name: design
description: knitpick design system — read before building or changing any UI. Colors, typography, spacing, components, color-blocking rules.
---

# knitpick design system

Clean Scandinavian foundation with bold color blocking: a warm cream canvas, crisp
type, flat surfaces — punctuated by large solid blocks of warm candy color (terracotta,
bubblegum pink, grass green, blush, burnt orange, sage, cobalt, petal, moss,
navy). Reference vibe: https://units.gr/en/homepage/. The palette works in
warm ↔ pale pairs (terracotta ↔ bubblegum, green ↔ blush, orange ↔ petal,
navy ↔ sage).

## Principles

1. **Cream is the default.** Generous whitespace on the warm canvas; color is
   deliberate and rationed.
2. **Color blocking, not decoration.** Accents appear as large solid panels (a full
   card, a full-width button, a section band) — never as tints, gradients, shadows,
   or thin colored borders.
3. **Flat.** No box shadows, no gradients, no glassmorphism. Depth comes from color
   contrast and spacing.
4. **One accent block per region.** A view may use several accents, but adjacent
   blocks must not share a color.
5. **Big targets.** Primary actions ≥ 56px tall; the row-counter increment button is
   the largest element on its screen.

## Tokens (defined in `src/app.css`)

| Token | Value | Text on it |
|---|---|---|
| `--bg` | `#f4e9e1` | |
| `--ink` | `#141414` | |
| `--muted` | `#6b6b6b` | |
| `--line` | `#e0d2c6` | |
| `--red` | `#df5539` | white |
| `--pink` | `#f496d1` | ink `#141414` |
| `--green` | `#32a255` | white |
| `--blush` | `#efb6dc` | ink `#141414` |
| `--orange` | `#e36025` | white |
| `--sage` | `#7da87a` | ink `#141414` |
| `--cobalt` | `#115eae` | white |
| `--petal` | `#f4cde4` | ink `#141414` |
| `--moss` | `#668d57` | white |
| `--navy` | `#1a2d70` | white |

The preset palette's source of truth is `src/lib/accents.ts` (the css tokens
above are kept in sync for direct uses like `.btn` and `.danger`). A project's
accent is a preset name **or a custom hex the user added** (stored in the
`colors` table, picked via `AccentPicker` swatches on the new-project and
edit-details forms). Components never hardcode an accent: they apply
`style={accentVars(accent)}`, which sets `--accent`, `--on-accent`, and
`--on-accent-hover`; component CSS consumes those vars. Text on custom colors
is chosen by relative luminance (> 0.3 → ink, else white) — the same rule the
curated presets follow. The app is light-only for now; dark mode (manual
toggle stored in the DB) is planned.

A project's accent colours its card, its continue block, and its counter screen.
The new-project form suggests the next colour in the cycle (red → sage → navy →
pink → moss → blush → cobalt → orange → green → petal, defined as `ACCENTS` in
`src/lib/queries.ts` — it alternates warm/cool and dark/pale so neighbouring
projects rarely clash), but the knitter can pick any preset or custom swatch.

Titles and headings sit directly on white — no color band behind them. Color
blocks are for tappable things (cards, buttons, counter surfaces).

## Typography

Two-tier system — **bold and PHAAT for headlines, clean and legible for everything
else**:

- **Display** (`--font-display`): Archivo Black, bundled via `@fontsource/archivo-black`
  (self-hosted, offline-safe — never load fonts from a CDN). Used for the app name,
  project names, screen titles, and counter digits. Go big — the home hero title runs
  56px, screen/band titles 36–40px, card and continue-block names 18–32px — tight
  letter-spacing (`-0.02em`), lowercase-friendly.
- **Body** (`--font-body`): system stack (`system-ui, -apple-system, sans-serif`),
  16px/1.5, weight 400–600. All UI text, notes, labels.

Counter digits: display font, huge (96px+), `font-variant-numeric: tabular-nums`.

## Shape & spacing

- Corner radius: `--radius` (10px) on blocks/cards, `--radius-pill` on buttons.
- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48px.
- Hairline `--line` borders only for separating white-on-white surfaces.
- Hover motion: arrows rotate −45° (→ becomes ↗) with `transition: transform 0.7s
  var(--ease)`. That's the only animation — surfaces stay flat and still.

## Layout & navigation (units.gr-style shell)

- **Desktop (≥900px)**: fixed left sidebar (`--sidebar-w`, ~180–260px) with the
  wordmark on top and a full-height column of nav cards; content offset by the
  sidebar width, generous horizontal padding, up to ~1200px wide. Pages use the
  width (e.g. project overview is a two-column grid); text-heavy runs cap at ~720px.
- **Mobile (<900px)**: sidebar becomes a top bar (wordmark + hamburger) opening a
  fullscreen overlay of the same nav cards, ~96px tall each.
- **Nav cards** (`Sidebar.svelte`): solid accent blocks with a two-digit index
  top-left, arrow top-right, display-font label bottom. The sidebar holds the
  outlined "add project" card pinned at top, then a **scrollable** list of every
  project with the current one first. The page you're currently viewing has its
  card **outlined, not filled** (transparent bg, 2px ink border) — units.gr's
  active state; the **current project's** card is outlined in its own accent
  instead (ink text, no sub-label) even when you're not viewing it. On hover a
  card's text swaps colour (`--on-accent-hover`: white ↔ ink on filled cards;
  outlined cards shift to an accent) and the arrow rotates. The sidebar no
  longer shows per-project section links — that nav lives on the project page
  itself (see **Project page nav** below).
- **Project page nav** (`project/[id]/+layout.svelte`): every project page —
  counters, pattern, notes, details — shows the same header: the project name
  as an `<h1>`, a status line if any (`finished 🎉` / `frozen` / `current
  project`), then 4 small black nav cards (`--ink` fill, white text, →
  arrow) linking to counters / pattern / notes / details. The one you're
  already on is outlined instead of filled and drops its arrow — same
  filled-vs-outlined active convention as the sidebar's nav cards, just
  smaller. The counter screen is the one exception: it stays full-bleed with
  no shared header, using its own back link instead.

## Components

- **Home screen**: no wordmark hero (the wordmark lives in the sidebar) — a small
  muted tagline, then a row of outlined **stat tiles** on top (rows today /
  rows this week / on the needles): display-font number in ink, muted label —
  never colored numbers. Below, the current project's name and a units-style
  modular grid (stacked on mobile): the continue card as the hero, and beside
  it an outlined **notes panel** (last 3 notes + a quick-add input, head links
  into the notes page) and an outlined **pattern card** (one tap to the pdf).
- **Continue card** (home hero block): solid block in the current project's accent,
  ≥40vh tall. Header row ("continue · name" + arrow) links into the counter screen;
  the body is a live tap-to-increment zone showing the main counter's value huge
  (96–180px) — counting must work straight from the home screen. Ghost "− undo"
  sits below, outside the block.
- **Project cards** live in the sidebar as nav cards (see Layout) — there is no
  separate project list on the home screen.
- **Buttons**: pill-shaped slabs of accent color (units.gr CTA style) — **never
  ink/black** — inline-flex content width, min-height 56px, display-font label,
  usually with a trailing → that rotates to ↗ on hover; default color is terracotta
  (`--red`). Low-emphasis actions use a ghost button (ink text, no border).
- **Counter screen**: accent-colored full-bleed increment area; undo/decrement as a
  small ghost control — mis-taps must be cheap, so undo sits away from increment.
- **Project overview**: a prominent solid "make current project" button (only
  shown when the project isn't already current) sits above everything else;
  then the main counter as the accent block, secondary counters as small
  outlined cards in an auto-fill grid. Editing (name/yarn/needles/colour,
  status, delete) lives on its own `project/[id]/edit` page, reached via the
  "details" nav card — not inline on the overview.
- **Outlined card** is the second card grammar next to filled accent blocks:
  transparent on cream, 2px ink border, 10px radius — used for panels, stat
  tiles, secondary counters, and the sidebar's add/active states.

## Voice

UI text is lowercase-friendly, short, warm but plain: "add project", "row 47",
"finished 🎉" is the ceiling of whimsy. No exclamation-mark enthusiasm.

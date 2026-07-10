---
name: design
description: knitpick design system — read before building or changing any UI. Colors, typography, spacing, components, color-blocking rules.
---

# knitpick design system

Clean Scandinavian foundation with bold color blocking: lots of white, crisp type,
flat surfaces — punctuated by large solid blocks of bright red, pink, and orange.

## Principles

1. **White is the default.** Generous whitespace; color is deliberate and rationed.
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

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#ffffff` | `#121212` |
| `--ink` | `#141414` | `#f2f0ec` |
| `--muted` | `#6b6b6b` | `#9a9a9a` |
| `--line` | `#e4e2de` | `#2c2c2c` |
| `--red` | `#e5322c` | same |
| `--pink` | `#f04e98` | same |
| `--orange` | `#ff7a00` | same |

Text on accent blocks: **white on red**, **ink (`#141414`) on pink and orange** —
always, in both themes. Dark mode follows the system preference
(`prefers-color-scheme`) with a manual toggle stored in the DB.

Each project is auto-assigned one accent (cycling red → pink → orange) used for its
card, its continue block, and its counter screen.

## Typography

Two-tier system — **bold and PHAAT for headlines, clean and legible for everything
else**:

- **Display** (`--font-display`): Archivo Black, bundled via `@fontsource/archivo-black`
  (self-hosted, offline-safe — never load fonts from a CDN). Used for the app name,
  project names, screen titles, and counter digits. Big sizes (28–40px headings),
  tight letter-spacing (`-0.02em`), lowercase-friendly.
- **Body** (`--font-body`): system stack (`system-ui, -apple-system, sans-serif`),
  16px/1.5, weight 400–600. All UI text, notes, labels.

Counter digits: display font, huge (96px+), `font-variant-numeric: tabular-nums`.

## Shape & spacing

- Corner radius: `4px` everywhere (crisp, near-square). No pill shapes.
- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48px.
- Mobile-first, single column, `max-width: 640px` centered; content padding 16px.
- Hairline `--line` borders only for separating white-on-white surfaces.

## Components

- **Continue card**: full-width solid block in the project's accent, project name +
  current row, one tap into the counter.
- **Project card**: white, hairline border, with a solid accent square (24px) as the
  project's color mark.
- **Buttons**: CHONKY. Solid accent or solid ink blocks, min-height 56px, full-width
  for primary actions, display-font labels at 18px+. Low-emphasis actions use a ghost
  button (ink text, no border) — but anything primary is a fat slab of color.
- **Counter screen**: accent-colored full-bleed increment area; undo/decrement as a
  small ghost control — mis-taps must be cheap, so undo sits away from increment.

## Voice

UI text is lowercase-friendly, short, warm but plain: "add project", "row 47",
"finished 🎉" is the ceiling of whimsy. No exclamation-mark enthusiasm.

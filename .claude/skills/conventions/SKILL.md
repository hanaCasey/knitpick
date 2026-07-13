---
name: conventions
description: knitpick architecture and code conventions — read before writing or reviewing any code. Data model, persistence rules, file layout, style.
---

# knitpick conventions

## Architecture (non-negotiable)

Local-first static PWA. **No server, no network calls, no analytics, no external
resources** (fonts, CDNs). Everything must work offline and be hostable as static
files (GitHub Pages). All data lives in IndexedDB via Dexie — including PDF and
photo blobs.

## Stack

- SvelteKit + `adapter-static` (SPA fallback, no prerendered dynamic routes)
- Svelte 5 with runes (`$state`, `$derived`, `$effect`) — no legacy stores unless
  bridging a library
- TypeScript, strict
- Dexie for persistence; `dexie` `liveQuery` bridged into Svelte reactivity
- Vanilla CSS: design tokens in `src/app.css`, component styles in scoped
  `<style>` blocks. No CSS frameworks, no Tailwind.

## Data model (Dexie tables in `src/lib/db.ts`)

- `projects`: id, name, accent, status (`active | finished | frozen`), yarn/needle
  fields, createdAt, updatedAt (bump on any activity — drives the continue card)
- `counters`: id, projectId, label, value, isMain, createdAt, target?, linkTo?
  (repeat counter that auto-resets at target and increments the linked counter —
  target/linkTo not wired up yet). Exactly one counter per project has
  `isMain: true`; it's the one shown on the project overview and gets promoted
  automatically when the current main counter is deleted.
- `counterEvents`: id, counterId, projectId, value (value after the update),
  createdAt — one row per increment/decrement, powers the per-counter timestamped
  log. Never mutated, only appended/deleted with its counter.
- `files`: id, projectId, kind (`pdf | photo`), blob, thumbnail?, lastViewedPage?
  (one `pdf` file per project; rendered via a plain `<iframe>` blob URL — no pdf.js
  yet, so `lastViewedPage` is unused)
- `notes`: id, projectId, text, photoId?, createdAt (progress log: notes and photos
  interleave on one timeline — photo attachment via `photoId` not wired up yet)

Schema changes go through Dexie versioned migrations — never mutate a version
in place once committed.

## File layout

```
src/lib/db.ts                                    # Dexie schema + typed table interfaces
src/lib/queries.ts                                # reusable liveQuery helpers
src/lib/components/                               # shared UI components
src/routes/                                       # + (home: continue card + project list)
src/routes/project/[id]/                          # project overview: main counter,
                                                   # counter list, edit form, status/delete
src/routes/project/[id]/counter/[counterId]/      # full-bleed counter screen + its log
src/routes/project/[id]/pattern/                  # pattern pdf upload/view
src/routes/project/[id]/log/                      # notes log
```

## Style

- Clean and concise; prefer deleting code over abstracting early.
- Small components; logic that touches the DB lives in `src/lib`, not in routes.
- Comments only for non-obvious constraints.
- Commits: small, imperative, lowercase ("add project creation flow"), no
  attribution lines or tool mentions.

## Verifying

`npm run check` (svelte-check) and `npm run build` must pass before committing.
For UI changes, verify in the browser via `npm run dev`.

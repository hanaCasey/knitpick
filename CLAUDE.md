# knitpick

Personal knitting helper: projects with pattern PDFs, linked row counters, and a
notes/photos progress log. Local-first PWA — all data in IndexedDB, deployed as a
static site (GitHub Pages). No server, ever.

## Skills

- `.claude/skills/conventions/` — architecture, data model, code style. Read before writing code.
- `.claude/skills/design/` — design system. Read before touching UI.

## Commands

- `npm run dev` — dev server
- `npm run check` — typecheck (svelte-check)
- `npm run build` — production build (must pass before committing)

## Roadmap

1. ✅ Scaffold, design system, project CRUD
2. Row counter (Wake Lock, linked repeat counters)
3. PDF viewer (pdf.js, remember last page)
4. Progress log (notes + compressed photos)
5. PWA: offline, install, persistent storage, backup export/import
6. Deploy to GitHub Pages

# knitpick

Personal knitting helper: projects with pattern PDFs, linked row counters, and a
notes/photos progress log. Local-first PWA — all data in IndexedDB, deployed as a
static site (GitHub Pages). No server, ever.

## Skills

- `.claude/skills/conventions/` — architecture, data model, code style. Read before writing code.
- `.claude/skills/design/` — design system. Read before touching UI.

## Workflow

- Work directly on `main` in this checkout. Don't use git worktrees for this project.
- Commit regularly as work completes — small, logical, imperative-mood commits
  (see conventions skill). Don't leave large uncommitted diffs sitting around.
- Only push or open a PR when explicitly asked.

## Commands

- `npm run dev` — dev server
- `npm run check` — typecheck (svelte-check)
- `npm run build` — production build (must pass before committing)

## Roadmap

1. ✅ Scaffold, design system, project CRUD
2. 🟡 Row counter — spawn/name/delete counters, one main + list, tap-to-count
   screen, timestamped log. Still missing: Wake Lock, linked repeat counters
   (target/linkTo).
3. 🟡 PDF pattern viewer — upload/replace/remove, inline view via `<iframe>` blob
   URL. Still missing: pdf.js, remember last page.
4. 🟡 Progress log — timestamped text notes. Still missing: photo attachments
   (compression, thumbnails).
5. 🟡 PWA — manifest, icons, offline service worker, persistent storage request.
   Still missing: backup export/import
6. Deploy to a Hugging Face static Space: `HF_TOKEN=hf_xxx npm run deploy <user>/knitpick`
   (`scripts/deploy.sh` builds, creates the space if needed, force-pushes `build/`)

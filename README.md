# knitpick

A personal knitting helper: projects with pattern PDFs, linked row counters, and a
notes-and-photos progress log.

Local-first PWA — everything lives in IndexedDB on your device, deployed as a
static site. No server, no accounts, no tracking. Works offline.

## Stack

SvelteKit (static adapter, SPA) · Svelte 5 · TypeScript · Dexie · vanilla CSS

## Development

```sh
npm install
npm run dev     # dev server
npm run check   # typecheck
npm run build   # production build
```

A [devcontainer](.devcontainer/devcontainer.json) is included for sandboxed development.

## License

[MIT](LICENSE)

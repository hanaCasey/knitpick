import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// SPA fallback: all data is client-side (IndexedDB), no prerendered dynamic routes
			adapter: adapter({ fallback: 'index.html' }),

			// relative asset paths break the SPA fallback on nested routes (/project/x
			// resolves ./_app to /project/_app → 404) and scope the service worker to
			// the registering page's directory — the app is served from the domain root
			paths: { relative: false }
		})
	]
});

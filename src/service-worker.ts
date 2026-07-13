/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

import { base, build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;

const CACHE = `knitpick-${version}`;
// the SPA shell lives at the root URL (adapter-static fallback index.html)
const SHELL = `${base}/`;
const ASSETS = [SHELL, ...build, ...files];

sw.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE)
			.then((cache) => cache.addAll(ASSETS))
			.then(() => sw.skipWaiting())
	);
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
			.then(() => sw.clients.claim())
	);
});

sw.addEventListener('fetch', (event) => {
	const { request } = event;
	if (request.method !== 'GET') return;

	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE);

			// app navigations always get the cached shell — makes deep links and
			// offline launches work on a plain static host
			if (request.mode === 'navigate') {
				const shell = await cache.match(SHELL);
				if (shell) return shell;
			}

			const cached = await cache.match(request);
			if (cached) return cached;

			const response = await fetch(request);
			if (response.ok && new URL(request.url).origin === location.origin) {
				cache.put(request, response.clone());
			}
			return response;
		})()
	);
});

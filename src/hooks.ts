import type { Reroute } from '@sveltejs/kit';

// static hosts (hf spaces) redirect / to /index.html, which matches no route
// and would render the 404 page — map it back to home
export const reroute: Reroute = ({ url }) => {
	if (url.pathname === '/index.html') return '/';
};

<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Sidebar from '$lib/components/Sidebar.svelte';

	let { children } = $props();

	// ask the browser not to evict IndexedDB (pattern pdfs and photos live there)
	$effect(() => {
		navigator.storage?.persist?.();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Sidebar />

<main>
	{@render children()}
</main>

<style>
	main {
		padding: 84px 16px 48px;
	}

	@media (min-width: 900px) {
		main {
			margin-left: var(--sidebar-w);
			padding: 40px clamp(24px, 5vw, 96px) 64px;
			max-width: calc(1200px + var(--sidebar-w));
		}
	}
</style>

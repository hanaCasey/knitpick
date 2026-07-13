<script lang="ts">
	import { page } from '$app/state';
	import { projectList } from '$lib/queries';

	let { children } = $props();

	const projects = projectList();
	const project = $derived($projects?.find((p) => p.id === page.params.id));

	const overviewHref = $derived(`/project/${page.params.id}`);
	const onOverview = $derived(page.url.pathname === overviewHref);
	// the counter screen stays full-bleed: its back link is the way out
	const onCounter = $derived(page.url.pathname.includes('/counter/'));

	const sectionLabel = $derived.by(() => {
		if (page.url.pathname === `${overviewHref}/pattern`) return 'pattern';
		if (page.url.pathname === `${overviewHref}/log`) return 'notes';
		if (page.url.pathname === `${overviewHref}/edit`) return 'edit details';
		return 'counters';
	});

	const statusLabel = $derived.by(() => {
		if (!project) return null;
		if (project.status === 'finished') return 'finished 🎉';
		if (project.status === 'frozen') return 'frozen';
		if (project.isCurrent) return 'current project';
		return null;
	});
</script>

{#if project && !onCounter}
	<header class="project-header">
		<h1 class="title">
			{#if onOverview}
				{project.name}
			{:else}
				<a href={overviewHref}>{project.name}</a>
			{/if}
		</h1>
		{#if statusLabel}
			<p class="status">{statusLabel}</p>
		{/if}
		<h2 class="section">{sectionLabel}</h2>
	</header>
{/if}

<!-- remount pages when only params change (project → project in the sidebar,
     counter → counter) — they capture page.params at init -->
{#key page.url.pathname}
	{@render children()}
{/key}

<style>
	.project-header {
		margin-bottom: 24px;
	}

	.title {
		font-size: clamp(40px, 5vw, 64px);
	}

	.title a {
		text-decoration: none;
	}

	.status {
		margin-top: 4px;
		font-size: 14px;
		font-weight: 600;
		color: var(--muted);
	}

	.section {
		margin-top: 12px;
		font-size: 18px;
	}
</style>

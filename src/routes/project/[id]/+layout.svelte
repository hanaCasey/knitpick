<script lang="ts">
	import { page } from '$app/state';
	import { accentVars } from '$lib/accents';
	import { ACCENTS, projectList } from '$lib/queries';

	let { children } = $props();

	const projects = projectList();
	const project = $derived($projects?.find((p) => p.id === page.params.id));

	// each tab gets a distinct accent, borrowed from the project's own colour cycle
	const tabs = $derived.by(() => {
		if (!project) return [];
		const others = ACCENTS.filter((a) => a !== project.accent);
		return [
			{ label: 'counters', href: `/project/${project.id}`, accent: project.accent },
			{ label: 'pattern', href: `/project/${project.id}/pattern`, accent: others[0] },
			{ label: 'notes', href: `/project/${project.id}/log`, accent: others[1] }
		];
	});

	// the counter screen stays full-bleed: its back link is the way out
	const onCounter = $derived(page.url.pathname.includes('/counter/'));

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
		<h1>{project.name}</h1>
		{#if statusLabel}
			<p class="status">{statusLabel}</p>
		{/if}
		<nav class="project-nav" aria-label="project sections">
			{#each tabs as tab (tab.href)}
				<a
					href={tab.href}
					style={accentVars(tab.accent)}
					aria-current={page.url.pathname === tab.href ? 'page' : undefined}
				>
					{tab.label}
				</a>
			{/each}
		</nav>
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

	.project-header h1 {
		font-size: clamp(40px, 5vw, 64px);
	}

	.status {
		margin-top: 4px;
		font-size: 14px;
		font-weight: 600;
		color: var(--muted);
	}

	.project-nav {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
		max-width: 480px;
		margin-top: 16px;
	}

	.project-nav a {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 48px;
		padding: 8px 4px;
		border: 2px solid transparent;
		border-radius: var(--radius);
		background: var(--accent);
		color: var(--on-accent);
		text-decoration: none;
		font-family: var(--font-display);
		font-size: 14px;
		letter-spacing: -0.02em;
	}

	/* units-style current state: outlined, no fill — same as the sidebar */
	.project-nav a[aria-current='page'] {
		background: transparent;
		border-color: var(--ink);
		color: var(--ink);
	}
</style>

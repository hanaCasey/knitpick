<script lang="ts">
	import { page } from '$app/state';
	import { accentVars } from '$lib/accents';
	import { ACCENTS, projectList } from '$lib/queries';

	let { children } = $props();

	const projects = projectList();
	const project = $derived($projects?.find((p) => p.id === page.params.id));

	// same accent assignment as the sidebar's section boxes
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
	const onOverview = $derived(page.url.pathname === `/project/${page.params.id}`);
</script>

{#if project && !onCounter}
	<header class="project-nav">
		{#if !onOverview}
			<a class="context" href="/project/{project.id}">{project.name}</a>
		{/if}
		<nav aria-label="project sections">
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
	/* mobile only — the sidebar's section boxes cover this on desktop */
	.project-nav {
		display: none;
	}

	@media (max-width: 899px) {
		.project-nav {
			display: flex;
			flex-direction: column;
			gap: 10px;
			margin-bottom: 8px;
		}

		.context {
			font-size: 13px;
			font-weight: 600;
			color: var(--muted);
			text-decoration: none;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		nav {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 8px;
		}

		nav a {
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
		nav a[aria-current='page'] {
			background: transparent;
			border-color: var(--ink);
			color: var(--ink);
		}
	}
</style>

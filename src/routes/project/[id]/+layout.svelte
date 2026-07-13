<script lang="ts">
	import { page } from '$app/state';
	import { projectList } from '$lib/queries';

	let { children } = $props();

	const projects = projectList();
	const project = $derived($projects?.find((p) => p.id === page.params.id));

	const overviewHref = $derived(`/project/${page.params.id}`);
	// the counter screen stays full-bleed: its back link is the way out
	const onCounter = $derived(page.url.pathname.includes('/counter/'));

	// the same 4 destinations, in the same order, on every project page
	const sections = $derived([
		{ label: 'counters', href: overviewHref },
		{ label: 'pattern', href: `${overviewHref}/pattern` },
		{ label: 'notes', href: `${overviewHref}/log` },
		{ label: 'details', href: `${overviewHref}/edit` }
	]);

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
		<h1 class="title">{project.name}</h1>
		{#if statusLabel}
			<p class="status">{statusLabel}</p>
		{/if}
		<nav class="section-nav" aria-label="project sections">
			{#each sections as s (s.href)}
				<a class="chip" href={s.href} aria-current={page.url.pathname === s.href ? 'page' : undefined}>
					<span class="chip-label">{s.label}</span>
					<span class="arrow" aria-hidden="true">→</span>
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

	.title {
		font-size: clamp(40px, 5vw, 64px);
	}

	.status {
		margin-top: 4px;
		font-size: 14px;
		font-weight: 600;
		color: var(--muted);
	}

	.section-nav {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 16px;
	}

	/* little black cards with a white label + arrow — not plain text — so
	   every destination reads as obviously clickable. same 4 cards appear on
	   every project page. */
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		padding: 10px 16px;
		border: 2px solid var(--ink);
		border-radius: var(--radius);
		background: var(--ink);
		color: #fff;
		text-decoration: none;
		font-family: var(--font-display);
		font-size: 15px;
		letter-spacing: -0.02em;
	}

	.chip-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.chip .arrow {
		font-size: 14px;
		flex-shrink: 0;
		transition: transform 0.7s var(--ease);
	}

	.chip:hover .arrow {
		transform: rotate(-45deg);
	}

	/* the page you're currently on — outlined instead of filled. the arrow
	   stays (just doesn't rotate) so the card doesn't change width when it
	   becomes active */
	.chip[aria-current='page'] {
		background: transparent;
		color: var(--ink);
	}

	/* narrow screens: 4 equal columns so all cards stay on one line instead
	   of wrapping — shrink padding/gap/font to fit "counters"/"details" */
	@media (max-width: 480px) {
		.section-nav {
			display: grid;
			grid-template-columns: repeat(4, 1fr);
			gap: 6px;
		}

		.chip {
			gap: 4px;
			padding: 8px 6px;
			font-size: 12px;
			justify-content: center;
		}

		.chip .arrow {
			font-size: 11px;
		}
	}
</style>

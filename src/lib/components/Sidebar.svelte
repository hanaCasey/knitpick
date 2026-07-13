<script lang="ts">
	import { page } from '$app/state';
	import { accentVars } from '$lib/accents';
	import type { Accent } from '$lib/db';
	import { ACCENTS, projectList } from '$lib/queries';

	const projects = projectList();
	let open = $state(false);

	const projectId = $derived(page.params.id);

	// the project the section boxes refer to: the one being viewed,
	// falling back to the current (or latest active) project on home
	const displayed = $derived(
		(projectId ? $projects?.find((p) => p.id === projectId) : undefined) ??
			$projects?.find((p) => p.isCurrent) ??
			$projects?.find((p) => p.status === 'active')
	);

	type Item = {
		label: string;
		href: string;
		index: string;
		accent?: Accent;
		sub?: string;
		current?: boolean;
		outline?: boolean;
	};

	const sections: Item[] = $derived.by(() => {
		if (!displayed) return [];
		const others = ACCENTS.filter((a) => a !== displayed.accent);
		return [
			{ label: 'counters', href: `/project/${displayed.id}`, accent: displayed.accent },
			{ label: 'pattern', href: `/project/${displayed.id}/pattern`, accent: others[0] },
			{ label: 'notes', href: `/project/${displayed.id}/log`, accent: others[1] }
		].map((it, i) => ({ ...it, index: String(i + 1).padStart(2, '0') }));
	});

	const projectCards: Item[] = $derived.by(() => {
		const list = $projects ?? [];
		const cur = list.find((p) => p.isCurrent);
		const rest = list.filter((p) => p.id !== cur?.id);
		return (cur ? [cur, ...rest] : rest).map((p, i) => ({
			label: p.name,
			href: `/project/${p.id}`,
			accent: p.accent,
			index: String(i + 1).padStart(2, '0'),
			current: p.isCurrent,
			sub: p.status === 'finished' ? 'finished 🎉' : p.status === 'frozen' ? 'frozen' : undefined
		}));
	});

	const addCard: Item = { label: 'add project', href: '/new', index: '+', outline: true };

	// the counter screen belongs to the "counters" section
	const isActive = (href: string) =>
		page.url.pathname === href ||
		(!!projectId && href === `/project/${projectId}` && page.url.pathname.includes('/counter/'));

	$effect(() => {
		page.url.pathname;
		open = false;
	});
</script>

{#snippet card(item: Item, active: boolean)}
	<a
		class="block"
		class:current={item.current}
		class:outline={item.outline}
		style={item.accent ? accentVars(item.accent) : undefined}
		href={item.href}
		title={item.label}
		aria-current={active ? 'page' : undefined}
	>
		<span class="head">
			<span class="index">{item.index}</span>
			<span class="arrow" aria-hidden="true">→</span>
		</span>
		<span class="foot">
			<span class="label">{item.label}</span>
			{#if item.sub}
				<span class="sub">{item.sub}</span>
			{/if}
		</span>
	</a>
{/snippet}

<aside>
	<div class="bar">
		<a class="wordmark" href="/">knitpick</a>
		<button class="hamburger" onclick={() => (open = !open)} aria-expanded={open} aria-label="menu">
			{open ? '✕' : '☰'}
		</button>
	</div>

	<nav class:open>
		{#if displayed}
			<p class="context">{displayed.name}</p>
			<ul class="sections">
				{#each sections as item (item.href)}
					<li>{@render card(item, isActive(item.href))}</li>
				{/each}
			</ul>
		{/if}

		<div class="projects-group">
			{@render card(addCard, page.url.pathname === '/new')}
			<ul class="projects">
				{#each projectCards as item (item.href)}
					<li>{@render card(item, false)}</li>
				{/each}
			</ul>
		</div>
	</nav>
</aside>

<style>
	.wordmark {
		font-family: var(--font-display);
		font-size: 22px;
		letter-spacing: -0.02em;
		text-decoration: none;
	}

	.hamburger {
		display: none;
		font-size: 22px;
		min-width: 44px;
		min-height: 44px;
	}

	.context {
		font-size: 13px;
		font-weight: 600;
		color: var(--muted);
		margin-bottom: 8px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	nav ul {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	nav li {
		display: flex;
		/* in the fixed-height scrollable column, cards must scroll, not squish:
		   the explicit min-height below would otherwise let flex shrink them */
		flex-shrink: 0;
	}

	.sections {
		margin-bottom: 16px;
	}

	/* section boxes and project cards are the same card — identical heights.
	   a fixed height (not min-height) is what actually guarantees this once
	   labels can be different lengths. 104px fits the tallest case (header row
	   + a wrapped sub-label like "finished 🎉") without the content overflowing
	   the box — measured content height tops out at 95px. */
	.sections li,
	.projects li {
		height: 104px;
	}

	.projects-group {
		border-top: 1px solid var(--line);
		padding-top: 16px;
	}

	.block {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 12px;
		width: 100%;
		min-width: 0;
		padding: 12px 12px 16px;
		border: 2px solid transparent;
		border-radius: var(--radius);
		background: var(--accent);
		color: var(--on-accent);
		text-decoration: none;
		transition: color 0.7s var(--ease);
	}

	/* units-style current state: outlined, no fill */
	.block[aria-current='page'],
	.block.outline {
		background: transparent;
		border-color: var(--ink);
		color: var(--ink);
	}

	/* the current project: no fill, border in its own accent */
	.block.current {
		background: transparent;
		border-color: var(--accent);
		color: var(--ink);
	}

	/* units-style hover: text swaps colour, arrow rotates */
	.block:hover {
		color: var(--on-accent-hover);
	}

	.block.outline:hover,
	.block[aria-current='page']:hover {
		color: var(--red);
	}

	.block.current:hover {
		color: var(--accent);
	}

	.projects-group > :global(.block) {
		height: 104px;
		flex-shrink: 0;
		margin-bottom: 10px;
	}

	.head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 13px;
		font-weight: 600;
	}

	.arrow {
		font-size: 18px;
		transition: transform 0.7s var(--ease);
	}

	.block:hover .arrow {
		transform: rotate(-45deg);
	}

	.foot {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.label {
		font-family: var(--font-display);
		font-size: 16px;
		letter-spacing: -0.02em;
		line-height: 1.35;
		/* single line + ellipsis, not wrapping — a fixed-height card can't
		   accommodate a variable number of lines */
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		/* overflow clips at the padding edge — keep display-font descenders visible */
		padding-bottom: 0.15em;
	}

	.sub {
		font-size: 12px;
		font-weight: 600;
		opacity: 0.75;
	}

	/* desktop: fixed full-height column — sections pinned, projects scroll */
	@media (min-width: 900px) {
		aside {
			position: fixed;
			top: 0;
			left: 0;
			bottom: 0;
			width: var(--sidebar-w);
			display: flex;
			flex-direction: column;
			padding: 24px 0 20px 20px;
			z-index: 10;
		}

		nav {
			flex: 1;
			display: flex;
			flex-direction: column;
			margin-top: 20px;
			min-height: 0;
		}

		.projects-group {
			flex: 1;
			min-height: 0;
			display: flex;
			flex-direction: column;
		}

		.projects {
			flex: 1;
			min-height: 0;
			overflow-y: auto;
		}
	}

	/* mobile: top bar + fullscreen overlay menu */
	@media (max-width: 899px) {
		aside {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			z-index: 10;
			background: var(--bg);
		}

		.bar {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 8px 8px 8px 16px;
			border-bottom: 1px solid var(--line);
		}

		.hamburger {
			display: block;
		}

		nav {
			display: none;
		}

		nav.open {
			display: block;
			position: fixed;
			top: 61px;
			left: 0;
			right: 0;
			bottom: 0;
			background: var(--bg);
			overflow-y: auto;
			padding: 16px;
		}

		nav.open .sections li,
		nav.open .projects li {
			height: 128px;
		}
	}
</style>

<script lang="ts">
	import { accentVars } from '$lib/accents';
	import type { Counter, Project } from '$lib/db';
	import { decrementCounter, incrementCounter } from '$lib/queries';

	let { project, counter }: { project: Project; counter: Counter | null } = $props();

	const href = $derived(
		counter ? `/project/${project.id}/counter/${counter.id}` : `/project/${project.id}`
	);

	function tap() {
		if (counter) incrementCounter(counter.id);
	}

	function undo() {
		if (counter) decrementCounter(counter.id);
	}
</script>

<section class="continue" style={accentVars(project.accent)}>
	<a class="head" {href}>
		<span class="label">continue · {project.name}</span>
		<span class="arrow" aria-hidden="true">→</span>
	</a>

	{#if counter}
		<button class="tapzone" onclick={tap} aria-label="add one to {counter.label}">
			<span class="value">{counter.value}</span>
			<span class="hint">{counter.label} · tap to count</span>
		</button>
	{:else}
		<a class="name" {href}>{project.name}</a>
	{/if}
</section>

{#if counter}
	<button class="btn ghost undo" onclick={undo}>− undo</button>
{/if}

<style>
	.continue {
		display: flex;
		flex-direction: column;
		min-height: clamp(240px, 40vh, 420px);
		border-radius: var(--radius);
		background: var(--accent);
		color: var(--on-accent);
	}

	.head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 16px;
		padding: clamp(16px, 2vw, 24px) clamp(20px, 2.5vw, 36px) 0;
		color: inherit;
		text-decoration: none;
		font-size: 14px;
		font-weight: 600;
		min-width: 0;
	}

	.label {
		opacity: 0.85;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.arrow {
		font-family: var(--font-display);
		font-size: 24px;
		flex-shrink: 0;
		transition: transform 0.7s var(--ease);
	}

	.head:hover .arrow {
		transform: rotate(-45deg);
	}

	.tapzone {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 16px;
		color: inherit;
		-webkit-tap-highlight-color: transparent;
	}

	.tapzone:active .value {
		transform: scale(0.97);
	}

	.value {
		font-family: var(--font-display);
		font-size: clamp(96px, 14vw, 180px);
		letter-spacing: -0.02em;
		line-height: 1;
		font-variant-numeric: tabular-nums;
	}

	.hint {
		font-size: 13px;
		font-weight: 600;
		opacity: 0.75;
	}

	.name {
		flex: 1;
		display: flex;
		align-items: flex-end;
		padding: 16px clamp(20px, 2.5vw, 36px) clamp(20px, 2.5vw, 36px);
		color: inherit;
		text-decoration: none;
		font-family: var(--font-display);
		font-size: clamp(36px, 5vw, 64px);
		letter-spacing: -0.02em;
		line-height: 1.05;
		overflow-wrap: anywhere;
	}

	.undo {
		margin-top: 8px;
	}
</style>

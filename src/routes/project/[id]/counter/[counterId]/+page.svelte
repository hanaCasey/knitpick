<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { accentVars } from '$lib/accents';
	import {
		counterById,
		decrementCounter,
		deleteCounter,
		eventsByCounter,
		incrementCounter,
		projectById,
		renameCounter
	} from '$lib/queries';

	const projectId = page.params.id!;
	const counterId = page.params.counterId!;

	const project = projectById(projectId);
	const counter = counterById(counterId);
	const events = eventsByCounter(counterId);

	function rename() {
		const current = $counter;
		if (!current) return;
		const label = prompt('rename counter', current.label);
		if (label === null) return;
		renameCounter(counterId, label.trim() || current.label);
	}

	async function remove() {
		if (!confirm(`delete "${$counter?.label}"? this cannot be undone`)) return;
		await deleteCounter(counterId);
		await goto(`/project/${projectId}`);
	}

	function formatTime(ts: number) {
		return new Date(ts).toLocaleString(undefined, {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	}
</script>

{#if $project && $counter}
	<a class="btn ghost back" href="/project/{projectId}">← {$project.name}</a>

	<div class="head">
		<h1>{$counter.label}</h1>
		<span class="head-actions">
			<button class="btn ghost" onclick={rename}>rename</button>
			<button class="btn ghost danger" onclick={remove}>delete</button>
		</span>
	</div>

	<button class="tap" style={accentVars($project.accent)} onclick={() => incrementCounter(counterId)}>
		<span class="value">{$counter.value}</span>
	</button>

	<button class="btn ghost undo" onclick={() => decrementCounter(counterId)}>− undo</button>

	{#if $events && $events.length > 0}
		<h2>log</h2>
		<ul class="log">
			{#each $events as event (event.id)}
				<li>
					<span>row {event.value}</span>
					<span class="time">{formatTime(event.createdAt)}</span>
				</li>
			{/each}
		</ul>
	{/if}
{/if}

<style>
	.back {
		margin-bottom: 12px;
	}

	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 8px;
		margin-bottom: 16px;
	}

	.head h1 {
		font-size: 28px;
	}

	.head-actions {
		display: flex;
		gap: 4px;
		flex-shrink: 0;
	}

	.danger {
		color: var(--red);
	}

	.tap {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		max-width: 900px;
		min-height: 48vh;
		min-height: 48dvh; /* mobile browser chrome shrinks vh */
		border-radius: var(--radius);
		margin-bottom: 12px;
		background: var(--accent);
		color: var(--on-accent);
		-webkit-tap-highlight-color: transparent;
	}

	.tap:active .value {
		transform: scale(0.97);
	}

	.value {
		font-family: var(--font-display);
		font-size: clamp(88px, 24vw, 112px);
		letter-spacing: -0.02em;
		line-height: 1;
		font-variant-numeric: tabular-nums;
	}

	.undo {
		margin: 0 0 32px;
	}

	h2 {
		font-size: 18px;
		margin-bottom: 8px;
	}

	.log {
		list-style: none;
		max-width: 720px;
	}

	.log li {
		display: flex;
		justify-content: space-between;
		padding: 8px 0;
		border-bottom: 1px solid var(--line);
		font-size: 14px;
	}

	.time {
		color: var(--muted);
	}
</style>

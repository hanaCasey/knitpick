<script lang="ts">
	import { page } from '$app/state';
	import { accentVars } from '$lib/accents';
	import {
		countersByProject,
		createCounter,
		deleteCounter,
		projectById,
		setMainCounter
	} from '$lib/queries';

	const project = projectById(page.params.id!);
	const counters = countersByProject(page.params.id!);
	const mainCounter = $derived($counters?.find((c) => c.isMain));
	const otherCounters = $derived($counters?.filter((c) => c.id !== mainCounter?.id) ?? []);

	async function addCounter() {
		const label = prompt('counter name', 'row');
		if (label === null) return;
		await createCounter(page.params.id!, label.trim() || 'row');
	}

	async function removeCounter(id: string, label: string) {
		if (!confirm(`delete "${label}"? this cannot be undone`)) return;
		await deleteCounter(id);
	}
</script>

{#if $project}
	<section class="counters">
		{#if mainCounter}
			<a
				class="counter-main"
				style={accentVars($project.accent)}
				href="/project/{page.params.id}/counter/{mainCounter.id}"
			>
				<span class="cm-head">
					<span class="counter-label">{mainCounter.label}</span>
					<span class="arrow" aria-hidden="true">→</span>
				</span>
				<span class="counter-value">{mainCounter.value}</span>
			</a>
		{/if}

		{#if otherCounters.length > 0}
			<ul class="counter-grid">
				{#each otherCounters as counter (counter.id)}
					<li class="counter-card">
						<a href="/project/{page.params.id}/counter/{counter.id}">
							<span class="cc-label">{counter.label}</span>
							<span class="cc-value">{counter.value}</span>
						</a>
						<span class="row-actions">
							<button class="ghost-small" onclick={() => setMainCounter(page.params.id!, counter.id)}
								>set main</button
							>
							<button
								class="ghost-small danger"
								onclick={() => removeCounter(counter.id, counter.label)}>delete</button
							>
						</span>
					</li>
				{/each}
			</ul>
		{/if}

		<button class="btn" onclick={addCounter}>add counter</button>
	</section>
{/if}

<style>
	.counters {
		max-width: 820px;
		margin-bottom: 24px;
	}

	.counter-main {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 24px 20px;
		border-radius: var(--radius);
		background: var(--accent);
		color: var(--on-accent);
		text-decoration: none;
		margin-bottom: 12px;
	}

	.cm-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 8px;
	}

	.arrow {
		font-family: var(--font-display);
		font-size: 24px;
		transition: transform 0.7s var(--ease);
	}

	.counter-main:hover .arrow {
		transform: rotate(-45deg);
	}

	.counter-label {
		font-size: 14px;
		font-weight: 600;
		opacity: 0.8;
	}

	.counter-value {
		font-family: var(--font-display);
		font-size: clamp(64px, 6vw, 96px);
		letter-spacing: -0.02em;
		line-height: 1;
		font-variant-numeric: tabular-nums;
	}

	.counter-grid {
		list-style: none;
		display: grid;
		/* 140px keeps two columns on small phones */
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 12px;
		margin-bottom: 12px;
	}

	.counter-card {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 12px;
		padding: 12px;
		border: 2px solid var(--ink);
		border-radius: var(--radius);
	}

	.counter-card a {
		display: flex;
		flex-direction: column;
		gap: 8px;
		text-decoration: none;
	}

	.cc-label {
		font-size: 13px;
		font-weight: 600;
		color: var(--muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.cc-value {
		font-family: var(--font-display);
		font-size: 32px;
		letter-spacing: -0.02em;
		line-height: 1;
	}

	.row-actions {
		display: flex;
		gap: 4px;
	}

	.ghost-small {
		min-height: 40px;
		padding: 4px 10px;
		font-size: 13px;
		font-weight: 600;
		color: var(--muted);
	}

	.ghost-small.danger {
		color: var(--red);
	}
</style>

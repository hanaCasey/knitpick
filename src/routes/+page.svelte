<script lang="ts">
	import ContinueCard from '$lib/components/ContinueCard.svelte';
	import { addNote, continueTarget, projectList, rowStats } from '$lib/queries';

	const projects = projectList();
	const current = continueTarget();
	const stats = rowStats();

	let noteText = $state('');

	async function quickNote(event: SubmitEvent) {
		event.preventDefault();
		const text = noteText.trim();
		const projectId = $current?.project.id;
		if (!text || !projectId) return;
		await addNote(projectId, text);
		noteText = '';
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

<p class="tagline">your knitting, row by row</p>

{#if $projects}
	{#if $projects.length > 0 && $stats}
		<ul class="stats">
			<li><span class="num">{$stats.today}</span><span class="lbl">rows today</span></li>
			<li><span class="num">{$stats.week}</span><span class="lbl">rows this week</span></li>
			<li><span class="num">{$stats.active}</span><span class="lbl">on the needles</span></li>
		</ul>
	{/if}

	{#if $current}
		<h1>{$current.project.name}</h1>
		<div class="cols">
			<div class="counter-col">
				<ContinueCard project={$current.project} counter={$current.counter} />
			</div>

			<div class="side-col">
				<div class="panel notes">
					<a class="head" href="/project/{$current.project.id}/log">
						<span class="label">notes</span>
						<span class="arrow" aria-hidden="true">→</span>
					</a>
					{#if $current.notes.length > 0}
						<ul>
							{#each $current.notes as note (note.id)}
								<li>
									<span class="time">{formatTime(note.createdAt)}</span>
									<p>{note.text}</p>
								</li>
							{/each}
						</ul>
					{:else}
						<p class="none">no notes yet</p>
					{/if}
					<form onsubmit={quickNote}>
						<input bind:value={noteText} placeholder="add a note…" aria-label="add a note" />
						<button type="submit">add</button>
					</form>
				</div>

				<a class="panel pattern" href="/project/{$current.project.id}/pattern">
					<span class="head">
						<span class="label">pattern</span>
						<span class="arrow" aria-hidden="true">→</span>
					</span>
					<span class="big">{$current.hasPattern ? 'open pdf' : 'add pdf'}</span>
				</a>
			</div>
		</div>
	{:else if $projects.length > 0}
		<p class="empty">no active project — reactivate one from the sidebar</p>
	{/if}

	{#if $projects.length === 0}
		<p class="empty">nothing on the needles yet</p>
		<a class="btn" href="/new">add project <span class="arrow" aria-hidden="true">→</span></a>
	{/if}
{/if}

<style>
	.tagline {
		font-size: 15px;
		font-weight: 600;
		color: var(--muted);
		margin: 4px 0 20px;
	}

	h1 {
		font-size: clamp(36px, 5vw, 56px);
		margin: 0 0 24px;
		overflow-wrap: anywhere;
	}

	.cols {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	@media (min-width: 900px) {
		.cols {
			display: grid;
			grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
			gap: clamp(20px, 2.5vw, 40px);
			align-items: stretch;
		}
	}

	.side-col {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.panel {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: clamp(16px, 2vw, 24px);
		border: 2px solid var(--ink);
		border-radius: var(--radius);
		text-decoration: none;
	}

	.notes {
		flex: 1;
		min-height: 200px;
	}

	.head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 14px;
		font-weight: 600;
		text-decoration: none;
		color: inherit;
	}

	.label {
		color: var(--muted);
	}

	.arrow {
		font-family: var(--font-display);
		font-size: 24px;
		transition: transform 0.7s var(--ease);
	}

	.head:hover .arrow,
	.pattern:hover .arrow {
		transform: rotate(-45deg);
	}

	.notes ul {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.notes li p {
		font-size: 15px;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.time {
		font-size: 12px;
		color: var(--muted);
	}

	.none {
		color: var(--muted);
		font-size: 15px;
	}

	.notes form {
		display: flex;
		gap: 8px;
		margin-top: auto;
	}

	.notes input {
		flex: 1;
	}

	.notes form button {
		font-weight: 600;
		padding: 0 12px;
	}

	.pattern .big {
		font-family: var(--font-display);
		font-size: 24px;
		letter-spacing: -0.02em;
	}

	.stats {
		list-style: none;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
		margin-bottom: 16px;
	}

	.stats li {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 16px 20px;
		border: 2px solid var(--ink);
		border-radius: var(--radius);
	}

	@media (max-width: 899px) {
		.stats {
			gap: 8px;
		}

		.stats li {
			padding: 12px;
		}
	}

	.num {
		font-family: var(--font-display);
		font-size: clamp(36px, 4vw, 56px);
		letter-spacing: -0.02em;
		line-height: 1.1;
	}

	.lbl {
		font-size: 13px;
		font-weight: 600;
		color: var(--muted);
	}

	.empty {
		color: var(--muted);
		padding: 48px 0 16px;
	}
</style>

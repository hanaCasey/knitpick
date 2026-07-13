<script lang="ts">
	import { page } from '$app/state';
	import { addNote, deleteNote, notesByProject, projectById } from '$lib/queries';

	const projectId = page.params.id!;
	const project = projectById(projectId);
	const notes = notesByProject(projectId);

	let text = $state('');

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		const trimmed = text.trim();
		if (!trimmed) return;
		await addNote(projectId, trimmed);
		text = '';
	}

	async function remove(id: string) {
		if (!confirm('delete this note?')) return;
		await deleteNote(id);
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

{#if $project}
	<a class="btn ghost back" href="/project/{projectId}">← {$project.name}</a>
	<h1>log</h1>

	<form onsubmit={submit}>
		<textarea bind:value={text} placeholder="what happened?" rows="3"></textarea>
		<button class="btn red" type="submit">add note</button>
	</form>

	{#if $notes && $notes.length > 0}
		<ul class="notes">
			{#each $notes as note (note.id)}
				<li>
					<div class="meta">
						<span class="time">{formatTime(note.createdAt)}</span>
						<button class="ghost-small danger" onclick={() => remove(note.id)}>delete</button>
					</div>
					<p>{note.text}</p>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="empty">no notes yet</p>
	{/if}
{/if}

<style>
	.back {
		margin-bottom: 12px;
	}

	h1 {
		font-size: 28px;
		margin-bottom: 16px;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 24px;
	}

	textarea {
		resize: vertical;
	}

	.notes {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.notes li {
		padding-bottom: 16px;
		border-bottom: 1px solid var(--line);
	}

	.meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 4px;
	}

	.time {
		font-size: 13px;
		color: var(--muted);
	}

	.ghost-small {
		min-height: 32px;
		padding: 4px 8px;
		font-size: 13px;
		font-weight: 600;
		color: var(--muted);
	}

	.ghost-small.danger {
		color: var(--red);
	}

	.empty {
		color: var(--muted);
		padding: 32px 0;
		text-align: center;
	}
</style>

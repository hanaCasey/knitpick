<script lang="ts">
	import { page } from '$app/state';
	import { fileByProject, projectById, removePatternPdf, setPatternPdf } from '$lib/queries';

	const projectId = page.params.id!;
	const project = projectById(projectId);
	const file = fileByProject(projectId, 'pdf');

	let url = $state<string | null>(null);

	$effect(() => {
		const blob = $file?.blob;
		if (!blob) {
			url = null;
			return;
		}
		const objectUrl = URL.createObjectURL(blob);
		url = objectUrl;
		return () => URL.revokeObjectURL(objectUrl);
	});

	async function upload(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const selected = input.files?.[0];
		if (!selected) return;
		await setPatternPdf(projectId, selected);
		input.value = '';
	}

	async function remove() {
		if (!$file) return;
		if (!confirm('remove pattern pdf? this cannot be undone')) return;
		await removePatternPdf($file.id);
	}
</script>

{#if $project}
	<a class="btn ghost back" href="/project/{projectId}">← {$project.name}</a>
	<h1>pattern</h1>

	{#if url}
		<iframe class="viewer" src={url} title="pattern pdf"></iframe>
		<div class="actions">
			<label class="btn ghost file">
				replace pdf
				<input type="file" accept="application/pdf" onchange={upload} />
			</label>
			<button class="btn ghost danger" onclick={remove}>remove</button>
		</div>
	{:else}
		<p class="empty">no pattern uploaded yet</p>
		<label class="btn red file">
			add pattern pdf
			<input type="file" accept="application/pdf" onchange={upload} />
		</label>
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

	.viewer {
		width: 100%;
		height: 70vh;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		margin-bottom: 16px;
	}

	.empty {
		color: var(--muted);
		padding: 32px 0;
		text-align: center;
	}

	.actions {
		display: flex;
		gap: 8px;
	}

	.actions .btn {
		flex: 1;
	}

	.file {
		position: relative;
		overflow: hidden;
		cursor: pointer;
	}

	.file input {
		position: absolute;
		inset: 0;
		opacity: 0;
		cursor: pointer;
	}

	.danger {
		color: var(--red);
	}
</style>

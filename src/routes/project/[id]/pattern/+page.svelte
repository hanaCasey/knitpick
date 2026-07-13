<script lang="ts">
	import { untrack } from 'svelte';
	import { page } from '$app/state';
	import PdfViewer from '$lib/components/PdfViewer.svelte';
	import {
		fileByProject,
		projectById,
		removePatternPdf,
		setLastViewedPage,
		setPatternPdf
	} from '$lib/queries';

	const projectId = page.params.id!;
	const project = projectById(projectId);
	const file = fileByProject(projectId, 'pdf');

	// snapshot keyed on file id so lastViewedPage writes (which re-emit $file with a
	// fresh blob instance) don't remount the viewer; a replaced pdf gets a new id
	let viewer = $state<{ id: string; blob: Blob; initialPage: number } | null>(null);
	$effect(() => {
		const f = $file;
		if (untrack(() => viewer)?.id === f?.id) return;
		viewer = f ? { id: f.id, blob: f.blob, initialPage: f.lastViewedPage ?? 1 } : null;
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
	{#if viewer}
		{@const v = viewer}
		<PdfViewer
			blob={v.blob}
			initialPage={v.initialPage}
			onpagechange={(p) => setLastViewedPage(v.id, p)}
		/>
		<div class="actions">
			<label class="btn ghost file">
				replace pdf
				<input type="file" accept="application/pdf" onchange={upload} />
			</label>
			<button class="btn ghost danger" onclick={remove}>remove</button>
		</div>
	{:else}
		<p class="empty">no pattern uploaded yet</p>
		<label class="btn file">
			add pattern pdf
			<input type="file" accept="application/pdf" onchange={upload} />
		</label>
	{/if}
{/if}

<style>
	.empty {
		color: var(--muted);
		padding: 32px 0 24px;
	}

	.actions {
		display: flex;
		gap: 8px;
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

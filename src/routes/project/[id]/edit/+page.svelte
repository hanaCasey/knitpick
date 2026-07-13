<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import AccentPicker from '$lib/components/AccentPicker.svelte';
	import { deleteProject, projectById, setCurrentProject, updateProject } from '$lib/queries';

	const project = projectById(page.params.id!);

	let name = $state('');
	let yarn = $state('');
	let needles = $state('');
	let accent = $state('');
	let loaded = $state(false);

	$effect(() => {
		const p = $project;
		if (p && !loaded) {
			name = p.name;
			yarn = p.yarn;
			needles = p.needles;
			accent = p.accent;
			loaded = true;
		}
	});

	async function save(event: SubmitEvent) {
		event.preventDefault();
		await updateProject(page.params.id!, {
			name: name.trim(),
			yarn: yarn.trim(),
			needles: needles.trim(),
			accent
		});
		await goto(`/project/${page.params.id}`);
	}

	async function setStatus(status: 'active' | 'finished' | 'frozen') {
		await updateProject(page.params.id!, { status });
	}

	async function remove() {
		if (!confirm(`delete "${$project?.name}"? this cannot be undone`)) return;
		await deleteProject(page.params.id!);
		await goto('/');
	}
</script>

{#if $project}
	<form onsubmit={save}>
		<div>
			<label for="name">name</label>
			<input id="name" bind:value={name} required autocomplete="off" />
		</div>
		<div>
			<label for="yarn">yarn</label>
			<input id="yarn" bind:value={yarn} autocomplete="off" />
		</div>
		<div>
			<label for="needles">needles</label>
			<input id="needles" bind:value={needles} autocomplete="off" />
		</div>
		<div>
			<span class="field-label">colour</span>
			<AccentPicker bind:value={accent} />
		</div>
		<button class="btn" type="submit">save</button>
	</form>

	<div class="actions">
		{#if $project.status === 'active'}
			{#if !$project.isCurrent}
				<button class="btn ghost" onclick={() => setCurrentProject(page.params.id!)}
					>make current</button
				>
			{/if}
			<button class="btn ghost" onclick={() => setStatus('finished')}>mark finished</button>
			<button class="btn ghost" onclick={() => setStatus('frozen')}>freeze</button>
		{:else}
			<button class="btn ghost" onclick={() => setStatus('active')}>reactivate</button>
		{/if}
		<button class="btn ghost danger" onclick={remove}>delete project</button>
	</div>
{/if}

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 16px;
		max-width: 520px;
	}

	form .btn {
		margin-top: 8px;
		align-self: flex-start;
	}

	.field-label {
		display: block;
		font-size: 14px;
		font-weight: 600;
		color: var(--muted);
		margin-bottom: 8px;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 24px;
		max-width: 520px;
	}

	.danger {
		color: var(--red);
	}
</style>

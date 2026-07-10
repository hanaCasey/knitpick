<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { deleteProject, projectById, updateProject } from '$lib/queries';

	const project = projectById(page.params.id!);

	let name = $state('');
	let yarn = $state('');
	let needles = $state('');
	let loaded = $state(false);

	$effect(() => {
		const p = $project;
		if (p && !loaded) {
			name = p.name;
			yarn = p.yarn;
			needles = p.needles;
			loaded = true;
		}
	});

	async function save(event: SubmitEvent) {
		event.preventDefault();
		await updateProject(page.params.id!, {
			name: name.trim(),
			yarn: yarn.trim(),
			needles: needles.trim()
		});
		await goto('/');
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
	<a class="btn ghost back" href="/">← home</a>

	<header class="band {$project.accent}">
		<h1>{$project.name}</h1>
		{#if $project.status !== 'active'}
			<span class="status">{$project.status === 'finished' ? 'finished 🎉' : 'frozen'}</span>
		{/if}
	</header>

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
		<button class="btn" type="submit">save</button>
	</form>

	<div class="actions">
		{#if $project.status === 'active'}
			<button class="btn ghost" onclick={() => setStatus('finished')}>mark finished</button>
			<button class="btn ghost" onclick={() => setStatus('frozen')}>freeze</button>
		{:else}
			<button class="btn ghost" onclick={() => setStatus('active')}>reactivate</button>
		{/if}
		<button class="btn ghost danger" onclick={remove}>delete project</button>
	</div>
{/if}

<style>
	.back {
		margin-bottom: 12px;
	}

	.band {
		padding: 32px 16px;
		border-radius: var(--radius);
		margin-bottom: 24px;
	}

	.band h1 {
		font-size: 32px;
	}

	.band.red {
		background: var(--red);
		color: var(--on-red);
	}

	.band.pink {
		background: var(--pink);
		color: var(--on-pink);
	}

	.band.orange {
		background: var(--orange);
		color: var(--on-orange);
	}

	.status {
		font-size: 14px;
		font-weight: 600;
		opacity: 0.8;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	form .btn {
		margin-top: 8px;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 8px;
		margin-top: 24px;
	}

	.danger {
		color: var(--red);
	}
</style>

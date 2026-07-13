<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		countersByProject,
		createCounter,
		deleteCounter,
		deleteProject,
		projectById,
		setMainCounter,
		updateProject
	} from '$lib/queries';

	const project = projectById(page.params.id!);
	const counters = countersByProject(page.params.id!);
	const mainCounter = $derived($counters?.find((c) => c.isMain));
	const otherCounters = $derived($counters?.filter((c) => c.id !== mainCounter?.id) ?? []);

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
	<a class="btn ghost back" href="/">← home</a>

	<header class="band {$project.accent}">
		<h1>{$project.name}</h1>
		{#if $project.status !== 'active'}
			<span class="status">{$project.status === 'finished' ? 'finished 🎉' : 'frozen'}</span>
		{/if}
	</header>

	<section class="counters">
		{#if mainCounter}
			<a class="counter-main" href="/project/{page.params.id}/counter/{mainCounter.id}">
				<span class="counter-label">{mainCounter.label}</span>
				<span class="counter-value">{mainCounter.value}</span>
			</a>
		{/if}

		{#if otherCounters.length > 0}
			<ul class="counter-list">
				{#each otherCounters as counter (counter.id)}
					<li>
						<a class="counter-row" href="/project/{page.params.id}/counter/{counter.id}">
							<span class="counter-row-label">{counter.label}</span>
							<span class="counter-row-value">{counter.value}</span>
						</a>
						<span class="row-actions">
							<button
								class="ghost-small"
								onclick={() => setMainCounter(page.params.id!, counter.id)}>set main</button
							>
							<button class="ghost-small danger" onclick={() => removeCounter(counter.id, counter.label)}
								>delete</button
							>
						</span>
					</li>
				{/each}
			</ul>
		{/if}

		<button class="btn ghost" onclick={addCounter}>add counter</button>
	</section>

	<div class="links">
		<a class="btn ghost" href="/project/{page.params.id}/pattern">pattern</a>
		<a class="btn ghost" href="/project/{page.params.id}/log">log</a>
	</div>

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

	.counters {
		margin-bottom: 24px;
	}

	.counter-main {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 24px 16px;
		border-radius: var(--radius);
		background: var(--ink);
		color: var(--bg);
		text-decoration: none;
		margin-bottom: 12px;
	}

	.counter-label {
		font-size: 14px;
		font-weight: 600;
		opacity: 0.8;
	}

	.counter-value {
		font-family: var(--font-display);
		font-size: 64px;
		letter-spacing: -0.02em;
		line-height: 1;
		font-variant-numeric: tabular-nums;
	}

	.counter-list {
		list-style: none;
	}

	.counter-list li {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 0;
		border-bottom: 1px solid var(--line);
	}

	.counter-row {
		display: flex;
		flex: 1;
		justify-content: space-between;
		align-items: baseline;
		text-decoration: none;
		min-width: 0;
	}

	.counter-row-label {
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.counter-row-value {
		font-family: var(--font-display);
		font-size: 20px;
		font-variant-numeric: tabular-nums;
		flex-shrink: 0;
		margin-left: 8px;
	}

	.row-actions {
		display: flex;
		gap: 4px;
		flex-shrink: 0;
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

	.links {
		display: flex;
		gap: 8px;
		margin-bottom: 24px;
	}

	.links .btn {
		flex: 1;
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

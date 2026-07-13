<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { accentVars } from '$lib/accents';
	import AccentPicker from '$lib/components/AccentPicker.svelte';
	import {
		countersByProject,
		createCounter,
		deleteCounter,
		deleteProject,
		projectById,
		setCurrentProject,
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
	let accent = $state('');
	let loaded = $state(false);
	let showDetails = $state(false);

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
		showDetails = false;
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
	<header class="head">
		<h1>{$project.name}</h1>
		{#if $project.status !== 'active'}
			<p class="status">{$project.status === 'finished' ? 'finished 🎉' : 'frozen'}</p>
		{:else if $project.isCurrent}
			<p class="status">current project</p>
		{/if}
	</header>

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

		<button class="btn ghost" onclick={addCounter}>add counter</button>
	</section>

	<section class="details">
		<button class="btn ghost" onclick={() => (showDetails = !showDetails)}>
			{showDetails ? 'hide details' : 'edit details'}
		</button>

		{#if showDetails}
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
	</section>
{/if}

<style>
	.head {
		margin: 16px 0 24px;
	}

	.head h1 {
		font-size: clamp(40px, 5vw, 64px);
	}

	.status {
		margin-top: 4px;
		font-size: 14px;
		font-weight: 600;
		color: var(--muted);
	}

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

	.details {
		border-top: 1px solid var(--line);
		padding-top: 16px;
		max-width: 820px;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 16px;
		max-width: 520px;
		margin-top: 16px;
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
	}

	.danger {
		color: var(--red);
	}
</style>

<script lang="ts">
	import { goto } from '$app/navigation';
	import AccentPicker from '$lib/components/AccentPicker.svelte';
	import { ACCENTS, createProject, projectList } from '$lib/queries';

	const projects = projectList();

	let name = $state('');
	let yarn = $state('');
	let needles = $state('');
	let accent = $state('');

	// suggest the next colour in the cycle once, without overriding a user pick
	$effect(() => {
		if (!accent && $projects) accent = ACCENTS[$projects.length % ACCENTS.length];
	});

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		const id = await createProject({
			name: name.trim(),
			yarn: yarn.trim(),
			needles: needles.trim(),
			accent: accent || undefined
		});
		await goto(`/project/${id}`);
	}
</script>

<h1>new project</h1>

<form onsubmit={submit}>
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
		<input id="needles" bind:value={needles} autocomplete="off" placeholder="4 mm" />
	</div>
	<div>
		<span class="field-label">colour</span>
		<AccentPicker bind:value={accent} />
	</div>

	<button class="btn" type="submit">add project <span class="arrow" aria-hidden="true">→</span></button>
	<a class="btn ghost" href="/">cancel</a>
</form>

<style>
	h1 {
		font-size: clamp(36px, 5vw, 56px);
		margin: 16px 0 32px;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 16px;
		max-width: 520px;
	}

	.field-label {
		display: block;
		font-size: 14px;
		font-weight: 600;
		color: var(--muted);
		margin-bottom: 8px;
	}

	.btn[type='submit'] {
		margin-top: 8px;
		align-self: flex-start;
	}

	.ghost {
		align-self: flex-start;
	}
</style>

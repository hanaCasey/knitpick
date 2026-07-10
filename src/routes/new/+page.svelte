<script lang="ts">
	import { goto } from '$app/navigation';
	import { createProject } from '$lib/queries';

	let name = $state('');
	let yarn = $state('');
	let needles = $state('');

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		const id = await createProject({ name: name.trim(), yarn: yarn.trim(), needles: needles.trim() });
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

	<button class="btn red" type="submit">add project</button>
	<a class="btn ghost" href="/">cancel</a>
</form>

<style>
	h1 {
		font-size: 28px;
		margin: 16px 0 24px;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.btn.red {
		margin-top: 8px;
	}

	.ghost {
		align-self: center;
	}
</style>

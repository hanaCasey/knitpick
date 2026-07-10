<script lang="ts">
	import ContinueCard from '$lib/components/ContinueCard.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import { projectList } from '$lib/queries';

	const projects = projectList();
	const current = $derived($projects?.find((p) => p.status === 'active'));
	const rest = $derived($projects?.filter((p) => p.id !== current?.id) ?? []);
</script>

<h1>knitpick</h1>

{#if $projects}
	{#if current}
		<ContinueCard project={current} />
	{/if}

	{#if rest.length > 0}
		<ul>
			{#each rest as project (project.id)}
				<li><ProjectCard {project} /></li>
			{/each}
		</ul>
	{/if}

	{#if $projects.length === 0}
		<p class="empty">nothing on the needles yet</p>
	{/if}

	<a class="btn" href="/new">add project</a>
{/if}

<style>
	h1 {
		font-size: 32px;
		margin: 16px 0 24px;
	}

	ul {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-top: 12px;
	}

	.empty {
		color: var(--muted);
		padding: 32px 0;
		text-align: center;
	}

	.btn {
		margin-top: 24px;
	}
</style>

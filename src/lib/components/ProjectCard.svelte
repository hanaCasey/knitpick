<script lang="ts">
	import type { Project } from '$lib/db';

	let { project }: { project: Project } = $props();

	const meta = $derived(
		project.status === 'finished'
			? 'finished 🎉'
			: project.status === 'frozen'
				? 'frozen'
				: [project.yarn, project.needles].filter(Boolean).join(' · ')
	);
</script>

<a class="card" href="/project/{project.id}">
	<span class="mark {project.accent}"></span>
	<span class="body">
		<span class="name">{project.name}</span>
		{#if meta}
			<span class="meta">{meta}</span>
		{/if}
	</span>
</a>

<style>
	.card {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		text-decoration: none;
	}

	.mark {
		width: 24px;
		height: 24px;
		border-radius: var(--radius);
		flex-shrink: 0;
	}

	.mark.red {
		background: var(--red);
	}

	.mark.pink {
		background: var(--pink);
	}

	.mark.orange {
		background: var(--orange);
	}

	.body {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.name {
		font-family: var(--font-display);
		font-size: 18px;
		letter-spacing: -0.02em;
	}

	.meta {
		font-size: 14px;
		color: var(--muted);
	}
</style>

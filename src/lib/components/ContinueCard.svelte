<script lang="ts">
	import type { Project } from '$lib/db';

	let { project }: { project: Project } = $props();
</script>

<a class="continue {project.accent}" href="/project/{project.id}">
	<span class="label">continue</span>
	<span class="name">{project.name}</span>
</a>

<style>
	.continue {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 24px 16px;
		border-radius: var(--radius);
		text-decoration: none;
	}

	.red {
		background: var(--red);
		color: var(--on-red);
	}

	.pink {
		background: var(--pink);
		color: var(--on-pink);
	}

	.orange {
		background: var(--orange);
		color: var(--on-orange);
	}

	.label {
		font-size: 14px;
		font-weight: 600;
		opacity: 0.8;
	}

	.name {
		font-family: var(--font-display);
		font-size: 28px;
		letter-spacing: -0.02em;
		line-height: 1.15;
	}
</style>

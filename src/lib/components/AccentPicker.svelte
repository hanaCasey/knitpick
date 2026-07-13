<script lang="ts">
	import { PRESETS } from '$lib/accents';
	import { addColor, colorList } from '$lib/queries';

	let { value = $bindable() }: { value: string } = $props();

	const customs = colorList();

	async function pickCustom(event: Event) {
		const hex = (event.currentTarget as HTMLInputElement).value;
		await addColor(hex);
		value = hex;
	}
</script>

<div class="swatches" role="radiogroup" aria-label="project colour">
	{#each PRESETS as preset (preset.name)}
		<button
			type="button"
			class="swatch"
			class:selected={value === preset.name}
			style="background: {preset.hex}"
			role="radio"
			aria-checked={value === preset.name}
			aria-label={preset.name}
			title={preset.name}
			onclick={() => (value = preset.name)}
		></button>
	{/each}
	{#each $customs ?? [] as color (color.id)}
		<button
			type="button"
			class="swatch"
			class:selected={value === color.hex}
			style="background: {color.hex}"
			role="radio"
			aria-checked={value === color.hex}
			aria-label={color.hex}
			title={color.hex}
			onclick={() => (value = color.hex)}
		></button>
	{/each}
	<label class="swatch add" title="add colour">
		+
		<input type="color" onchange={pickCustom} aria-label="add colour" />
	</label>
</div>

<style>
	.swatches {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.swatch {
		width: 36px;
		height: 36px;
		border-radius: 8px;
		border: 2px solid transparent;
		cursor: pointer;
	}

	.swatch.selected {
		outline: 2px solid var(--ink);
		outline-offset: 2px;
	}

	.add {
		display: flex;
		align-items: center;
		justify-content: center;
		border-color: var(--ink);
		font-weight: 600;
		font-size: 18px;
		position: relative;
		overflow: hidden;
	}

	.add input {
		position: absolute;
		inset: 0;
		opacity: 0;
		cursor: pointer;
	}
</style>

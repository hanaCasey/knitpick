<script lang="ts">
	import { tick, untrack } from 'svelte';
	import { loadPdf, type PDFDocumentProxy } from '$lib/pdf';

	interface PageInfo {
		num: number;
		w: number;
		h: number;
	}

	let {
		blob,
		initialPage = 1,
		onpagechange
	}: {
		blob: Blob;
		initialPage?: number;
		onpagechange?: (page: number) => void;
	} = $props();

	const PAD = 12;
	// iOS refuses canvases much larger than this
	const MAX_CANVAS_PIXELS = 8_000_000;

	let scroller = $state<HTMLDivElement>();
	let cw = $state(0);
	let zoom = $state(1);
	let pages = $state<PageInfo[]>([]);
	let current = $state(1);

	let doc: PDFDocumentProxy | null = null;
	let epoch = 0; // bumped when doc/zoom/width changes; stale renders are dropped
	const els = new Map<number, HTMLDivElement>();
	const rendered = new Map<number, number>(); // page num -> epoch it was rendered at
	const tasks = new Map<number, { cancel(): void }>();
	const visible = new Set<number>();
	let observer: IntersectionObserver | undefined;

	const pageWidth = $derived(Math.max(0, cw - PAD * 2) * zoom);

	$effect(() => {
		const b = blob;
		let cancelled = false;
		(async () => {
			const d = await loadPdf(b);
			if (cancelled) {
				d.loadingTask.destroy();
				return;
			}
			doc = d;
			const infos: PageInfo[] = [];
			for (let i = 1; i <= d.numPages; i++) {
				const vp = (await d.getPage(i)).getViewport({ scale: 1 });
				infos.push({ num: i, w: vp.width, h: vp.height });
			}
			if (cancelled) return;
			pages = infos;
			current = Math.max(1, Math.min(untrack(() => initialPage), d.numPages));
			await tick();
			scrollToPage(current);
		})();
		return () => {
			cancelled = true;
			doc?.loadingTask.destroy();
			doc = null;
			pages = [];
			rendered.clear();
			tasks.clear();
		};
	});

	// re-render visible pages when zoom or container width changes (and on first load)
	$effect(() => {
		void zoom;
		void cw;
		if (!cw || pages.length === 0) return;
		epoch++;
		rendered.clear();
		for (const t of tasks.values()) t.cancel();
		tasks.clear();
		tick().then(() => {
			for (const num of visible) render(num);
		});
	});

	$effect(() => {
		if (!scroller) return;
		const io = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const num = Number((entry.target as HTMLElement).dataset.num);
					if (entry.isIntersecting) {
						visible.add(num);
						render(num);
					} else {
						visible.delete(num);
					}
				}
			},
			{ root: scroller, rootMargin: '100% 0px' }
		);
		observer = io;
		for (const el of els.values()) io.observe(el);
		return () => {
			io.disconnect();
			observer = undefined;
		};
	});

	function pageEl(node: HTMLDivElement, num: number) {
		els.set(num, node);
		observer?.observe(node);
		return {
			destroy() {
				els.delete(num);
				observer?.unobserve(node);
			}
		};
	}

	async function render(num: number) {
		const d = doc;
		const info = pages.find((p) => p.num === num);
		const el = els.get(num);
		const displayW = pageWidth;
		if (!d || !info || !el || !displayW || rendered.get(num) === epoch) return;
		const myEpoch = epoch;
		rendered.set(num, myEpoch);

		const page = await d.getPage(num);
		if (myEpoch !== epoch) return;
		const displayH = (displayW * info.h) / info.w;
		const ratio = Math.min(
			window.devicePixelRatio || 1,
			Math.sqrt(MAX_CANVAS_PIXELS / (displayW * displayH))
		);
		const viewport = page.getViewport({ scale: (displayW / info.w) * ratio });
		const canvas = document.createElement('canvas');
		canvas.width = Math.floor(viewport.width);
		canvas.height = Math.floor(viewport.height);
		const task = page.render({ canvas, viewport });
		tasks.set(num, task);
		try {
			await task.promise;
		} catch {
			if (rendered.get(num) === myEpoch) rendered.delete(num);
			return;
		}
		if (myEpoch !== epoch) return;
		el.replaceChildren(canvas);
	}

	function scrollToPage(num: number) {
		const el = els.get(num);
		if (scroller && el) scroller.scrollTop = el.offsetTop - PAD;
	}

	async function setZoom(z: number) {
		zoom = Math.max(1, Math.min(3, z));
		await tick();
		scrollToPage(current);
	}

	let scrollTimer: ReturnType<typeof setTimeout>;
	function onScroll() {
		clearTimeout(scrollTimer);
		scrollTimer = setTimeout(() => {
			if (!scroller) return;
			const top = scroller.scrollTop + scroller.clientHeight * 0.5;
			let cur = 1;
			for (const p of pages) {
				const el = els.get(p.num);
				if (el && el.offsetTop <= top) cur = p.num;
			}
			if (cur !== current) {
				current = cur;
				onpagechange?.(cur);
			}
		}, 200);
	}
</script>

<div class="bar">
	<span class="info">page {current} / {pages.length || '…'}</span>
	<span class="zoomctl">
		<button class="ghost" onclick={() => setZoom(zoom - 0.5)} disabled={zoom <= 1} aria-label="zoom out">−</button>
		<span class="info">{zoom}×</span>
		<button class="ghost" onclick={() => setZoom(zoom + 0.5)} disabled={zoom >= 3} aria-label="zoom in">+</button>
	</span>
</div>

<div class="scroller" bind:this={scroller} bind:clientWidth={cw} onscroll={onScroll}>
	{#if pages.length === 0}
		<p class="loading">loading pattern…</p>
	{/if}
	{#each pages as p (p.num)}
		<div
			class="page"
			data-num={p.num}
			use:pageEl={p.num}
			style="width:{pageWidth}px; height:{(pageWidth * p.h) / p.w}px"
		></div>
	{/each}
</div>

<style>
	.bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}

	.info {
		font-size: 14px;
		font-weight: 600;
		color: var(--muted);
		font-variant-numeric: tabular-nums;
	}

	.zoomctl {
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}

	.zoomctl button {
		font-family: var(--font-display);
		font-size: 20px;
		width: 44px;
		height: 44px;
		border-radius: var(--radius-pill);
	}

	.zoomctl button:disabled {
		opacity: 0.3;
	}

	.scroller {
		position: relative;
		height: 75vh;
		height: 75dvh; /* mobile browser chrome shrinks vh */
		overflow: auto;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		padding: 12px;
	}

	.page {
		background: #fff;
		border: 1px solid var(--line);
		margin-bottom: 12px;
	}

	.page :global(canvas) {
		display: block;
		width: 100%;
		height: 100%;
	}

	.loading {
		color: var(--muted);
		font-size: 15px;
	}
</style>

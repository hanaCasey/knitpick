// source of truth for accent colors. a project's `accent` is either a preset
// name from this list or a raw hex string the user added.
export type Preset = { name: string; hex: string; on: string };

export const PRESETS: Preset[] = [
	{ name: 'red', hex: '#df5539', on: '#ffffff' },
	{ name: 'pink', hex: '#f496d1', on: '#141414' },
	{ name: 'green', hex: '#32a255', on: '#ffffff' },
	{ name: 'blush', hex: '#efb6dc', on: '#141414' },
	{ name: 'orange', hex: '#e36025', on: '#ffffff' },
	{ name: 'sage', hex: '#7da87a', on: '#141414' },
	{ name: 'cobalt', hex: '#115eae', on: '#ffffff' },
	{ name: 'petal', hex: '#f4cde4', on: '#141414' },
	{ name: 'moss', hex: '#668d57', on: '#ffffff' },
	{ name: 'navy', hex: '#1a2d70', on: '#ffffff' }
];

function luminance(hex: string): number {
	const n = hex.replace('#', '');
	const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
	const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
	return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function accentHex(accent: string): string {
	return PRESETS.find((p) => p.name === accent)?.hex ?? accent;
}

export function onAccent(accent: string): string {
	const preset = PRESETS.find((p) => p.name === accent);
	if (preset) return preset.on;
	// 0.3 reproduces the curated preset choices, so custom colors behave consistently
	return luminance(accentHex(accent)) > 0.3 ? '#141414' : '#ffffff';
}

// inline style that feeds the --accent/--on-accent vars component css consumes
export function accentVars(accent: string): string {
	const on = onAccent(accent);
	const hover = on === '#ffffff' ? '#141414' : '#ffffff';
	return `--accent:${accentHex(accent)};--on-accent:${on};--on-accent-hover:${hover}`;
}

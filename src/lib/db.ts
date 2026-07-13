import Dexie, { type EntityTable } from 'dexie';

// a preset name from src/lib/accents.ts, or a raw '#rrggbb' the user added
export type Accent = string;
export type ProjectStatus = 'active' | 'finished' | 'frozen';

export interface Project {
	id: string;
	name: string;
	accent: Accent;
	status: ProjectStatus;
	isCurrent: boolean; // at most one, always active — drives the continue card + sidebar order
	yarn: string;
	needles: string;
	createdAt: number;
	updatedAt: number; // bumped on any activity
}

export interface Counter {
	id: string;
	projectId: string;
	label: string;
	value: number;
	isMain: boolean;
	createdAt: number;
	target?: number;
	linkTo?: string; // repeat counter: auto-resets at target, increments linked counter
}

export interface CounterEvent {
	id: string;
	counterId: string;
	projectId: string;
	value: number; // counter value after this update
	createdAt: number;
}

export interface FileEntry {
	id: string;
	projectId: string;
	kind: 'pdf' | 'photo';
	blob: Blob;
	thumbnail?: Blob;
	lastViewedPage?: number;
}

export interface Note {
	id: string;
	projectId: string;
	text: string;
	photoId?: string;
	createdAt: number;
}

export interface CustomColor {
	id: string;
	hex: string;
	createdAt: number;
}

export const db = new Dexie('knitpick') as Dexie & {
	projects: EntityTable<Project, 'id'>;
	counters: EntityTable<Counter, 'id'>;
	counterEvents: EntityTable<CounterEvent, 'id'>;
	files: EntityTable<FileEntry, 'id'>;
	notes: EntityTable<Note, 'id'>;
	colors: EntityTable<CustomColor, 'id'>;
};

db.version(1).stores({
	projects: 'id, status, updatedAt',
	counters: 'id, projectId',
	files: 'id, projectId, kind',
	notes: 'id, projectId, createdAt'
});

db.version(2)
	.stores({
		projects: 'id, status, updatedAt',
		counters: 'id, projectId, isMain',
		files: 'id, projectId, kind',
		notes: 'id, projectId, createdAt',
		counterEvents: 'id, counterId, projectId, createdAt'
	})
	.upgrade(async (tx) => {
		await tx
			.table('counters')
			.toCollection()
			.modify((c) => {
				c.isMain ??= false;
				c.createdAt ??= Date.now();
			});
	});

// palette swap: pink and orange retired, remap to their nearest new accent
db.version(3).upgrade(async (tx) => {
	const remap: Record<string, string> = { pink: 'purple', orange: 'amber' };
	await tx
		.table('projects')
		.toCollection()
		.modify((p) => {
			if (p.accent in remap) p.accent = remap[p.accent];
		});
});

// palette rework: candy pairs (red/pink, green/blush) — amber, teal, purple retired
db.version(4).upgrade(async (tx) => {
	const remap: Record<string, Accent> = { amber: 'blush', teal: 'green', purple: 'pink' };
	await tx
		.table('projects')
		.toCollection()
		.modify((p) => {
			if (p.accent in remap) p.accent = remap[p.accent];
		});
});

// explicit current project — seeded from the previously implicit rule (latest active)
db.version(5).upgrade(async (tx) => {
	const projects = await tx.table('projects').toArray();
	const current = projects
		.filter((p) => p.status === 'active')
		.sort((a, b) => b.updatedAt - a.updatedAt)[0];
	await tx
		.table('projects')
		.toCollection()
		.modify((p) => {
			p.isCurrent = p.id === current?.id;
		});
});

// user-added accent colors
db.version(6).stores({ colors: 'id, createdAt' });

import Dexie, { type EntityTable } from 'dexie';

export type Accent = 'red' | 'pink' | 'orange';
export type ProjectStatus = 'active' | 'finished' | 'frozen';

export interface Project {
	id: string;
	name: string;
	accent: Accent;
	status: ProjectStatus;
	yarn: string;
	needles: string;
	createdAt: number;
	updatedAt: number; // bumped on any activity — drives the continue card
}

export interface Counter {
	id: string;
	projectId: string;
	label: string;
	value: number;
	target?: number;
	linkTo?: string; // repeat counter: auto-resets at target, increments linked counter
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

export const db = new Dexie('knitpick') as Dexie & {
	projects: EntityTable<Project, 'id'>;
	counters: EntityTable<Counter, 'id'>;
	files: EntityTable<FileEntry, 'id'>;
	notes: EntityTable<Note, 'id'>;
};

db.version(1).stores({
	projects: 'id, status, updatedAt',
	counters: 'id, projectId',
	files: 'id, projectId, kind',
	notes: 'id, projectId, createdAt'
});

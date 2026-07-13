import { liveQuery } from 'dexie';
import { db, type Accent, type Project } from './db';

const ACCENTS: Accent[] = ['red', 'pink', 'orange'];

export const projectList = () =>
	liveQuery(() => db.projects.orderBy('updatedAt').reverse().toArray());

export const projectById = (id: string) => liveQuery(() => db.projects.get(id));

export async function createProject(fields: Pick<Project, 'name' | 'yarn' | 'needles'>) {
	const id = crypto.randomUUID();
	const count = await db.projects.count();
	const now = Date.now();
	await db.projects.add({
		id,
		...fields,
		accent: ACCENTS[count % ACCENTS.length],
		status: 'active',
		createdAt: now,
		updatedAt: now
	});
	return id;
}

export async function updateProject(
	id: string,
	changes: Partial<Pick<Project, 'name' | 'yarn' | 'needles' | 'status'>>
) {
	await db.projects.update(id, { ...changes, updatedAt: Date.now() });
}

export async function deleteProject(id: string) {
	await db.transaction(
		'rw',
		[db.projects, db.counters, db.counterEvents, db.files, db.notes],
		async () => {
			await db.projects.delete(id);
			await db.counterEvents.where('projectId').equals(id).delete();
			await db.counters.where('projectId').equals(id).delete();
			await db.files.where('projectId').equals(id).delete();
			await db.notes.where('projectId').equals(id).delete();
		}
	);
}

// counters

export const countersByProject = (projectId: string) =>
	liveQuery(() => db.counters.where('projectId').equals(projectId).toArray());

export const counterById = (id: string) => liveQuery(() => db.counters.get(id));

export const eventsByCounter = (counterId: string) =>
	liveQuery(async () => {
		const events = await db.counterEvents.where('counterId').equals(counterId).sortBy('createdAt');
		return events.reverse();
	});

export async function createCounter(projectId: string, label: string) {
	const id = crypto.randomUUID();
	const isFirst = (await db.counters.where('projectId').equals(projectId).count()) === 0;
	await db.counters.add({
		id,
		projectId,
		label,
		value: 0,
		isMain: isFirst,
		createdAt: Date.now()
	});
	return id;
}

export async function renameCounter(id: string, label: string) {
	await db.counters.update(id, { label });
}

export async function setMainCounter(projectId: string, counterId: string) {
	await db.transaction('rw', db.counters, async () => {
		const siblings = await db.counters.where('projectId').equals(projectId).toArray();
		await Promise.all(
			siblings.map((c) => db.counters.update(c.id, { isMain: c.id === counterId }))
		);
	});
}

export async function deleteCounter(id: string) {
	await db.transaction('rw', [db.counters, db.counterEvents], async () => {
		const counter = await db.counters.get(id);
		if (!counter) return;
		await db.counters.delete(id);
		await db.counterEvents.where('counterId').equals(id).delete();
		if (counter.isMain) {
			const next = await db.counters.where('projectId').equals(counter.projectId).first();
			if (next) await db.counters.update(next.id, { isMain: true });
		}
	});
}

async function bumpCounter(id: string, delta: 1 | -1) {
	await db.transaction('rw', [db.counters, db.counterEvents, db.projects], async () => {
		const counter = await db.counters.get(id);
		if (!counter) return;
		const value = Math.max(0, counter.value + delta);
		if (value === counter.value) return;
		await db.counters.update(id, { value });
		await db.counterEvents.add({
			id: crypto.randomUUID(),
			counterId: id,
			projectId: counter.projectId,
			value,
			createdAt: Date.now()
		});
		await db.projects.update(counter.projectId, { updatedAt: Date.now() });
	});
}

export const incrementCounter = (id: string) => bumpCounter(id, 1);
export const decrementCounter = (id: string) => bumpCounter(id, -1);

// pattern files

export const fileByProject = (projectId: string, kind: 'pdf' | 'photo') =>
	liveQuery(() =>
		db.files.where('projectId').equals(projectId).and((f) => f.kind === kind).first()
	);

export async function setPatternPdf(projectId: string, blob: Blob) {
	await db.transaction('rw', db.files, async () => {
		const existing = await db.files
			.where('projectId')
			.equals(projectId)
			.and((f) => f.kind === 'pdf')
			.first();
		if (existing) {
			await db.files.update(existing.id, { blob });
		} else {
			await db.files.add({ id: crypto.randomUUID(), projectId, kind: 'pdf', blob });
		}
	});
}

export async function removePatternPdf(fileId: string) {
	await db.files.delete(fileId);
}

// notes

export const notesByProject = (projectId: string) =>
	liveQuery(async () => {
		const notes = await db.notes.where('projectId').equals(projectId).sortBy('createdAt');
		return notes.reverse();
	});

export async function addNote(projectId: string, text: string) {
	await db.transaction('rw', [db.notes, db.projects], async () => {
		await db.notes.add({ id: crypto.randomUUID(), projectId, text, createdAt: Date.now() });
		await db.projects.update(projectId, { updatedAt: Date.now() });
	});
}

export async function deleteNote(id: string) {
	await db.notes.delete(id);
}

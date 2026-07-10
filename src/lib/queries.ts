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
	await db.transaction('rw', [db.projects, db.counters, db.files, db.notes], async () => {
		await db.projects.delete(id);
		await db.counters.where('projectId').equals(id).delete();
		await db.files.where('projectId').equals(id).delete();
		await db.notes.where('projectId').equals(id).delete();
	});
}

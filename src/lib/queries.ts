import { liveQuery } from 'dexie';
import { db, type Accent, type Project } from './db';

// cycle order alternates warm/cool and dark/pale so neighbouring projects never clash
export const ACCENTS: Accent[] = [
	'red',
	'sage',
	'navy',
	'pink',
	'moss',
	'blush',
	'cobalt',
	'orange',
	'green',
	'petal'
];

export const projectList = () =>
	liveQuery(() => db.projects.orderBy('updatedAt').reverse().toArray());

export const projectById = (id: string) => liveQuery(() => db.projects.get(id));

// the current project + its main counter + latest notes — drives the home screen.
// falls back to the most recently worked-on active project if none is marked.
export const continueTarget = () =>
	liveQuery(async () => {
		const project =
			(await db.projects.filter((p) => p.isCurrent).first()) ??
			(await db.projects
				.orderBy('updatedAt')
				.reverse()
				.filter((p) => p.status === 'active')
				.first());
		if (!project) return null;
		const counter =
			(await db.counters
				.where('projectId')
				.equals(project.id)
				.and((c) => c.isMain)
				.first()) ?? null;
		const notes = (await db.notes.where('projectId').equals(project.id).sortBy('createdAt'))
			.reverse()
			.slice(0, 3);
		const hasPattern = !!(await db.files
			.where('projectId')
			.equals(project.id)
			.and((f) => f.kind === 'pdf')
			.first());
		return { project, counter, notes, hasPattern };
	});

// net rows counted since the start of today / this week (monday), plus active project count.
// counter values only ever change through counterEvents, so "value at time t" is the
// last event before t (0 if none).
export const rowStats = () =>
	liveQuery(async () => {
		const d = new Date();
		d.setHours(0, 0, 0, 0);
		const todayStart = d.getTime();
		const weekStart = todayStart - ((d.getDay() + 6) % 7) * 86400000;

		const counters = await db.counters.toArray();
		const events = await db.counterEvents.orderBy('createdAt').toArray();
		const tracked = new Set(events.map((e) => e.counterId));

		const net = (t: number) => {
			const base = new Map<string, number>();
			for (const e of events) {
				if (e.createdAt >= t) break;
				base.set(e.counterId, e.value);
			}
			return counters.reduce(
				(sum, c) => (tracked.has(c.id) ? sum + c.value - (base.get(c.id) ?? 0) : sum),
				0
			);
		};

		const active = await db.projects.where('status').equals('active').count();
		return {
			today: Math.max(0, net(todayStart)),
			week: Math.max(0, net(weekStart)),
			active
		};
	});

export async function createProject(
	fields: Pick<Project, 'name' | 'yarn' | 'needles'> & { accent?: Accent }
) {
	const id = crypto.randomUUID();
	const count = await db.projects.count();
	const hasCurrent = !!(await db.projects.filter((p) => p.isCurrent).first());
	const now = Date.now();
	await db.projects.add({
		...fields,
		id,
		accent: fields.accent ?? ACCENTS[count % ACCENTS.length],
		status: 'active',
		isCurrent: !hasCurrent,
		createdAt: now,
		updatedAt: now
	});
	return id;
}

export async function updateProject(
	id: string,
	changes: Partial<Pick<Project, 'name' | 'yarn' | 'needles' | 'status' | 'accent'>>
) {
	const patch: Partial<Project> = { ...changes, updatedAt: Date.now() };
	// only an active project can be current
	if (changes.status && changes.status !== 'active') patch.isCurrent = false;
	await db.projects.update(id, patch);
}

export async function setCurrentProject(id: string) {
	await db.transaction('rw', db.projects, async () => {
		const all = await db.projects.toArray();
		await Promise.all(all.map((p) => db.projects.update(p.id, { isCurrent: p.id === id })));
	});
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

// custom accent colors

export const colorList = () => liveQuery(() => db.colors.orderBy('createdAt').toArray());

export async function addColor(hex: string) {
	const exists = await db.colors.filter((c) => c.hex === hex).first();
	if (exists) return;
	await db.colors.add({ id: crypto.randomUUID(), hex, createdAt: Date.now() });
}

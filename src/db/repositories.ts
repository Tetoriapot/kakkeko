import { openDatabase } from './indexedDb';
import { migrateDocument } from '../domain/migrations';
import { duplicateDocument } from '../domain/factories';
import type { ProjectDocument } from '../domain/types';
export const projectRepository = {
  async list() {
    const db = await openDatabase();
    try {
      return (await db.getAllFromIndex('projects', 'by-updated')).reverse();
    } finally {
      db.close();
    }
  },
  async get(id: string) {
    const db = await openDatabase();
    try {
      const doc = await db.get('projects', id);
      return doc ? migrateDocument(doc) : undefined;
    } finally {
      db.close();
    }
  },
  async save(doc: ProjectDocument) {
    const db = await openDatabase();
    try {
      await db.put('projects', doc);
    } finally {
      db.close();
    }
  },
  async remove(id: string) {
    const db = await openDatabase();
    try {
      await db.delete('projects', id);
    } finally {
      db.close();
    }
  },
  async clear() {
    const db = await openDatabase();
    try {
      await db.clear('projects');
    } finally {
      db.close();
    }
  },
  async importAll(docs: ProjectDocument[]) {
    const copies = docs.map((d) =>
      duplicateDocument(migrateDocument(d), d.project.title),
    );
    const db = await openDatabase();
    try {
      const tx = db.transaction('projects', 'readwrite');
      await Promise.all(copies.map((d) => tx.store.add(d)));
      await tx.done;
      return copies;
    } finally {
      db.close();
    }
  },
};
export function parseImport(json: string): ProjectDocument[] {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    throw new Error(
      'JSONが破損しています。KAKKEKOから書き出したJSONファイルを選択してください。',
    );
  }
  const docs = Array.isArray(raw) ? raw : [raw];
  if (docs.length === 0) throw new Error('バックアップに作品がありません。');
  return docs.map((d, i) => {
    try {
      return migrateDocument(d);
    } catch (error) {
      throw new Error(
        `作品 ${i + 1}: ${error instanceof Error ? error.message : '読込エラー'}`,
      );
    }
  });
}
export async function fullBackup() {
  return JSON.stringify(await projectRepository.list(), null, 2);
}

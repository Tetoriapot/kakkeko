import { openDB } from 'idb';
import type { DBSchema } from 'idb';
import type { ProjectDocument } from '../domain/types';
interface KakkekoDatabase extends DBSchema {
  projects: {
    key: string;
    value: ProjectDocument;
    indexes: { 'by-updated': string };
  };
}
export const openDatabase = () =>
  openDB<KakkekoDatabase>('kakkeko', 1, {
    upgrade(db) {
      const store = db.createObjectStore('projects', { keyPath: 'project.id' });
      store.createIndex('by-updated', 'project.updatedAt');
    },
    blocking(_current, _blocked, event) {
      (event.target as IDBDatabase).close();
    },
  });

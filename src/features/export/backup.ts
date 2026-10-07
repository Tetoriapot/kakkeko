import type { ProjectDocument } from '../../domain/types';
import { projectRepository } from '../../db/repositories';
import { useProjectStore } from '../../stores/projectStore';
import { useBackupStore } from '../../stores/backupStore';
import { downloadText, safeFilename } from '../../utils/download';

export function downloadProjectBackup(document: ProjectDocument) {
  const current = useProjectStore.getState().document;
  const doc = current?.project.id === document.project.id ? current : document;
  downloadText(
    JSON.stringify(doc, null, 2),
    `${safeFilename(doc.project.title)}.json`,
  );
  useBackupStore.getState().record([doc.project]);
}

export async function downloadFullBackup() {
  const saved = await projectRepository.list();
  // Include the latest draft even if automatic saving is disabled or has failed.
  const current = useProjectStore.getState().document;
  const docs = saved.map((doc) =>
    current?.project.id === doc.project.id ? current : doc,
  );
  downloadText(JSON.stringify(docs, null, 2), 'kakkeko-backup.json');
  useBackupStore.getState().record(
    docs.map((doc) => doc.project),
    true,
  );
}

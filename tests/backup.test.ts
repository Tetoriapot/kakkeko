import { beforeEach, expect, it, vi } from 'vitest';
import { createDocument } from '../src/domain/factories';
import { useProjectStore } from '../src/stores/projectStore';
import { backupDue, useBackupStore } from '../src/stores/backupStore';
import {
  downloadFullBackup,
  downloadProjectBackup,
} from '../src/features/export/backup';
import { projectRepository } from '../src/db/repositories';
import { downloadText } from '../src/utils/download';
vi.mock('../src/utils/download', () => ({
  downloadText: vi.fn(),
  safeFilename: (s: string) => s,
}));
beforeEach(async () => {
  vi.mocked(downloadText).mockReset();
  useProjectStore.getState().clear();
  useBackupStore.setState({ projects: {}, lastFull: null, reminderDays: 0 });
  await projectRepository.clear();
});

it('records only successful JSON download requests and leaves other projects untouched', () => {
  const doc = createDocument({ title: 'backup' });
  vi.mocked(downloadText).mockImplementationOnce(() => {
    throw new Error('download failed');
  });
  expect(() => downloadProjectBackup(doc)).toThrow();
  expect(useBackupStore.getState().projects).toEqual({});
  downloadProjectBackup(doc);
  expect(useBackupStore.getState().projects[doc.project.id].updatedAt).toBe(
    doc.project.updatedAt,
  );
  expect(useBackupStore.getState().lastFull).toBeNull();
});
it('includes the latest unsaved draft in full backups but does not resurrect deleted projects', async () => {
  const doc = createDocument({ title: 'old' });
  await projectRepository.save(doc);
  useProjectStore.getState().load(doc);
  useProjectStore.getState().updateProject({ title: 'latest draft' });
  await downloadFullBackup();
  expect(
    JSON.parse(vi.mocked(downloadText).mock.calls[0][0])[0].project.title,
  ).toBe('latest draft');
  expect(useBackupStore.getState().lastFull?.count).toBe(1);
  await projectRepository.remove(doc.project.id);
  await downloadFullBackup();
  expect(JSON.parse(vi.mocked(downloadText).mock.calls[1][0])).toEqual([]);
});
it('reminds only when enabled and missing or changed beyond the selected interval', () => {
  const p = createDocument().project;
  const now = Date.parse('2026-10-05T00:00:00Z');
  const record = { exportedAt: '2026-09-01T00:00:00Z', updatedAt: p.updatedAt };
  expect(backupDue(p, undefined, 0, now)).toBe(false);
  expect(backupDue(p, undefined, 7, now)).toBe(true);
  expect(backupDue(p, record, 7, now)).toBe(false);
  expect(backupDue({ ...p, updatedAt: 'changed' }, record, 7, now)).toBe(true);
  expect(
    backupDue(
      { ...p, updatedAt: 'changed' },
      { ...record, exportedAt: '2026-10-04T00:00:00Z' },
      7,
      now,
    ),
  ).toBe(false);
});

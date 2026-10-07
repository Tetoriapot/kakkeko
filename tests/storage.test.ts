import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { sampleDocument } from '../src/domain/fixtures';
import { migrateDocument } from '../src/domain/migrations';
import {
  fullBackup,
  parseImport,
  projectRepository,
} from '../src/db/repositories';
import { createAutosaver, useSaveStore } from '../src/db/autosave';
import { useProjectStore } from '../src/stores/projectStore';
beforeEach(async () => {
  useProjectStore.getState().clear();
  await projectRepository.clear();
});
afterEach(() => vi.useRealTimers());
it('does not mark a newly loaded project dirty when an older save completes', async () => {
  useProjectStore.getState().load(sampleDocument);
  let complete!: () => void;
  const save = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        complete = resolve;
      }),
  );
  const controller = createAutosaver({ save });
  try {
    useProjectStore.getState().updateProject({ title: '保存中の作品' });
    const pending = controller.flush();
    await Promise.resolve();
    await Promise.resolve();
    useProjectStore.getState().load({
      ...sampleDocument,
      project: { ...sampleDocument.project, id: 'different' },
    });
    complete();
    await pending;
    expect(controller.isDirty()).toBe(false);
    expect(useSaveStore.getState().status).toBe('saved');
  } finally {
    controller.stop();
  }
});
it('validates every project before importing a backup atomically', async () => {
  const bad = { ...sampleDocument, schemaVersion: '8.0.0' };
  await expect(
    projectRepository.importAll([sampleDocument, bad as never]),
  ).rejects.toThrow('未対応');
  expect(await projectRepository.list()).toHaveLength(0);
});
it('roundtrips the supplied sample and a full backup without overwriting IDs', async () => {
  expect(migrateDocument(sampleDocument)).toEqual(sampleDocument);
  await projectRepository.save(sampleDocument);
  expect(await projectRepository.get('proj_sample')).toEqual(sampleDocument);
  const copies = await projectRepository.importAll(
    parseImport(await fullBackup()),
  );
  expect(copies[0].project.id).not.toBe('proj_sample');
  expect(await projectRepository.list()).toHaveLength(2);
});
it('rejects corruption, unknown versions, dangling references and duplicate IDs', () => {
  expect(() => parseImport('{')).toThrow('破損');
  expect(() =>
    migrateDocument({ ...sampleDocument, schemaVersion: '2.0.0' }),
  ).toThrow('未対応');
  expect(() => migrateDocument({ ...sampleDocument, characters: [] })).toThrow(
    '参照先',
  );
  expect(() =>
    migrateDocument({
      ...sampleDocument,
      characters: [...sampleDocument.characters, sampleDocument.characters[0]],
    }),
  ).toThrow('重複');
});
it('debounces typing, saves the latest revision, reports quota failure and retries', async () => {
  vi.useFakeTimers();
  useProjectStore.getState().load(sampleDocument);
  const save = vi.fn().mockResolvedValue(undefined);
  const controller = createAutosaver({ save });
  try {
    useProjectStore.getState().updateProject({ title: 'a' });
    await vi.advanceTimersByTimeAsync(800);
    useProjectStore.getState().updateProject({ title: 'ab' });
    await vi.advanceTimersByTimeAsync(1200);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.calls[0][0].project.title).toBe('ab');
    save.mockRejectedValueOnce(new DOMException('full', 'QuotaExceededError'));
    useProjectStore.getState().updateProject({ title: 'abc' });
    await expect(controller.flush()).rejects.toThrow();
    expect(useSaveStore.getState().error).toContain('容量');
    await controller.flush();
    expect(controller.isDirty()).toBe(false);
  } finally {
    controller.stop();
    useProjectStore.getState().clear();
  }
});

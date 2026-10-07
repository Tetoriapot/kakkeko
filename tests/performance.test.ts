import { expect, it } from 'vitest';
import { createBlock, createDocument } from '../src/domain/factories';
import { useProjectStore } from '../src/stores/projectStore';
import { episodeStore } from '../src/stores/episodeStore';
import { selectBlock } from '../src/stores/selectors';
it('1000-block edits retain 999 references and a bounded undo history', () => {
  const doc = createDocument();
  doc.episodes[0].blocks = Array.from({ length: 1000 }, () =>
    createBlock('dialogue'),
  );
  useProjectStore.getState().load(doc);
  const before = useProjectStore.getState().document!.episodes[0].blocks;
  for (let i = 0; i < 120; i++)
    episodeStore.updateBlock(doc.episodes[0].id, before[i].id, {
      text: '変更',
    });
  const after = useProjectStore.getState().document!;
  expect(after.episodes[0].blocks[999]).toBe(before[999]);
  expect(useProjectStore.getState().past.length).toBeLessThanOrEqual(100);
  expect(selectBlock(after, doc.episodes[0].id, before[999].id)).toBe(
    before[999],
  );
});

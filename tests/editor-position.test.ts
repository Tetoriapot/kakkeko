import { beforeEach, expect, it, vi } from 'vitest';
import {
  createBlock,
  createDocument,
  createEpisode,
} from '../src/domain/factories';
import {
  positionKey,
  readEditorPosition,
  writeEditorPosition,
} from '../src/features/editor/editorPosition';
beforeEach(() => localStorage.clear());
it('keeps positions isolated by project and falls back safely for deleted blocks or episodes', () => {
  const doc = createDocument();
  const episode = createEpisode({ blocks: [createBlock('narration')] });
  doc.episodes.push(episode);
  const position = {
    episodeId: episode.id,
    blockId: episode.blocks[0].id,
    scrollTop: 250,
    blockOffset: -40,
  };
  writeEditorPosition(doc.project.id, position);
  expect(readEditorPosition(doc)).toEqual(position);
  expect(readEditorPosition(createDocument())).toBeNull();
  episode.blocks = [];
  expect(readEditorPosition(doc)).toMatchObject({
    episodeId: episode.id,
    blockId: null,
    scrollTop: 0,
  });
  doc.episodes.pop();
  expect(readEditorPosition(doc)).toBeNull();
});
it('ignores corrupt records and unavailable preference storage', () => {
  const doc = createDocument();
  for (const raw of [
    '{bad',
    'null',
    '{"episodeId":3}',
    JSON.stringify({
      episodeId: doc.episodes[0].id,
      blockId: null,
      scrollTop: -1,
      blockOffset: 0,
    }),
  ]) {
    localStorage.setItem(positionKey(doc.project.id), raw);
    expect(readEditorPosition(doc)).toBeNull();
  }
  const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('full', 'QuotaExceededError');
  });
  try {
    expect(() =>
      writeEditorPosition(doc.project.id, {
        episodeId: doc.episodes[0].id,
        blockId: null,
        scrollTop: 0,
        blockOffset: 0,
      }),
    ).not.toThrow();
  } finally {
    spy.mockRestore();
  }
});

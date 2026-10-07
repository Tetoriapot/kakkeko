import { expect, it } from 'vitest';
import {
  createBlock,
  createCharacter,
  createDocument,
  createEpisode,
} from '../src/domain/factories';
import { searchProject } from '../src/features/search/searchProject';

it('searches ordered episodes, names, notes and private content without mutating the document', () => {
  const doc = createDocument();
  const speaker = createCharacter({ name: '案内人' });
  doc.characters = [speaker];
  doc.episodes = [
    createEpisode({
      title: '終章',
      order: 2,
      blocks: [createBlock('memo', { text: '秘密の星舟', hidden: true })],
    }),
    createEpisode({
      title: '星舟の出発',
      order: 1,
      blocks: [
        createBlock('dialogue', {
          characterId: speaker.id,
          text: '星舟に乗る',
          note: '後で確認',
        }),
        createBlock('image', { alt: '赤い船', caption: '港の風景' }),
      ],
    }),
  ];
  const original = structuredClone(doc);
  const results = searchProject(doc, '星舟');
  expect(results).toHaveLength(3);
  expect(results[0].episodeTitle).toBe('星舟の出発');
  expect(results[2]).toMatchObject({ privateMemo: true, hidden: true });
  expect(searchProject(doc, '案内人')).toHaveLength(1);
  expect(searchProject(doc, '後で確認')).toHaveLength(1);
  expect(searchProject(doc, '港の風景')).toHaveLength(1);
  expect(searchProject(doc, '   ')).toEqual([]);
  expect(doc).toEqual(original);
});
it('matches literal text with case and width normalization and returns bounded context', () => {
  const doc = createDocument();
  doc.episodes[0].blocks = [
    createBlock('narration', {
      text: '前'.repeat(5000) + 'ＡＢＣ [.*] 答え' + '後'.repeat(5000),
    }),
  ];
  expect(searchProject(doc, ' abc ')[0].excerpt).toContain('ＡＢＣ');
  expect(searchProject(doc, '[.*]')).toHaveLength(1);
  expect(searchProject(doc, '答え')[0].excerpt.length).toBeLessThan(170);
  expect(searchProject(doc, '不存在')).toEqual([]);
});

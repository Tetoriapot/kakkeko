import { beforeEach, expect, it } from 'vitest';
import { sampleDocument } from '../src/domain/fixtures';
import { useProjectStore } from '../src/stores/projectStore';
import {
  adjacentEpisodes,
  episodeActions,
} from '../src/features/episodes/operations';
const store = useProjectStore.getState;
beforeEach(() => store().load(sampleDocument));
it('creates, duplicates, reorders and deletes episodes with correct navigation', () => {
  const id = episodeActions.add();
  episodeActions.duplicate('ep_01');
  let episodes = store().document!.episodes;
  expect(new Set(episodes.map((e) => e.slug)).size).toBe(3);
  expect(episodes[2].blocks[0].id).not.toBe(episodes[0].blocks[0].id);
  episodeActions.reorder(1, 0);
  episodes = store().document!.episodes;
  expect(adjacentEpisodes(episodes, id).previous).toBeUndefined();
  expect(adjacentEpisodes(episodes, id).next?.id).toBe('ep_01');
  episodeActions.remove(id);
  expect(store().document!.episodes).toHaveLength(2);
  store().undo();
  expect(store().document!.episodes).toHaveLength(3);
});
it('rejects duplicate or path-like slugs', () => {
  const id = episodeActions.add();
  expect(() => episodeActions.update(id, { slug: '01' })).toThrow('slug');
  expect(() => episodeActions.update(id, { slug: '../file' })).toThrow('slug');
  episodeActions.update(id, { slug: '次の話', status: 'ready' });
  expect(store().document!.episodes[1]).toMatchObject({
    slug: '次の話',
    status: 'ready',
  });
});

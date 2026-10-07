import type { Episode } from '../../domain/types';
import { createEpisode, createId } from '../../domain/factories';
import { useProjectStore } from '../../stores/projectStore';
import { useEditorStore } from '../../stores/editorStore';
import { changeEpisode } from '../../stores/episodeStore';
import { moveItem } from '../../utils/array';
export const orderedEpisodes = (episodes: Episode[]) =>
  [...episodes].sort((a, b) => a.order - b.order);
export function adjacentEpisodes(episodes: Episode[], id: string) {
  const sorted = orderedEpisodes(episodes);
  const index = sorted.findIndex((e) => e.id === id);
  return {
    previous: sorted[index - 1],
    next: index < 0 ? undefined : sorted[index + 1],
    index,
    total: sorted.length,
  };
}
export function uniqueSlug(episodes: Episode[], base: string) {
  let slug = base;
  let number = 2;
  while (episodes.some((e) => e.slug === slug)) slug = `${base}-${number++}`;
  return slug;
}
export const episodeActions = {
  add() {
    const episodes = useProjectStore.getState().document?.episodes ?? [];
    const episode = createEpisode({
      title: `第${episodes.length + 1}話`,
      slug: uniqueSlug(episodes, String(episodes.length + 1).padStart(2, '0')),
      order: episodes.length + 1,
    });
    useProjectStore
      .getState()
      .commit((d) => ({ ...d, episodes: [...d.episodes, episode] }));
    useEditorStore.getState().selectEpisode(episode.id);
    return episode.id;
  },
  update(
    id: string,
    patch: Partial<Pick<Episode, 'title' | 'slug' | 'status'>>,
  ) {
    const episodes = useProjectStore.getState().document?.episodes ?? [];
    if (
      patch.slug !== undefined &&
      (!/^[\p{L}\p{N}_-]+$/u.test(patch.slug) ||
        episodes.some((e) => e.id !== id && e.slug === patch.slug))
    )
      throw new Error(
        'slugは重複しない文字・数字・ハイフン・アンダースコアで指定してください。',
      );
    changeEpisode(id, (e) => ({ ...e, ...patch }));
  },
  remove(id: string) {
    useProjectStore.getState().commit((d) => ({
      ...d,
      episodes: d.episodes
        .filter((e) => e.id !== id)
        .map((e, i) => ({ ...e, order: i + 1 })),
    }));
    if (useEditorStore.getState().episodeId === id)
      useEditorStore
        .getState()
        .selectEpisode(
          useProjectStore.getState().document?.episodes[0]?.id ?? '',
        );
  },
  reorder(from: number, to: number) {
    useProjectStore.getState().commit((d) => ({
      ...d,
      episodes: moveItem(orderedEpisodes(d.episodes), from, to).map((e, i) => ({
        ...e,
        order: i + 1,
      })),
    }));
  },
  duplicate(id: string) {
    const doc = useProjectStore.getState().document;
    const original = doc?.episodes.find((e) => e.id === id);
    if (!doc || !original) return;
    const copy = structuredClone(original);
    copy.id = createId();
    copy.title += ' のコピー';
    copy.slug = uniqueSlug(doc.episodes, `${copy.slug}-copy`);
    copy.order = doc.episodes.length + 1;
    copy.createdAt = copy.updatedAt = new Date().toISOString();
    const ids = new Map(copy.blocks.map((b) => [b.id, createId()]));
    copy.blocks = copy.blocks.map((b) => ({
      ...b,
      id: ids.get(b.id)!,
      createdAt: copy.createdAt,
      updatedAt: copy.updatedAt,
    }));
    copy.blocks.forEach((b) => {
      if (b.type === 'dialogue' && b.replyToBlockId)
        b.replyToBlockId = ids.get(b.replyToBlockId) ?? b.replyToBlockId;
    });
    useProjectStore
      .getState()
      .commit((d) => ({ ...d, episodes: [...d.episodes, copy] }));
    useEditorStore.getState().selectEpisode(copy.id);
  },
};

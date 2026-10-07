import type { Block, ProjectDocument } from '../domain/types';
const blockIndexes = new WeakMap<Block[], Map<string, Block>>();
export function selectBlock(
  doc: ProjectDocument | null,
  episodeId: string,
  id: string,
) {
  const blocks = doc?.episodes.find((e) => e.id === episodeId)?.blocks;
  if (!blocks) return undefined;
  let index = blockIndexes.get(blocks);
  if (!index) {
    index = new Map(blocks.map((b) => [b.id, b]));
    blockIndexes.set(blocks, index);
  }
  return index.get(id);
}
export function selectCharacterUsage(doc: ProjectDocument | null) {
  const counts: Record<string, number> = {};
  for (const ep of doc?.episodes ?? [])
    for (const b of ep.blocks)
      if (b.type === 'dialogue')
        counts[b.characterId] = (counts[b.characterId] ?? 0) + 1;
  return counts;
}

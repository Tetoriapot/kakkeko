import { BLOCK_LABELS } from '../../domain/types';
import type { ProjectDocument } from '../../domain/types';

export type SearchResult = {
  episodeId: string;
  episodeTitle: string;
  blockId: string | null;
  label: string;
  excerpt: string;
  hidden: boolean;
  privateMemo: boolean;
};
const normalize = (text: string) =>
  text.normalize('NFKC').toLocaleLowerCase('ja-JP');
function excerpt(text: string, query: string) {
  const start = Math.max(0, normalize(text).indexOf(query) - 35);
  return `${start ? '…' : ''}${text.slice(start, start + 160)}${text.length > start + 160 ? '…' : ''}`;
}
export function searchProject(
  doc: ProjectDocument,
  query: string,
): SearchResult[] {
  const needle = normalize(query.trim());
  if (!needle) return [];
  const results: SearchResult[] = [];
  const names = new Map(doc.characters.map((c) => [c.id, c.name]));
  for (const episode of [...doc.episodes].sort((a, b) => a.order - b.order)) {
    if (normalize(episode.title).includes(needle))
      results.push({
        episodeId: episode.id,
        episodeTitle: episode.title,
        blockId: null,
        label: 'エピソードタイトル',
        excerpt: excerpt(episode.title, needle),
        hidden: false,
        privateMemo: false,
      });
    episode.blocks.forEach((block, index) => {
      const speaker =
        block.type === 'dialogue'
          ? block.overrideName || names.get(block.characterId) || '話者未設定'
          : '';
      const fields = [
        'text' in block ? block.text : '',
        ...(block.type === 'image' ? [block.alt, block.caption ?? ''] : []),
        speaker,
        block.note ?? '',
      ];
      const matched = fields.find((text) => normalize(text).includes(needle));
      if (matched === undefined) return;
      results.push({
        episodeId: episode.id,
        episodeTitle: episode.title,
        blockId: block.id,
        label: `${index + 1}. ${BLOCK_LABELS[block.type]}${speaker ? ` · ${speaker}` : ''}`,
        excerpt: excerpt(matched, needle),
        hidden: !!block.hidden,
        privateMemo: block.type === 'memo',
      });
    });
  }
  return results;
}

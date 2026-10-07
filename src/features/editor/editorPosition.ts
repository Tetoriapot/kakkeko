import type { ProjectDocument } from '../../domain/types';
import { localPreferences } from '../../utils/localPreferences';

export type EditorPosition = {
  episodeId: string;
  blockId: string | null;
  scrollTop: number;
  blockOffset: number;
};
export const positionKey = (projectId: string) =>
  `kakkeko-position:${projectId}`;
export const isMobileEditor = () => matchMedia('(max-width: 799px)').matches;
export function readEditorPosition(
  doc: ProjectDocument,
): EditorPosition | null {
  try {
    const value = JSON.parse(
      localPreferences.getItem(positionKey(doc.project.id)) ?? 'null',
    ) as Partial<EditorPosition> | null;
    if (
      !value ||
      typeof value.episodeId !== 'string' ||
      !(value.blockId === null || typeof value.blockId === 'string') ||
      typeof value.scrollTop !== 'number' ||
      !Number.isFinite(value.scrollTop) ||
      value.scrollTop < 0 ||
      typeof value.blockOffset !== 'number' ||
      !Number.isFinite(value.blockOffset)
    )
      return null;
    const episode = doc.episodes.find((e) => e.id === value.episodeId);
    if (!episode) return null;
    if (value.blockId && !episode.blocks.some((b) => b.id === value.blockId))
      return {
        episodeId: episode.id,
        blockId: null,
        scrollTop: 0,
        blockOffset: 0,
      };
    return value as EditorPosition;
  } catch {
    return null;
  }
}
export function writeEditorPosition(
  projectId: string,
  position: EditorPosition,
) {
  localPreferences.setItem(positionKey(projectId), JSON.stringify(position));
}

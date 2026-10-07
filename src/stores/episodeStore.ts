import { createBlock, createId } from '../domain/factories';
import type { Block, BlockType, Episode } from '../domain/types';
import { moveItem } from '../utils/array';
import { useEditorStore } from './editorStore';
import { useProjectStore } from './projectStore';

export function changeEpisode(
  id: string,
  update: (episode: Episode) => Episode,
  group?: string,
) {
  useProjectStore.getState().commit((d) => {
    const index = d.episodes.findIndex((e) => e.id === id);
    if (index < 0) return d;
    const next = update(d.episodes[index]);
    if (next === d.episodes[index]) return d;
    const episodes = [...d.episodes];
    episodes[index] = { ...next, updatedAt: new Date().toISOString() };
    return { ...d, episodes };
  }, group);
}
export const episodeStore = {
  addBlock(
    episodeId: string,
    type: BlockType,
    characterId?: string,
    afterId?: string,
  ) {
    const last = useEditorStore.getState().lastCharacterId;
    const doc = useProjectStore.getState().document;
    const candidate =
      characterId ??
      (!last || doc?.characters.some((c) => c.id === last && !c.isArchived)
        ? last
        : (doc?.characters.find((c) => !c.isArchived)?.id ?? ''));
    const speaker = doc?.characters.some((c) => c.id === candidate)
      ? candidate
      : '';
    const block =
      type === 'dialogue'
        ? createBlock('dialogue', { characterId: speaker })
        : createBlock(type);
    changeEpisode(episodeId, (ep) => {
      const blocks = [...ep.blocks];
      const after = afterId ? blocks.findIndex((b) => b.id === afterId) : -1;
      blocks.splice(after < 0 ? blocks.length : after + 1, 0, block);
      return { ...ep, blocks };
    });
    if (type === 'dialogue') useEditorStore.getState().selectCharacter(speaker);
    useEditorStore.getState().focusBlock(block.id);
    return block.id;
  },
  updateBlock(episodeId: string, id: string, patch: Partial<Block>) {
    changeEpisode(
      episodeId,
      (ep) => ({
        ...ep,
        blocks: ep.blocks.map((b) =>
          b.id === id
            ? ({
                ...b,
                ...patch,
                id: b.id,
                type: b.type,
                updatedAt: new Date().toISOString(),
              } as Block)
            : b,
        ),
      }),
      `block:${id}`,
    );
    if ('characterId' in patch && patch.characterId !== undefined)
      useEditorStore.getState().selectCharacter(patch.characterId);
  },
  deleteBlock(episodeId: string, id: string) {
    changeEpisode(episodeId, (ep) => ({
      ...ep,
      blocks: ep.blocks.filter((b) => b.id !== id),
    }));
  },
  duplicateBlock(episodeId: string, id: string) {
    let newId = '';
    changeEpisode(episodeId, (ep) => {
      const index = ep.blocks.findIndex((b) => b.id === id);
      if (index < 0) return ep;
      newId = createId();
      const blocks = [...ep.blocks];
      const time = new Date().toISOString();
      blocks.splice(index + 1, 0, {
        ...ep.blocks[index],
        id: newId,
        createdAt: time,
        updatedAt: time,
      });
      return { ...ep, blocks };
    });
    if (newId) useEditorStore.getState().focusBlock(newId);
  },
  moveBlock(episodeId: string, from: number, to: number) {
    changeEpisode(episodeId, (ep) => {
      const blocks = moveItem(ep.blocks, from, to);
      return blocks === ep.blocks ? ep : { ...ep, blocks };
    });
  },
};

import { createCharacter, createId } from '../domain/factories';
import type { Character } from '../domain/types';
import { moveItem } from '../utils/array';
import { useProjectStore } from './projectStore';
export const characterStore = {
  add(values: Partial<Character> = {}) {
    const character = createCharacter({
      ...values,
      order:
        values.order ??
        (useProjectStore.getState().document?.characters.length ?? 0) + 1,
    });
    useProjectStore
      .getState()
      .commit((d) => ({ ...d, characters: [...d.characters, character] }));
    return character.id;
  },
  update(id: string, patch: Partial<Character>) {
    useProjectStore.getState().commit((d) => ({
      ...d,
      characters: d.characters.map((c) =>
        c.id === id ? { ...c, ...patch, id: c.id } : c,
      ),
    }));
  },
  usage(id: string) {
    return (
      useProjectStore
        .getState()
        .document?.episodes.flatMap((e) => e.blocks)
        .filter((b) => b.type === 'dialogue' && b.characterId === id).length ??
      0
    );
  },
  remove(id: string) {
    if (this.usage(id) > 0)
      throw new Error(
        '発言のあるキャラクターは削除できません。アーカイブしてください。',
      );
    useProjectStore.getState().commit((d) => ({
      ...d,
      characters: d.characters.filter((c) => c.id !== id),
    }));
  },
  duplicate(id: string) {
    const c = useProjectStore
      .getState()
      .document?.characters.find((c) => c.id === id);
    if (c)
      return this.add({
        ...c,
        id: createId(),
        name: `${c.name} のコピー`,
        isArchived: false,
      });
  },
  reorder(from: number, to: number) {
    useProjectStore.getState().commit((d) => ({
      ...d,
      characters: moveItem(d.characters, from, to).map((c, i) => ({
        ...c,
        order: i + 1,
      })),
    }));
  },
};

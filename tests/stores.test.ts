import { beforeEach, expect, it } from 'vitest';
import { sampleDocument } from '../src/domain/fixtures';
import { useProjectStore } from '../src/stores/projectStore';
import { episodeStore } from '../src/stores/episodeStore';
import { characterStore } from '../src/stores/characterStore';
import { useEditorStore } from '../src/stores/editorStore';
const store = useProjectStore.getState;
beforeEach(() => store().load(sampleDocument));
it('remembers anonymous speakers and never creates a dangling speaker reference', () => {
  useEditorStore.getState().selectCharacter('');
  const id = episodeStore.addBlock('ep_01', 'dialogue');
  expect(
    store().document!.episodes[0].blocks.find((b) => b.id === id),
  ).toMatchObject({ characterId: '' });
  const stale = episodeStore.addBlock('ep_01', 'dialogue', 'deleted-speaker');
  expect(
    store().document!.episodes[0].blocks.find((b) => b.id === stale),
  ).toMatchObject({ characterId: '' });
});
it('undoes add/edit/delete/reorder and redoes; new changes invalidate redo', () => {
  const id = episodeStore.addBlock('ep_01', 'dialogue', 'char_boon');
  episodeStore.updateBlock('ep_01', id, { text: '新しい発言' });
  episodeStore.moveBlock('ep_01', 3, 0);
  expect(store().document!.episodes[0].blocks[0].id).toBe(id);
  store().undo();
  expect(store().document!.episodes[0].blocks[3].id).toBe(id);
  store().undo();
  expect(store().document!.episodes[0].blocks[3]).toMatchObject({ text: '' });
  store().redo();
  expect(store().document!.episodes[0].blocks[3]).toMatchObject({
    text: '新しい発言',
  });
  episodeStore.deleteBlock('ep_01', id);
  store().undo();
  expect(store().document!.episodes[0].blocks).toHaveLength(4);
  episodeStore.addBlock('ep_01', 'memo');
  expect(store().future).toHaveLength(0);
});
it('protects referenced characters and preserves undo for character changes', () => {
  expect(() => characterStore.remove('char_boon')).toThrow('アーカイブ');
  characterStore.update('char_boon', { name: '変更' });
  store().undo();
  expect(store().document!.characters[0].name).toBe('ブーン');
  const id = characterStore.add({ name: '未使用' });
  characterStore.remove(id);
  expect(store().document!.characters).toHaveLength(2);
});
it('preserves unrelated block references while editing and groups typing into one undo', () => {
  const before = store().document!.episodes[0].blocks[1];
  episodeStore.updateBlock('ep_01', 'b1', { text: 'a' });
  episodeStore.updateBlock('ep_01', 'b1', { text: 'abc' });
  expect(store().past).toHaveLength(1);
  expect(store().document!.episodes[0].blocks[1]).toBe(before);
  store().undo();
  expect(store().document!.episodes[0].blocks[0]).toMatchObject({
    text:
      sampleDocument.episodes[0].blocks[0].type === 'dialogue' &&
      sampleDocument.episodes[0].blocks[0].text,
  });
});

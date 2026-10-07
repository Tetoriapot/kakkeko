import { beforeEach, expect, it } from 'vitest';
import { handleEditorShortcut } from '../src/features/editor/shortcuts';
import { useProjectStore } from '../src/stores/projectStore';
import { useEditorStore } from '../src/stores/editorStore';
import { sampleDocument } from '../src/domain/fixtures';
beforeEach(() => {
  useProjectStore.getState().load(sampleDocument);
  useEditorStore.setState({ episodeId: 'ep_01', selectedBlockId: 'b1' });
});
it('does not add dialogue during IME composition or repeat', () => {
  for (const options of [{ isComposing: true }, { repeat: true }])
    handleEditorShortcut(
      new KeyboardEvent('keydown', {
        key: '1',
        code: 'Digit1',
        altKey: true,
        ...options,
      }),
    );
  handleEditorShortcut(
    new KeyboardEvent('keydown', { key: '1', code: 'Digit1', altKey: true }),
    true,
  );
  expect(useProjectStore.getState().document!.episodes[0].blocks).toHaveLength(
    3,
  );
});
it('adds the numbered speaker after the selected block and remembers them', () => {
  handleEditorShortcut(
    new KeyboardEvent('keydown', { key: '2', code: 'Digit2', altKey: true }),
  );
  const block = useProjectStore.getState().document!.episodes[0].blocks[1];
  expect(block).toMatchObject({ type: 'dialogue', characterId: 'char_gm' });
  expect(useEditorStore.getState().lastCharacterId).toBe('char_gm');
  expect(useEditorStore.getState().focusBlockId).toBe(block.id);
});

import { useEffect } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { useEditorStore } from '../../stores/editorStore';
import { episodeStore } from '../../stores/episodeStore';
import { autosaver } from '../../db/autosave';
export function handleEditorShortcut(event: KeyboardEvent, composing = false) {
  if (
    composing ||
    event.isComposing ||
    event.keyCode === 229 ||
    event.repeat ||
    document.querySelector('dialog[open]')
  )
    return;
  const editor = useEditorStore.getState();
  const doc = useProjectStore.getState().document;
  const episode = doc?.episodes.find((e) => e.id === editor.episodeId);
  if (!episode) return;
  const command = event.ctrlKey || event.metaKey;
  const key = event.key.toLowerCase();
  if (command && !event.altKey && key === 's') {
    event.preventDefault();
    void autosaver.flush().catch(() => {});
    return;
  }
  if (command && !event.altKey && key === 'z') {
    event.preventDefault();
    if (event.shiftKey) useProjectStore.getState().redo();
    else useProjectStore.getState().undo();
    return;
  }
  if (command && event.shiftKey && key === 'n') {
    event.preventDefault();
    episodeStore.addBlock(
      episode.id,
      'narration',
      undefined,
      editor.selectedBlockId ?? undefined,
    );
    return;
  }
  if (
    event.altKey &&
    !command &&
    /^[1-9]$/.test(event.code.replace('Digit', ''))
  ) {
    const c = [...doc!.characters]
      .filter((c) => !c.isArchived)
      .sort((a, b) => a.order - b.order)[
      Number(event.code.replace('Digit', '')) - 1
    ];
    if (c) {
      event.preventDefault();
      episodeStore.addBlock(
        episode.id,
        'dialogue',
        c.id,
        editor.selectedBlockId ?? undefined,
      );
    }
    return;
  }
  if (command && key === 'enter') {
    const target = event.target instanceof HTMLElement ? event.target : null;
    const blockId = target
      ?.closest('[data-block-id]')
      ?.getAttribute('data-block-id');
    const current = episode.blocks.find((b) => b.id === blockId);
    if (
      current?.type === 'dialogue' &&
      target?.matches('textarea[data-block-input]')
    ) {
      event.preventDefault();
      episodeStore.addBlock(
        episode.id,
        'dialogue',
        current.characterId,
        current.id,
      );
    }
  }
}
export function useEditorShortcuts() {
  useEffect(() => {
    let composing = false;
    const start = () => {
      composing = true;
    };
    const end = () => {
      composing = false;
    };
    const key = (e: KeyboardEvent) => handleEditorShortcut(e, composing);
    document.addEventListener('compositionstart', start);
    document.addEventListener('compositionend', end);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('compositionstart', start);
      document.removeEventListener('compositionend', end);
      document.removeEventListener('keydown', key);
    };
  }, []);
}

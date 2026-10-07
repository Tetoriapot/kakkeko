import { useEffect, useSyncExternalStore } from 'react';
import { useEditorStore } from '../../stores/editorStore';
import { useProjectStore } from '../../stores/projectStore';
import {
  isMobileEditor,
  readEditorPosition,
  writeEditorPosition,
} from './editorPosition';
import type { EditorPosition } from './editorPosition';

function subscribeMobile(change: () => void) {
  const media = matchMedia('(max-width: 799px)');
  media.addEventListener('change', change);
  return () => media.removeEventListener('change', change);
}
export function useEditorPosition(
  projectId: string | undefined,
  ready: boolean,
) {
  const mobile = useSyncExternalStore(subscribeMobile, isMobileEditor);
  useEffect(() => {
    if (!projectId || !ready || !mobile) return;
    const doc = useProjectStore.getState().document;
    const layout = document.querySelector<HTMLElement>('.editor-layout');
    if (!doc || doc.project.id !== projectId || !layout) return;
    let position: EditorPosition | null = readEditorPosition(doc);
    let restoring = true;
    let restoreFrame = 0;
    let captureFrame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const blockElement = (id: string | null) =>
      id
        ? layout.querySelector<HTMLElement>(
            `[data-block-id="${CSS.escape(id)}"]`,
          )
        : null;
    function persist() {
      clearTimeout(timer);
      if (position) writeEditorPosition(projectId!, position);
    }
    function capture(state = useEditorStore.getState()) {
      if (
        restoring ||
        state.mobileTab !== 'edit' ||
        !layout?.isConnected ||
        !state.episodeId
      )
        return;
      const currentDoc = useProjectStore.getState().document;
      if (!currentDoc || currentDoc.project.id !== projectId) return;
      const episode = currentDoc.episodes.find((e) => e.id === state.episodeId);
      if (!episode) return;
      const block = blockElement(state.selectedBlockId);
      position = {
        episodeId: episode.id,
        blockId: block ? state.selectedBlockId : null,
        scrollTop: layout.scrollTop,
        blockOffset: block
          ? block.getBoundingClientRect().top -
            layout.getBoundingClientRect().top
          : 0,
      };
      clearTimeout(timer);
      timer = setTimeout(persist, 150);
    }
    function restore() {
      restoring = true;
      cancelAnimationFrame(restoreFrame);
      restoreFrame = requestAnimationFrame(() => {
        restoreFrame = requestAnimationFrame(() => {
          const state = useEditorStore.getState();
          if (
            position &&
            position.episodeId === state.episodeId &&
            state.mobileTab === 'edit'
          ) {
            const block = blockElement(position.blockId);
            if (block)
              layout!.scrollTop +=
                block.getBoundingClientRect().top -
                layout!.getBoundingClientRect().top -
                position.blockOffset;
            else layout!.scrollTop = position.scrollTop;
            useEditorStore.setState({
              selectedBlockId: block ? position.blockId : null,
            });
          }
          restoring = false;
          capture();
        });
      });
    }
    const scroll = () => capture();
    const focus = () => {
      cancelAnimationFrame(captureFrame);
      captureFrame = requestAnimationFrame(() => capture());
    };
    const flush = () => {
      capture();
      persist();
    };
    const visibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    const unsubscribe = useEditorStore.subscribe((state, previous) => {
      if (restoring) return;
      if (previous.mobileTab === 'edit' && state.mobileTab !== 'edit') {
        capture(previous);
        persist();
      }
      if (state.episodeId !== previous.episodeId) {
        position = null;
        focus();
      } else if (state.mobileTab === 'edit' && previous.mobileTab !== 'edit')
        restore();
      else if (state.selectedBlockId !== previous.selectedBlockId) focus();
    });
    layout.addEventListener('scroll', scroll, { passive: true });
    layout.addEventListener('focusin', focus);
    layout.addEventListener('input', scroll);
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', visibility);
    restore();
    return () => {
      cancelAnimationFrame(restoreFrame);
      cancelAnimationFrame(captureFrame);
      persist();
      unsubscribe();
      layout.removeEventListener('scroll', scroll);
      layout.removeEventListener('focusin', focus);
      layout.removeEventListener('input', scroll);
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [projectId, ready, mobile]);
}

import { create } from 'zustand';
import { useProjectStore } from './projectStore';
export function lastCharacterForProject(projectId: string) {
  try {
    return localStorage.getItem(`kakkeko-speaker:${projectId}`) ?? '';
  } catch {
    return '';
  }
}
type EditorState = {
  episodeId: string | null;
  selectedBlockId: string | null;
  lastCharacterId: string;
  previewOpen: boolean;
  mobileTab: 'edit' | 'preview' | 'settings';
  focusBlockId: string | null;
  selectEpisode: (id: string) => void;
  selectCharacter: (id: string) => void;
  focusBlock: (id: string | null) => void;
};
export const useEditorStore = create<EditorState>((set) => ({
  episodeId: null,
  selectedBlockId: null,
  lastCharacterId: '',
  previewOpen: false,
  mobileTab: 'edit',
  focusBlockId: null,
  selectEpisode: (id) => set({ episodeId: id, selectedBlockId: null }),
  selectCharacter: (id) => {
    set({ lastCharacterId: id });
    const projectId = useProjectStore.getState().document?.project.id;
    if (projectId)
      try {
        localStorage.setItem(`kakkeko-speaker:${projectId}`, id);
      } catch {
        /* Selection still works when browser preference storage is unavailable. */
      }
  },
  focusBlock: (id) =>
    set((s) => ({
      focusBlockId: id,
      selectedBlockId: id ?? s.selectedBlockId,
    })),
}));

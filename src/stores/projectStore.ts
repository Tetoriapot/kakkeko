import { create } from 'zustand';
import type { Project, ProjectDocument } from '../domain/types';

type HistoryEntry = ProjectDocument;
type ProjectState = {
  document: ProjectDocument | null;
  revision: number;
  past: HistoryEntry[];
  future: HistoryEntry[];
  lastEdit: { key: string; time: number } | null;
  load: (doc: ProjectDocument) => void;
  clear: () => void;
  commit: (
    update: (doc: ProjectDocument) => ProjectDocument,
    group?: string,
  ) => void;
  updateProject: (patch: Partial<Project>) => void;
  undo: () => void;
  redo: () => void;
};
export const useProjectStore = create<ProjectState>((set, get) => ({
  document: null,
  revision: 0,
  past: [],
  future: [],
  lastEdit: null,
  load: (doc) => {
    const loaded = structuredClone(doc);
    loaded.characters.sort((a, b) => a.order - b.order);
    loaded.episodes.sort((a, b) => a.order - b.order);
    set({
      document: loaded,
      revision: 0,
      past: [],
      future: [],
      lastEdit: null,
    });
  },
  clear: () =>
    set({ document: null, revision: 0, past: [], future: [], lastEdit: null }),
  commit: (update, group) =>
    set((state) => {
      if (!state.document) return state;
      const next = update(state.document);
      if (next === state.document) return state;
      const time = Date.now();
      const coalesce =
        group &&
        state.lastEdit?.key === group &&
        time - state.lastEdit.time < 700;
      return {
        document: {
          ...next,
          project: { ...next.project, updatedAt: new Date().toISOString() },
        },
        revision: state.revision + 1,
        past: coalesce
          ? state.past
          : [...state.past.slice(-99), state.document],
        future: [],
        lastEdit: group ? { key: group, time } : null,
      };
    }),
  updateProject: (patch) =>
    get().commit(
      (d) => ({ ...d, project: { ...d.project, ...patch, id: d.project.id } }),
      'project',
    ),
  undo: () =>
    set((s) => {
      const previous = s.past.at(-1);
      return previous && s.document
        ? {
            document: {
              ...previous,
              project: {
                ...previous.project,
                updatedAt: new Date().toISOString(),
              },
            },
            past: s.past.slice(0, -1),
            future: [...s.future, s.document],
            revision: s.revision + 1,
            lastEdit: null,
          }
        : s;
    }),
  redo: () =>
    set((s) => {
      const next = s.future.at(-1);
      return next && s.document
        ? {
            document: {
              ...next,
              project: { ...next.project, updatedAt: new Date().toISOString() },
            },
            past: [...s.past, s.document],
            future: s.future.slice(0, -1),
            revision: s.revision + 1,
            lastEdit: null,
          }
        : s;
    }),
}));

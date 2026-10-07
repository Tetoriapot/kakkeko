import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { localPreferences } from '../utils/localPreferences';

export const useGuideStore = create<{
  projects: Record<string, { visible: boolean; previewed: boolean }>;
  start: (id: string) => void;
  dismiss: (id: string) => void;
  preview: (id: string) => void;
}>()(
  persist(
    (set) => ({
      projects: {},
      start: (id) =>
        set((s) => ({
          projects: {
            ...s.projects,
            [id]: { visible: true, previewed: false },
          },
        })),
      dismiss: (id) =>
        set((s) => ({
          projects: {
            ...s.projects,
            [id]: { ...s.projects[id], visible: false },
          },
        })),
      preview: (id) =>
        set((s) => ({
          projects: {
            ...s.projects,
            [id]: { ...s.projects[id], previewed: true },
          },
        })),
    }),
    {
      name: 'kakkeko-guide',
      storage: createJSONStorage(() => localPreferences),
    },
  ),
);

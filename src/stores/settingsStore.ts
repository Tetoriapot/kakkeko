import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppPreferences, Settings } from '../domain/types';
import { useProjectStore } from './projectStore';
export const settingsStore = {
  updateEditor(patch: Partial<Settings['editor']>) {
    useProjectStore.getState().commit((d) => ({
      ...d,
      settings: { ...d.settings, editor: { ...d.settings.editor, ...patch } },
    }));
  },
  updateRendering(patch: Partial<Settings['rendering']>) {
    useProjectStore.getState().commit((d) => ({
      ...d,
      settings: {
        ...d.settings,
        rendering: { ...d.settings.rendering, ...patch },
      },
    }));
  },
};
export const useSettingsStore = create<{
  preferences: AppPreferences;
  update: (patch: Partial<AppPreferences>) => void;
}>()(
  persist(
    (set) => ({
      preferences: {
        appearance: 'system',
        confirmDestructive: true,
        autoSave: true,
        autoSaveIntervalMs: 1200,
      },
      update: (patch) =>
        set((s) => ({ preferences: { ...s.preferences, ...patch } })),
    }),
    { name: 'kakkeko-preferences' },
  ),
);

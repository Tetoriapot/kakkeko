import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Project } from '../domain/types';
import { localPreferences } from '../utils/localPreferences';

type BackupRecord = { exportedAt: string; updatedAt: string };
export const useBackupStore = create<{
  projects: Record<string, BackupRecord>;
  lastFull: { exportedAt: string; count: number } | null;
  reminderDays: number;
  setReminder: (days: number) => void;
  record: (projects: Project[], full?: boolean) => void;
}>()(
  persist(
    (set) => ({
      projects: {},
      lastFull: null,
      reminderDays: 0,
      setReminder: (days) => set({ reminderDays: days }),
      record: (projects, full = false) =>
        set((s) => {
          const exportedAt = new Date().toISOString();
          return {
            projects: {
              ...s.projects,
              ...Object.fromEntries(
                projects.map((p) => [
                  p.id,
                  { exportedAt, updatedAt: p.updatedAt },
                ]),
              ),
            },
            lastFull: full
              ? { exportedAt, count: projects.length }
              : s.lastFull,
          };
        }),
    }),
    {
      name: 'kakkeko-backups',
      storage: createJSONStorage(() => localPreferences),
    },
  ),
);

export function backupDue(
  project: Project,
  record: BackupRecord | undefined,
  days: number,
  now = Date.now(),
) {
  return (
    days > 0 &&
    (!record ||
      (record.updatedAt !== project.updatedAt &&
        now - Date.parse(record.exportedAt) >= days * 86400000))
  );
}

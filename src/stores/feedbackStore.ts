import { create } from 'zustand';
import { useSettingsStore } from './settingsStore';
type Confirmation = { message: string; resolve: (confirmed: boolean) => void };
type Toast = { id: number; message: string; kind: 'info' | 'error' };
export const useFeedbackStore = create<{
  confirmation: Confirmation | null;
  toasts: Toast[];
}>(() => ({ confirmation: null, toasts: [] }));
let toastId = 0;
export function toast(message: string, kind: Toast['kind'] = 'info') {
  const id = ++toastId;
  useFeedbackStore.setState((s) => ({
    toasts: [...s.toasts.slice(-3), { id, message, kind }],
  }));
  return id;
}
export function dismissToast(id: number) {
  useFeedbackStore.setState((s) => ({
    toasts: s.toasts.filter((t) => t.id !== id),
  }));
}
export function confirmAction(
  message: string,
  always = false,
): Promise<boolean> {
  if (!always && !useSettingsStore.getState().preferences.confirmDestructive)
    return Promise.resolve(true);
  return new Promise((resolve) => {
    useFeedbackStore.getState().confirmation?.resolve(false);
    useFeedbackStore.setState({ confirmation: { message, resolve } });
  });
}
export function answerConfirmation(value: boolean) {
  const current = useFeedbackStore.getState().confirmation;
  useFeedbackStore.setState({ confirmation: null });
  current?.resolve(value);
}

import { useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { AppRoutes } from './router';
import { useSettingsStore } from '../stores/settingsStore';
import { autosaver } from '../db/autosave';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { Feedback } from '../components/common/Feedback';
export function App() {
  const appearance = useSettingsStore((s) => s.preferences.appearance);
  useEffect(() => {
    document.documentElement.dataset.appearance = appearance;
  }, [appearance]);
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (autosaver.isDirty()) {
        void autosaver.flush().catch(() => {});
        e.preventDefault();
        e.returnValue = '';
      }
    };
    const hidden = () => {
      if (document.visibilityState === 'hidden')
        void autosaver.flush().catch(() => {});
    };
    window.addEventListener('beforeunload', beforeUnload);
    document.addEventListener('visibilitychange', hidden);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      document.removeEventListener('visibilitychange', hidden);
    };
  }, []);
  return (
    <ErrorBoundary>
      <HashRouter>
        <AppRoutes />
        <Feedback />
      </HashRouter>
    </ErrorBoundary>
  );
}

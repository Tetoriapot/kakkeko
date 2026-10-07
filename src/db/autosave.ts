import { create } from 'zustand';
import { useProjectStore } from '../stores/projectStore';
import { projectRepository } from './repositories';
import { errorMessage } from '../utils/safety';
export const useSaveStore = create<{
  status: 'saved' | 'pending' | 'saving' | 'error';
  error: string;
}>()(() => ({ status: 'saved', error: '' }));
type Repository = Pick<typeof projectRepository, 'save'>;
export function createAutosaver(repository: Repository = projectRepository) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let savedDocument = useProjectStore.getState().document;
  let generation = 0;
  let queue = Promise.resolve();
  const flush = () => {
    clearTimeout(timer);
    const doc = useProjectStore.getState().document;
    const requestGeneration = generation;
    if (!doc || doc === savedDocument) return queue.catch(() => {});
    useSaveStore.setState({ status: 'saving', error: '' });
    const task = queue
      .catch(() => {})
      .then(async () => {
        try {
          await repository.save(doc);
          if (generation === requestGeneration) savedDocument = doc;
          if (useProjectStore.getState().document === doc)
            useSaveStore.setState({ status: 'saved', error: '' });
        } catch (error) {
          if (generation === requestGeneration)
            useSaveStore.setState({
              status: 'error',
              error: errorMessage(error),
            });
          throw error;
        }
      });
    queue = task;
    return task;
  };
  const unsubscribe = useProjectStore.subscribe((s, previous) => {
    if (s.document === previous.document) return;
    clearTimeout(timer);
    if (s.revision === 0) {
      generation++;
      savedDocument = s.document;
      useSaveStore.setState({ status: 'saved', error: '' });
      return;
    }
    useSaveStore.setState({ status: 'pending', error: '' });
    if (s.document?.settings.editor.autoSave)
      timer = setTimeout(() => {
        void flush().catch(() => {});
      }, s.document.settings.editor.autoSaveIntervalMs);
  });
  return {
    flush,
    stop: () => {
      clearTimeout(timer);
      unsubscribe();
    },
    isDirty: () => useProjectStore.getState().document !== savedDocument,
  };
}
export const autosaver = createAutosaver();

import { autosaver, useSaveStore } from '../../db/autosave';
export function SaveStatus() {
  const { status, error } = useSaveStore();
  const labels = {
    saved: '保存済み',
    pending: '未保存',
    saving: '保存中…',
    error: '保存に失敗',
  };
  return (
    <div className={`save-status ${status}`}>
      <span role="status" aria-live="polite">
        {labels[status]}
      </span>
      {error && <span role="alert">{error}</span>}
      <button
        type="button"
        onClick={() => void autosaver.flush().catch(() => {})}
        disabled={status === 'saving'}
      >
        保存
      </button>
    </div>
  );
}

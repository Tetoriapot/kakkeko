import { useEffect } from 'react';
import { Modal } from './Modal';
import {
  answerConfirmation,
  dismissToast,
  useFeedbackStore,
} from '../../stores/feedbackStore';
function ToastItem({
  id,
  message,
  kind,
}: {
  id: number;
  message: string;
  kind: 'info' | 'error';
}) {
  useEffect(() => {
    if (kind === 'error') return;
    const timer = setTimeout(() => dismissToast(id), 5000);
    return () => clearTimeout(timer);
  }, [id, kind]);
  return (
    <div
      className={`toast ${kind}`}
      role={kind === 'error' ? 'alert' : 'status'}
    >
      <span>{message}</span>
      <button aria-label="通知を閉じる" onClick={() => dismissToast(id)}>
        ×
      </button>
    </div>
  );
}
export function Feedback() {
  const { confirmation, toasts } = useFeedbackStore();
  return (
    <>
      <div className="toast-stack">
        {toasts.map((t) => (
          <ToastItem key={t.id} {...t} />
        ))}
      </div>
      {confirmation && (
        <Modal title="削除の確認" onClose={() => answerConfirmation(false)}>
          <p>{confirmation.message}</p>
          <div className="modal-footer">
            <button autoFocus onClick={() => answerConfirmation(false)}>
              キャンセル
            </button>
            <button
              className="danger destructive"
              onClick={() => answerConfirmation(true)}
            >
              削除する
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

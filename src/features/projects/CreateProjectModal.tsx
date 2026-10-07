import { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { fromTemplate, templates } from './templates';
import type { TemplateId } from './templates';
import type { ThemeId } from '../../domain/types';
import { projectRepository } from '../../db/repositories';
import { useSettingsStore } from '../../stores/settingsStore';
import { errorMessage } from '../../utils/safety';
import { useGuideStore } from '../../stores/guideStore';
export function CreateProjectModal({
  initial = 'blank',
  onClose,
  onCreated,
}: {
  initial?: TemplateId;
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState(initial);
  const [theme, setTheme] = useState<ThemeId>(
    initial === 'trpg' ? 'trpg-replay' : 'default-bubble',
  );
  const [samples, setSamples] = useState(initial !== 'blank');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return (
    <Modal title="新しい作品" onClose={onClose}>
      <form
        className="form-stack"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            const doc = fromTemplate(
              title,
              description,
              template,
              theme,
              samples,
            );
            const p = useSettingsStore.getState().preferences;
            doc.settings.editor = {
              ...doc.settings.editor,
              autoSave: p.autoSave,
              autoSaveIntervalMs: p.autoSaveIntervalMs,
            };
            await projectRepository.save(doc);
            useGuideStore.getState().start(doc.project.id);
            onCreated(doc.project.id);
          } catch (err) {
            setError(errorMessage(err));
            setBusy(false);
          }
        }}
      >
        <label>
          作品タイトル
          <input
            autoFocus
            required
            value={title}
            placeholder="どんな会話をつくりますか？"
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label>
          説明（任意）
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label>
          テンプレート
          <select
            value={template}
            onChange={(e) => {
              const id = e.target.value as TemplateId;
              setTemplate(id);
              setSamples(id !== 'blank');
              setTheme(
                id === 'trpg'
                  ? 'trpg-replay'
                  : id === 'talk'
                    ? 'magazine-talk'
                    : 'default-bubble',
              );
            }}
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          初期テーマ
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as ThemeId)}
          >
            <option value="default-bubble">Default Bubble</option>
            <option value="minimal-log">Minimal Log</option>
            <option value="aa-classic">AA Classic</option>
            <option value="trpg-replay">TRPG Replay</option>
            <option value="magazine-talk">Magazine Talk</option>
          </select>
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={samples}
            onChange={(e) => setSamples(e.target.checked)}
          />
          サンプルキャラクターを入れる
        </label>
        {error && (
          <p role="alert" className="error-box">
            {error}
          </p>
        )}
        <div className="modal-footer">
          <button type="button" onClick={onClose}>
            キャンセル
          </button>
          <button
            className="primary"
            type="submit"
            disabled={busy || !title.trim()}
          >
            {busy ? '作成中…' : '作品を作成'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

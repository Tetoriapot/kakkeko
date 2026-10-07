import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../../stores/projectStore';
import { useEditorStore } from '../../stores/editorStore';
import { autosaver } from '../../db/autosave';
import { SaveStatus } from '../common/SaveStatus';
import { useState } from 'react';
import { ExportModal } from '../../features/export/ExportModal';
import { HeaderUtilities } from '../common/HeaderUtilities';
export function EditorHeader() {
  const [exporting, setExporting] = useState(false);
  const title = useProjectStore((s) => s.document?.project.title);
  const canUndo = useProjectStore((s) => s.past.length > 0);
  const canRedo = useProjectStore((s) => s.future.length > 0);
  const navigate = useNavigate();
  return (
    <header className="editor-header">
      <div className="editor-title-group">
        <button
          aria-label="作品一覧に戻る"
          onClick={async () => {
            try {
              await autosaver.flush();
              navigate('/');
            } catch {
              /* SaveStatus exposes the failure. */
            }
          }}
        >
          ←
        </button>
        <div>
          <p className="eyebrow">KAKKEKO / WORKSPACE</p>
          <strong>{title}</strong>
        </div>
      </div>
      <div className="actions">
        <button
          title="Ctrl/Cmd+Z"
          aria-label="元に戻す"
          disabled={!canUndo}
          onClick={() => useProjectStore.getState().undo()}
        >
          ↶
        </button>
        <button
          title="Ctrl/Cmd+Shift+Z"
          aria-label="やり直す"
          disabled={!canRedo}
          onClick={() => useProjectStore.getState().redo()}
        >
          ↷
        </button>
        <SaveStatus />
        <button className="primary" onClick={() => setExporting(true)}>
          書き出し
        </button>
        <button
          className="header-preview-button"
          onClick={() =>
            useEditorStore.setState({ previewOpen: true, mobileTab: 'preview' })
          }
        >
          プレビュー
        </button>
      </div>
      <HeaderUtilities />
      {exporting && <ExportModal onClose={() => setExporting(false)} />}
    </header>
  );
}

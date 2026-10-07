import { EpisodeNavigation } from './EpisodeNavigation';
import { useProjectStore } from '../../stores/projectStore';
import { useEditorStore } from '../../stores/editorStore';
import { useState } from 'react';
import { EpisodeRenderer } from '../../renderer/EpisodeRenderer';
import { Modal } from '../common/Modal';
import '../../themes';
import { ThemeSelect } from '../../features/themes/ThemeSelect';
import { useThrottled } from '../../utils/useThrottled';
export function PreviewPane() {
  const id = useEditorStore((s) => s.episodeId);
  const liveDocument = useProjectStore((s) => s.document);
  const doc = useThrottled(liveDocument);
  const episode = doc?.episodes.find((e) => e.id === id);
  const [mode, setMode] = useState<'pc' | 'mobile'>('pc');
  const [expanded, setExpanded] = useState(false);
  return (
    <aside className="preview-pane" aria-label="ライブプレビュー">
      <header className="preview-toolbar">
        <h2>プレビュー</h2>
        <div className="actions">
          <button aria-pressed={mode === 'pc'} onClick={() => setMode('pc')}>
            PC
          </button>
          <button
            aria-pressed={mode === 'mobile'}
            onClick={() => setMode('mobile')}
          >
            スマホ
          </button>
          <button
            aria-label="プレビューを拡大"
            onClick={() => setExpanded(true)}
          >
            ↗
          </button>
        </div>
        <button
          className="preview-close"
          onClick={() =>
            useEditorStore.setState({ previewOpen: false, mobileTab: 'edit' })
          }
        >
          閉じる
        </button>
      </header>
      <div className="preview-theme">
        <ThemeSelect />
      </div>
      <div className="preview-scroll">
        <div className={`preview-document preview-${mode}`}>
          {doc && episode && (
            <EpisodeRenderer document={doc} episode={episode} />
          )}
          {doc && episode && (
            <EpisodeNavigation document={doc} id={episode.id} />
          )}
        </div>
      </div>
      <p className="preview-scale">
        100% · {mode === 'pc' ? 'PC' : 'スマホ'}表示
      </p>
      {expanded && doc && episode && (
        <Modal wide title="閲覧プレビュー" onClose={() => setExpanded(false)}>
          <EpisodeRenderer document={doc} episode={episode} />
        </Modal>
      )}
    </aside>
  );
}

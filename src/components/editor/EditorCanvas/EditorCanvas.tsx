import { useProjectStore } from '../../../stores/projectStore';
import { useEditorStore } from '../../../stores/editorStore';
import { SortableBlocks } from './SortableBlocks';
import { AddBlockBar } from '../AddBlockBar/AddBlockBar';
import { EpisodeMenu } from '../../../features/episodes/EpisodeMenu';
import { useShallow } from 'zustand/react/shallow';
import { MobileCharacterSelector } from '../MobileCharacterSelector';
import { GettingStarted } from '../../../features/editor/GettingStarted';
import { ProjectBackup } from '../../../features/editor/ProjectBackup';
export function EditorCanvas() {
  const id = useEditorStore((s) => s.episodeId);
  const episode = useProjectStore(
    useShallow((s) => {
      const e = s.document?.episodes.find((e) => e.id === id);
      return e
        ? {
            id: e.id,
            title: e.title,
            status: e.status,
            order: e.order,
            count: e.blocks.length,
          }
        : null;
    }),
  );
  return (
    <main id="main" className="editor-canvas">
      <GettingStarted />
      <MobileCharacterSelector />
      <EpisodeMenu />
      <ProjectBackup />
      <div className="episode-heading">
        <p className="eyebrow">
          EPISODE {episode?.order.toString().padStart(2, '0')}
        </p>
        <h1 tabIndex={-1}>{episode?.title || 'エピソードがありません'}</h1>
        <span className="badge">
          {episode?.status === 'ready'
            ? '完成'
            : episode?.status === 'published'
              ? '公開済み'
              : '下書き'}
        </span>
      </div>
      <div className="block-list">
        {episode && <SortableBlocks episodeId={episode.id} />}
        {!episode?.count && (
          <div className="editor-empty">
            <h2>最初のひとことを、ここから。</h2>
            <p className="muted">セリフや地の文を追加できます。</p>
          </div>
        )}
      </div>
      {episode && <AddBlockBar episodeId={episode.id} />}
    </main>
  );
}

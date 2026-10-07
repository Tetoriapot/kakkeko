import { lazy, Suspense, useState } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { useEditorStore } from '../../stores/editorStore';
import { orderedEpisodes } from './operations';
import { EpisodeManager } from './EpisodeManager';
const SearchModal = lazy(() =>
  import('../search/SearchModal').then((module) => ({
    default: module.SearchModal,
  })),
);
export function EpisodeMenu() {
  const episodes = useProjectStore((s) => s.document?.episodes ?? []);
  const id = useEditorStore((s) => s.episodeId);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  return (
    <div className="episode-menu">
      <label>
        <span className="visually-hidden">編集中のエピソード</span>
        <select
          value={id ?? ''}
          onChange={(e) =>
            useEditorStore.getState().selectEpisode(e.target.value)
          }
        >
          {!episodes.length && <option value="">エピソードなし</option>}
          {orderedEpisodes(episodes).map((e, i) => (
            <option key={e.id} value={e.id}>
              {i + 1}. {e.title}
            </option>
          ))}
        </select>
      </label>
      <button onClick={() => setOpen(true)}>エピソード管理</button>
      <button onClick={() => setSearching(true)}>作品内を検索</button>
      {open && <EpisodeManager onClose={() => setOpen(false)} />}
      {searching && (
        <Suspense fallback={<span role="status">検索を準備中…</span>}>
          <SearchModal onClose={() => setSearching(false)} />
        </Suspense>
      )}
    </div>
  );
}

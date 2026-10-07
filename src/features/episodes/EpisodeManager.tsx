import { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { useProjectStore } from '../../stores/projectStore';
import { useEditorStore } from '../../stores/editorStore';
import { confirmAction } from '../../stores/feedbackStore';
import {
  adjacentEpisodes,
  episodeActions,
  orderedEpisodes,
} from './operations';
import type { Episode } from '../../domain/types';
import { errorMessage } from '../../utils/safety';
function EpisodeForm({ episode }: { episode: Episode }) {
  const [title, setTitle] = useState(episode.title);
  const [slug, setSlug] = useState(episode.slug);
  const [status, setStatus] = useState(episode.status);
  const [message, setMessage] = useState('');
  const episodes = useProjectStore((s) => s.document?.episodes ?? []);
  const { previous, next } = adjacentEpisodes(episodes, episode.id);
  return (
    <form
      className="form-stack"
      onSubmit={(e) => {
        e.preventDefault();
        try {
          episodeActions.update(episode.id, { title, slug, status });
          setMessage('設定を保存しました');
        } catch (err) {
          setMessage(errorMessage(err));
        }
      }}
    >
      <label>
        エピソードタイトル
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <label>
        slug
        <input
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
      </label>
      <label>
        状態
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Episode['status'])}
        >
          <option value="draft">下書き</option>
          <option value="ready">完成</option>
          <option value="published">公開済み（状態のみ）</option>
        </select>
      </label>
      <p className="muted">
        作成: {new Date(episode.createdAt).toLocaleString('ja-JP')}
        <br />
        更新: {new Date(episode.updatedAt).toLocaleString('ja-JP')}
        <br />
        {episode.blocks.length} ブロック
      </p>
      <p className="muted">
        前の話: {previous?.title ?? 'なし'}
        <br />
        次の話: {next?.title ?? 'なし'}
      </p>
      <button type="submit" className="primary">
        エピソード設定を保存
      </button>
      <p role="status">{message}</p>
    </form>
  );
}
export function EpisodeManager({ onClose }: { onClose: () => void }) {
  const episodes = useProjectStore((s) => s.document?.episodes ?? []);
  const id = useEditorStore((s) => s.episodeId);
  const sorted = orderedEpisodes(episodes);
  const selected = sorted.find((e) => e.id === id);
  return (
    <Modal wide title="エピソード管理" onClose={onClose}>
      <div className="episode-manager">
        <div className="episode-list">
          <button className="primary" onClick={() => episodeActions.add()}>
            ＋ 新規エピソード
          </button>
          {sorted.map((e, i) => (
            <div
              className={`episode-item ${e.id === id ? 'selected' : ''}`}
              key={e.id}
            >
              <button
                aria-pressed={e.id === id}
                onClick={() => useEditorStore.getState().selectEpisode(e.id)}
              >
                {i + 1}. {e.title}
              </button>
              <div className="actions">
                <button
                  aria-label={`${e.title}を上へ`}
                  disabled={i === 0}
                  onClick={() => episodeActions.reorder(i, i - 1)}
                >
                  ↑
                </button>
                <button
                  aria-label={`${e.title}を下へ`}
                  disabled={i === sorted.length - 1}
                  onClick={() => episodeActions.reorder(i, i + 1)}
                >
                  ↓
                </button>
                <button onClick={() => episodeActions.duplicate(e.id)}>
                  複製
                </button>
                <button
                  className="danger"
                  onClick={async () => {
                    if (
                      await confirmAction(
                        `「${e.title}」を削除しますか？ Undoで戻せます。`,
                      )
                    )
                      episodeActions.remove(e.id);
                  }}
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
        {selected ? (
          <EpisodeForm key={selected.id} episode={selected} />
        ) : (
          <p className="muted">エピソードを作成してください。</p>
        )}
      </div>
    </Modal>
  );
}

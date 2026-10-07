import { useState } from 'react';
import type { ProjectDocument } from '../../domain/types';
import {
  adjacentEpisodes,
  orderedEpisodes,
} from '../../features/episodes/operations';
import { useEditorStore } from '../../stores/editorStore';
export function EpisodeNavigation({
  document: doc,
  id,
}: {
  document: ProjectDocument;
  id: string;
}) {
  const { previous, next, index, total } = adjacentEpisodes(doc.episodes, id);
  const [message, setMessage] = useState('');
  const go = (value: string) => useEditorStore.getState().selectEpisode(value);
  return (
    <>
      <nav className="episode-navigation" aria-label="話数ナビゲーション">
        <button
          disabled={!previous}
          onClick={() => previous && go(previous.id)}
        >
          ← 前の話
        </button>
        <span>
          {index + 1} / {total}
        </span>
        <button disabled={!next} onClick={() => next && go(next.id)}>
          次の話 →
        </button>
      </nav>
      <details className="episode-toc">
        <summary>目次</summary>
        <p>{doc.project.description}</p>
        <ol>
          {orderedEpisodes(doc.episodes).map((e) => (
            <li key={e.id}>
              <button
                aria-current={e.id === id ? 'page' : undefined}
                onClick={() => go(e.id)}
              >
                {e.title}
              </button>
            </li>
          ))}
        </ol>
      </details>
      <div className="preview-share">
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(window.location.href);
              setMessage(
                'この端末用のURLをコピーしました。共有にはHTML書き出しをご利用ください。',
              );
            } catch {
              setMessage('URLをコピーできませんでした。');
            }
          }}
        >
          URLをコピー
        </button>
        <p role="status">{message}</p>
      </div>
    </>
  );
}

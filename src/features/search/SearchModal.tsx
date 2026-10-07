import { useDeferredValue, useMemo, useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { useProjectStore } from '../../stores/projectStore';
import { useEditorStore } from '../../stores/editorStore';
import { searchProject } from './searchProject';
import type { SearchResult } from './searchProject';

export function SearchModal({ onClose }: { onClose: () => void }) {
  const doc = useProjectStore((s) => s.document);
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(50);
  const deferredQuery = useDeferredValue(query);
  const results = useMemo(
    () => (doc ? searchProject(doc, deferredQuery) : []),
    [doc, deferredQuery],
  );
  function navigate(result: SearchResult) {
    onClose();
    // Let the dialog restore focus before moving it to the chosen editing target.
    requestAnimationFrame(() => {
      const episode = useProjectStore
        .getState()
        .document?.episodes.find((e) => e.id === result.episodeId);
      if (
        !episode ||
        (result.blockId && !episode.blocks.some((b) => b.id === result.blockId))
      )
        return;
      useEditorStore.setState({
        episodeId: episode.id,
        selectedBlockId: result.blockId,
        focusBlockId: result.blockId,
        mobileTab: 'edit',
        previewOpen: false,
      });
      if (!result.blockId)
        requestAnimationFrame(() => {
          const heading = document.querySelector<HTMLElement>(
            '.episode-heading h1',
          );
          heading?.focus({ preventScroll: true });
          heading?.scrollIntoView({ block: 'start' });
        });
    });
  }
  return (
    <Modal title="作品内を検索" onClose={onClose} wide>
      <label>
        検索語
        <input
          autoFocus
          type="search"
          onKeyDown={(event) => {
            if (event.key === 'Escape' && !event.nativeEvent.isComposing) {
              event.preventDefault();
              event.stopPropagation();
              onClose();
            }
          }}
          value={query}
          placeholder="本文・話者名・エピソード名など"
          onChange={(e) => {
            setQuery(e.target.value);
            setLimit(50);
          }}
        />
      </label>
      <p className="muted">
        全エピソードの本文・話者名・画像の説明・編集用ノートを検索します。メモと非表示ブロックも含みます。
      </p>
      <p role="status">
        {!query.trim()
          ? '検索語を入力してください。'
          : query !== deferredQuery
            ? '検索中…'
            : results.length
              ? `${results.length}件見つかりました`
              : '一致する内容はありません。'}
      </p>
      <ol
        className="search-results"
        aria-label="検索結果"
        aria-busy={query !== deferredQuery}
      >
        {results.slice(0, limit).map((result) => (
          <li key={`${result.episodeId}:${result.blockId ?? 'title'}`}>
            <button onClick={() => navigate(result)}>
              <strong>
                {result.episodeTitle} / {result.label}
              </strong>
              {(result.hidden || result.privateMemo) && (
                <span className="search-badges">
                  {result.hidden && '非表示 '}
                  {result.privateMemo && '非公開メモ'}
                </span>
              )}
              <span>{result.excerpt}</span>
            </button>
          </li>
        ))}
      </ol>
      {results.length > limit && (
        <button onClick={() => setLimit((value) => value + 50)}>
          さらに50件表示
        </button>
      )}
    </Modal>
  );
}

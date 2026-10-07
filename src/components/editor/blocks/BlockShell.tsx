import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Block } from '../../../domain/types';
import { BLOCK_LABELS } from '../../../domain/types';
import { episodeStore } from '../../../stores/episodeStore';
import { useEditorStore } from '../../../stores/editorStore';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from '../../../stores/feedbackStore';
export function BlockShell({
  block,
  episodeId,
  index,
  total,
  children,
}: {
  block: Block;
  episodeId: string;
  index: number;
  total: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const sortable = useSortable({ id: block.id });
  const shouldFocus = useEditorStore((s) => s.focusBlockId === block.id);
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (shouldFocus) {
      const input =
        ref.current?.querySelector<HTMLElement>('[data-block-input]');
      if (!input && ref.current) ref.current.tabIndex = -1;
      const target = input ?? ref.current;
      target?.focus({ preventScroll: true });
      target?.scrollIntoView?.({ block: 'nearest' });
      useEditorStore.getState().focusBlock(null);
    }
  }, [shouldFocus, block.id]);
  return (
    <article
      ref={(node) => {
        ref.current = node;
        sortable.setNodeRef(node);
      }}
      style={{
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
        zIndex: sortable.isDragging ? 8 : undefined,
        opacity: sortable.isDragging ? 0.8 : 1,
        borderLeftColor: block.type === 'memo' ? block.color : undefined,
      }}
      data-testid="block"
      data-block-id={block.id}
      className={`block-shell block-${block.type} ${block.hidden ? 'block-hidden' : ''}`}
      aria-label={`${index + 1}: ${BLOCK_LABELS[block.type]}`}
      onFocus={() => useEditorStore.setState({ selectedBlockId: block.id })}
    >
      <div className="block-toolbar">
        <button
          ref={sortable.setActivatorNodeRef}
          className="drag-handle"
          {...sortable.attributes}
          {...sortable.listeners}
          aria-label={`ブロック ${index + 1} を並べ替え`}
        >
          ⠿
        </button>
        <span className="block-kind">{BLOCK_LABELS[block.type]}</span>
        {block.hidden && <span className="badge">非表示</span>}
        <div className="block-actions">
          <button
            aria-label="ブロックを上へ"
            disabled={index === 0}
            onClick={() => episodeStore.moveBlock(episodeId, index, index - 1)}
          >
            ↑
          </button>
          <button
            aria-label="ブロックを下へ"
            disabled={index === total - 1}
            onClick={() => episodeStore.moveBlock(episodeId, index, index + 1)}
          >
            ↓
          </button>
          <button
            aria-label="ブロックを複製"
            onClick={() => episodeStore.duplicateBlock(episodeId, block.id)}
          >
            複製
          </button>
          <button
            aria-label={block.hidden ? 'ブロックを表示' : 'ブロックを非表示'}
            onClick={() =>
              episodeStore.updateBlock(episodeId, block.id, {
                hidden: !block.hidden,
              })
            }
          >
            {block.hidden ? '表示' : '非表示'}
          </button>
          <button
            className="danger"
            aria-label="ブロックを削除"
            onClick={() => {
              episodeStore.deleteBlock(episodeId, block.id);
              toast('ブロックを削除しました。Undoで元に戻せます。');
            }}
          >
            ×
          </button>
        </div>
      </div>
      <div className="block-content">{children}</div>
      <details className="block-details">
        <summary>ブロックの詳細</summary>
        <div className="form-stack">
          <label>
            編集用ノート
            <input
              value={block.note ?? ''}
              onChange={(e) =>
                episodeStore.updateBlock(episodeId, block.id, {
                  note: e.target.value,
                })
              }
            />
          </label>
          <label>
            HTMLクラス名
            <input
              value={block.customClass ?? ''}
              onChange={(e) =>
                episodeStore.updateBlock(episodeId, block.id, {
                  customClass: e.target.value,
                })
              }
            />
          </label>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(
                  'text' in block
                    ? block.text
                    : block.type === 'image'
                      ? block.src
                      : '───',
                );
                setMessage('コピーしました');
              } catch {
                setMessage(
                  'コピーできませんでした。本文を選択してコピーしてください。',
                );
              }
            }}
          >
            内容をコピー
          </button>
          <span role="status">{message}</span>
        </div>
      </details>
    </article>
  );
}

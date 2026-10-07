import type { MemoBlock } from '../../../domain/types';
import type { BlockEditorProps } from './types';
export function MemoBlockEditor({
  block,
  onChange,
}: BlockEditorProps<MemoBlock>) {
  return (
    <div className="form-stack">
      <p className="muted">
        編集用の非公開メモです。プレビューには表示されません。
      </p>
      <label>
        <span className="visually-hidden">メモ本文</span>
        <textarea
          data-block-input
          aria-label="メモ本文"
          value={block.text}
          placeholder="あとで書きたいこと、覚えておきたいこと…"
          onChange={(e) => onChange({ text: e.target.value })}
        />
      </label>
      <label>
        メモの色
        <input
          type="color"
          value={block.color ?? '#fff5cc'}
          onChange={(e) => onChange({ color: e.target.value })}
        />
      </label>
    </div>
  );
}

import type { HeadingBlock } from '../../../domain/types';
import type { BlockEditorProps } from './types';
export function HeadingBlockEditor({
  block,
  onChange,
}: BlockEditorProps<HeadingBlock>) {
  return (
    <div className="form-stack">
      <label>
        見出し本文
        <input
          data-block-input
          value={block.text}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="場面の見出し"
        />
      </label>
      <label>
        見出しレベル
        <select
          value={block.level}
          onChange={(e) =>
            onChange({ level: Number(e.target.value) as 2 | 3 | 4 })
          }
        >
          <option value={2}>H2 大見出し</option>
          <option value={3}>H3 中見出し</option>
          <option value={4}>H4 小見出し</option>
        </select>
      </label>
    </div>
  );
}

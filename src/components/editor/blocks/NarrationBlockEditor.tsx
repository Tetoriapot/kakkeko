import type { NarrationBlock } from '../../../domain/types';
import type { BlockEditorProps } from './types';
export function NarrationBlockEditor({
  block,
  onChange,
}: BlockEditorProps<NarrationBlock>) {
  return (
    <div className="form-stack">
      <label>
        <span className="visually-hidden">地の文本文</span>
        <textarea
          data-block-input
          aria-label="地の文本文"
          placeholder="情景、説明、ト書きを入力…"
          value={block.text}
          onChange={(e) => onChange({ text: e.target.value })}
        />
      </label>
      <div className="form-columns">
        <label>
          地の文スタイル
          <select
            value={block.style ?? 'normal'}
            onChange={(e) =>
              onChange({ style: e.target.value as NarrationBlock['style'] })
            }
          >
            <option value="normal">通常</option>
            <option value="emphasis">強調</option>
            <option value="small">小さく</option>
          </select>
        </label>
        <label>
          地の文の配置
          <select
            value={block.align ?? 'left'}
            onChange={(e) =>
              onChange({ align: e.target.value as NarrationBlock['align'] })
            }
          >
            <option value="left">左</option>
            <option value="center">中央</option>
          </select>
        </label>
      </div>
    </div>
  );
}

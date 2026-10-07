import type { DividerBlock } from '../../../domain/types';
import type { BlockEditorProps } from './types';
export function DividerBlockEditor({
  block,
  onChange,
}: BlockEditorProps<DividerBlock>) {
  return (
    <label>
      区切りの種類
      <select
        data-block-input
        value={block.style}
        onChange={(e) =>
          onChange({ style: e.target.value as DividerBlock['style'] })
        }
      >
        <option value="line">線</option>
        <option value="dots">点</option>
        <option value="space">余白</option>
        <option value="scene">場面転換</option>
      </select>
    </label>
  );
}

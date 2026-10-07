import type { ImageBlock } from '../../../domain/types';
import type { BlockEditorProps } from './types';
import { ImageInput } from '../../common/ImageInput';
import { safeImageUrl } from '../../../utils/safety';
import { UrlInput } from '../../common/UrlInput';
export function ImageBlockEditor({
  block,
  onChange,
}: BlockEditorProps<ImageBlock>) {
  return (
    <div className="form-stack">
      <ImageInput label="本文画像" onChange={(src) => onChange({ src })} />
      {safeImageUrl(block.src) && (
        <img
          className="editor-image"
          src={safeImageUrl(block.src)}
          alt={block.alt}
        />
      )}
      <UrlInput
        label="画像URL"
        value={block.src}
        image
        onChange={(src) => onChange({ src })}
      />
      <label>
        代替テキスト
        <input
          value={block.alt}
          onChange={(e) => onChange({ alt: e.target.value })}
        />
      </label>
      <label>
        キャプション
        <input
          value={block.caption ?? ''}
          onChange={(e) => onChange({ caption: e.target.value })}
        />
      </label>
      <div className="form-columns">
        <label>
          画像の幅
          <select
            value={block.width ?? 'large'}
            onChange={(e) =>
              onChange({ width: e.target.value as ImageBlock['width'] })
            }
          >
            <option value="small">小</option>
            <option value="medium">中</option>
            <option value="large">大</option>
            <option value="full">全幅</option>
          </select>
        </label>
        <label>
          画像の配置
          <select
            value={block.align ?? 'center'}
            onChange={(e) =>
              onChange({ align: e.target.value as ImageBlock['align'] })
            }
          >
            <option value="left">左</option>
            <option value="center">中央</option>
            <option value="right">右</option>
          </select>
        </label>
      </div>
      <UrlInput
        label="画像のリンク先"
        value={block.link ?? ''}
        onChange={(link) => onChange({ link })}
      />
      <button onClick={() => onChange({ src: '' })}>画像をクリア</button>
    </div>
  );
}

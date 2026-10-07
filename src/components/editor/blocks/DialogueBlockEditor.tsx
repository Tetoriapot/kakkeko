import type { DialogueBlock } from '../../../domain/types';
import type { BlockEditorProps } from './types';
import { useProjectStore } from '../../../stores/projectStore';
import { ImageInput } from '../../common/ImageInput';
export function DialogueBlockEditor({
  block,
  onChange,
}: BlockEditorProps<DialogueBlock>) {
  const characters = useProjectStore((s) => s.document?.characters);
  return (
    <div className="dialogue-editor">
      <label className="speaker-field">
        話し手
        <select
          aria-label="話し手"
          value={block.characterId}
          onChange={(e) => onChange({ characterId: e.target.value })}
        >
          <option value="">匿名の話し手</option>
          {characters
            ?.filter((c) => !c.isArchived || c.id === block.characterId)
            .sort((a, b) => a.order - b.order)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.isArchived ? '（アーカイブ）' : ''}
              </option>
            ))}
        </select>
      </label>
      <label className="block-text-label">
        <span className="visually-hidden">セリフ本文</span>
        <textarea
          data-block-input
          aria-label="セリフ本文"
          placeholder="セリフを入力…"
          value={block.text}
          onChange={(e) => onChange({ text: e.target.value })}
        />
      </label>
      <details className="block-details">
        <summary>セリフの詳細</summary>
        <div className="form-stack">
          <div className="form-columns">
            <label>
              感情
              <input
                value={block.emotion ?? ''}
                onChange={(e) => onChange({ emotion: e.target.value })}
              />
            </label>
            <label>
              配置
              <select
                value={block.alignment ?? 'auto'}
                onChange={(e) =>
                  onChange({
                    alignment: e.target.value as DialogueBlock['alignment'],
                  })
                }
              >
                <option value="auto">自動</option>
                <option value="left">左</option>
                <option value="right">右</option>
              </select>
            </label>
          </div>
          <label>
            この発言だけの名前
            <input
              value={block.overrideName ?? ''}
              onChange={(e) => onChange({ overrideName: e.target.value })}
            />
          </label>
          <ImageInput
            label="この発言だけのアイコン"
            onChange={(overrideIcon) => onChange({ overrideIcon })}
          />
          {block.overrideIcon && (
            <button
              type="button"
              onClick={() => onChange({ overrideIcon: undefined })}
            >
              発言用アイコンを解除
            </button>
          )}
          <label>
            タイムスタンプ
            <input
              value={block.timestamp ?? ''}
              onChange={(e) => onChange({ timestamp: e.target.value })}
            />
          </label>
        </div>
      </details>
    </div>
  );
}

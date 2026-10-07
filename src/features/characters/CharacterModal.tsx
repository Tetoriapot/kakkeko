import { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { ImageInput } from '../../components/common/ImageInput';
import { createCharacter } from '../../domain/factories';
import type { Character } from '../../domain/types';
import { characterStore } from '../../stores/characterStore';
import { useEditorStore } from '../../stores/editorStore';
import { safeImageUrl } from '../../utils/safety';
export function CharacterModal({
  character,
  onClose,
}: {
  character?: Character;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Character>(() =>
    character ? structuredClone(character) : createCharacter({ name: '' }),
  );
  const [tab, setTab] = useState('基本');
  const update = (patch: Partial<Character>) =>
    setDraft((s) => ({ ...s, ...patch }));
  const trpg = (patch: Partial<NonNullable<Character['trpg']>>) =>
    update({ trpg: { ...draft.trpg, ...patch } });
  return (
    <Modal
      title={character ? 'キャラクターを編集' : 'キャラクターを追加'}
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.name.trim()) {
            setTab('基本');
            return;
          }
          const normalized = { ...draft, name: draft.name.trim() };
          if (character) characterStore.update(character.id, normalized);
          else {
            const id = characterStore.add({ ...normalized, order: undefined });
            useEditorStore.getState().selectCharacter(id);
          }
          onClose();
        }}
      >
        <nav className="dialog-tabs" aria-label="キャラクター編集項目">
          {['基本', '表示', 'TRPG', '詳細'].map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tab === t}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </nav>
        <div className="form-stack" hidden={tab !== '基本'}>
          <div className="character-icon-edit">
            <span className="avatar large">
              {safeImageUrl(draft.icon?.value) ? (
                <img src={safeImageUrl(draft.icon?.value)} alt={draft.name} />
              ) : (
                draft.name.slice(0, 1) || '人'
              )}
            </span>
            <ImageInput
              label="アイコン画像"
              onChange={(value) => update({ icon: { type: 'dataUrl', value } })}
            />
          </div>
          <button
            type="button"
            onClick={() => update({ icon: { type: 'none' } })}
          >
            アイコンをクリア
          </button>
          <label>
            キャラクター名
            <input
              autoFocus
              value={draft.name}
              onChange={(e) => update({ name: e.target.value })}
            />
          </label>
          <div className="form-columns">
            <label>
              読み
              <input
                value={draft.reading ?? ''}
                onChange={(e) => update({ reading: e.target.value })}
              />
            </label>
            <label>
              短縮名
              <input
                value={draft.shortName ?? ''}
                onChange={(e) => update({ shortName: e.target.value })}
              />
            </label>
          </div>
          <label>
            補助名
            <input
              value={draft.subtitle ?? ''}
              onChange={(e) => update({ subtitle: e.target.value })}
            />
          </label>
          <label>
            キャラクター色
            <input
              type="color"
              value={draft.color}
              onChange={(e) => update({ color: e.target.value })}
            />
          </label>
        </div>
        <div className="form-stack" hidden={tab !== '表示'}>
          <label>
            アイコン形状
            <select
              value={draft.iconShape ?? ''}
              onChange={(e) =>
                update({
                  iconShape: (e.target.value ||
                    undefined) as Character['iconShape'],
                })
              }
            >
              <option value="">作品設定に従う</option>
              <option value="circle">丸</option>
              <option value="rounded">角丸</option>
              <option value="square">四角</option>
            </select>
          </label>
          <label>
            表示位置
            <select
              value={draft.position}
              onChange={(e) =>
                update({ position: e.target.value as Character['position'] })
              }
            >
              <option value="left">左</option>
              <option value="right">右</option>
            </select>
          </label>
          <div className="form-columns">
            <label>
              吹き出し色
              <input
                type="color"
                value={draft.bubbleColor ?? '#F3F6F1'}
                onChange={(e) => update({ bubbleColor: e.target.value })}
              />
            </label>
            <label>
              名前色
              <input
                type="color"
                value={draft.textColor ?? '#20332D'}
                onChange={(e) => update({ textColor: e.target.value })}
              />
            </label>
          </div>
          <p className="muted">
            文字色は背景とのコントラストに応じて補正されます。
          </p>
          <label>
            AAテキスト
            <textarea
              className="aa-input"
              value={draft.aaText ?? ''}
              placeholder="（　＾ω＾）"
              onChange={(e) => update({ aaText: e.target.value })}
            />
          </label>
        </div>
        <div className="form-stack" hidden={tab !== 'TRPG'}>
          <label>
            PL名
            <input
              value={draft.trpg?.playerName ?? ''}
              onChange={(e) => trpg({ playerName: e.target.value })}
            />
          </label>
          <label>
            PC名
            <input
              value={draft.trpg?.pcName ?? ''}
              onChange={(e) => trpg({ pcName: e.target.value })}
            />
          </label>
          <label>
            役割
            <select
              value={draft.trpg?.role ?? 'other'}
              onChange={(e) =>
                trpg({
                  role: e.target.value as NonNullable<
                    Character['trpg']
                  >['role'],
                })
              }
            >
              <option value="gm">GM</option>
              <option value="player">PL</option>
              <option value="npc">NPC</option>
              <option value="other">その他</option>
            </select>
          </label>
          <label>
            システム名
            <input
              value={draft.trpg?.systemName ?? ''}
              onChange={(e) => trpg({ systemName: e.target.value })}
            />
          </label>
          <label>
            名前の表示
            <select
              value={draft.trpg?.displayPreset ?? 'pc-player'}
              onChange={(e) =>
                trpg({
                  displayPreset: e.target.value as NonNullable<
                    Character['trpg']
                  >['displayPreset'],
                })
              }
            >
              <option value="pc">PC名のみ</option>
              <option value="pc-player">PC名 + PL名</option>
              <option value="player">PL名のみ</option>
              <option value="gm">GM表記</option>
            </select>
          </label>
        </div>
        <div className="form-stack" hidden={tab !== '詳細'}>
          <label>
            一人称
            <input
              value={draft.firstPerson ?? ''}
              onChange={(e) => update({ firstPerson: e.target.value })}
            />
          </label>
          <label>
            メモ
            <textarea
              value={draft.notes ?? ''}
              onChange={(e) => update({ notes: e.target.value })}
            />
          </label>
          <label>
            タグ（カンマ区切り）
            <input
              value={draft.tags?.join(',') ?? ''}
              onChange={(e) => update({ tags: e.target.value.split(',') })}
            />
          </label>
        </div>
        <div className="modal-footer">
          <button type="button" onClick={onClose}>
            キャンセル
          </button>
          <button
            type="submit"
            className="primary"
            disabled={!draft.name.trim()}
          >
            {character ? '変更を保存' : 'キャラクターを登録'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

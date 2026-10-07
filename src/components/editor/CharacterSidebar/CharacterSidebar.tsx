import { useState } from 'react';
import { useProjectStore } from '../../../stores/projectStore';
import { useEditorStore } from '../../../stores/editorStore';
import { characterStore } from '../../../stores/characterStore';
import { episodeStore } from '../../../stores/episodeStore';
import { CharacterModal } from '../../../features/characters/CharacterModal';
import type { Character } from '../../../domain/types';
import { errorMessage, safeImageUrl } from '../../../utils/safety';
import { useShallow } from 'zustand/react/shallow';
import { selectCharacterUsage } from '../../../stores/selectors';
import { confirmAction } from '../../../stores/feedbackStore';
export function CharacterSidebar() {
  const characters = useProjectStore((s) => s.document?.characters ?? []);
  const counts = useProjectStore(
    useShallow((s) => selectCharacterUsage(s.document)),
  );
  const selected = useEditorStore((s) => s.lastCharacterId);
  const episodeId = useEditorStore((s) => s.episodeId);
  const [editing, setEditing] = useState<Character | 'new' | null>(null);
  const [sort, setSort] = useState('manual');
  const [archived, setArchived] = useState(false);
  const [error, setError] = useState('');
  const count = (id: string) => counts[id] ?? 0;
  const manual = [...characters].sort((a, b) => a.order - b.order);
  const shown = manual
    .filter((c) => archived || !c.isArchived)
    .sort((a, b) =>
      sort === 'name'
        ? a.name.localeCompare(b.name, 'ja')
        : sort === 'usage'
          ? count(b.id) - count(a.id)
          : a.order - b.order,
    );
  return (
    <aside className="character-sidebar">
      <div className="sidebar-heading">
        <h2>キャラクター</h2>
        <span className="badge">
          {characters.filter((c) => !c.isArchived).length}
        </span>
      </div>
      <p className="muted sidebar-hint">ダブルクリックですぐに発言</p>
      <label className="visually-hidden" htmlFor="character-sort">
        キャラクター表示順
      </label>
      <select
        id="character-sort"
        value={sort}
        onChange={(e) => setSort(e.target.value)}
      >
        <option value="manual">手動順</option>
        <option value="usage">発言回数順</option>
        <option value="name">名前順</option>
      </select>
      <div className="character-list">
        {shown.map((c) => (
          <div className="character-item" key={c.id}>
            <button
              className={`character-row ${selected === c.id ? 'selected' : ''}`}
              aria-pressed={selected === c.id}
              onClick={() => useEditorStore.getState().selectCharacter(c.id)}
              onDoubleClick={() => {
                if (episodeId && !c.isArchived)
                  episodeStore.addBlock(episodeId, 'dialogue', c.id);
              }}
            >
              <span className="avatar" style={{ borderColor: c.color }}>
                {safeImageUrl(c.icon?.value) ? (
                  <img alt={c.name} src={safeImageUrl(c.icon?.value)} />
                ) : (
                  c.name.slice(0, 1)
                )}
              </span>
              <span>
                <strong>{c.name}</strong>
                <small>
                  {c.isArchived
                    ? 'アーカイブ'
                    : c.subtitle || c.trpg?.playerName || `${count(c.id)} 発言`}
                </small>
              </span>
              <kbd>
                {manual
                  .filter((x) => !x.isArchived)
                  .findIndex((x) => x.id === c.id) < 9 && !c.isArchived
                  ? manual
                      .filter((x) => !x.isArchived)
                      .findIndex((x) => x.id === c.id) + 1
                  : ''}
              </kbd>
            </button>
            <details className="card-menu">
              <summary aria-label={`${c.name}の操作`}>⋮</summary>
              <div>
                <button onClick={() => setEditing(c)}>編集</button>
                <button onClick={() => characterStore.duplicate(c.id)}>
                  複製
                </button>
                <button
                  disabled={manual.indexOf(c) === 0}
                  onClick={() =>
                    characterStore.reorder(
                      characters.indexOf(c),
                      characters.indexOf(manual[manual.indexOf(c) - 1]),
                    )
                  }
                >
                  上へ
                </button>
                <button
                  disabled={manual.indexOf(c) === manual.length - 1}
                  onClick={() =>
                    characterStore.reorder(
                      characters.indexOf(c),
                      characters.indexOf(manual[manual.indexOf(c) + 1]),
                    )
                  }
                >
                  下へ
                </button>
                <button
                  onClick={() =>
                    characterStore.update(c.id, { isArchived: !c.isArchived })
                  }
                >
                  {c.isArchived ? 'アーカイブ解除' : 'アーカイブ'}
                </button>
                <button
                  className="danger"
                  onClick={async () => {
                    try {
                      if (
                        characterStore.usage(c.id) === 0 &&
                        !(await confirmAction(
                          `「${c.name}」を削除しますか？ Undoで戻せます。`,
                        ))
                      )
                        return;
                      characterStore.remove(c.id);
                      setError('');
                    } catch (e) {
                      setError(errorMessage(e));
                    }
                  }}
                >
                  削除
                </button>
              </div>
            </details>
          </div>
        ))}
      </div>
      {!shown.length && (
        <p className="muted sidebar-hint">
          キャラクターはまだいません。匿名の発言も入力できます。
        </p>
      )}
      <button className="add-character" onClick={() => setEditing('new')}>
        ＋ キャラクターを追加
      </button>
      <label className="check archive-toggle">
        <input
          type="checkbox"
          checked={archived}
          onChange={(e) => setArchived(e.target.checked)}
        />
        アーカイブも表示
      </label>
      {error && (
        <p role="alert" className="error-box">
          {error}
        </p>
      )}
      {editing && (
        <CharacterModal
          character={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </aside>
  );
}

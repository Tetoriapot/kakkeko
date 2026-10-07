import { useProjectStore } from '../../stores/projectStore';
import { useEditorStore } from '../../stores/editorStore';
import { episodeStore } from '../../stores/episodeStore';
export function MobileCharacterSelector() {
  const characters = useProjectStore((s) => s.document?.characters ?? []);
  const last = useEditorStore((s) => s.lastCharacterId);
  const episodeId = useEditorStore((s) => s.episodeId);
  const active = characters
    .filter((c) => !c.isArchived)
    .sort((a, b) => a.order - b.order);
  return (
    <div className="mobile-character-selector">
      <label>
        次の話し手
        <select
          aria-label="次の話し手"
          value={active.some((c) => c.id === last) ? last : ''}
          onChange={(e) =>
            useEditorStore.getState().selectCharacter(e.target.value)
          }
        >
          <option value="">匿名の話し手</option>
          {active.map((c, i) => (
            <option key={c.id} value={c.id}>
              {i + 1}. {c.name}
            </option>
          ))}
        </select>
      </label>
      <button
        disabled={!episodeId}
        onClick={() =>
          episodeId &&
          episodeStore.addBlock(
            episodeId,
            'dialogue',
            active.some((c) => c.id === last) ? last : '',
          )
        }
      >
        ＋ 発言
      </button>
    </div>
  );
}

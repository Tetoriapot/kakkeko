import { BLOCK_LABELS } from '../../../domain/types';
import type { BlockType } from '../../../domain/types';
import { episodeStore } from '../../../stores/episodeStore';
import { CharacterPicker } from './CharacterPicker';
export function AddBlockBar({ episodeId }: { episodeId: string }) {
  return (
    <div className="add-block-bar" role="toolbar" aria-label="ブロック追加">
      <div className="dialogue-add">
        <button
          className="primary"
          onClick={() => episodeStore.addBlock(episodeId, 'dialogue')}
        >
          ＋ セリフ
        </button>
        <CharacterPicker episodeId={episodeId} />
      </div>
      {(
        ['narration', 'image', 'heading', 'divider', 'memo'] as BlockType[]
      ).map((type) => (
        <button
          key={type}
          onClick={() => episodeStore.addBlock(episodeId, type)}
        >
          ＋ {BLOCK_LABELS[type]}
        </button>
      ))}
    </div>
  );
}

import { useState } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { useEditorStore } from '../../stores/editorStore';
import { useGuideStore } from '../../stores/guideStore';
import { episodeStore } from '../../stores/episodeStore';
import { CharacterModal } from '../characters/CharacterModal';

export function GettingStarted() {
  const doc = useProjectStore((s) => s.document);
  const episodeId = useEditorStore((s) => s.episodeId);
  const guide = useGuideStore((s) =>
    doc ? s.projects[doc.project.id] : undefined,
  );
  const [addingCharacter, setAddingCharacter] = useState(false);
  if (!doc || !guide?.visible) return null;
  const characters = doc.characters.filter((c) => !c.isArchived);
  const written = doc.episodes.find((e) =>
    e.blocks.some(
      (b) =>
        b.type === 'dialogue' &&
        b.text.trim() &&
        characters.some((c) => c.id === b.characterId),
    ),
  );
  const step = !characters.length ? 0 : !written ? 1 : !guide.previewed ? 2 : 3;
  const labels = ['キャラクターを登録', 'セリフを書く', 'プレビューを確認'];
  return (
    <section className="getting-started" aria-label="はじめての作品ガイド">
      <div className="guide-heading">
        <h2>はじめての作品ガイド</h2>
        <button
          onClick={() => useGuideStore.getState().dismiss(doc.project.id)}
        >
          {step === 3 ? 'ガイドを終了' : 'ガイドを閉じる'}
        </button>
      </div>
      <ol className="guide-steps">
        {labels.map((label, index) => (
          <li key={label} aria-current={index === step ? 'step' : undefined}>
            <span aria-hidden="true">{index < step ? '✓' : index + 1}</span>
            {label}
            {index < step && <span className="visually-hidden">（完了）</span>}
          </li>
        ))}
      </ol>
      <p role="status">
        {
          [
            'キャラクターを1人登録してください。',
            'セリフを追加して本文を入力してください。',
            'プレビューで話し手とセリフを確認してください。',
            '初期設定が完了しました。',
          ][step]
        }
      </p>
      {step === 0 && (
        <button className="primary" onClick={() => setAddingCharacter(true)}>
          キャラクターを登録する
        </button>
      )}
      {step === 1 && (
        <button
          className="primary"
          disabled={!episodeId}
          onClick={() => {
            if (!episodeId) return;
            const empty = doc.episodes
              .find((e) => e.id === episodeId)
              ?.blocks.find((b) => b.type === 'dialogue' && !b.text.trim());
            if (empty) {
              if (
                empty.type === 'dialogue' &&
                !characters.some((c) => c.id === empty.characterId)
              )
                episodeStore.updateBlock(episodeId, empty.id, {
                  characterId: characters[0].id,
                });
              useEditorStore.getState().focusBlock(empty.id);
            } else
              episodeStore.addBlock(episodeId, 'dialogue', characters[0].id);
          }}
        >
          セリフを入力する
        </button>
      )}
      {step === 2 && (
        <button
          className="primary"
          onClick={() => {
            useGuideStore.getState().preview(doc.project.id);
            if (written) useEditorStore.getState().selectEpisode(written.id);
            useEditorStore.setState({
              previewOpen: true,
              mobileTab: 'preview',
            });
          }}
        >
          プレビューで確認する
        </button>
      )}
      {addingCharacter && (
        <CharacterModal onClose={() => setAddingCharacter(false)} />
      )}
    </section>
  );
}

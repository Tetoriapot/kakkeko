import { SkipLink } from '../../components/common/SkipLink';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { projectRepository } from '../../db/repositories';
import { useProjectStore } from '../../stores/projectStore';
import {
  useEditorStore,
  lastCharacterForProject,
} from '../../stores/editorStore';
import { EditorHeader } from '../../components/editor/EditorHeader';
import { CharacterSidebar } from '../../components/editor/CharacterSidebar/CharacterSidebar';
import { ProjectSettings } from '../../components/editor/ProjectSettings';
import { EditorCanvas } from '../../components/editor/EditorCanvas/EditorCanvas';
import { PreviewPane } from '../../components/preview/PreviewPane';
import { errorMessage } from '../../utils/safety';
import { useEditorShortcuts } from '../editor/shortcuts';
import { autosaver } from '../../db/autosave';
import { useEditorPosition } from '../editor/useEditorPosition';
import { isMobileEditor, readEditorPosition } from '../editor/editorPosition';
export function Editor() {
  useEditorShortcuts();
  const { projectId } = useParams();
  const loadedProjectId = useProjectStore((s) => s.document?.project.id);
  const [error, setError] = useState('');
  const [readyProjectId, setReadyProjectId] = useState<string | null>(null);
  useEditorPosition(projectId, readyProjectId === projectId);
  const tab = useEditorStore((s) => s.mobileTab);
  const previewOpen = useEditorStore((s) => s.previewOpen);
  useEffect(() => {
    let cancelled = false;
    if (!projectId) return;
    setError('');
    setReadyProjectId(null);
    autosaver
      .flush()
      .then(() => projectRepository.get(projectId))
      .then((d) => {
        if (cancelled) return;
        if (!d) {
          setError('作品が見つかりません');
          return;
        }
        useProjectStore.getState().load(d);
        const remembered = lastCharacterForProject(d.project.id);
        useEditorStore.setState({
          lastCharacterId: d.characters.some(
            (c) => c.id === remembered && !c.isArchived,
          )
            ? remembered
            : (d.characters
                .filter((c) => !c.isArchived)
                .sort((a, b) => a.order - b.order)[0]?.id ?? ''),
          mobileTab: 'edit',
          previewOpen: false,
        });
        const position = isMobileEditor() ? readEditorPosition(d) : null;
        useEditorStore
          .getState()
          .selectEpisode(position?.episodeId ?? d.episodes[0]?.id ?? '');
        useEditorStore.setState({
          focusBlockId: null,
          selectedBlockId: position?.blockId ?? null,
        });
        setReadyProjectId(projectId);
      })
      .catch((e) => {
        if (!cancelled) setError(errorMessage(e));
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);
  if (error)
    return (
      <main className="page">
        <h1>{error}</h1>
        <Link to="/">作品一覧へ</Link>
      </main>
    );
  if (loadedProjectId !== projectId || readyProjectId !== projectId)
    return (
      <main className="page" role="status">
        作品を読み込んでいます…
      </main>
    );
  return (
    <div
      className={`editor-app tab-${tab} ${previewOpen ? 'preview-open' : ''}`}
    >
      <SkipLink>編集本文へ移動</SkipLink>
      <EditorHeader />
      <nav className="mobile-tabs" aria-label="編集画面切替">
        {(
          [
            ['edit', '編集'],
            ['preview', 'プレビュー'],
            ['settings', '設定'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            aria-pressed={tab === key}
            onClick={() =>
              useEditorStore.setState({
                mobileTab: key,
                previewOpen: key === 'preview',
              })
            }
          >
            {label}
          </button>
        ))}
      </nav>
      <div className="editor-layout">
        <div className="left-panel">
          <CharacterSidebar />
          <ProjectSettings />
        </div>
        <EditorCanvas />
        <PreviewPane />
      </div>
    </div>
  );
}

import { createElement, memo, useMemo } from 'react';
import type {
  Block,
  Character,
  Episode,
  ProjectDocument,
  Settings,
} from '../domain/types';
import { safeImageUrl, safeLink } from '../utils/safety';
import { publicBlocks, softColor } from './transform';
import { CharacterRenderer } from './CharacterRenderer';
export type RenderOptions = {
  includeImages?: boolean;
  includeMetadata?: boolean;
  includeMemos?: boolean;
};
const RenderBlock = memo(function RenderBlock({
  block,
  character,
  settings,
  themeId,
  includeImages,
}: {
  block: Block;
  character?: Character;
  settings: Settings;
  themeId: string;
  includeImages: boolean;
}) {
  const custom =
    block.customClass
      ?.split(/\s+/)
      .filter((c) => /^[a-zA-Z_][\w-]*$/.test(c))
      .join(' ') ?? '';
  switch (block.type) {
    case 'dialogue': {
      const alignment =
        block.alignment && block.alignment !== 'auto'
          ? block.alignment
          : (character?.position ?? 'left');
      return (
        <section className={`render-dialogue align-${alignment} ${custom}`}>
          <CharacterRenderer
            character={character}
            block={block}
            settings={settings}
            themeId={themeId}
            includeImages={includeImages}
          />
          <div
            className="render-bubble"
            style={{
              backgroundColor: softColor(
                character?.bubbleColor ?? character?.color,
              ),
              borderColor: character?.color ?? '#99ad9b',
            }}
          >
            <p>{block.text}</p>
          </div>
        </section>
      );
    }
    case 'narration':
      return (
        <p
          className={`render-narration narration-${block.style ?? 'normal'} text-${block.align ?? 'left'} ${custom}`}
        >
          {block.text}
        </p>
      );
    case 'heading':
      return createElement(
        `h${block.level}`,
        { className: `render-heading ${custom}` },
        block.text,
      );
    case 'image': {
      if (!includeImages || !safeImageUrl(block.src)) return null;
      const img = (
        <img src={safeImageUrl(block.src)} alt={block.alt} loading="lazy" />
      );
      return (
        <figure
          className={`render-image width-${block.width ?? 'large'} image-${block.align ?? 'center'} ${custom}`}
        >
          {safeLink(block.link) ? (
            <a href={safeLink(block.link)} rel="noopener noreferrer">
              {img}
            </a>
          ) : (
            img
          )}
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      );
    }
    case 'divider':
      return block.style === 'line' ? (
        <hr className={`render-divider ${custom}`} />
      ) : (
        <div
          role="separator"
          className={`render-divider divider-${block.style} ${custom}`}
          aria-label="場面の区切り"
        >
          {block.style === 'dots'
            ? '•••'
            : block.style === 'scene'
              ? '＊　＊　＊'
              : ''}
        </div>
      );
    case 'memo':
      return (
        <aside className={`render-memo ${custom}`}>
          <strong>制作メモ</strong>
          <p>{block.text}</p>
        </aside>
      );
  }
});
export const EpisodeRenderer = memo(function EpisodeRenderer({
  document: doc,
  episode,
  options = {},
}: {
  document: ProjectDocument;
  episode: Episode;
  options?: RenderOptions;
}) {
  const characters = useMemo(
    () => new Map(doc.characters.map((c) => [c.id, c])),
    [doc.characters],
  );
  return (
    <article
      className={`episode-renderer theme-${doc.project.themeId} font-${doc.settings.editor.fontSize} bubble-${doc.settings.rendering.bubbleWidth}`}
      data-testid="episode-renderer"
    >
      <header className="render-header">
        <p className="render-project-name">{doc.project.title}</p>
        <h1>{episode.title}</h1>
        {options.includeMetadata && (
          <time dateTime={episode.updatedAt}>
            {new Date(episode.updatedAt).toLocaleDateString('ja-JP')}
          </time>
        )}
      </header>
      <div className="render-blocks">
        {publicBlocks(episode, options.includeMemos).map((b) => (
          <RenderBlock
            key={b.id}
            block={b}
            character={
              b.type === 'dialogue' ? characters.get(b.characterId) : undefined
            }
            settings={doc.settings}
            themeId={doc.project.themeId}
            includeImages={options.includeImages !== false}
          />
        ))}
      </div>
    </article>
  );
});

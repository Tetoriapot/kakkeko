import type { Character, DialogueBlock, Settings } from '../domain/types';
import { safeImageUrl } from '../utils/safety';
import { characterName, readableColor } from './transform';
export function CharacterRenderer({
  character,
  block,
  settings,
  themeId,
  includeImages = true,
}: {
  character: Character | undefined;
  block: DialogueBlock;
  settings: Settings;
  themeId: string;
  includeImages?: boolean;
}) {
  const name = block.overrideName || characterName(character);
  const image = includeImages
    ? safeImageUrl(block.overrideIcon || character?.icon?.value)
    : undefined;
  const aa = themeId === 'aa-classic' && character?.aaText;
  return (
    <>
      <div
        className={`render-avatar icon-${character?.iconShape ?? settings.rendering.iconShape}`}
        aria-hidden={aa ? undefined : !image}
      >
        {aa ? (
          <span className="aa-text">{aa}</span>
        ) : image ? (
          <img alt={name} src={image} loading="lazy" />
        ) : (
          <span>{name.slice(0, 1)}</span>
        )}
      </div>
      <div className="render-speaker">
        {settings.rendering.showCharacterNames && (
          <strong style={{ color: readableColor(character?.textColor) }}>
            {name}
          </strong>
        )}
        {settings.rendering.showPlayerNames &&
          character?.trpg?.playerName &&
          character.trpg.displayPreset !== 'pc' &&
          character.trpg.displayPreset !== 'player' &&
          character.trpg.displayPreset !== 'gm' && (
            <small>PL: {character.trpg.playerName}</small>
          )}
        {character?.subtitle && <small>{character.subtitle}</small>}
        {block.emotion && (
          <span className="render-emotion">{block.emotion}</span>
        )}
        {settings.rendering.showTimestamps && block.timestamp && (
          <span className="render-timestamp">{block.timestamp}</span>
        )}
      </div>
    </>
  );
}

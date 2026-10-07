import type { Block, Character, Episode } from '../domain/types';
export const publicBlocks = (episode: Episode, includeMemos = false): Block[] =>
  episode.blocks.filter(
    (b) => !b.hidden && (includeMemos || b.type !== 'memo'),
  );
export function characterName(character: Character | undefined): string {
  if (!character) return '匿名の話し手';
  const trpg = character.trpg;
  if (trpg?.displayPreset === 'gm') return 'GM';
  if (trpg?.displayPreset === 'player')
    return trpg.playerName || character.name;
  return trpg?.pcName || character.name;
}
const luminance = (hex: string) => {
  const safe = /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#20332d';
  const rgb = [1, 3, 5]
    .map((i) => parseInt(safe.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
};
export function contrastRatio(a: string, b: string) {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
export function readableColor(
  color: string | undefined,
  background = '#ffffff',
) {
  if (
    color &&
    /^#[0-9a-f]{6}$/i.test(color) &&
    contrastRatio(color, background) >= 4.5
  )
    return color;
  return contrastRatio('#20332d', background) >= 4.5 ? '#20332d' : '#ffffff';
}
export function softColor(color: string | undefined) {
  if (!color || !/^#[0-9a-f]{6}$/i.test(color)) return '#f1f5ef';
  return (
    '#' +
    [1, 3, 5]
      .map((i) =>
        Math.round(parseInt(color.slice(i, i + 2), 16) * 0.2 + 255 * 0.8)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}

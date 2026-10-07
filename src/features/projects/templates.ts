import {
  createBlock,
  createCharacter,
  createDocument,
} from '../../domain/factories';
import type { ThemeId } from '../../domain/types';
export const templates = [
  {
    id: 'blank',
    name: '空の作品',
    description: 'まっさらな会話から',
    symbol: '＋',
  },
  {
    id: 'trpg',
    name: 'TRPGリプレイ',
    description: 'あのセッションを、物語に',
    symbol: '◇',
  },
  {
    id: 'drama',
    name: '会話劇',
    description: 'キャラクターが動き出す',
    symbol: '「」',
  },
  {
    id: 'talk',
    name: '座談会',
    description: '掛け合いを、そのまま記事に',
    symbol: '…',
  },
] as const;
export type TemplateId = (typeof templates)[number]['id'];
export function fromTemplate(
  title: string,
  description: string,
  template: TemplateId,
  theme: ThemeId,
  samples: boolean,
) {
  const doc = createDocument({
    title: title.trim() || '無題の作品',
    description,
    themeId: theme,
  });
  if (samples) {
    doc.characters =
      template === 'trpg'
        ? [
            createCharacter({
              name: 'GM',
              color: '#8B6FE8',
              trpg: { role: 'gm' },
            }),
            createCharacter({
              name: '探索者',
              order: 2,
              trpg: { role: 'player' },
            }),
          ]
        : [
            createCharacter({ name: '話し手 A' }),
            createCharacter({
              name: '話し手 B',
              order: 2,
              position: 'right',
              color: '#C07D39',
            }),
          ];
    doc.episodes[0].blocks = [
      createBlock('dialogue', {
        characterId: doc.characters[0].id,
        text:
          template === 'trpg'
            ? 'それでは、物語をはじめましょう。'
            : 'ここから、会話をはじめましょう。',
      }),
    ];
  }
  return doc;
}

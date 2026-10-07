import type { ThemeId } from '../../domain/types';
export const themes: { id: ThemeId; name: string; description: string }[] = [
  {
    id: 'default-bubble',
    name: 'Default Bubble',
    description: '読みやすい吹き出し',
  },
  {
    id: 'minimal-log',
    name: 'Minimal Log',
    description: 'すっきりとした会話ログ',
  },
  {
    id: 'aa-classic',
    name: 'AA Classic',
    description: 'AAを主役にしたクラシック表示',
  },
  { id: 'trpg-replay', name: 'TRPG Replay', description: 'セッションの記録に' },
  {
    id: 'magazine-talk',
    name: 'Magazine Talk',
    description: '雑誌の対談のように',
  },
];

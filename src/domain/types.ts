export const SCHEMA_VERSION = '1.0.0' as const;
export const APP_VERSION = '0.1.0';
export type ThemeId =
  | 'default-bubble'
  | 'minimal-log'
  | 'aa-classic'
  | 'trpg-replay'
  | 'magazine-talk';
export type Project = {
  id: string;
  title: string;
  description: string;
  slug?: string;
  createdAt: string;
  updatedAt: string;
  themeId: string;
};
export type IconShape = 'circle' | 'rounded' | 'square';
export type Character = {
  id: string;
  name: string;
  reading?: string;
  shortName?: string;
  subtitle?: string;
  icon?: { type: 'dataUrl' | 'url' | 'none'; value?: string };
  aaText?: string;
  color: string;
  bubbleColor?: string;
  textColor?: string;
  position: 'left' | 'right';
  order: number;
  isArchived: boolean;
  trpg?: {
    playerName?: string;
    pcName?: string;
    role?: 'gm' | 'player' | 'npc' | 'other';
    systemName?: string;
    displayPreset?: 'pc' | 'pc-player' | 'player' | 'gm';
  };
  notes?: string;
  iconShape?: IconShape;
  firstPerson?: string;
  tags?: string[];
};
export type BaseBlock = {
  id: string;
  createdAt: string;
  updatedAt: string;
  hidden?: boolean;
  note?: string;
  customClass?: string;
};
export type DialogueBlock = BaseBlock & {
  type: 'dialogue';
  characterId: string;
  text: string;
  emotion?: string;
  alignment?: 'auto' | 'left' | 'right';
  overrideName?: string;
  overrideIcon?: string;
  timestamp?: string;
  replyToBlockId?: string;
};
export type NarrationBlock = BaseBlock & {
  type: 'narration';
  text: string;
  style?: 'normal' | 'emphasis' | 'small';
  align?: 'left' | 'center';
};
export type HeadingBlock = BaseBlock & {
  type: 'heading';
  text: string;
  level: 2 | 3 | 4;
};
export type ImageBlock = BaseBlock & {
  type: 'image';
  src: string;
  alt: string;
  caption?: string;
  width?: 'small' | 'medium' | 'large' | 'full';
  align?: 'left' | 'center' | 'right';
  link?: string;
};
export type DividerBlock = BaseBlock & {
  type: 'divider';
  style: 'line' | 'dots' | 'space' | 'scene';
};
export type MemoBlock = BaseBlock & {
  type: 'memo';
  text: string;
  color?: string;
};
export type Block =
  | DialogueBlock
  | NarrationBlock
  | HeadingBlock
  | ImageBlock
  | DividerBlock
  | MemoBlock;
export type BlockType = Block['type'];
export type Episode = {
  id: string;
  title: string;
  slug: string;
  order: number;
  status: 'draft' | 'ready' | 'published';
  createdAt: string;
  updatedAt: string;
  blocks: Block[];
};
export type Settings = {
  editor: {
    autoSave: boolean;
    autoSaveIntervalMs: number;
    fontSize: 'small' | 'medium' | 'large';
  };
  rendering: {
    showCharacterNames: boolean;
    showPlayerNames: boolean;
    iconShape: IconShape;
    bubbleWidth: 'compact' | 'normal' | 'wide';
    showTimestamps?: boolean;
  };
};
export type ProjectDocument = {
  schemaVersion: typeof SCHEMA_VERSION;
  appVersion: string;
  project: Project;
  characters: Character[];
  episodes: Episode[];
  settings: Settings;
};
export type AppPreferences = {
  appearance: 'light' | 'dark' | 'system';
  confirmDestructive: boolean;
  autoSave: boolean;
  autoSaveIntervalMs: number;
};
export const BLOCK_LABELS: Record<BlockType, string> = {
  dialogue: 'セリフ',
  narration: '地の文',
  heading: '見出し',
  image: '画像',
  divider: '区切り',
  memo: 'メモ',
};

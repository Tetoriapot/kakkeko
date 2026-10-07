# JSON設計

## ルート

```json
{
  "schemaVersion": "1.0.0",
  "appVersion": "0.1.0",
  "project": {},
  "characters": [],
  "episodes": [],
  "settings": {}
}
```

## Project

```ts
type Project = {
  id: string;
  title: string;
  description: string;
  slug?: string;
  createdAt: string;
  updatedAt: string;
  themeId: string;
};
```

## Character

```ts
type Character = {
  id: string;
  name: string;
  reading?: string;
  shortName?: string;
  subtitle?: string;
  icon?: {
    type: "dataUrl" | "url" | "none";
    value?: string;
  };
  aaText?: string;
  color: string;
  bubbleColor?: string;
  textColor?: string;
  position: "left" | "right";
  order: number;
  isArchived: boolean;
  trpg?: {
    playerName?: string;
    pcName?: string;
    role?: "gm" | "player" | "npc" | "other";
    systemName?: string;
  };
  notes?: string;
};
```

## Episode

```ts
type Episode = {
  id: string;
  title: string;
  slug: string;
  order: number;
  status: "draft" | "ready" | "published";
  createdAt: string;
  updatedAt: string;
  blocks: Block[];
};
```

## Block

```ts
type BaseBlock = {
  id: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  hidden?: boolean;
  note?: string;
};

type DialogueBlock = BaseBlock & {
  type: "dialogue";
  characterId: string;
  text: string;
  emotion?: string;
  alignment?: "auto" | "left" | "right";
};

type NarrationBlock = BaseBlock & {
  type: "narration";
  text: string;
  style?: "normal" | "emphasis" | "small";
  align?: "left" | "center";
};

type HeadingBlock = BaseBlock & {
  type: "heading";
  text: string;
  level: 2 | 3 | 4;
};

type ImageBlock = BaseBlock & {
  type: "image";
  src: string;
  alt: string;
  caption?: string;
  width?: "small" | "medium" | "large" | "full";
  align?: "left" | "center" | "right";
};

type DividerBlock = BaseBlock & {
  type: "divider";
  style: "line" | "dots" | "space" | "scene";
};

type MemoBlock = BaseBlock & {
  type: "memo";
  text: string;
  color?: string;
};

type Block =
  | DialogueBlock
  | NarrationBlock
  | HeadingBlock
  | ImageBlock
  | DividerBlock
  | MemoBlock;
```

## Settings

```ts
type Settings = {
  editor: {
    autoSave: boolean;
    autoSaveIntervalMs: number;
    fontSize: "small" | "medium" | "large";
  };
  rendering: {
    showCharacterNames: boolean;
    showPlayerNames: boolean;
    iconShape: "circle" | "rounded" | "square";
    bubbleWidth: "compact" | "normal" | "wide";
  };
};
```

## ID

crypto.randomUUID() を使用。

## バージョン管理

schemaVersionを必須にする。

将来のマイグレーション:
1. JSON読込
2. schemaVersion確認
3. migrate_1_0_to_1_1等を順次適用
4. 現行形式として保存

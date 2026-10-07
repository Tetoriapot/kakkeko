import { APP_VERSION, SCHEMA_VERSION } from './types';
import type {
  Block,
  BlockType,
  Character,
  Episode,
  Project,
  ProjectDocument,
  Settings,
} from './types';

export const createId = () => crypto.randomUUID();
const now = () => new Date().toISOString();
export function createProject(values: Partial<Project> = {}): Project {
  const time = now();
  return {
    id: createId(),
    title: '無題の作品',
    description: '',
    createdAt: time,
    updatedAt: time,
    themeId: 'default-bubble',
    ...values,
  };
}
export function createCharacter(values: Partial<Character> = {}): Character {
  return {
    id: createId(),
    name: '新しいキャラクター',
    color: '#4F8CFF',
    position: 'left',
    order: 1,
    isArchived: false,
    icon: { type: 'none' },
    ...values,
  };
}
export function createEpisode(values: Partial<Episode> = {}): Episode {
  const time = now();
  return {
    id: createId(),
    title: '第1話',
    slug: '01',
    order: 1,
    status: 'draft',
    createdAt: time,
    updatedAt: time,
    blocks: [],
    ...values,
  };
}
export function createSettings(): Settings {
  return {
    editor: { autoSave: true, autoSaveIntervalMs: 1200, fontSize: 'medium' },
    rendering: {
      showCharacterNames: true,
      showPlayerNames: true,
      iconShape: 'circle',
      bubbleWidth: 'normal',
      showTimestamps: false,
    },
  };
}
export function createBlock<T extends BlockType>(
  type: T,
  values?: Partial<Extract<Block, { type: T }>>,
): Extract<Block, { type: T }>;
export function createBlock(
  type: BlockType,
  values: Partial<Block> = {},
): Block {
  const time = now();
  const defaults = {
    dialogue: { characterId: '', text: '', alignment: 'auto' },
    narration: { text: '', style: 'normal', align: 'left' },
    heading: { text: '', level: 2 },
    image: { src: '', alt: '', width: 'large', align: 'center' },
    divider: { style: 'line' },
    memo: { text: '', color: '#fff5cc' },
  } as const;
  return {
    id: createId(),
    createdAt: time,
    updatedAt: time,
    hidden: false,
    ...defaults[type],
    ...values,
    type,
  } as Block;
}
export function createDocument(values: Partial<Project> = {}): ProjectDocument {
  return {
    schemaVersion: SCHEMA_VERSION,
    appVersion: APP_VERSION,
    project: createProject(values),
    characters: [],
    episodes: [createEpisode()],
    settings: createSettings(),
  };
}
export function duplicateDocument(
  source: ProjectDocument,
  title = `${source.project.title} のコピー`,
): ProjectDocument {
  const doc = structuredClone(source);
  doc.project = createProject({
    ...doc.project,
    id: createId(),
    title,
    createdAt: now(),
    updatedAt: now(),
  });
  const ids = new Map<string, string>();
  doc.characters.forEach((c) => {
    const id = createId();
    ids.set(c.id, id);
    c.id = id;
  });
  doc.episodes.forEach((ep) => {
    ep.id = createId();
    ep.createdAt = now();
    ep.updatedAt = now();
    ep.blocks.forEach((b) => {
      const id = createId();
      ids.set(b.id, id);
      b.id = id;
    });
  });
  doc.episodes.forEach((ep) =>
    ep.blocks.forEach((b) => {
      if (b.type === 'dialogue') {
        b.characterId = ids.get(b.characterId) ?? b.characterId;
        if (b.replyToBlockId) b.replyToBlockId = ids.get(b.replyToBlockId);
      }
    }),
  );
  return doc;
}

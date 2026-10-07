import { z } from 'zod';
import { SCHEMA_VERSION } from './types';
import type { ProjectDocument } from './types';
import { safeImageUrl, safeLink } from '../utils/safety';
const text = z.string();
const id = text.min(1);
const time = z.iso.datetime({ offset: true });
const color = text.regex(/^#[0-9a-f]{6}$/i, '色は #RRGGBB 形式にしてください');
const image = text.refine(
  (s) => !s || !!safeImageUrl(s),
  '画像URLの形式が不正です',
);
const link = text.refine(
  (s) => !s || !!safeLink(s),
  'リンクはhttp/httpsで指定してください',
);
const base = {
  id,
  createdAt: time,
  updatedAt: time,
  hidden: z.boolean().optional(),
  note: text.optional(),
  customClass: text.optional(),
};
const blockSchema = z.discriminatedUnion('type', [
  z.object({
    ...base,
    type: z.literal('dialogue'),
    characterId: text,
    text,
    emotion: text.optional(),
    alignment: z.enum(['auto', 'left', 'right']).optional(),
    overrideName: text.optional(),
    overrideIcon: image.optional(),
    timestamp: text.optional(),
    replyToBlockId: text.optional(),
  }),
  z.object({
    ...base,
    type: z.literal('narration'),
    text,
    style: z.enum(['normal', 'emphasis', 'small']).optional(),
    align: z.enum(['left', 'center']).optional(),
  }),
  z.object({
    ...base,
    type: z.literal('heading'),
    text,
    level: z.union([z.literal(2), z.literal(3), z.literal(4)]),
  }),
  z.object({
    ...base,
    type: z.literal('image'),
    src: image,
    alt: text,
    caption: text.optional(),
    width: z.enum(['small', 'medium', 'large', 'full']).optional(),
    align: z.enum(['left', 'center', 'right']).optional(),
    link: link.optional(),
  }),
  z.object({
    ...base,
    type: z.literal('divider'),
    style: z.enum(['line', 'dots', 'space', 'scene']),
  }),
  z.object({ ...base, type: z.literal('memo'), text, color: color.optional() }),
]);
const shape = z.enum(['circle', 'rounded', 'square']);
export const documentSchema = z
  .object({
    schemaVersion: z.literal(SCHEMA_VERSION),
    appVersion: text.min(1),
    project: z.object({
      id,
      title: text,
      description: text,
      slug: text.optional(),
      createdAt: time,
      updatedAt: time,
      themeId: text,
    }),
    characters: z.array(
      z.object({
        id,
        name: text,
        reading: text.optional(),
        shortName: text.optional(),
        subtitle: text.optional(),
        icon: z
          .object({
            type: z.enum(['dataUrl', 'url', 'none']),
            value: image.optional(),
          })
          .optional(),
        aaText: text.optional(),
        color,
        bubbleColor: color.optional(),
        textColor: color.optional(),
        position: z.enum(['left', 'right']),
        order: z.number().int().nonnegative(),
        isArchived: z.boolean(),
        trpg: z
          .object({
            playerName: text.optional(),
            pcName: text.optional(),
            role: z.enum(['gm', 'player', 'npc', 'other']).optional(),
            systemName: text.optional(),
            displayPreset: z
              .enum(['pc', 'pc-player', 'player', 'gm'])
              .optional(),
          })
          .optional(),
        notes: text.optional(),
        iconShape: shape.optional(),
        firstPerson: text.optional(),
        tags: z.array(text).optional(),
      }),
    ),
    episodes: z.array(
      z.object({
        id,
        title: text,
        slug: text
          .min(1)
          .regex(
            /^[\p{L}\p{N}_-]+$/u,
            'slugには文字・数字・ハイフン・アンダースコアを使用してください',
          ),
        order: z.number().int().nonnegative(),
        status: z.enum(['draft', 'ready', 'published']),
        createdAt: time,
        updatedAt: time,
        blocks: z.array(blockSchema),
      }),
    ),
    settings: z.object({
      editor: z.object({
        autoSave: z.boolean(),
        autoSaveIntervalMs: z.number().int().min(200).max(60000),
        fontSize: z.enum(['small', 'medium', 'large']),
      }),
      rendering: z.object({
        showCharacterNames: z.boolean(),
        showPlayerNames: z.boolean(),
        iconShape: shape,
        bubbleWidth: z.enum(['compact', 'normal', 'wide']),
        showTimestamps: z.boolean().optional(),
      }),
    }),
  })
  .superRefine((doc, ctx) => {
    const ids = new Set<string>();
    const entries = [
      ...doc.characters,
      ...doc.episodes,
      ...doc.episodes.flatMap((e) => e.blocks),
    ];
    for (const item of entries) {
      if (ids.has(item.id))
        ctx.addIssue({
          code: 'custom',
          message: `IDが重複しています: ${item.id}`,
        });
      ids.add(item.id);
    }
    const characters = new Set(doc.characters.map((c) => c.id));
    const slugs = new Set<string>();
    doc.episodes.forEach((ep, i) => {
      if (slugs.has(ep.slug))
        ctx.addIssue({
          code: 'custom',
          path: ['episodes', i, 'slug'],
          message: 'slugが重複しています',
        });
      slugs.add(ep.slug);
      ep.blocks.forEach((b, j) => {
        if (
          b.type === 'dialogue' &&
          b.characterId &&
          !characters.has(b.characterId)
        )
          ctx.addIssue({
            code: 'custom',
            path: ['episodes', i, 'blocks', j, 'characterId'],
            message: '参照先のキャラクターが存在しません',
          });
      });
    });
  });
export function validateDocument(input: unknown): ProjectDocument {
  const version =
    input && typeof input === 'object' && 'schemaVersion' in input
      ? input.schemaVersion
      : undefined;
  if (version !== SCHEMA_VERSION)
    throw new Error(
      `未対応のschemaVersionです: ${String(version ?? '未指定')}（対応: ${SCHEMA_VERSION}）`,
    );
  const result = documentSchema.safeParse(input);
  if (!result.success)
    throw new Error(
      result.error.issues
        .map((i) => `${i.path.join('.') || 'document'}: ${i.message}`)
        .join('\n'),
    );
  return result.data;
}

import { describe, expect, it } from 'vitest';
import {
  createBlock,
  createCharacter,
  createDocument,
  createEpisode,
  createId,
  duplicateDocument,
} from '../src/domain/factories';
import { sampleDocument } from '../src/domain/fixtures';
describe('domain factories', () => {
  it('generates unique UUIDs', () => {
    const ids = new Set(Array.from({ length: 1000 }, createId));
    expect(ids.size).toBe(1000);
    expect([...ids][0]).toMatch(
      /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/,
    );
  });
  it('creates independent defaults and applies overrides', () => {
    const a = createDocument({ title: '作品' });
    const b = createDocument();
    expect(a.project.title).toBe('作品');
    expect(a.schemaVersion).toBe('1.0.0');
    expect(a.settings.editor.autoSaveIntervalMs).toBe(1200);
    a.episodes[0].blocks.push(createBlock('memo'));
    expect(b.episodes[0].blocks).toHaveLength(0);
    expect(createCharacter().isArchived).toBe(false);
    expect(createEpisode().status).toBe('draft');
  });
  it('creates all six block types with required fields', () => {
    expect(createBlock('dialogue', { characterId: 'a' }).characterId).toBe('a');
    expect(createBlock('narration').style).toBe('normal');
    expect(createBlock('heading').level).toBe(2);
    expect(createBlock('image').alt).toBe('');
    expect(createBlock('divider').style).toBe('line');
    expect(createBlock('memo').text).toBe('');
  });
  it('copies a project with independent IDs and consistent references', () => {
    const copy = duplicateDocument(sampleDocument);
    expect(copy.project.id).not.toBe(sampleDocument.project.id);
    expect(copy.episodes[0].id).not.toBe(sampleDocument.episodes[0].id);
    const block = copy.episodes[0].blocks[0];
    expect(block.type === 'dialogue' && block.characterId).toBe(
      copy.characters[0].id,
    );
    expect(sampleDocument.characters[0].id).toBe('char_boon');
  });
});

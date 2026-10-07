import { expect, it } from 'vitest';
import { migrateDocument } from '../src/domain/migrations';
import { sampleDocument } from '../src/domain/fixtures';
it('requires schemaVersion and rejects malformed nested data', () => {
  const { schemaVersion: _, ...missing } = sampleDocument;
  void _;
  expect(() => migrateDocument(missing)).toThrow('未指定');
  const corrupt = structuredClone(sampleDocument);
  corrupt.episodes[0].createdAt = 'yesterday';
  expect(() => migrateDocument(corrupt)).toThrow('createdAt');
});
it('rejects executable image URLs and preserves optional extension fields', () => {
  const corrupt = structuredClone(sampleDocument);
  corrupt.characters[0].icon = { type: 'url', value: 'javascript:alert(1)' };
  expect(() => migrateDocument(corrupt)).toThrow('画像URL');
  const valid = structuredClone(sampleDocument);
  valid.characters[0].firstPerson = '僕';
  valid.characters[0].tags = ['主人公'];
  expect(migrateDocument(valid).characters[0].tags).toEqual(['主人公']);
});

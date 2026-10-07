import { expect, it } from 'vitest';
import JSZip from 'jszip';
import { sampleDocument } from '../src/domain/fixtures';
import { createBlock } from '../src/domain/factories';
import {
  exportHtml,
  exportTxt,
  exportJson,
  exportZip,
} from '../src/features/export/exporters';
import { parseImport } from '../src/db/repositories';
const pixel =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==';
it('exports a script-free standalone HTML with escaping and private content excluded', () => {
  const doc = structuredClone(sampleDocument);
  doc.project.title = '<script>bad</script>';
  doc.episodes[0].blocks.push(
    createBlock('memo', { text: 'secret-memo' }),
    createBlock('dialogue', { text: 'hidden-text', hidden: true }),
    createBlock('image', { src: pixel, alt: '画像' }),
  );
  const html = exportHtml(doc);
  expect(html).toContain('<!doctype html>');
  expect(html).toContain('<style>');
  expect(html).toContain('&lt;script&gt;bad&lt;/script&gt;');
  expect(html).toContain(pixel);
  expect(html).not.toMatch(/<script|secret-memo|hidden-text/);
  expect(exportHtml(doc, { includeImages: false })).not.toContain(pixel);
});
it('roundtrips full JSON and exports three TXT formats', () => {
  expect(parseImport(exportJson(sampleDocument))[0]).toEqual(sampleDocument);
  expect(exportTxt(sampleDocument)).toContain('ブーン：');
  expect(exportTxt(sampleDocument, { txtStyle: 'aa' })).toContain(
    '（　＾ω＾）「',
  );
  expect(exportTxt(sampleDocument, { txtStyle: 'script' })).toContain(
    'ブーン\n　',
  );
});
it('packages HTML, CSS, local images and valid previous/next links in ZIP', async () => {
  const doc = structuredClone(sampleDocument);
  doc.episodes[0].blocks.push(
    createBlock('image', { src: pixel, alt: 'test' }),
  );
  doc.episodes.push({
    ...doc.episodes[0],
    id: 'second',
    title: '次の話',
    slug: '02',
    order: 2,
    blocks: [],
  });
  const zip = await JSZip.loadAsync(await exportZip(doc));
  expect(Object.keys(zip.files)).toContain('style.css');
  expect(Object.keys(zip.files)).toContain('assets/image-1.png');
  const html = await zip.file('episode-01.html')!.async('string');
  expect(html).toContain('src="assets/image-1.png"');
  expect(html).toContain('href="episode-02.html"');
  expect(html).not.toContain('data:image');
  expect(await zip.file('index.html')!.async('string')).toContain('目次');
});

import { renderToStaticMarkup } from 'react-dom/server';
import type { Episode, ProjectDocument } from '../../domain/types';
import { EpisodeRenderer } from '../../renderer/EpisodeRenderer';
import type { RenderOptions } from '../../renderer/EpisodeRenderer';
import { characterName, publicBlocks } from '../../renderer/transform';
import { orderedEpisodes } from '../episodes/operations';
import { exportCss } from './styles';
import { safeImageUrl } from '../../utils/safety';
export type ExportOptions = RenderOptions & {
  episodeId?: string;
  bodyOnly?: boolean;
  txtStyle?: 'name' | 'aa' | 'script';
};
export const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  );
const episodesFor = (doc: ProjectDocument, options: ExportOptions) =>
  orderedEpisodes(doc.episodes).filter(
    (e) => !options.episodeId || e.id === options.episodeId,
  );
export const exportJson = (doc: ProjectDocument) =>
  JSON.stringify(doc, null, 2);
export function exportTxt(doc: ProjectDocument, options: ExportOptions = {}) {
  const characters = new Map(doc.characters.map((c) => [c.id, c]));
  const episodes = episodesFor(doc, options).map(
    (ep) =>
      `${ep.title}\n${'─'.repeat(24)}\n\n` +
      publicBlocks(ep, options.includeMemos)
        .map((b) => {
          switch (b.type) {
            case 'dialogue': {
              const c = characters.get(b.characterId);
              const name = b.overrideName || characterName(c);
              return options.txtStyle === 'aa'
                ? `${c?.aaText || name}「${b.text}」`
                : options.txtStyle === 'script'
                  ? `${name}\n　${b.text.replaceAll('\n', '\n　')}`
                  : `${name}：${b.text}`;
            }
            case 'narration':
            case 'heading':
              return b.text;
            case 'image':
              return options.includeImages === false
                ? ''
                : `[画像: ${b.alt}]${b.caption ? '\n' + b.caption : ''}`;
            case 'divider':
              return b.style === 'space' ? '\n' : '＊　＊　＊';
            case 'memo':
              return `［制作メモ］${b.text}`;
          }
        })
        .filter(Boolean)
        .join('\n\n'),
  );
  return `${doc.project.title}\n${options.includeMetadata ? doc.project.description + '\n' : ''}\n${episodes.join('\n\n\n')}`;
}
function tableOfContents(
  doc: ProjectDocument,
  episodes: Episode[],
  href: (e: Episode) => string,
  current?: string,
) {
  return (
    <details className="episode-toc" id="contents" open>
      <summary>目次</summary>
      <p>{doc.project.description}</p>
      <ol>
        {episodes.map((e) => (
          <li key={e.id}>
            <a
              href={href(e)}
              aria-current={e.id === current ? 'page' : undefined}
            >
              {e.title}
            </a>
          </li>
        ))}
      </ol>
    </details>
  );
}
function navigation(
  episodes: Episode[],
  index: number,
  href: (e: Episode) => string,
  toc = '#contents',
) {
  return (
    <nav className="episode-navigation" aria-label="話数ナビゲーション">
      {index > 0 ? <a href={href(episodes[index - 1])}>← 前の話</a> : <span />}
      <span>
        {index + 1} / {episodes.length}
      </span>
      <a href={toc}>目次</a>
      {index < episodes.length - 1 ? (
        <a href={href(episodes[index + 1])}>次の話 →</a>
      ) : (
        <span />
      )}
    </nav>
  );
}
function wrapHtml(
  doc: ProjectDocument,
  body: string,
  options: ExportOptions,
  cssHref?: string,
) {
  if (options.bodyOnly) return body;
  return `<!doctype html>\n<html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(doc.project.title)}</title>${options.includeMetadata ? `<meta name="description" content="${escapeHtml(doc.project.description)}">` : ''}${cssHref ? `<link rel="stylesheet" href="${cssHref}">` : `<style>${exportCss}</style>`}</head><body><main>${body}</main></body></html>`;
}
export function exportHtml(doc: ProjectDocument, options: ExportOptions = {}) {
  const episodes = episodesFor(doc, options);
  const href = (ep: Episode) => `#episode-${episodes.indexOf(ep) + 1}`;
  const body = renderToStaticMarkup(
    <>
      {tableOfContents(doc, episodes, href)}
      {episodes.map((ep, i) => (
        <section key={ep.id} id={`episode-${i + 1}`}>
          <EpisodeRenderer document={doc} episode={ep} options={options} />
          {navigation(episodes, i, href)}
        </section>
      ))}
    </>,
  );
  return wrapHtml(doc, body, options);
}
// Resolve remote URLs before export so generated files can be read offline.
export async function embedExportImages(
  source: ProjectDocument,
  options: ExportOptions = {},
): Promise<ProjectDocument> {
  const doc = structuredClone(source);
  if (options.includeImages === false) return doc;
  const urls = new Set<string>();
  const used = new Set<string>();
  const episodes = episodesFor(doc, options);
  for (const ep of episodes)
    for (const b of publicBlocks(ep, options.includeMemos)) {
      if (b.type === 'image' && safeImageUrl(b.src)) urls.add(b.src);
      if (b.type === 'dialogue') {
        used.add(b.characterId);
        if (b.overrideIcon && safeImageUrl(b.overrideIcon))
          urls.add(b.overrideIcon);
      }
    }
  doc.characters
    .filter((c) => used.has(c.id) && c.icon?.type !== 'none')
    .forEach((c) => {
      if (c.icon?.value && safeImageUrl(c.icon.value)) urls.add(c.icon.value);
    });
  const converted = new Map<string, string>();
  for (const url of urls) {
    if (url.startsWith('data:')) continue;
    try {
      const response = await fetch(url, {
        credentials: 'omit',
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const blob = await response.blob();
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      if (!safeImageUrl(data)) throw new Error('非対応の画像形式');
      converted.set(url, data);
    } catch {
      throw new Error(
        '外部画像を埋め込めませんでした。画像ファイルをアップロードし直すか「画像を含める」をオフにしてください。',
      );
    }
  }
  doc.characters.forEach((c) => {
    if (c.icon?.value && converted.has(c.icon.value))
      c.icon = { type: 'dataUrl', value: converted.get(c.icon.value)! };
  });
  doc.episodes.forEach((ep) =>
    ep.blocks.forEach((b) => {
      if (b.type === 'image' && converted.has(b.src))
        b.src = converted.get(b.src)!;
      if (
        b.type === 'dialogue' &&
        b.overrideIcon &&
        converted.has(b.overrideIcon)
      )
        b.overrideIcon = converted.get(b.overrideIcon)!;
    }),
  );
  return doc;
}
export async function exportZip(
  doc: ProjectDocument,
  options: ExportOptions = {},
) {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  const episodes = episodesFor(doc, options);
  const files = new Map(
    episodes.map((e, i) => [
      e.id,
      `episode-${String(i + 1).padStart(2, '0')}.html`,
    ]),
  );
  const href = (e: Episode) => files.get(e.id)!;
  const assets = new Map<string, string>();
  const extract = (html: string) =>
    html.replace(
      /src="(data:image\/(png|jpeg|gif|webp|avif);base64,([A-Za-z0-9+/=\s]+))"/g,
      (_match, source: string, ext: string, base64: string) => {
        let filename = assets.get(source);
        if (!filename) {
          filename = `assets/image-${assets.size + 1}.${ext === 'jpeg' ? 'jpg' : ext}`;
          assets.set(source, filename);
          zip.file(filename, base64.replace(/\s/g, ''), { base64: true });
        }
        return `src="${filename}"`;
      },
    );
  zip.file('style.css', exportCss);
  zip.file(
    'index.html',
    wrapHtml(
      doc,
      renderToStaticMarkup(tableOfContents(doc, episodes, href)),
      { ...options, bodyOnly: false },
      'style.css',
    ),
  );
  episodes.forEach((ep, i) => {
    const body = renderToStaticMarkup(
      <>
        <EpisodeRenderer document={doc} episode={ep} options={options} />
        {navigation(episodes, i, href, 'index.html#contents')}
      </>,
    );
    zip.file(
      href(ep),
      extract(
        wrapHtml(doc, body, { ...options, bodyOnly: false }, 'style.css'),
      ),
    );
  });
  return zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
}

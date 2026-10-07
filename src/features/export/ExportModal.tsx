import { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { useProjectStore } from '../../stores/projectStore';
import { useEditorStore } from '../../stores/editorStore';
import { downloadBlob, downloadText, safeFilename } from '../../utils/download';
import { errorMessage } from '../../utils/safety';
import { downloadProjectBackup } from './backup';
import { BackupStatus } from '../../components/common/BackupStatus';
export function ExportModal({ onClose }: { onClose: () => void }) {
  const doc = useProjectStore((s) => s.document);
  const episodeId = useEditorStore((s) => s.episodeId);
  const [format, setFormat] = useState('html');
  const [scope, setScope] = useState('all');
  const [htmlType, setHtmlType] = useState('standalone');
  const [txtStyle, setTxtStyle] = useState<'name' | 'aa' | 'script'>('name');
  const [images, setImages] = useState(true);
  const [metadata, setMetadata] = useState(true);
  const [excludeMemos, setExcludeMemos] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  if (!doc) return null;
  return (
    <Modal title="作品を書き出す" onClose={onClose}>
      <form
        className="form-stack"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setMessage('');
          try {
            const exporter = await import('./exporters');
            const options = {
              episodeId:
                scope === 'current' ? (episodeId ?? undefined) : undefined,
              includeImages: images,
              includeMetadata: metadata,
              includeMemos: !excludeMemos,
              txtStyle,
              bodyOnly: htmlType === 'body',
            };
            const name = safeFilename(doc.project.title);
            if (format === 'json') downloadProjectBackup(doc);
            else if (format === 'txt')
              downloadText(
                exporter.exportTxt(doc, options),
                `${name}.txt`,
                'text/plain',
              );
            else {
              const prepared = await exporter.embedExportImages(doc, options);
              if (htmlType === 'zip') {
                const data = await exporter.exportZip(prepared, options);
                downloadBlob(
                  new Blob([new Uint8Array(data)], { type: 'application/zip' }),
                  `${name}.zip`,
                );
              } else
                downloadText(
                  exporter.exportHtml(prepared, options),
                  `${name}.html`,
                  'text/html',
                );
            }
            setMessage('書き出しました');
          } catch (err) {
            setMessage(errorMessage(err));
          } finally {
            setBusy(false);
          }
        }}
      >
        <BackupStatus project={doc.project} />
        <p className="muted">
          JSON出力日時はダウンロード開始時の記録です。保存先のファイルも確認してください。
        </p>
        <label>
          書き出し形式
          <select
            aria-label="書き出し形式"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            <option value="html">HTML</option>
            <option value="txt">TXT</option>
            <option value="json">JSON（作品全体のバックアップ）</option>
          </select>
        </label>
        {format !== 'json' && (
          <>
            <label>
              対象
              <select value={scope} onChange={(e) => setScope(e.target.value)}>
                <option value="all">全エピソード</option>
                <option value="current" disabled={!episodeId}>
                  現在のエピソード
                </option>
              </select>
            </label>
            {format === 'html' ? (
              <label>
                HTML形式
                <select
                  value={htmlType}
                  onChange={(e) => setHtmlType(e.target.value)}
                >
                  <option value="standalone">
                    単一HTML（CSS・画像埋め込み）
                  </option>
                  <option value="zip">CSS・画像同梱ZIP</option>
                  <option value="body">本文のみ</option>
                </select>
              </label>
            ) : (
              <label>
                TXT形式
                <select
                  value={txtStyle}
                  onChange={(e) =>
                    setTxtStyle(e.target.value as typeof txtStyle)
                  }
                >
                  <option value="name">キャラ名付き</option>
                  <option value="aa">AA形式</option>
                  <option value="script">台本形式</option>
                </select>
              </label>
            )}
            <label className="check">
              <input
                type="checkbox"
                checked={images}
                onChange={(e) => setImages(e.target.checked)}
              />
              画像を含める
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={metadata}
                onChange={(e) => setMetadata(e.target.checked)}
              />
              メタデータを含める
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={excludeMemos}
                onChange={(e) => setExcludeMemos(e.target.checked)}
              />
              非公開メモを除外
            </label>
          </>
        )}
        {format === 'json' && (
          <p className="muted">
            メモ・非表示ブロック・画像を含む、作品全体を保存します。
          </p>
        )}
        {format === 'html' && (
          <p className="muted">
            JavaScriptなしで読めるHTMLです。本文のみの場合、テーマのCSSは含まれません。
          </p>
        )}
        <p
          role="status"
          className={
            message && !message.includes('書き出しました') ? 'error-box' : ''
          }
        >
          {message}
        </p>
        <div className="modal-footer">
          <button type="button" onClick={onClose}>
            閉じる
          </button>
          <button type="submit" className="primary" disabled={busy}>
            {busy ? '書き出し中…' : 'ダウンロード'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

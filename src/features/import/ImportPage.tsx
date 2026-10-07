import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SiteHeader } from '../../components/common/SiteHeader';
import { parseImport, projectRepository } from '../../db/repositories';
import type { ProjectDocument } from '../../domain/types';
import { errorMessage } from '../../utils/safety';
export function ImportPage() {
  const [docs, setDocs] = useState<ProjectDocument[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  return (
    <>
      <SiteHeader />
      <main id="main" className="page narrow">
        <p className="eyebrow">IMPORT</p>
        <h1>作品を読み込む</h1>
        <p className="muted">
          KAKKEKO
          JSON、または全データバックアップを選択してください。新しい作品として追加します。
        </p>
        <label className="upload-zone">
          JSONファイル
          <input
            aria-label="JSONファイル"
            type="file"
            accept=".json,application/json"
            disabled={busy}
            onChange={async (e) => {
              setError('');
              setDocs([]);
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                setDocs(parseImport(await file.text()));
              } catch (err) {
                setError(errorMessage(err));
              }
            }}
          />
        </label>
        {error && (
          <pre className="error-box" role="alert">
            {error}
          </pre>
        )}
        {docs.length > 0 && (
          <section className="panel">
            <h2>読み込み内容</h2>
            {docs.map((d) => (
              <div key={d.project.id}>
                <h3>{d.project.title}</h3>
                <p>
                  {d.episodes.length}話 / {d.characters.length}キャラクター
                </p>
                <p className="muted">
                  {d.characters.map((c) => c.name).join('、') ||
                    'キャラクターなし'}
                </p>
              </div>
            ))}
            <button
              className="primary"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  const imported = await projectRepository.importAll(docs);
                  navigate(
                    imported.length === 1
                      ? `/editor/${imported[0].project.id}`
                      : '/',
                  );
                } catch (err) {
                  setError(errorMessage(err));
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? '読み込み中…' : `${docs.length}作品をインポート`}
            </button>
          </section>
        )}
      </main>
    </>
  );
}

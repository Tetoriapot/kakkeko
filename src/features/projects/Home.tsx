import { SiteHeader } from '../../components/common/SiteHeader';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { projectRepository } from '../../db/repositories';
import type { ProjectDocument } from '../../domain/types';
import { duplicateDocument } from '../../domain/factories';
import { sampleDocument } from '../../domain/fixtures';
import { errorMessage } from '../../utils/safety';
import { downloadProjectBackup } from '../export/backup';
import { BackupStatus } from '../../components/common/BackupStatus';
import { confirmAction } from '../../stores/feedbackStore';
import { autosaver } from '../../db/autosave';
import { CreateProjectModal } from './CreateProjectModal';
import { templates } from './templates';
import type { TemplateId } from './templates';
export function Home() {
  const [docs, setDocs] = useState<ProjectDocument[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState<TemplateId | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const refresh = useCallback(async () => {
    try {
      await autosaver.flush().catch((error) => setError(errorMessage(error)));
      setDocs(await projectRepository.list());
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoaded(true);
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  useEffect(() => {
    if (params.has('create')) {
      setCreating('blank');
      setParams({}, { replace: true });
    }
  }, [params, setParams]);
  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await action();
      await refresh();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <SiteHeader />
      <main id="main" className="page home-page">
        <div className="page-heading">
          <div>
            <p className="eyebrow">YOUR WORKSPACE</p>
            <h1>作品一覧</h1>
            <p className="muted">会話でつくる、物語と記事。</p>
          </div>
          <button className="primary" onClick={() => setCreating('blank')}>
            ＋ 新規作品
          </button>
        </div>
        {error && (
          <p role="alert" className="error-box">
            {error}
          </p>
        )}
        {!loaded ? (
          <p role="status">作品を読み込んでいます…</p>
        ) : docs.length === 0 ? (
          <section className="empty-hero">
            <span className="hero-symbol" aria-hidden="true">
              「　」
            </span>
            <p className="eyebrow">A STORY STARTS WITH A VOICE</p>
            <h2>最初の会話作品をつくる</h2>
            <p>
              ひとことから、物語が動き出す。
              <br />
              キャラクターを選択して会話を作成できます。
            </p>
          </section>
        ) : (
          <>
            <div className="list-label">
              <span>{docs.length} 作品</span>
              <span>最終更新順</span>
            </div>
            <div className="project-grid">
              {docs.map((d) => (
                <article className="project-card" key={d.project.id}>
                  <div
                    className={`project-cover theme-cover-${d.project.themeId}`}
                  >
                    <span aria-hidden="true">「</span>
                    <p>{d.project.title}</p>
                    <span className="cover-close" aria-hidden="true">
                      」
                    </span>
                  </div>
                  <div className="project-card-body">
                    <div className="card-meta">
                      <span className="badge">ローカル保存</span>
                      <time dateTime={d.project.updatedAt}>
                        {new Intl.DateTimeFormat('ja-JP', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        }).format(new Date(d.project.updatedAt))}
                      </time>
                    </div>
                    <h2>{d.project.title}</h2>
                    <p className="card-description">
                      {d.project.description || 'まだ説明はありません'}
                    </p>
                    <BackupStatus project={d.project} />
                    <p className="muted">
                      {d.episodes.length} エピソード{' '}
                      <span aria-hidden="true">·</span> {d.characters.length}{' '}
                      キャラクター
                    </p>
                    <div className="card-actions">
                      <Link
                        className="button primary"
                        to={`/editor/${d.project.id}`}
                      >
                        続きを編集 →
                      </Link>
                      <details className="card-menu">
                        <summary aria-label={`${d.project.title}の操作`}>
                          •••
                        </summary>
                        <div>
                          <button
                            disabled={busy}
                            onClick={() =>
                              void run(async () => {
                                await projectRepository.save(
                                  duplicateDocument(d),
                                );
                              })
                            }
                          >
                            複製
                          </button>
                          <button
                            onClick={() => {
                              try {
                                downloadProjectBackup(d);
                              } catch (err) {
                                setError(errorMessage(err));
                              }
                            }}
                          >
                            JSON書き出し
                          </button>
                          <button
                            className="danger"
                            disabled={busy}
                            onClick={async () => {
                              if (
                                await confirmAction(
                                  `「${d.project.title}」を削除しますか？`,
                                )
                              )
                                void run(() =>
                                  projectRepository.remove(d.project.id),
                                );
                            }}
                          >
                            削除
                          </button>
                        </div>
                      </details>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
        <section className="templates-section">
          <div className="section-heading">
            <h2>テンプレートからはじめる</h2>
            <span className="muted">書きたいものに合わせて</span>
          </div>
          <div className="template-grid">
            {templates.map((t) => (
              <button
                key={t.id}
                className="template-card"
                onClick={() => setCreating(t.id)}
              >
                <span className="template-symbol" aria-hidden="true">
                  {t.symbol}
                </span>
                <span>
                  <strong>{t.name}</strong>
                  <small>{t.description}</small>
                </span>
                <span className="template-arrow" aria-hidden="true">
                  ↗
                </span>
              </button>
            ))}
          </div>
        </section>
        <footer className="home-footer">
          <p>作品は、このブラウザーに保存されます。</p>
          <div className="actions">
            <Link to="/import">JSONをインポート</Link>
            <button
              className="text-button"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  const d = duplicateDocument(
                    sampleDocument,
                    sampleDocument.project.title,
                  );
                  await projectRepository.save(d);
                  navigate(`/editor/${d.project.id}`);
                })
              }
            >
              サンプル作品を開く ↗
            </button>
          </div>
        </footer>
      </main>
      {creating && (
        <CreateProjectModal
          initial={creating}
          onClose={() => setCreating(null)}
          onCreated={(id) => navigate(`/editor/${id}`)}
        />
      )}
    </>
  );
}

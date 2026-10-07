import { useEffect, useState } from 'react';
import { SiteHeader } from '../../components/common/SiteHeader';
import { useSettingsStore } from '../../stores/settingsStore';
import { projectRepository } from '../../db/repositories';
import { downloadFullBackup } from '../export/backup';
import { useBackupStore } from '../../stores/backupStore';
import { errorMessage } from '../../utils/safety';
import { confirmAction } from '../../stores/feedbackStore';
import { useProjectStore } from '../../stores/projectStore';
import { autosaver } from '../../db/autosave';
export function SettingsPage() {
  const { preferences, update } = useSettingsStore();
  const [usage, setUsage] = useState('確認中…');
  const [message, setMessage] = useState('');
  const { lastFull, reminderDays, setReminder } = useBackupStore();
  useEffect(() => {
    navigator.storage
      ?.estimate?.()
      .then((s) =>
        setUsage(
          `${((s.usage ?? 0) / 1024 / 1024).toFixed(1)} MB / ${((s.quota ?? 0) / 1024 / 1024).toFixed(0)} MB`,
        ),
      )
      .catch(() => setUsage('このブラウザーでは取得できません'));
    if (!navigator.storage?.estimate)
      setUsage('このブラウザーでは取得できません');
  }, []);
  return (
    <>
      <SiteHeader />
      <main id="main" className="page narrow">
        <p className="eyebrow">PREFERENCES</p>
        <h1>設定</h1>
        <section className="panel form-stack">
          <h2>表示と保存</h2>
          <label>
            外観
            <select
              value={preferences.appearance}
              onChange={(e) =>
                update({
                  appearance: e.target.value as typeof preferences.appearance,
                })
              }
            >
              <option value="light">ライト</option>
              <option value="dark">ダーク</option>
              <option value="system">システム</option>
            </select>
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={preferences.autoSave}
              onChange={(e) => update({ autoSave: e.target.checked })}
            />
            新規作品で自動保存を使う
          </label>
          <label>
            新規作品の保存頻度
            <select
              value={preferences.autoSaveIntervalMs}
              onChange={(e) =>
                update({ autoSaveIntervalMs: Number(e.target.value) })
              }
            >
              <option value={600}>0.6秒</option>
              <option value={1200}>1.2秒</option>
              <option value={3000}>3秒</option>
            </select>
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={preferences.confirmDestructive}
              onChange={(e) => update({ confirmDestructive: e.target.checked })}
            />
            削除前に確認する
          </label>
        </section>
        <section className="panel">
          <h2>データ管理</h2>
          <p>ブラウザーの使用量: {usage}</p>
          <p>
            {lastFull
              ? `最終全作品JSON出力: ${new Date(lastFull.exportedAt).toLocaleString('ja-JP')}（${lastFull.count}作品）`
              : '全作品JSONバックアップ: 未出力'}
          </p>
          <p className="muted">
            出力日時はダウンロード開始時の記録です。保存先のファイルも確認してください。
          </p>
          <label className="backup-preference">
            バックアップのリマインダー
            <select
              value={reminderDays}
              onChange={(e) => setReminder(Number(e.target.value))}
            >
              <option value={0}>通知しない</option>
              <option value={7}>
                未出力、または変更があり前回出力から7日経過
              </option>
              <option value={30}>
                未出力、または変更があり前回出力から30日経過
              </option>
            </select>
          </label>
          <p className="muted">
            有効にすると、作品一覧と編集画面内に案内を表示します。
          </p>
          <div className="actions">
            <button
              onClick={async () => {
                try {
                  await downloadFullBackup();
                  setMessage('バックアップを書き出しました');
                } catch (e) {
                  setMessage(errorMessage(e));
                }
              }}
            >
              全データJSONバックアップ
            </button>
            <button
              className="danger"
              onClick={async () => {
                if (
                  !(await confirmAction(
                    '全作品を削除します。元に戻せません。バックアップを取得しましたか？',
                    true,
                  ))
                )
                  return;
                try {
                  await autosaver.flush().catch(() => {});
                  await projectRepository.clear();
                  useProjectStore.getState().clear();
                  setMessage('全作品を削除しました');
                } catch (e) {
                  setMessage(errorMessage(e));
                }
              }}
            >
              全データ削除
            </button>
          </div>
          <p role="status">{message}</p>
        </section>
        <section className="panel">
          <h2>キーボードショートカット</h2>
          <dl className="shortcuts">
            <dt>Ctrl / Cmd + Enter</dt>
            <dd>次のセリフ</dd>
            <dt>Alt + 1〜9</dt>
            <dd>指定キャラのセリフを追加</dd>
            <dt>Ctrl / Cmd + Shift + N</dt>
            <dd>地の文を追加</dd>
            <dt>Ctrl / Cmd + Z</dt>
            <dd>Undo</dd>
            <dt>Ctrl / Cmd + Shift + Z</dt>
            <dd>Redo</dd>
            <dt>Ctrl / Cmd + S</dt>
            <dd>保存</dd>
            <dt>Escape</dt>
            <dd>ダイアログを閉じる</dd>
          </dl>
        </section>
      </main>
    </>
  );
}

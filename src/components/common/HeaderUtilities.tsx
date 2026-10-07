import { useState } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { HelpContent } from './HelpContent';
import { Modal } from './Modal';
import { useMatch } from 'react-router-dom';
import { useGuideStore } from '../../stores/guideStore';
import { useEditorStore } from '../../stores/editorStore';

export function HeaderUtilities() {
  const [dialog, setDialog] = useState<'updates' | 'help' | null>(null);
  const appearance = useSettingsStore((s) => s.preferences.appearance);
  const update = useSettingsStore((s) => s.update);
  const editor = useMatch('/editor/:projectId');

  return (
    <>
      <div className="header-utilities" role="group" aria-label="共通メニュー">
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => setDialog('updates')}
        >
          更新情報
        </button>
        <select
          aria-label="表示モード"
          title="表示モード（自動は端末の設定に従います）"
          value={appearance}
          onChange={(e) =>
            update({ appearance: e.target.value as typeof appearance })
          }
        >
          <option value="light">ライト</option>
          <option value="dark">ダーク</option>
          <option value="system">自動</option>
        </select>
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => setDialog('help')}
        >
          Help
        </button>
      </div>
      {dialog === 'updates' && (
        <Modal title="更新情報" onClose={() => setDialog(null)}>
          <div className="update-history">
            <section>
              <time dateTime="2026-10-05">2026年10月5日</time>
              <h3>制作を続けやすくする4つの機能</h3>
              <ul>
                <li>
                  新規作品でキャラクター登録からプレビューまでの操作ガイドを表示します。
                </li>
                <li>
                  最終JSON出力日時と出力後の変更を表示します。設定からバックアップのリマインダーも選べます。
                </li>
                <li>
                  「作品内を検索」で全エピソードを横断検索し、該当箇所へ移動できます。
                </li>
                <li>スマホでは最後のエピソードと編集位置から再開できます。</li>
              </ul>
            </section>
            <section>
              <time dateTime="2026-10-05">2026年10月5日</time>
              <h3>右上から使える共通メニュー</h3>
              <ul>
                <li>
                  更新情報とHelpを、作業中の画面で開けるようになりました。
                </li>
                <li>ライト・ダーク・自動の表示モードを右上から選べます。</li>
              </ul>
            </section>
            <section>
              <time dateTime="2026-10-02">2026年10月2日</time>
              <h3>ローカルで会話作品をつくる基本機能</h3>
              <ul>
                <li>
                  作品・キャラクター・エピソードと6種類のブロックを編集できます。
                </li>
                <li>5種類のテーマ、PC・スマホのプレビューに対応しました。</li>
                <li>
                  ブラウザー内の自動保存とJSON・TXT・HTML・ZIPの書き出しに対応しました。
                </li>
              </ul>
            </section>
          </div>
        </Modal>
      )}
      {dialog === 'help' && (
        <Modal title="Help・使い方" onClose={() => setDialog(null)}>
          <HelpContent />
          {editor?.params.projectId && (
            <button
              onClick={() => {
                useGuideStore.getState().start(editor.params.projectId!);
                useEditorStore.setState({
                  mobileTab: 'edit',
                  previewOpen: false,
                });
                setDialog(null);
                requestAnimationFrame(() =>
                  requestAnimationFrame(() =>
                    document
                      .querySelector('.getting-started')
                      ?.scrollIntoView({ block: 'start' }),
                  ),
                );
              }}
            >
              操作ガイドを開く
            </button>
          )}
        </Modal>
      )}
    </>
  );
}

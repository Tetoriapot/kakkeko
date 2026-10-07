# TASKS.md

Codexは上から順番に実装する。
各Phase終了時にテストし、壊れた状態のまま次へ進まない。

# 0. 初期セットアップ

- [x] Vite + React + TypeScript
- [x] ESLint
- [x] Prettier
- [x] Vitest
- [x] Playwright
- [x] CSS reset
- [x] srcディレクトリ整理
- [x] strict TypeScript
- [x] README起動手順作成

完了条件:
npm run dev / build / test が成功。

# 1. ドメイン型

- [x] Project型
- [x] Character型
- [x] Episode型
- [x] Block union型
- [x] Settings型
- [x] schemaVersion
- [x] factory関数
- [x] sample fixture

テスト:
- [x] 各factory
- [x] ID生成
- [x] 初期値

# 2. 状態管理

Zustand推奨。

- [x] projectStore
- [x] characterStore
- [x] episodeStore
- [x] editorStore
- [x] settingsStore
- [x] Undo/Redo history

履歴対象:
- ブロック追加
- 編集
- 削除
- 並び替え
- キャラ変更

# 3. 保存層

- [x] IndexedDB
- [x] projects
- [x] autosave
- [x] debounce
- [x] save status indicator
- [x] JSON full backup
- [x] import validation

異常系:
- [x] 容量不足
- [x] JSON破損
- [x] 未知schemaVersion

# 4. App Shell

- [x] Router
- [x] Home
- [x] Editor
- [x] Settings
- [x] Import
- [x] NotFound

# 5. 作品一覧

- [x] カード
- [x] 新規作成
- [x] 複製
- [x] 削除
- [x] 最終更新表示
- [x] 空状態

# 6. 編集画面3カラム

- [x] Header
- [x] CharacterSidebar
- [x] EditorCanvas
- [x] PreviewPane
- [x] responsive layout

# 7. キャラクターCRUD

- [x] 一覧
- [x] 追加
- [x] 編集
- [x] アーカイブ
- [x] 発言あり削除ガード
- [x] 並べ替え
- [x] アイコン画像
- [x] カラー
- [x] TRPG項目
- [x] AA

# 8. ブロックエディタ

以下を個別コンポーネント化。

- [x] DialogueBlockEditor
- [x] NarrationBlockEditor
- [x] HeadingBlockEditor
- [x] ImageBlockEditor
- [x] DividerBlockEditor
- [x] MemoBlockEditor

共通:
- [x] BlockShell
- [x] drag handle
- [x] move up/down
- [x] duplicate
- [x] delete
- [x] hidden

# 9. 高速会話入力

- [x] 最後に使ったキャラ記憶
- [x] Ctrl/Cmd+Enter
- [x] Alt+1〜9
- [x] キャラ選択ポップオーバー
- [x] 追加後自動focus
- [x] IME誤爆対策

# 10. 並べ替え

推奨:
dnd-kit

- [x] mouse
- [x] touch
- [x] keyboard
- [x] 自動スクロール
- [x] Undo対応

# 11. プレビューエンジン

EditorとRendererを分離。

- [x] EpisodeRenderer
- [x] CharacterRenderer
- [x] 6ブロック
- [x] PC preview
- [x] mobile preview
- [x] hidden block除外
- [x] memo除外

# 12. テーマ

CSS Variables中心。

- [x] Default Bubble
- [x] Minimal Log
- [x] AA Classic
- [x] TRPG Replay
- [x] Magazine Talk

要件:
データ形式を変えずに切替可能。

# 13. エピソード管理

- [x] CRUD
- [x] reorder
- [x] slug
- [x] draft status
- [x] 前後話算出
- [x] episode menu

# 14. 書き出し

- [x] JSON export
- [x] JSON import
- [x] TXT export
- [x] standalone HTML
- [x] ZIP HTML + CSS + assets

Standalone HTML:
JavaScript不要でも読める形式を基本にする。

# 15. アクセシビリティ

- [x] semantic HTML
- [x] focus ring
- [x] keyboard operation
- [x] label
- [x] contrast
- [x] reduced motion
- [x] aria-live save status

# 16. エラーUI

- [x] ErrorBoundary
- [x] Toast
- [x] ConfirmDialog
- [x] destructive button style
- [x] import error report

# 17. テスト

Unit:
- [x] migrations
- [x] stores
- [x] export functions
- [x] render transformations

E2E:
- [x] 新規作品
- [x] キャラ作成
- [x] セリフ追加
- [x] 地の文追加
- [x] 並び替え
- [x] リロード後保持
- [x] HTML出力
- [x] JSON export→import

# 18. パフォーマンス

- [x] 1000ブロック動作確認
- [x] unnecessary rerender調査
- [x] autosave debounce
- [x] image size warning
- [x] preview throttling

目安:
1000ブロック程度までは通常編集可能。

# 19. スマホ

- [x] 1カラム
- [x] tab navigation
- [x] preview drawer
- [x] character quick selector
- [x] bottom add bar
- [x] 44px以上タップ領域

# 20. 最終確認

- [x] npm run build
- [x] npm run test
- [x] playwright
- [x] console error 0
- [x] broken button 0
- [x] README更新
- [x] sample project付属
- [x] LICENSE検討

# 追加依頼: 優先改善（2026-10-05）

提示した優先順位に従い、各項目のbuild / test成功後に次へ進む。

- [x] 1. 初回操作ガイド（キャラクター登録→セリフ入力→プレビュー、Helpから再表示）
- [x] 2. バックアップ状況（最終JSON出力、出力後の変更、任意のアプリ内リマインダー）
- [x] 3. 長編の検索（全エピソード横断検索、該当編集箇所への移動）
- [x] 4. スマホの編集再開（作品別のエピソード・ブロック・スクロール位置復元）
- [x] 統合build / unit / E2E / lint / format確認

# 追加依頼: GitHub Pages公開（2026-10-07）

- [x] Tetoriapot/kakkekoの公開リポジトリを作成
- [x] 検証成功後にdistを公開するGitHub Actionsを追加
- [x] lint / format / unit / production build / E2E確認
- [x] GitHub Pagesを有効化し、公開処理の成功を確認
- [x] 公開URLで起動・編集・保存・再読込・書き出し・スマホ表示を確認
- [x] READMEの公開・データ移行手順を更新し、日本語を確認

公開URL: https://tetoriapot.github.io/kakkeko/
GitHub Actionsでも単体テスト36件・E2E19件・lint・format・production buildが成功。
公開環境でHTMLとJSONの出力、JSONの再取り込み、検索、390px幅の表示も確認済み。

# ブロック仕様

## 共通データ

全ブロック共通:
- id
- type
- createdAt
- updatedAt
- hidden
- note
- customClass

## 1. dialogue / セリフ

必須:
- characterId
- text

任意:
- emotion
- alignment
- overrideName
- overrideIcon
- timestamp
- replyToBlockId

UI:
- キャラアイコン
- キャラ名
- テキスト入力
- キャラ切替ボタン

Enter:
改行

Ctrl/Cmd+Enter:
直後に同キャラのセリフを追加

---

## 2. narration / 地の文

項目:
- text
- style: normal / emphasis / small
- align: left / center

用途:
説明、情景描写、ト書き。

---

## 3. heading / 見出し

項目:
- text
- level: 2 / 3 / 4

H1はエピソードタイトル専用。

---

## 4. image / 画像

項目:
- src
- alt
- caption
- width
- align
- link

MVP:
Base64またはローカルObject URLで編集し、
HTML書き出し時に埋め込み可。

画像上限の警告を出す。

---

## 5. divider / 区切り

項目:
- style: line / dots / space / scene

---

## 6. memo / 非公開メモ

項目:
- text
- color

公開・HTML出力では原則除外。
編集画面専用。

---

## 7. quote / 引用（Phase 2）

項目:
- text
- source
- url

---

## 8. choice / 選択肢（Phase 3）

ゲームブック用途。
MVP対象外。

---

## ブロック共通操作

- 上へ
- 下へ
- ドラッグ移動
- 複製
- 非表示
- 削除
- Undo対象
- コピー
- 他エピソードへ移動 Phase 2

## キーボード操作

- Ctrl/Cmd+Z Undo
- Ctrl/Cmd+Shift+Z Redo
- Ctrl/Cmd+S 明示保存
- Ctrl/Cmd+Enter 次のセリフ
- Alt+1〜9 キャラ指定セリフ追加
- Ctrl/Cmd+Shift+N 地の文追加
- Escape モーダルを閉じる

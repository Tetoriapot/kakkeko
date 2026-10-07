# キャラクター管理仕様

## 1. キャラクターの考え方

キャラクターは作品単位で管理する。
複数エピソードから共通参照する。

ブロック内に名前や画像を直接複製しない。
characterIdで参照する。

これにより、キャラ名・画像変更が全話に即反映される。

## 2. 基本項目

- id
- name
- reading
- shortName
- subtitle
- icon
- color
- textColor
- bubbleColor
- position
- isArchived
- order

## 3. TRPG項目

- playerName
- pcName
- role
- systemName

role:
- gm
- player
- npc
- other

表示プリセット:
- PC名のみ
- PC名 + PL名
- PL名のみ
- GM表記

例:
アルベルト
PL: 田中

## 4. AA対応

aaTextを設定可能。

例:
（　＾ω＾）

テーマがAAモードの場合、
アイコン画像の代わりにaaTextを表示できる。

## 5. カラー設計

キャラ色はアクセント用途に限定。

禁止:
- 背景全面を高彩度色にする
- 白文字固定
- コントラスト不足

自動的にWCAGを意識した文字色へ補正する。

## 6. 削除

キャラに紐づく発言が存在する場合:
完全削除は禁止。

選択肢:
- アーカイブ
- 別キャラへ統合
- 発言を匿名話者へ変更

## 7. 並び順

- 手動並び替え
- 発言回数順
- 名前順

ショートカット番号は手動順1〜9を利用する。

# 開示よみときノート

株式投資初心者・小規模投資家向けに、登録した銘柄の周辺情報を見出しベースで拾い、危なそうな見出し・注目すべき見出しを確認順に並べる学習補助ツールです。

このアプリは株価予想、売買判断、投資助言を行いません。表示内容は一般的な確認ポイントであり、必ず出典元の一次情報を確認してください。

## 目的

- どんなIR・開示・ニュースが出ているかを確認する
- 見出しのどこが危なそうかを学ぶ
- 注意すべき用語を辞書で確認する
- 一次情報のどこを見るべきかを記録する
- 自分の確認状態とメモを残す

## やること

- 登録銘柄と `public/data/feeds.json` の見出しを照合する
- 危険語・注目語辞書で見出しを分類する
- 「今日の注意候補」に危険度・注目度順で表示する
- 確認済み、保留、無視、ユーザーメモを localStorage に保存する
- 登録銘柄と確認状態を JSON エクスポート/インポートする

## やらないこと

- AI要約、外部AI API利用
- 証券口座連携、自動売買、売買推奨
- 保有数、取得単価、評価額の管理
- サーバーDB保存
- ニュース本文、PDF本文、有料記事本文の取得
- 会社IRページの個別巡回
- 株価取得
- SNS、掲示板、YouTube取得
- ブラウザからの外部サイト直接クロール

## データ保存

公開データは `public/data/feeds.json` に置きます。個人データである登録銘柄、応援理由、怖い点、確認状態、ユーザーメモはブラウザの localStorage に保存します。個人データは外部送信しません。

## v0.1で取得する見出し

- TDnet/適時開示系
- EDINET系
- 銘柄名ニュース検索系
- サンプル/手動確認用見出し

v0.1では取得対象を広げすぎないため、会社IR個別巡回、ニュース本文、PDF本文、株価、SNS等は取得しません。

## feeds.jsonの仕組み

GitHub Actions が `npm run build:feeds` を実行し、公開RSS等から取得できる見出しを集約して `public/data/feeds.json` を生成します。RSS取得に失敗しても、動作確認用のサンプル見出しを必ず混ぜます。

ブラウザ側は `feeds.json` を読むだけです。ユーザーの localStorage データを GitHub Actions に渡しません。

## 起動方法

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
npm run build:feeds
```

GitHub Pages のリポジトリパスでビルドする場合:

```bash
VITE_BASE_PATH=/disclosure-reading-note/ npm run build
```

Windows PowerShell の場合:

```powershell
$env:VITE_BASE_PATH="/disclosure-reading-note/"
npm run build
```

必要に応じて `cross-env` を導入し、OS差を吸収してください。

## GitHub Pages公開

`.github/workflows/pages.yml` は main ブランチへの push で実行されます。

処理内容:

- `npm ci`
- `npm run build`
- `dist` を GitHub Pages にデプロイ

`VITE_BASE_PATH` は Actions 内で `/${{ github.event.repository.name }}/` に設定しています。

## 見出し更新

`.github/workflows/build-feeds.yml` は手動実行と平日低頻度の schedule 実行に対応しています。

処理内容:

- `npm ci`
- `npm run build:feeds`
- `public/data/feeds.json` に差分があればコミット

## 今後の拡張案

- 実際に安定利用できるTDnet/EDINET公開フィードの追加
- 固定公開リストに基づくニュース検索枠の追加
- 辞書ルールのユーザー調整
- 表示候補の並び順調整
- 開示種別ごとのチェックリスト強化

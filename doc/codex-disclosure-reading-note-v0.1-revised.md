# Codex実装依頼：開示よみときノート v0.1

## 目的

株式投資初心者・小規模投資家向けに、登録した銘柄の周辺情報を拾い、危なそうな見出し・注目すべき見出しを自動で並べる学習補助ツールを作ってください。

このアプリは、株価予想や売買判断をするものではありません。

目的は、ユーザーが保有株・気になる株について、

- どんなIR・開示・ニュースが出ているか
- その見出しのどこが危なそうか
- どの用語に注意すべきか
- 一次情報のどこを確認すべきか
- 自分はどう判断したか

を勉強しながら記録できるようにすることです。

## 重要な前提

v0.1から、ユーザーに「自分でリンクを踏んで探して貼れ」だけを要求しないでください。

最低限、アプリ側が公開情報の見出しを取得し、登録銘柄と照合し、危険語・注目語辞書で分類して、今日見るべき候補として表示するところまで実装してください。

ただし、無料で運用したいため、AI要約・有料API・証券口座連携・サーバー保存は使いません。

## プロダクト名

仮称：開示よみときノート

## v0.1で取得対象にする見出し

v0.1では、見出し取得対象を広げすぎないでください。

取得対象は以下4種類に限定してください。

```txt
1. TDnet/適時開示系の見出し
2. EDINET系の書類見出し
3. 銘柄名ニュース検索系の見出し
4. サンプル/手動確認用の見出し
```

### 優先順位

```txt
最優先：
  TDnet/適時開示系

次点：
  EDINET系

任意：
  銘柄名ニュース検索系

必須：
  サンプル見出し

後回し：
  会社IRページの個別巡回
  会社ごとのHTMLスクレイピング
  ニュース本文取得
  PDF本文取得
  株価取得
  SNS/X/掲示板/YouTube取得
```

### v0.1で取る見出しの種類

#### 1. TDnet/適時開示系

最重要です。

対象例：

- 決算短信
- 業績予想の修正
- 配当予想の修正
- 下方修正
- 上方修正
- 第三者割当
- 新株予約権
- 自己株式取得
- 主要株主の異動
- 監査法人の異動
- 代表取締役の異動
- 特別損失
- 減損損失
- 訴訟
- 行政処分
- 上場維持基準
- 継続企業の前提

#### 2. EDINET系

重めの書類が出たことを拾うための見出しです。

対象例：

- 有価証券報告書
- 四半期報告書
- 半期報告書
- 臨時報告書
- 訂正報告書
- 大量保有報告書
- 変更報告書
- 有価証券届出書

v0.1では本文解析をしないでください。
「何の書類が出たか」を候補として表示できれば十分です。

#### 3. 銘柄名ニュース検索系

任意実装です。
ニュースは便利ですがノイズが多いので、v0.1では控えめにしてください。

銘柄ごとに生成する検索クエリは最大2個までにしてください。

例：

```txt
"アクセルスペースホールディングス"
"アクセルスペース 402A"
```

以下のような広いテーマ語検索はv0.1では行わないでください。

```txt
防衛
宇宙
AI
半導体
補助金
国策
```

理由：ノイズが多く、初心者向けの「今日見るべき候補」が埋もれるため。

#### 4. サンプル/手動確認用見出し

GitHub Actionsや外部取得が失敗しても、アプリの動作確認ができるように、サンプル見出しは必ず入れてください。

## v0.1のゴール

v0.1では、以下の体験を完成させてください。

1. ユーザーが銘柄を登録する
2. GitHub Actionsが公開RSS等から、限定された種類の見出しを取得する
3. 取得した見出しを `public/data/feeds.json` に保存する
4. アプリ起動時に `feeds.json` を読み込む
5. 登録銘柄と見出しを照合する
6. 関係ありそうな見出しを「今日の注意候補」に表示する
7. 見出しに危険語・注目語辞書を当てる
8. 「なぜ注意か」「どこを見るか」を解説カードとして表示する
9. ユーザーが確認済み・保留・無視・メモを保存できる
10. データはlocalStorageに保存され、リロード後も残る

## やること

- React + Vite + TypeScript の静的Webアプリを作る
- GitHub Pagesで公開できる構成にする
- ユーザー入力データはlocalStorageに保存する
- 銘柄登録機能を作る
- 銘柄ごとに、応援理由・怖い点・監視頻度を保存できるようにする
- GitHub Actionsで公開RSS等から限定された見出しを取得する
- 見出し取得結果を `public/data/feeds.json` として保存する
- ブラウザ側は `feeds.json` を読むだけにする
- 登録銘柄と見出しを照合する
- 危険語・注目語辞書に基づいて見出しを分類する
- 危険度・注目度順に候補を並べる
- 解説カードを表示する
- 確認状態とユーザーメモをlocalStorageに保存する
- JSONエクスポート/インポート機能を作る
- READMEを整備する

## やらないこと

- AI要約はしない
- OpenAI APIなどの外部AI APIは使わない
- 証券口座連携はしない
- 楽天証券やマネーフォワードにログインしない
- ユーザーの保有数・取得単価・評価額は扱わない
- 自動売買はしない
- 売買推奨はしない
- 株価予想はしない
- ユーザー入力データを外部送信しない
- サーバーDBに保存しない
- ニュース本文・PDF全文・有料記事本文を取得しない
- 会社IRページを個別巡回しない
- 会社ごとのHTMLスクレイピングをしない
- SNS/X/掲示板/YouTubeを取得しない
- ブラウザから外部サイトを直接クロールしない

## アーキテクチャ

### 基本方針

GitHub Pages + GitHub Actions + localStorage で無料運用できる構成にしてください。

```txt
GitHub Actions
  ↓
公開RSS/公開フィードから見出し取得
  ↓
public/data/feeds.json を生成・更新
  ↓
GitHub Pagesで配信

ユーザーのブラウザ
  ↓
feeds.jsonを読む
  ↓
localStorageの登録銘柄と照合
  ↓
危険語辞書で分類
  ↓
今日の注意候補を表示
```

### 公開データと個人データの分離

```txt
公開データ：
- feeds.json
- 見出し
- URL
- ソース名
- 公開日時
- 会社名
- 銘柄コード

個人データ：
- 登録銘柄
- 応援理由
- 怖い点
- 確認状態
- ユーザーメモ

個人データはlocalStorageに保存し、外部送信しない。
```

## ディレクトリ構成

```txt
disclosure-reading-note/
├─ README.md
├─ package.json
├─ vite.config.ts
├─ index.html
├─ public/
│  └─ data/
│     └─ feeds.json
├─ scripts/
│  └─ build-feeds.mjs
├─ .github/
│  └─ workflows/
│     ├─ pages.yml
│     └─ build-feeds.yml
└─ src/
   ├─ main.tsx
   ├─ App.tsx
   ├─ types.ts
   ├─ data/
   │  └─ riskDictionary.ts
   ├─ logic/
   │  ├─ matchStock.ts
   │  ├─ matchDisclosure.ts
   │  └─ score.ts
   ├─ services/
   │  └─ feedService.ts
   ├─ storage/
   │  └─ localStorageStore.ts
   ├─ components/
   │  ├─ Layout.tsx
   │  ├─ Dashboard.tsx
   │  ├─ StockForm.tsx
   │  ├─ StockList.tsx
   │  ├─ FeedCard.tsx
   │  ├─ RiskResult.tsx
   │  ├─ DictionaryPage.tsx
   │  ├─ SettingsPage.tsx
   │  └─ Disclaimer.tsx
   └─ styles/
      └─ app.css
```

## 技術スタック

- React
- Vite
- TypeScript
- localStorage
- Node.js script
- GitHub Actions
- 通常CSS

避けるもの：

- UIライブラリ
- 状態管理ライブラリ
- サーバーDB
- 外部AI API
- 有料API

## package.json scripts

最低限以下を用意してください。

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "build:feeds": "node scripts/build-feeds.mjs"
  }
}
```

## Vite設定

GitHub Pages公開を考慮し、`base` を環境変数で切り替えられるようにしてください。

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH ?? "/",
});
```

READMEには以下を記載してください。

```bash
VITE_BASE_PATH=/disclosure-reading-note/ npm run build
```

Windows環境では必要に応じて `cross-env` を使う説明も書いてください。

## データ型

`src/types.ts` に以下の型を定義してください。

```ts
export type Severity =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "positive"
  | "neutral";

export type CheckStatus =
  | "unread"
  | "checked"
  | "pending"
  | "ignored";

export type WatchLevel =
  | "manual"
  | "weekly"
  | "daily"
  | "priority";

export type FeedSource =
  | "tdnet"
  | "edinet"
  | "news"
  | "sample"
  | "manual";

export type Stock = {
  id: string;
  code: string;
  name: string;
  aliases: string[];
  market?: string;
  watchReason: string;
  riskMemo: string;
  watchLevel: WatchLevel;
  createdAt: string;
  updatedAt: string;
};

export type FeedItem = {
  id: string;
  title: string;
  url: string;
  source: FeedSource;
  publishedAt?: string;
  companyName?: string;
  code?: string;
  documentType?: string;
  raw?: Record<string, unknown>;
};

export type RiskRule = {
  id: string;
  category: string;
  severity: Severity;
  keywords: string[];
  title: string;
  summary: string;
  why: string[];
  checkPoints: string[];
  beginnerNote?: string;
  falsePositiveNote?: string;
};

export type FeedCheckState = {
  feedId: string;
  stockId?: string;
  status: CheckStatus;
  userMemo: string;
  updatedAt: string;
};

export type MatchedRisk = {
  rule: RiskRule;
  score: number;
  matchedKeywords: string[];
};

export type MatchedFeed = {
  feed: FeedItem;
  stock: Stock;
  stockMatchScore: number;
  risks: MatchedRisk[];
};
```

## localStorage仕様

`src/storage/localStorageStore.ts` を作成してください。

保存キー：

```ts
const STOCKS_KEY = "disclosure-reading-note:stocks";
const CHECKS_KEY = "disclosure-reading-note:checks";
```

実装する関数：

- `loadStocks(): Stock[]`
- `saveStocks(stocks: Stock[]): void`
- `loadChecks(): FeedCheckState[]`
- `saveChecks(checks: FeedCheckState[]): void`
- `upsertCheckState(check: FeedCheckState): void`
- `clearAllLocalData(): void`
- `exportLocalData(): string`
- `importLocalData(json: string): { ok: boolean; error?: string }`

JSON parse失敗時は空配列を返し、アプリが落ちないようにしてください。

## 銘柄登録

登録項目：

- 銘柄コード
- 銘柄名
- 別名・略称 aliases
- 市場 market
- 応援理由 watchReason
- 怖いと思っている点 riskMemo
- 監視頻度 watchLevel

監視頻度：

- manual: 手動
- weekly: 週1
- daily: 毎日
- priority: 重点監視

v0.1では保有数・取得単価・評価額は入れないでください。
資産管理アプリではなく、周辺情報の読解補助ツールです。

## feeds.json仕様

`public/data/feeds.json` は以下形式にしてください。

```json
[
  {
    "id": "tdnet-20260602-001",
    "title": "第三者割当による新株予約権の発行に関するお知らせ",
    "url": "https://example.com/disclosure/001",
    "source": "tdnet",
    "publishedAt": "2026-06-02T09:00:00+09:00",
    "companyName": "アクセルスペースホールディングス",
    "code": "402A",
    "documentType": "適時開示"
  }
]
```

v0.1では、実取得できなかった場合に備えて、サンプルデータも必ず混ぜてください。

最低サンプル：

- 第三者割当による新株予約権の発行に関するお知らせ
- 通期業績予想の修正に関するお知らせ
- 自己株式取得に係る事項の決定に関するお知らせ
- 継続企業の前提に関する重要事象等
- 監査法人の異動に関するお知らせ
- 主要株主の異動に関するお知らせ
- 大型受注に関するお知らせ
- 決算短信
- 臨時報告書
- 大量保有報告書

## 見出し取得スクリプト

`scripts/build-feeds.mjs` を作成してください。

### 役割

GitHub Actions上で実行し、公開RSS等から限定された種類の見出しを集約し、`public/data/feeds.json` を生成します。

### 実装方針

v0.1では、以下のようにしてください。

1. TDnet/適時開示系の取得枠を作る
2. EDINET系の取得枠を作る
3. 銘柄名ニュース検索系の取得枠を作る
4. 取得できるRSSや公開フィードは実際にfetchする
5. 取得失敗時はログを出して継続する
6. サンプル見出しを必ず追加する
7. 重複をURLまたはタイトル+会社名で除去する
8. `public/data/feeds.json` に保存する

### 注意

- APIキーは使わない
- 有料APIは使わない
- 認証が必要なサイトは使わない
- ニュース本文は取得しない
- PDF本文は取得しない
- 会社IRページの個別スクレイピングはしない
- 保存するのは見出し・URL・日時・ソース・会社名・コード程度にする
- ブラウザ側から直接RSS取得しない

### ソース定義

RSS URLや取得元は設定配列で管理してください。

例：

```js
const FEED_SOURCES = [
  {
    source: "tdnet",
    kind: "rss",
    url: "https://example.com/tdnet.xml",
    enabled: true
  },
  {
    source: "edinet",
    kind: "rss-or-api",
    url: "https://example.com/edinet.xml",
    enabled: false
  },
  {
    source: "news",
    kind: "rss",
    url: "https://example.com/news.xml",
    enabled: false
  }
];
```

実際に取得できるRSS URLは、実装時に無理に確定しなくてよいです。
取得失敗しても、サンプルデータでアプリが動くようにしてください。

ただし、構造としては将来TDnet/EDINET/ニュース検索を追加しやすいようにしてください。

### 銘柄名ニュース検索について

v0.1では、ニュース取得は任意実装です。

もし実装する場合は、以下の制約を守ってください。

- 登録銘柄リストをGitHub Actions側で使わない
- ユーザーのlocalStorageデータはActionsに渡さない
- そのため、v0.1ではニュース検索は固定サンプルまたは将来拡張枠でよい
- 個人の登録銘柄ごとのニュース取得はv0.2以降で検討する

理由：
GitHub Actionsは公開データを作るだけであり、ユーザー個人の登録銘柄を知らないため。

### コマンド

```bash
npm run build:feeds
```

## GitHub Actions

### `.github/workflows/pages.yml`

GitHub Pagesへデプロイするワークフローを作成してください。

条件：

- main ブランチへの push で実行
- `npm ci`
- `npm run build`
- GitHub Pagesへデプロイ

### `.github/workflows/build-feeds.yml`

見出しJSON生成用のワークフローを作成してください。

条件：

- 手動実行 `workflow_dispatch`
- 定期実行 `schedule`
- `npm ci`
- `npm run build:feeds`
- `public/data/feeds.json` に差分があればコミットする

scheduleはv0.1では低頻度にしてください。

```yaml
on:
  workflow_dispatch:
  schedule:
    # JST 10:00 / 21:00
    # UTC 01:00 / 12:00
    - cron: "0 1,12 * * 1-5"

    # JST 11:30 / 15:30
    # UTC 02:30 / 06:30
    - cron: "30 2,6 * * 1-5"
```

## 危険語・注目語辞書

`src/data/riskDictionary.ts` に厚めの辞書を実装してください。

最低30ルール以上。
可能なら40ルール以上。

カテゴリ：

1. 業績悪化
2. 配当悪化
3. 希薄化・資金調達
4. 継続企業・資金繰り
5. 会計・監査
6. 上場維持・上場廃止
7. 訴訟・行政処分
8. 経営陣・ガバナンス
9. 大株主・支配権
10. 事業リスク
11. 決算・月次確認
12. ポジティブ材料
13. 中立だが確認したい材料

### 必須キーワード

業績悪化：

- 下方修正
- 業績予想の修正
- 赤字転落
- 営業損失
- 経常損失
- 最終赤字
- 純損失
- 減損
- 特別損失

配当悪化：

- 減配
- 無配
- 配当予想の修正
- 復配見送り

希薄化・資金調達：

- 第三者割当
- 新株発行
- 新株予約権
- MSワラント
- 希薄化
- 行使価額修正条項
- 資金調達
- 借入
- 社債発行
- 劣後債

継続企業・資金繰り：

- 継続企業の前提
- 重要な疑義
- 重要事象
- GC注記
- 資金繰り
- 債務超過

会計・監査：

- 監査法人の異動
- 会計監査人の異動
- 監査意見
- 限定付適正意見
- 意見不表明
- 不適切会計
- 訂正報告書
- 過年度決算訂正
- 内部統制
- 調査委員会

上場維持：

- 上場廃止
- 監理銘柄
- 整理銘柄
- 特設注意市場銘柄
- 上場維持基準
- 改善期間

訴訟・行政処分：

- 訴訟
- 損害賠償
- 行政処分
- 業務停止
- 課徴金
- 命令
- 処分

経営陣・ガバナンス：

- 代表取締役の異動
- 社長交代
- 役員辞任
- 取締役辞任
- 辞任

大株主・支配権：

- 主要株主の異動
- 筆頭株主の異動
- 大株主の異動
- 大量保有
- 変更報告書
- TOB
- 公開買付

事業リスク：

- 延期
- 遅延
- 中止
- 撤退
- 失注
- 解約
- 契約終了
- 回収
- リコール

決算・月次：

- 決算短信
- 四半期決算
- 決算説明資料
- 月次
- 月次業績

ポジティブ：

- 上方修正
- 増配
- 自社株買い
- 自己株式取得
- 黒字転換
- 大型受注
- 受注
- 業務提携
- 資本業務提携
- 採択
- 補助金
- 量産開始

## マッチングロジック

### `matchStock.ts`

登録銘柄と見出しの関連を判定してください。

判定対象：

- stock.code
- stock.name
- stock.aliases
- feed.code
- feed.companyName
- feed.title

ルール：

- feed.code と stock.code が一致したら強一致
- feed.companyName に stock.name が含まれたら強一致
- feed.title に stock.name または alias が含まれたら中一致
- feed.title に stock.code が含まれたら中一致
- 会社名の「株式会社」「ホールディングス」「HD」などの揺れを少し吸収する

返却値：

```ts
export function scoreStockMatch(stock: Stock, feed: FeedItem): number
```

0なら非関連。
1以上なら関連候補。

### `matchDisclosure.ts`

見出しと辞書を照合してください。

対象テキスト：

- feed.title
- feed.companyName
- feed.documentType

実装：

```ts
export function matchRisks(input: string, rules: RiskRule[]): MatchedRisk[]
```

ルール：

- keyword が含まれていたら加点
- 長いキーワードほど少し高くする
- severity が critical/high のものは少し高くする
- score 降順で返す
- matchedKeywords を返す

### `score.ts`

見出し全体の表示優先度を計算してください。

```ts
export function scoreMatchedFeed(matched: MatchedFeed): number
```

考慮するもの：

- 銘柄一致スコア
- リスク一致スコア
- severity
- publishedAt の新しさ
- watchLevel
- source

sourceの重みは以下にしてください。

```txt
tdnet: 高
edinet: 中〜高
news: 中
sample: 低
manual: 中
```

重点監視銘柄は少し上に出してください。

## 画面仕様

### 共通

- 画面上部にアプリ名
- タブ風ナビ
  - 今日の注意候補
  - 銘柄
  - 辞書
  - 設定
- SPAでよい
- react-routerは使わなくてよい
- 免責文をフッターに表示する
- スマホでも読めるレスポンシブ対応にする

### 1. 今日の注意候補 Dashboard

最重要画面です。

表示内容：

- 登録銘柄に関連しそうな見出し
- 危険度順・新着順で表示
- critical/high を上に表示
- positive は「ポジティブ材料」として別枠表示
- neutral は「確認資料」として表示
- 確認済み・無視は初期表示から除外できる
- 「確認済みも表示」チェックボックスを用意する
- source別フィルタを用意する
  - TDnet/適時開示
  - EDINET
  - ニュース
  - サンプル

各カード表示：

- 銘柄名
- 銘柄コード
- 見出し
- ソース
- 公開日時
- 書類種別 documentType
- 検出カテゴリ
- 検出キーワード
- 危なそう度
- なぜ注意？
- 見るポイント
- 初心者メモ
- 誤検知・注意点
- 出典リンク
- 状態ボタン
  - 未確認
  - 確認済み
  - 保留
  - 無視
- ユーザーメモ欄

### 2. 銘柄ページ

機能：

- 銘柄追加
- 銘柄編集
- 銘柄削除
- 登録銘柄一覧
- 応援理由
- 怖い点
- 監視頻度

初期サンプル銘柄を追加するボタンを用意してください。

例：

- 402A アクセルスペースホールディングス
- 9348 アイスペース
- 9999 サンプル株式会社

### 3. 辞書ページ

機能：

- 辞書ルール一覧
- カテゴリフィルタ
- severityフィルタ
- キーワード検索
- 各ルールの詳細表示

表示項目：

- タイトル
- カテゴリ
- severity
- キーワード
- なぜ注意？
- 見るポイント
- 初心者メモ
- 誤検知・注意点

辞書はv0.1では編集不要です。

### 4. 設定ページ

機能：

- localStorage保存についての説明
- データ削除ボタン
- JSONエクスポート
- JSONインポート
- feeds.jsonの最終読み込み時刻表示
- 手動再読み込みボタン

JSONエクスポート対象：

- stocks
- checks

JSONインポート時は構造チェックを最低限行い、不正JSONならエラー表示してください。

## 免責文

短い表示：

```txt
この表示は一般的な確認ポイントです。売買判断ではありません。必ず出典を確認してください。
```

詳細表示：

```txt
本アプリは、開示・IR・ニュース見出しに含まれるキーワードをもとに、一般的な確認ポイントを表示する学習補助ツールです。
特定の金融商品の購入・売却・保有を推奨するものではありません。
表示内容は正確性・完全性を保証するものではありません。
必ず出典元の一次情報を確認し、最終的な投資判断はご自身で行ってください。
```

## READMEに書くこと

READMEには以下を含めてください。

- アプリ概要
- 目的
- やること
- やらないこと
- 投資助言ではない旨
- localStorage保存の説明
- 個人データは外部送信しない旨
- v0.1で取得する見出しの種類
  - TDnet/適時開示系
  - EDINET系
  - 銘柄名ニュース検索系
  - サンプル
- v0.1で取得しないもの
  - 会社IR個別巡回
  - ニュース本文
  - PDF本文
  - 株価
  - SNS等
- feeds.jsonの仕組み
- GitHub Actionsで公開見出しを低頻度に取得する構成
- 起動方法
- ビルド方法
- GitHub Pages公開方法
- 今後の拡張案

## スタイル方針

- 派手にしすぎない
- 初心者が読みやすい余白
- カード形式中心
- critical/high/medium/positive/neutral を視覚的に区別する
- 重要カードが埋もれないようにする
- スマホでも最低限読めるようにする

## 完成条件

以下を満たしたら完了です。

1. `npm install`
2. `npm run dev`
3. ブラウザでアプリが開く
4. サンプル銘柄を追加できる
5. `public/data/feeds.json` の見出しが読み込まれる
6. 登録銘柄に関連する見出しがDashboardに出る
7. source別フィルタが動く
8. 「第三者割当による新株予約権の発行に関するお知らせ」に対して、希薄化リスクの解説カードが出る
9. 「通期業績予想の修正に関するお知らせ」に対して、業績予想修正系の解説カードが出る
10. 「自己株式取得」に対して、ポジティブ材料の解説カードが出る
11. 「継続企業の前提」に対して、重大リスクとして表示される
12. 「臨時報告書」「大量保有報告書」などEDINET系サンプルが確認候補として出る
13. 確認済み/保留/無視を保存できる
14. メモがlocalStorageに保存される
15. リロード後も銘柄・確認状態・メモが残る
16. 辞書ページでルール一覧を見られる
17. 設定ページでJSONエクスポート/インポートができる
18. `npm run build` が成功する
19. `npm run build:feeds` が成功する
20. GitHub Actionsの雛形が存在する
21. READMEが整備されている

## 実装時の優先順位

最優先：

1. feeds.jsonを読む
2. 銘柄と見出しを照合する
3. 危険語辞書で分類する
4. 今日の注意候補に並べる
5. 解説カードを出す
6. localStorageで状態とメモを保存する

後回し：

- 見た目の凝った演出
- 実RSS取得の完全対応
- 会社IR個別巡回
- 本文取得
- PDF解析
- 証券CSV取り込み
- 株価取得

## 注意

v0.1は「リンク集」ではありません。
ユーザーに外部リンクを並べて終わりにしないでください。

必ず、アプリ側が `feeds.json` の見出しを読み、登録銘柄に関連しそうな候補を出し、危険語・注目語で分類し、初心者向けの確認ポイントを表示してください。

ただし、v0.1で取得する見出しは広げすぎないでください。
対象はTDnet/適時開示系、EDINET系、銘柄名ニュース検索系、サンプルに限定してください。
会社IR個別巡回、本文取得、SNS取得、株価取得は後回しです。

# Core Architecture: 文脈体験プラットフォーム

## 目的

このドキュメントは、文脈体験プラットフォームのcore設計を定義する。

本基盤は、株式投資、新人教育、創作支援、業務理解など複数ドメインへ展開できるようにする。

重要なのは、ドメイン知識をcoreに混ぜないことである。

coreは、人が情報に触れ、少しずつ理解し、自分で掴み取った感覚を得るための共通フローを担当する。

domain pluginは、株・投資信託・新人教育・創作など、個別領域の辞書・イベントマップ・スコアリング・文言を担当する。

---

## 全体構成

```txt
context-platform/
├─ core/
│  ├─ card/
│  ├─ dictionary/
│  ├─ event-map/
│  ├─ timeline/
│  ├─ checkpoint/
│  ├─ interaction-log/
│  ├─ scoring/
│  └─ reflection/
│
├─ plugins/
│  ├─ stock/
│  ├─ fund/
│  ├─ onboarding/
│  ├─ creative/
│  └─ workflow/
│
├─ apps/
│  ├─ web/
│  └─ admin/
│
└─ docs/
```

---

## CoreとPluginの責務

### Coreの責務

coreは以下を扱う。

```txt
1枚カードの表示構造
図鑑エントリの共通構造
イベントマップの共通構造
タイムラインの共通構造
チェックポイントの共通構造
ユーザー行動ログ
汎用スコアリング入力
振り返りレポート構造
UIの基本フロー
```

coreは以下を知らない。

```txt
自己株式取得とは何か
下方修正とは何か
エスカレーションとは何か
納期回答とは何か
伏線とは何か
```

### Pluginの責務

pluginは以下を扱う。

```txt
ドメイン辞書
ドメイン別イベントマップ
カード生成ルール
チェックポイント生成ルール
スコアリングルール
表示文言
AI分析プロンプト
```

例：

```txt
stock plugin:
  自己株式取得
  新株予約権
  下方修正
  TOB
  決算短信

fund plugin:
  指数
  ベンチマーク
  信託報酬
  為替ヘッジ
  組入比率

onboarding plugin:
  一次対応
  エスカレーション
  承認
  納期
  請求
```

---

## 基本UXフロー

全ドメインで共通する基本フローは以下。

```txt
1. 身近な対象を選ぶ
2. 今日の1枚を提示する
3. わかりそうでわからない用語・イベントを見つける
4. ユーザーが近づいたら説明する
5. 今ここマップで現在地を示す
6. 次に見る方向を示す
7. チェックポイントで理解をまとめる
8. 図鑑・タイムライン・比較ビューへ蓄積する
9. 行動ログを記録する
10. 振り返りを生成する
```

---

## 主要モデル

以下はTypeScript想定の概念モデルである。

実装時には必要に応じて分割・正規化してよい。

### Domain

```ts
export type DomainId =
  | "stock"
  | "fund"
  | "onboarding"
  | "creative"
  | "workflow"
  | string;

export type DomainPlugin = {
  id: DomainId;
  name: string;
  version: string;
  dictionaries: DictionaryEntry[];
  eventMaps: EventMap[];
  cardRules: CardRule[];
  scoringRules?: ScoringRule[];
  reflectionPrompts?: ReflectionPrompt[];
};
```

### Subject

Subjectは、ユーザーにとって身近な対象である。

株なら銘柄。  
投資信託なら商品。  
新人教育なら仮想会社・仮想部署・仮想案件。  
創作ならキャラクター・事件・テーマなど。

```ts
export type Subject = {
  id: string;
  domainId: DomainId;
  type: string;
  name: string;
  aliases?: string[];
  description?: string;
  tags?: string[];
  userMemo?: string;
  createdAt: string;
  updatedAt: string;
};
```

### InformationItem

InformationItemは、外部情報・教材・仮想ケース・手動メモなど、カード化やタイムライン化の元になる情報片である。

```ts
export type InformationItem = {
  id: string;
  domainId: DomainId;
  subjectIds: string[];
  sourceType:
    | "official"
    | "news"
    | "document"
    | "manual"
    | "case"
    | "sample"
    | string;
  title: string;
  bodyExcerpt?: string;
  url?: string;
  publishedAt?: string;
  capturedAt: string;
  tags?: string[];
  raw?: Record<string, unknown>;
};
```

### OneCard

OneCardは「今日の1枚」として表示されるカードである。

```ts
export type OneCard = {
  id: string;
  domainId: DomainId;
  subjectId?: string;
  itemId?: string;
  title: string;
  subtitle?: string;
  shortExplanation: string;
  focusPoints: string[];
  todayTakeaway: string;
  relatedTermIds?: string[];
  relatedEventMapIds?: string[];
  nextActions?: NextAction[];
  difficulty?: "easy" | "normal" | "hard";
  createdAt: string;
};
```

### DictionaryEntry

DictionaryEntryは用語図鑑のエントリである。

```ts
export type DictionaryEntry = {
  id: string;
  domainId: DomainId;
  term: string;
  aliases?: string[];
  category: string;
  status: "draft" | "reviewing" | "verified";
  shortExplanation: string;
  whyItMatters: string[];
  firstCheckpoints: string[];
  commonMisreadings?: string[];
  sourceHints?: string[];
  relatedEventMapIds?: string[];
  relatedTermIds?: string[];
};
```

辞書は「完全な講義」ではなく、初動ガイドである。

```txt
この言葉が出た
↓
何系の話か
↓
なぜ注目されるか
↓
まずどこを見るか
↓
よくある勘違いは何か
```

### EventMap

EventMapは、出来事の進行段階を表す。

```ts
export type EventMap = {
  id: string;
  domainId: DomainId;
  title: string;
  category: string;
  description: string;
  nodes: EventNode[];
  edges: EventEdge[];
  relatedTermIds?: string[];
};
```

### EventNode

```ts
export type EventNode = {
  id: string;
  label: string;
  shortExplanation: string;
  checkpoints: string[];
  commonMisreadings?: string[];
  nodeType?: "start" | "middle" | "end" | "branch" | "optional";
};
```

### EventEdge

```ts
export type EventEdge = {
  from: string;
  to: string;
  label?: string;
  condition?: string;
};
```

例：自己株式取得

```txt
取得決定 → 取得状況 → 取得終了 → 消却
```

例：問い合わせ対応

```txt
受付 → 一次切り分け → エスカレーション → 回答 → ナレッジ化
```

### TimelineItem

TimelineItemは、情報が時系列で積み上がる単位である。

```ts
export type TimelineItem = {
  id: string;
  domainId: DomainId;
  subjectId: string;
  itemId?: string;
  title: string;
  occurredAt: string;
  summary: string;
  tags: string[];
  relatedTermIds?: string[];
  relatedEventMapIds?: string[];
  eventNodeId?: string;
};
```

### Checkpoint

Checkpointは、ユーザーがよちよち歩き出した後に理解をまとめるための区切りである。

```ts
export type Checkpoint = {
  id: string;
  domainId: DomainId;
  title: string;
  prompt: string;
  options?: CheckpointOption[];
  freeTextEnabled?: boolean;
  relatedCardIds?: string[];
  relatedTermIds?: string[];
  relatedEventMapIds?: string[];
};

export type CheckpointOption = {
  id: string;
  label: string;
  meaning?: string;
};
```

### NextAction

```ts
export type NextAction = {
  id: string;
  label: string;
  type:
    | "open_dictionary"
    | "open_event_map"
    | "open_timeline"
    | "open_comparison"
    | "mark_understood"
    | "mark_later"
    | "external_link"
    | string;
  targetId?: string;
  url?: string;
};
```

---

## Interaction Log

InteractionLogは、ユーザーがどう読んだかを記録する。

診断や評価ではなく、振り返りや教材改善のための観察データである。

```ts
export type InteractionLog = {
  id: string;
  userId?: string;
  sessionId: string;
  domainId: DomainId;
  subjectId?: string;
  cardId?: string;
  itemId?: string;
  openedAt: string;
  closedAt?: string;
  readDurationMs?: number;
  openedDictionaryIds: string[];
  openedEventMapIds: string[];
  openedTimelineIds?: string[];
  selectedCheckpointIds?: string[];
  selectedActions: string[];
  finalReaction?:
    | "understood"
    | "somewhat_understood"
    | "unclear"
    | "later"
    | "important"
    | "skipped"
    | string;
  metadata?: Record<string, unknown>;
};
```

---

## Scoring

scoringはcoreに固定しすぎない。

coreが扱うのは、行動ログやカード情報などの入力形式である。

意味づけはpluginが担当する。

### ScoringInput

```ts
export type ScoringInput = {
  domainId: DomainId;
  logs: InteractionLog[];
  cards: OneCard[];
  dictionaryEntries: DictionaryEntry[];
  eventMaps: EventMap[];
  timelineItems?: TimelineItem[];
};
```

### ScoringResult

```ts
export type ScoringResult = {
  domainId: DomainId;
  summary: string;
  traits: ScoringTrait[];
  cautions: string[];
  nextSuggestions: string[];
};
```

### ScoringTrait

```ts
export type ScoringTrait = {
  id: string;
  label: string;
  score?: number;
  evidence: string[];
  interpretation: string;
  alternativeInterpretations?: string[];
};
```

---

## スコアリングの注意

スコアリングは、能力断定ではなく傾向観察として扱う。

特に新人教育・オンボーディング領域では、以下を禁止する。

```txt
採用合否
人事評価
ランク付け
能力断定
懲罰的利用
```

表示例：

```txt
NG:
  判断が遅い人です。

OK:
  初見情報では確認を優先する傾向があります。
  一方で、必要な確認項目が増えすぎると、次の行動が遅れる可能性があります。
```

---

## Reflection

Reflectionは、行動ログから振り返りを作る。

AIを使う場合は、マスキング済みデータだけを渡す。

### ReflectionReport

```ts
export type ReflectionReport = {
  id: string;
  domainId: DomainId;
  targetUserId?: string;
  periodStart: string;
  periodEnd: string;
  generalComment: string;
  strictComment?: string;
  observedPatterns: string[];
  possibleRisks: string[];
  nextTrainingCards: string[];
  createdAt: string;
};
```

### 二重視点

AI分析は、以下の2種類を出すと有効である。

```txt
一般論:
  穏当で支援的な観察コメント

辛口:
  改善点を鋭く指摘するコメント
```

ただし、辛口コメントも人格否定や断定評価にはしない。

---

## Plugin例: Stock

stock pluginは、株式投資の文脈を扱う。

### 辞書例

```txt
自己株式取得
自己株式の取得状況
自己株式の取得終了
新株予約権
第三者割当
希薄化
下方修正
上方修正
決算短信
大量保有報告書
TOB
公開買付
```

### イベントマップ例

```txt
自己株式取得:
  取得決定 → 取得状況 → 取得終了 → 消却

新株予約権:
  発行決定 → 行使開始 → 行使状況 → 行使完了 / 失効

TOB:
  開始予定 → 開始 → 条件変更 → 成立 / 不成立
```

### カード生成例

```txt
今日の1枚:
  自己株式の取得状況に関するお知らせ

これは何:
  すでに決まっていた自社株買いの途中経過です。

今ここ:
  自己株式取得イベントの「取得状況」です。

見るポイント:
  取得額、累計取得額、上限に対する進捗率
```

---

## Plugin例: Fund

fund pluginは、投資信託・ETFを扱う。

個別株とはカードのテイストを変える。

### 辞書例

```txt
指数
ベンチマーク
信託報酬
基準価額
純資産総額
為替ヘッジ
分配金
リバランス
地域比率
セクター比率
組入上位銘柄
金利
為替
```

### カード生成例

```txt
今日の1枚:
  NASDAQ100系投信に関係する話

これは何:
  米国長期金利が上がると、大型グロース株が売られやすくなることがあります。

見るポイント:
  米10年債利回り、ドル円、大型テック株の動き
```

---

## Plugin例: Onboarding

onboarding pluginは、新人教育や業務文脈の理解を扱う。

### 辞書例

```txt
一次対応
エスカレーション
確認中
承認
納期
見積
請求
契約
ナレッジ化
```

### イベントマップ例

```txt
問い合わせ対応:
  受付 → 一次切り分け → エスカレーション → 回答 → ナレッジ化

受注処理:
  見積 → 承認 → 契約 → 納品 → 請求 → 入金
```

### カード生成例

```txt
今日の1枚:
  顧客から「最短納期でお願いできますか？」と連絡が来た

これは何:
  すぐ確約せず、在庫・権限・影響範囲を確認する場面です。

見るポイント:
  在庫、回答権限、約束してよい範囲
```

---

## UI構成

UIはドメインをまたいでできるだけ変えない。

```txt
Home:
  今日の1枚

Card Detail:
  これは何
  今ここ
  見るポイント
  今日の理解
  次に見るもの

Dictionary:
  用語図鑑

Event Map:
  イベント進行マップ

Timeline:
  対象ごとの時系列

Comparison:
  複数対象比較

Reflection:
  振り返り
```

---

## データマスキング

AI分析や外部送信を行う場合は、必ずマスキング済みデータを使う。

### マスキング対象

```txt
氏名
メールアドレス
顧客名
会社名
住所
電話番号
契約番号
個人メモの固有名詞
社外秘情報
```

### マスキング後の例

```json
{
  "user": "USER_001",
  "card": "CARD_012",
  "domain": "onboarding",
  "readDurationMs": 84000,
  "openedDictionaryCount": 3,
  "openedEventMapCount": 1,
  "finalReaction": "unclear"
}
```

---

## 実装優先順位

### Phase 1: Core Docs / Model

```txt
concept.md
core-architecture.md
型定義
サンプルplugin
```

### Phase 2: UI Prototype

```txt
今日の1枚
用語図鑑
イベントマップ
チェックポイント
行動ログ
```

### Phase 3: Stock/Fund Plugin

```txt
個別株カード
投信カード
株式用語図鑑
イベントマップ
```

### Phase 4: Onboarding Plugin

```txt
仮想会社
仮想案件
業務イベントマップ
行動ログ分析
```

### Phase 5: Reflection / AI Analysis

```txt
マスキング
一般論コメント
辛口コメント
振り返りレポート
```

---

## 設計原則

1. ドメイン知識をcoreに混ぜない
2. ユーザー入口は軽くする
3. 深掘りはユーザーが近づいてから出す
4. 辞書は正解集ではなく初動ガイドにする
5. イベントマップは現在地を示す
6. スコアリングは断定ではなく観察にする
7. AI分析は評価ではなく振り返りに使う
8. 1枚・図鑑・イベントマップ・タイムライン・比較を共通UIにする
9. Pluginで辞書・イベント・スコアリング・文言を差し替える
10. ユーザーが「自分で掴み取った」と感じる体験を優先する

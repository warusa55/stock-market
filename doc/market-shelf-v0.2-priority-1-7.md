# Codex実装依頼：Market Shelf v0.2（優先度1〜7）

## 目的

`market` ブランチに、複数の自分の銘柄・材料をlocalStorageへ蓄積し、銘柄ごとに情報一覧として見られる **Market Shelf** を追加する。

現在の `market` ブランチでは、以下がすでに実装されている。

- `stock` / `fund` plugin 登録
- `stock` plugin の `TemplateDrivenPluginBase` 継承
- stock辞書
- stock eventType推定
- stock event map
- 手入力から `InformationItem` 相当の入力コンテキスト生成
- `OneCard` / `Dictionary` / `EventMap` / `Timeline` 連動
- 概要画面
- 今日の1枚フローティングUI

今回の目的は、これらを壊さずに、**単一入力のプロトタイプ**から、**複数の銘柄・複数の情報をlocalStorageに保存して切り替えられるUI**へ進めること。

## 今回のスコープ

今回やるのは、優先度1〜7のみ。

```txt
1. Market Shelf stateを追加する
2. 入力フォームに「保存」導線を足す
3. ホームに「マイ棚」ブロックを足す
4. 銘柄を選ぶと、最新材料と最近の流れを切り替える
5. 銘柄ごとの情報一覧を作る
6. 選んだ情報を既存のカード生成に流す
7. 今日の1枚フローティングは選択中の情報に追従する
```

## 今回やらないこと

以下は今やらない。

```txt
MySQL永続化
ユーザー別履歴
外部API本接続
TDnet本格取得
EDINET API本接続
ニュースAPI接続
ニュース本文保存
ポートフォリオ管理
株価取得
AI要約
本番デプロイ
```

まずはlocalStorageでUI体験を固める。

---

# 現状の問題

現在は `state.input` という単一入力をlocalStorageに保存し、その1件からカード・辞書・イベントマップ・タイムラインを再生成している。

そのため、以下ができない。

```txt
- 複数銘柄を登録する
- 銘柄ごとに複数材料を積む
- 保存済みの材料一覧を見る
- 以前入力した材料を選び直す
- 選んだ材料でOneCard / Dictionary / EventMapを再生成する
```

今回の修正では、既存の `state.input` を即削除せず、**Market Shelf用の蓄積状態**を追加する。

---

# 優先度1：Market Shelf stateを追加する

## 目的

複数銘柄・複数材料をlocalStorageに保持できるようにする。

## 追加する状態

既存の `state` に以下を追加する。

```js
marketShelf: {
  subjects: [],
  items: [],
  selectedSubjectId: "",
  selectedItemId: ""
}
```

## 型イメージ

TypeScriptではない場合も、構造は以下に合わせる。

```ts
type MarketShelfSubject = {
  id: string;
  domainId: "stock" | "fund";
  subjectType: string;
  code: string;
  name: string;
  memo?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

type MarketShelfItem = {
  id: string;
  subjectId: string;
  domainId: "stock" | "fund";
  sourceType: string;
  sourceKind: string;
  title: string;
  bodyExcerpt: string;
  url?: string;
  tags: string[];
  eventType?: string;
  sourceStatus?: "available" | "missing" | "paywalled" | "unknown";
  createdAt: string;
  updatedAt: string;
};
```

## ID方針

DB未導入なので、IDはクライアントで作る。

例：

```js
function createShelfId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
```

銘柄コードがある場合でも、複数保存や更新を考慮して、IDは別途作る。

## 初期値

`loadState()` の初期値に `marketShelf` を追加する。

```js
marketShelf: {
  subjects: [],
  items: [],
  selectedSubjectId: "",
  selectedItemId: ""
}
```

既存localStorageに `marketShelf` がない場合でも落ちないこと。

---

# 優先度2：入力フォームに「保存」導線を足す

## 目的

現在の「反映」は、カード確認用の一時入力として残す。  
それとは別に「保存」ボタンを作り、マイ棚へ銘柄・材料として蓄積できるようにする。

## ボタン

入力フォームのアクションに以下を追加する。

```txt
[反映]
[保存]
[保存して概要へ]
[クリア]
```

最低限、`保存` があればよい。

## 挙動

### 反映

既存どおり。

```txt
state.input にフォーム内容を入れる
refreshDataFromInput()
homeへ移動
```

### 保存

フォーム内容から以下を作る。

```txt
MarketShelfSubject
MarketShelfItem
```

保存後は、

```txt
marketShelf.subjects にsubjectを追加または更新
marketShelf.items にitemを追加
selectedSubjectId を保存したsubject.idへ
selectedItemId を保存したitem.idへ
localStorageへ保存
```

### 保存して概要へ

保存後、保存した銘柄・材料を選択し、概要画面へ移動する。

## subjectの重複扱い

同じ銘柄コードがすでにある場合は、subjectを新規追加せず更新する。

判定：

```txt
domainId + code が一致
```

codeが空の場合は、同名判定でもよい。

```txt
domainId + name が一致
```

更新するもの：

```txt
name
memo
tags
updatedAt
```

## itemの重複扱い

v0.2では厳密な重複排除は不要。

ただし、以下が完全一致する場合は重複追加しないのが望ましい。

```txt
subjectId + title + url
```

---

# 優先度3：ホームに「マイ棚」ブロックを足す

## 目的

保存した銘柄を一覧できる入口を作る。

価格や損益を見る場所ではなく、**情報・用語・イベントを束ねる棚**として扱う。

## 表示例

```txt
マイ棚

日本製鉄 5401
  材料 2件
  最近：自己株式取得 / 決算短信

アクセルスペース 402A
  材料 1件
  最近：新株予約権
```

## 表示項目

各銘柄カードに以下を出す。

```txt
銘柄名
コード/ID
材料件数
最新材料タイトル
タグまたはeventType
```

## 操作

銘柄カードをクリックすると、

```txt
selectedSubjectId を更新
selectedItemId はその銘柄の最新itemへ更新
保存
概要を再描画
```

## 空の場合

まだ保存がない場合は、以下を表示。

```txt
まだマイ棚に銘柄がありません。
入力画面から銘柄と材料を保存してください。
```

---

# 優先度4：銘柄を選ぶと、最新材料と最近の流れを切り替える

## 目的

ホームの概要を、選択中の銘柄に連動させる。

現在のホームは `data.subject` / `data.item` を表示している。  
これを、Market Shelfに選択中の銘柄・材料がある場合は、その内容を優先して表示する。

## 表示対象の決定

```txt
selectedSubjectId があり、対応subjectがある
  → そのsubjectを表示

selectedItemId があり、対応itemがある
  → そのitemを最新材料として表示

selectedItemId がない
  → そのsubjectに紐づく最新itemを表示

保存済みがない
  → 既存の data.subject / data.item を表示
```

## 最近の流れ

選択中subjectに紐づくitemsを新しい順に並べる。

```txt
最近の流れ
- 2026/06/01 自己株式の取得状況に関するお知らせ
- 2026/05/xx 決算短信
- 2026/05/xx ニュース観測メモ
```

既存の `renderTimelinePreview()` を流用してよい。

ただし、Market Shelf由来のitemsからTimeline風データを作る関数を追加する。

例：

```js
function createTimelineItemsFromShelf(subject, items) {
  return items.map((item) => ({
    id: `timeline-${item.id}`,
    domainId: item.domainId,
    subjectId: subject.id,
    itemId: item.id,
    title: item.title,
    occurredAt: item.updatedAt ?? item.createdAt,
    summary: item.bodyExcerpt || item.title,
    tags: item.tags ?? [],
    relatedTermIds: [],
    relatedEventMapIds: [],
    eventNodeId: undefined
  }));
}
```

---

# 優先度5：銘柄ごとの情報一覧を作る

## 目的

銘柄ごとに保存済み材料を一覧できるようにする。

これは `Timeline` とは別に、ソース管理に近い一覧である。

## 表示場所

まずはホーム下部のセクションでよい。

```txt
保存済み材料
```

または、既存 `timeline` view 内に追加してもよい。

大規模な新規ページ追加は不要。

## 表示例

```txt
保存済み材料

2026/06/01 TDnet
自己株式の取得状況に関するお知らせ
URLあり / self_share_buyback_status / 自己株式取得

2026/05/28 news
鉄鋼市況に関するニュース観測
URLあり / news / 未確認観測
```

## 表示項目

```txt
日付
sourceType
sourceKind
タイトル
本文/メモの短い抜粋
URL有無
eventType
tags
```

## 操作

各材料に以下をつける。

```txt
[この材料で見る]
```

クリックすると、

```txt
selectedItemId を更新
そのitemをstate.inputへ復元
refreshDataFromInput()
homeへ移動
```

これにより、既存のOneCard / Dictionary / EventMapが再生成される。

## sourceStatus

v0.2では任意だが、フィールドだけ持ってよい。

```txt
available
missing
paywalled
unknown
```

ニュースは消える前提なので、将来ここを使う。

---

# 優先度6：選んだ情報を既存のカード生成に流す

## 目的

保存済み材料をクリックしたら、既存のカード生成ロジックを流用して、OneCard / Dictionary / EventMap / Timeline を再生成する。

## 方針

既存の `loadContextData({ input: state.input })` を活かす。

保存済みitemを選んだ時に、以下のように `state.input` へ復元する。

```js
function restoreInputFromShelf(subject, item) {
  return {
    subjectName: subject.name,
    subjectCode: subject.code,
    subjectType: subject.subjectType,
    subjectMemo: subject.memo ?? "",
    sourceType: item.sourceType,
    sourceKind: item.sourceKind,
    title: item.title,
    bodyExcerpt: item.bodyExcerpt,
    url: item.url ?? "",
    tags: (item.tags ?? []).join(","),
    eventType: item.eventType ?? ""
  };
}
```

その後、

```js
state.input = restoreInputFromShelf(subject, item);
saveState();
await refreshDataFromInput();
switchView("home");
```

## 注意

既存の `stock plugin` / `stock-input.js` / `data-source.js` を大きく変えない。  
Market Shelfは、保存済みデータを既存入力形式へ戻す薄い層として作る。

---

# 優先度7：今日の1枚フローティングを選択中の情報に追従させる

## 目的

保存済み材料を選んだ時、右下の今日の1枚もその材料に合わせて変わるようにする。

現状は `createTodayCard(data.card, { subject: data.subject })` により現在の `data.card` からフローティングを作っている。

そのため、優先度6で `state.input` を保存済みitemから復元し、`refreshDataFromInput()` できれば、基本的には追従する。

## 必要な確認

保存済みitemを選んだ後に以下を確認する。

```txt
- ホームの最新材料が切り替わる
- OneCard内容が切り替わる
- Dictionary hitが切り替わる
- EventMapの現在地が切り替わる
- 右下フローティングカードのタイトル・説明が切り替わる
```

## 今日の1枚状態

`today-card-floating` の状態はcardId/dateKeyに依存している想定。

保存済みitemを切り替えた時に、古いカード状態が不自然に残る場合は、以下のどちらかにする。

### 案A：cardIdが変わったら新しいカード扱い

推奨。

```txt
selectedItemIdが変わる
↓
cardIdが変わる
↓
todayCardStateをresolveし直す
```

### 案B：日付単位で状態を共有

v0.2では非推奨。  
材料を切り替えても「完了済み」が残り、分かりづらくなる可能性がある。

---

# 実装上の推奨構成

既存 `app.js` が大きくなっているため、Market Shelf周りは分離する。

```txt
apps/web/
├─ market-shelf.js
├─ app.js
└─ today-card-floating.js
```

## market-shelf.js

以下を実装する。

```js
export function createEmptyMarketShelf();
export function normalizeMarketShelf(value);
export function saveInputToMarketShelf(shelf, input, { domainId });
export function getSelectedShelfSubject(shelf);
export function getSelectedShelfItem(shelf);
export function selectShelfSubject(shelf, subjectId);
export function selectShelfItem(shelf, itemId);
export function restoreInputFromShelf(subject, item);
export function listItemsForSubject(shelf, subjectId);
export function createTimelineItemsFromShelf(subject, items);
```

既存構成に合わせて関数名は調整してよい。

---

# UI文言方針

マネーフォワードや証券アプリと競合しない。

価格・損益・保有数を主役にしない。

使う言葉：

```txt
マイ棚
保有・監視銘柄
材料
最近の流れ
保存済み材料
この材料で見る
情報を束ねる
```

避ける言葉：

```txt
ポートフォリオ損益
買い時
売り時
利益予測
危険度
```

---

# 完成条件

以下を満たしたら完了。

1. 入力内容をマイ棚へ保存できる
2. 複数の銘柄/対象をlocalStorageに保持できる
3. 銘柄ごとに複数のInformationItem相当の材料を保持できる
4. ホームにマイ棚が表示される
5. 銘柄を選ぶと概要・最新材料・最近の流れが切り替わる
6. 銘柄ごとの保存済み材料一覧が見える
7. 保存済み材料を選ぶと、既存のOneCard / Dictionary / EventMap / Timelineに反映される
8. 今日の1枚フローティングが選択中の材料に追従する
9. READMEまたはdocに「今できること / 未実装」を追記する
10. `npm test` が通る
11. 既存の `npm run dev` を壊さない

## 最後に

今回の実装は、DB導入前のUI検証である。

Market Shelfは将来的にMySQLへ移す可能性があるが、v0.2ではlocalStorageでよい。

重要なのは、以下の体験を成立させること。

```txt
自分の銘柄を保存する
↓
銘柄に材料を積む
↓
銘柄ごとに情報一覧を見る
↓
材料を選ぶ
↓
既存の1枚・図鑑・イベントマップが切り替わる
```

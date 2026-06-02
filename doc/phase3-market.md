# Phase 3: Stock / Fund Plugin

## 目的

marketブランチでは、baseブランチで固めた `DomainPluginBase` から派生して、株式投資向けのPhase 3 pluginを作る。

Phase 3では、coreにドメイン知識を混ぜない。

```txt
core:
  1枚カード
  用語図鑑
  イベントマップ
  チェックポイント
  行動ログ
  振り返り

stock / fund plugin:
  株・投信の辞書
  株・投信のイベントマップ
  株・投信のカード生成ルール
  株・投信向けチェックポイント
```

## 追加したplugin

```txt
src/plugins/stock/
src/plugins/fund/
src/plugins/market/
```

### stock plugin

個別株は「会社に何が起きたか」を見る出来事カードとして扱う。

主な辞書:

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
```

主なイベントマップ:

```txt
自己株式取得:
  取得決定 -> 取得状況 -> 取得終了 -> 消却

新株予約権:
  発行決定 -> 行使開始 -> 行使状況 -> 完了 / 失効

業績予想修正:
  元の予想 -> 修正発表 -> 市場評価

TOB:
  開始予定 -> 開始 -> 条件変更 -> 成立 / 不成立
```

### fund plugin

投資信託は「商品構造と外部環境」を見る世界観カードとして扱う。

主な辞書:

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

主なイベントマップ:

```txt
投信の値動き確認:
  外部環境 -> 指数の動き -> 基準価額 -> 月次確認

リバランス:
  方針確認 -> 構成変更 -> 影響確認

分配金:
  分配方針 -> 決算 -> 分配 -> 基準価額反映
```

## 登録入口

`src/plugins/market/index.js` は、Phase 3で使う `stock` / `fund` pluginをまとめて登録する入口。

```js
import { createMarketRegistry } from "./src/plugins/market/index.js";

const registry = createMarketRegistry();
const stock = registry.require("stock");
const fund = registry.require("fund");
```

## Market Shelf v0.2

Market Shelfは、DB導入前にlocalStorageで複数銘柄・複数材料を扱うUI検証レイヤー。

今できること:

```txt
入力内容をマイ棚へ保存する
同じ銘柄コードの材料を同じ棚へ積む
ホームの概要でマイ棚と保存済み材料を見る
銘柄を選ぶと最新材料と最近の流れを切り替える
保存済み材料を選ぶと既存のOneCard / Dictionary / EventMapへ流す
今日の1枚Floatingを選択中の材料に追従させる
```

まだやらないこと:

```txt
MySQL永続化
ユーザー別履歴
TDnet / EDINET / ニュースAPI本接続
株価取得
保有数量、平均取得単価、評価損益
AI要約
```

## 守ること

Phase 3でも、以下はcoreへ入れない。

```txt
自己株式取得とは何か
信託報酬とは何か
TOBとは何か
為替ヘッジとは何か
```

これらはすべてplugin側の辞書、イベントマップ、カード生成ルールとして扱う。

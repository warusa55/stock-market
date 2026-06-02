# Phase 4: Onboarding / Company Plugin

## 目的

companyブランチでは、baseブランチのcoreと、Phase 3 marketブランチで見えた共通処理を踏まえて、Phase 4の新人教育・業務理解pluginを作る。

Phase 4でも、ドメイン知識はcoreに混ぜない。

```txt
core:
  1枚カード
  用語図鑑
  イベントマップ
  チェックポイント
  行動ログ
  振り返り

onboarding plugin:
  業務用語
  業務イベントマップ
  仮想ケース
  チェックポイント
```

## base昇格候補

marketブランチの stock / fund plugin と、companyブランチの onboarding plugin で被る処理は、`TemplateDrivenPluginBase` として切り出した。

```txt
DomainPluginBase
  └─ TemplateDrivenPluginBase
       └─ OnboardingPlugin
```

`TemplateDrivenPluginBase` が扱うもの:

```txt
InformationItemから判定用テキストを作る
cardTemplatesからOneCardを作る
relatedCardIdsでCheckpointを引く
default informationItemsからcreateCardsする
observeScoringへ委譲する
createReflectionReportへ委譲する
```

baseへ昇格してよい候補:

```txt
src/core/template-driven-plugin.js
src/core/types.d.ts の TemplateDrivenPluginBase 型
```

baseへ昇格しないもの:

```txt
一次対応とは何か
エスカレーションとは何か
納期回答とは何か
請求確認とは何か
```

これらは onboarding plugin 側に置く。

## 追加したplugin

```txt
src/plugins/onboarding/
src/plugins/company/
```

## onboarding plugin

新人教育や業務文脈の理解を扱う。

主な辞書:

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

主なイベントマップ:

```txt
問い合わせ対応:
  受付 -> 一次切り分け -> エスカレーション -> 回答 -> ナレッジ化

受注処理:
  見積 -> 承認 -> 契約 -> 納品 -> 請求 -> 入金

納期回答:
  依頼受付 -> 在庫確認 -> 権限確認 -> 回答 -> 影響共有

請求確認:
  指摘受付 -> 請求内容確認 -> 契約/納品照合 -> 修正/回答 -> ナレッジ化
```

主なカード:

```txt
顧客から「最短納期でお願いできますか？」と連絡が来た
顧客から請求書の金額が違うと言われた
契約前に仕様変更の相談が来た
```

## 登録入口

`src/plugins/company/index.js` は、Phase 4で使う onboarding pluginを登録する入口。

```js
import { createCompanyRegistry } from "./src/plugins/company/index.js";

const registry = createCompanyRegistry();
const onboarding = registry.require("onboarding");
```

## 注意

AI分析やスコアリングは、人事評価ではなく観察として扱う。

```txt
NG:
  判断が遅い人です。

OK:
  初見情報では確認を優先する傾向があります。
  一方で、必要な確認項目が増えすぎると、次の行動が遅れる可能性があります。
```

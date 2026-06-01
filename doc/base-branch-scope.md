# Base Branch Scope

## 目的

baseブランチでは、Phase 3 / Phase 4 の個別ドメイン実装に入る前の土台を作る。

ここで固めるものは、ドメイン知識ではなく、派生pluginが乗るための型・基底クラス・共通UX・観察/振り返りの扱いである。

## 対象Phase

### Phase 1: Core Docs / Model

baseブランチで扱う。

```txt
concept.md
core-architecture.md
型定義
サンプルplugin
```

実装上は以下を含む。

```txt
src/core/types.d.ts
src/core/plugin-base.js
src/core/registry.js
src/plugins/demo/
```

### Phase 2: UI Prototype / Base Layer

baseブランチで扱う。

Phase 2 は、画面の試作だけではなく、Phase 3 / 4 が派生するための基底層として扱う。

```txt
DomainPluginBase
PluginRegistry
InteractionSession
静的UIプロトタイプ
```

stock / fund / onboarding の個別カードや辞書はここでは作らない。

### Phase 5: Reflection / AI Analysis

baseブランチで扱う。

AI連携そのものではなく、AIに渡す前段のマスキング、観察コメント、辛口コメントの構造を固める。

```txt
src/core/masking.js
src/core/scoring.js
src/core/reflection.js
```

評価・ランク付け・能力断定はしない。

## 別ブランチで扱うPhase

### Phase 3: Stock / Fund Plugin

別ブランチで扱う。

`DomainPluginBase` から派生し、以下を追加する想定。

```txt
stock plugin
fund plugin
株式用語図鑑
投信用語図鑑
株式イベントマップ
個別株カード生成
投信カード生成
```

### Phase 4: Onboarding Plugin

別ブランチで扱う。

`DomainPluginBase` から派生し、以下を追加する想定。

```txt
onboarding plugin
仮想会社
仮想案件
業務イベントマップ
行動ログ分析
```

## 派生の考え方

baseブランチでは、pluginが差し替える場所だけを固定する。

```txt
DomainPluginBase
  ├─ DemoContextPlugin
  ├─ StockPlugin      phase3
  ├─ FundPlugin       phase3
  └─ OnboardingPlugin phase4
```

coreは以下を知らない。

```txt
自己株式取得とは何か
信託報酬とは何か
エスカレーションとは何か
```

coreが知るのは、以下の共通構造だけである。

```txt
1枚カード
用語図鑑
イベントマップ
タイムライン
チェックポイント
行動ログ
観察スコア
振り返り
```

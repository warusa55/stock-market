# Context Platform

文脈体験プラットフォームのbaseブランチ実装です。

baseブランチでは Phase 1 / 2 / 5 を扱います。

- Phase 1: core model / plugin contract
- Phase 2: base plugin class / registry / static UI prototype
- Phase 5: masking / observation scoring / reflection
- Input: manual Subject / InformationItem entry
- Matching: dictionary hit detection and related event map selection

Phase 3 の stock / fund plugin と Phase 4 の onboarding plugin は、別ブランチで `DomainPluginBase` から派生して作る想定です。

marketブランチでは Phase 3 として stock / fund plugin を追加します。

- `src/plugins/stock/`: 個別株カード、株式用語図鑑、株式イベントマップ
- `src/plugins/fund/`: 投信カード、投信用語図鑑、投信イベントマップ
- `src/plugins/market/`: stock / fund pluginの登録入口

## Commands

```powershell
npm run dev
npm test
```

`npm run dev` は依存追加なしのローカルサーバーを起動する。

```txt
http://127.0.0.1:6173/apps/web/index.html
```

```txt
base:
  demo pluginを表示

market:
  stock / fund pluginを表示

company:
  onboarding pluginを表示
```

## Market Plugin

```js
import { createMarketRegistry } from "./src/plugins/market/index.js";

const registry = createMarketRegistry();
const stock = registry.require("stock");
const fund = registry.require("fund");
```

## UI Prototype

`npm run dev` を実行して、表示されたURLをブラウザで開く。

入力画面では、対象名、情報タイトル、本文/メモ、URL、tags、eventTypeを入れると、現在のbranchにあるpluginでカードを再生成する。

入力テキストに辞書のtermやaliasが含まれる場合、検出語句として表示され、関連イベントマップの候補にも使われる。

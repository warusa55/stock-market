# Context Platform

文脈体験プラットフォームのcompanyブランチ実装です。

baseブランチでは Phase 1 / 2 / 5 を扱います。

- Phase 1: core model / plugin contract
- Phase 2: base plugin class / registry / static UI prototype
- Phase 5: masking / observation scoring / reflection

Phase 3 の stock / fund plugin と Phase 4 の onboarding plugin は、別ブランチで `DomainPluginBase` から派生して作る想定です。

companyブランチでは Phase 4 として onboarding plugin を追加します。

- `src/core/template-driven-plugin.js`: stock / fund / onboardingで共通化できるテンプレート駆動plugin基底
- `src/plugins/onboarding/`: 新人教育・業務理解向けの辞書、イベントマップ、カード生成
- `src/plugins/company/`: onboarding pluginの登録入口

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

## Company Plugin

```js
import { createCompanyRegistry } from "./src/plugins/company/index.js";

const registry = createCompanyRegistry();
const onboarding = registry.require("onboarding");
```

## UI Prototype

`npm run dev` を実行して、表示されたURLをブラウザで開く。

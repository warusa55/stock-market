# Context Platform

文脈体験プラットフォームのbaseブランチ実装です。

このブランチでは Phase 1 / 2 / 5 を扱います。

- Phase 1: core model / plugin contract
- Phase 2: base plugin class / registry / static UI prototype
- Phase 5: masking / observation scoring / reflection

Phase 3 の stock / fund plugin と Phase 4 の onboarding plugin は、別ブランチで `DomainPluginBase` から派生して作る想定です。

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

## UI Prototype

`npm run dev` を実行して、表示されたURLをブラウザで開く。

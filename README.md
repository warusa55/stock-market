# Context Platform

文脈体験プラットフォームのbaseブランチ実装です。

このブランチでは Phase 1 / 2 / 5 を扱います。

- Phase 1: core model / plugin contract
- Phase 2: base plugin class / registry / static UI prototype
- Phase 5: masking / observation scoring / reflection

Phase 3 の stock / fund plugin と Phase 4 の onboarding plugin は、別ブランチで `DomainPluginBase` から派生して作る想定です。

## Commands

```powershell
npm test
```

## UI Prototype

`apps/web/index.html` をブラウザで開くと、依存追加なしで静的UIプロトタイプを確認できます。

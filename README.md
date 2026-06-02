# Context Platform

文脈体験プラットフォームのbaseブランチ実装です。

このブランチでは Phase 1 / 2 / 5 を扱います。

- Phase 1: core model / plugin contract
- Phase 2: base plugin class / registry / static UI prototype
- Phase 5: masking / observation scoring / reflection
- Input: manual Subject / InformationItem entry
- Matching: dictionary hit detection and related event map selection

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

入力画面では、対象名、情報タイトル、本文/メモ、URL、tags、eventTypeを入れると、現在のbranchにあるpluginでカードを再生成する。

入力テキストに辞書のtermやaliasが含まれる場合、検出語句として表示され、関連イベントマップの候補にも使われる。

import { useCallback, useEffect, useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { DictionaryPage } from "./components/DictionaryPage";
import { Layout, type TabKey } from "./components/Layout";
import { SettingsPage } from "./components/SettingsPage";
import { StockList } from "./components/StockList";
import { loadFeeds } from "./services/feedService";
import {
  clearAllLocalData,
  importLocalData,
  loadChecks,
  loadStocks,
  saveChecks,
  saveStocks
} from "./storage/localStorageStore";
import type { FeedCheckState, FeedItem, Stock, WatchLevel } from "./types";

const sampleStockSeeds: Array<{
  code: string;
  name: string;
  aliases: string[];
  market: string;
  watchReason: string;
  riskMemo: string;
  watchLevel: WatchLevel;
}> = [
  {
    code: "402A",
    name: "アクセルスペースホールディングス",
    aliases: ["アクセルスペース", "アクセルスペースHD"],
    market: "グロース",
    watchReason: "宇宙関連の成長開示を継続して読みたい。",
    riskMemo: "資金調達、希薄化、開発遅延を重点確認する。",
    watchLevel: "priority"
  },
  {
    code: "9348",
    name: "アイスペース",
    aliases: ["ispace", "アイスペース"],
    market: "グロース",
    watchReason: "月面開発関連の進捗と受注を追いたい。",
    riskMemo: "赤字継続、資金繰り、ミッション延期に注意する。",
    watchLevel: "daily"
  },
  {
    code: "9999",
    name: "サンプル株式会社",
    aliases: ["サンプル"],
    market: "プライム",
    watchReason: "動作確認用の銘柄。",
    riskMemo: "主要株主、自己株式取得、EDINETサンプルを確認する。",
    watchLevel: "weekly"
  }
];

const createId = () =>
  globalThis.crypto?.randomUUID?.() ?? `stock-${Date.now()}-${Math.random().toString(36).slice(2)}`;

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [stocks, setStocks] = useState<Stock[]>(() => loadStocks());
  const [checks, setChecks] = useState<FeedCheckState[]>(() => loadChecks());
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [feedsLoadedAt, setFeedsLoadedAt] = useState<string>();
  const [feedError, setFeedError] = useState<string>();

  const reloadFeeds = useCallback(async () => {
    try {
      const result = await loadFeeds();
      setFeeds(result.feeds);
      setFeedsLoadedAt(result.loadedAt);
      setFeedError(undefined);
    } catch (error) {
      setFeedError(error instanceof Error ? error.message : "feeds.json の読み込みに失敗しました。");
    }
  }, []);

  useEffect(() => {
    void reloadFeeds();
  }, [reloadFeeds]);

  const persistStocks = (nextStocks: Stock[]) => {
    setStocks(nextStocks);
    saveStocks(nextStocks);
  };

  const persistChecks = (nextChecks: FeedCheckState[]) => {
    setChecks(nextChecks);
    saveChecks(nextChecks);
  };

  const handleCheckChange = (check: FeedCheckState) => {
    setChecks((current) => {
      const index = current.findIndex(
        (item) => item.feedId === check.feedId && item.stockId === check.stockId
      );
      const next =
        index >= 0
          ? current.map((item, itemIndex) => (itemIndex === index ? check : item))
          : [...current, check];

      saveChecks(next);
      return next;
    });
  };

  const addSampleStocks = () => {
    const now = new Date().toISOString();
    const existingCodes = new Set(stocks.map((stock) => stock.code.toUpperCase()));
    const additions: Stock[] = sampleStockSeeds
      .filter((stock) => !existingCodes.has(stock.code.toUpperCase()))
      .map((stock) => ({
        ...stock,
        id: createId(),
        createdAt: now,
        updatedAt: now
      }));

    if (additions.length > 0) {
      persistStocks([...stocks, ...additions]);
    }
  };

  const clearLocalData = () => {
    clearAllLocalData();
    setStocks([]);
    setChecks([]);
  };

  const handleImport = (json: string) => {
    const result = importLocalData(json);

    if (result.ok) {
      setStocks(loadStocks());
      setChecks(loadChecks());
    }

    return result;
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "dashboard" ? (
        <Dashboard
          stocks={stocks}
          feeds={feeds}
          checks={checks}
          feedError={feedError}
          onAddSampleStocks={addSampleStocks}
          onCheckChange={handleCheckChange}
        />
      ) : null}

      {activeTab === "stocks" ? (
        <StockList
          stocks={stocks}
          onStocksChange={persistStocks}
          onAddSampleStocks={addSampleStocks}
        />
      ) : null}

      {activeTab === "dictionary" ? <DictionaryPage /> : null}

      {activeTab === "settings" ? (
        <SettingsPage
          feedsLoadedAt={feedsLoadedAt}
          feedCount={feeds.length}
          onReloadFeeds={reloadFeeds}
          onClearLocalData={clearLocalData}
          onImportLocalData={handleImport}
        />
      ) : null}
    </Layout>
  );
}

export default App;

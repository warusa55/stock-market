import { useCallback, useEffect, useMemo, useState } from "react";
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
  loadLocalFeeds,
  loadStocks,
  saveChecks,
  saveLocalFeeds,
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

const feedKeys = (feed: FeedItem) => [
  `id:${feed.id}`,
  feed.url ? `url:${feed.url}` : "",
  `title:${feed.title}:${feed.companyName ?? ""}:${feed.code ?? ""}`
];

const mergeFeedsWithLocalPriority = (publicFeeds: FeedItem[], localFeeds: FeedItem[]) => {
  const merged: FeedItem[] = [];
  const indexByKey = new Map<string, number>();

  const insert = (feed: FeedItem, replaceExisting: boolean) => {
    const keys = feedKeys(feed).filter(Boolean);
    const existingIndex = keys
      .map((key) => indexByKey.get(key))
      .find((index): index is number => index !== undefined);

    if (existingIndex !== undefined && replaceExisting) {
      merged[existingIndex] = feed;
      keys.forEach((key) => indexByKey.set(key, existingIndex));
      return;
    }

    if (existingIndex !== undefined) {
      return;
    }

    const nextIndex = merged.length;
    merged.push(feed);
    keys.forEach((key) => indexByKey.set(key, nextIndex));
  };

  publicFeeds.forEach((feed) => insert(feed, false));
  localFeeds.forEach((feed) => insert(feed, true));

  return merged;
};

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [stocks, setStocks] = useState<Stock[]>(() => loadStocks());
  const [checks, setChecks] = useState<FeedCheckState[]>(() => loadChecks());
  const [publicFeeds, setPublicFeeds] = useState<FeedItem[]>([]);
  const [localFeeds, setLocalFeeds] = useState<FeedItem[]>(() => loadLocalFeeds());
  const [feedsLoadedAt, setFeedsLoadedAt] = useState<string>();
  const [feedError, setFeedError] = useState<string>();
  const feeds = useMemo(
    () => mergeFeedsWithLocalPriority(publicFeeds, localFeeds),
    [localFeeds, publicFeeds]
  );

  const reloadFeeds = useCallback(async () => {
    try {
      const result = await loadFeeds();
      setPublicFeeds(result.feeds);
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

  const persistLocalFeeds = (nextFeeds: FeedItem[]) => {
    setLocalFeeds(nextFeeds);
    saveLocalFeeds(nextFeeds);
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
      setActiveTab("dashboard");
    }
  };

  const clearLocalData = () => {
    clearAllLocalData();
    setStocks([]);
    setChecks([]);
    setLocalFeeds([]);
  };

  const handleImport = (json: string) => {
    const result = importLocalData(json);

    if (result.ok) {
      setStocks(loadStocks());
      setChecks(loadChecks());
      setLocalFeeds(loadLocalFeeds());
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
          onStockAdded={() => setActiveTab("dashboard")}
        />
      ) : null}

      {activeTab === "dictionary" ? <DictionaryPage /> : null}

      {activeTab === "settings" ? (
        <SettingsPage
          feedsLoadedAt={feedsLoadedAt}
          feedCount={feeds.length}
          publicFeedCount={publicFeeds.length}
          localFeeds={localFeeds}
          onReloadFeeds={reloadFeeds}
          onLocalFeedsChange={persistLocalFeeds}
          onClearLocalData={clearLocalData}
          onImportLocalData={handleImport}
        />
      ) : null}
    </Layout>
  );
}

export default App;

import { useMemo, useState } from "react";
import { riskDictionary } from "../data/riskDictionary";
import { sourceLabels } from "../labels";
import { matchRisks } from "../logic/matchDisclosure";
import { scoreStockMatch } from "../logic/matchStock";
import { scoreMatchedFeed } from "../logic/score";
import type { FeedCheckState, FeedItem, FeedSource, MatchedFeed, Stock } from "../types";
import { FeedCard } from "./FeedCard";

type DashboardProps = {
  stocks: Stock[];
  feeds: FeedItem[];
  checks: FeedCheckState[];
  feedError?: string;
  onAddSampleStocks: () => void;
  onCheckChange: (check: FeedCheckState) => void;
};

type DashboardItem = MatchedFeed & {
  priorityScore: number;
  checkState?: FeedCheckState;
};

const sourceOptions: Array<FeedSource | "all"> = [
  "all",
  "tdnet",
  "edinet",
  "news",
  "sample",
  "manual"
];

const buildRiskInput = (feed: FeedItem) =>
  [feed.title, feed.companyName, feed.documentType].filter(Boolean).join(" ");

const isPositiveOnly = (item: DashboardItem) =>
  item.risks.length > 0 &&
  item.risks.every((risk) => risk.rule.severity === "positive" || risk.rule.severity === "neutral") &&
  item.risks.some((risk) => risk.rule.severity === "positive");

const isNeutralOnly = (item: DashboardItem) =>
  item.risks.length === 0 || item.risks.every((risk) => risk.rule.severity === "neutral");

export function Dashboard({
  stocks,
  feeds,
  checks,
  feedError,
  onAddSampleStocks,
  onCheckChange
}: DashboardProps) {
  const [showChecked, setShowChecked] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<FeedSource | "all">("all");

  const matchedItems = useMemo<DashboardItem[]>(() => {
    const items: DashboardItem[] = [];

    for (const stock of stocks) {
      for (const feed of feeds) {
        const stockMatchScore = scoreStockMatch(stock, feed);

        if (stockMatchScore <= 0) {
          continue;
        }

        const matched: MatchedFeed = {
          feed,
          stock,
          stockMatchScore,
          risks: matchRisks(buildRiskInput(feed), riskDictionary)
        };
        const checkState = checks.find(
          (check) => check.feedId === feed.id && check.stockId === stock.id
        );

        items.push({
          ...matched,
          checkState,
          priorityScore: scoreMatchedFeed(matched)
        });
      }
    }

    return items.sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore;
      }

      return (b.feed.publishedAt ?? "").localeCompare(a.feed.publishedAt ?? "");
    });
  }, [checks, feeds, stocks]);

  const filteredItems = matchedItems.filter((item) => {
    if (sourceFilter !== "all" && item.feed.source !== sourceFilter) {
      return false;
    }

    if (!showChecked && ["checked", "ignored"].includes(item.checkState?.status ?? "")) {
      return false;
    }

    return true;
  });

  const alertItems = filteredItems.filter((item) => !isPositiveOnly(item) && !isNeutralOnly(item));
  const positiveItems = filteredItems.filter(isPositiveOnly);
  const neutralItems = filteredItems.filter(isNeutralOnly);

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <h2>今日の注意候補</h2>
          <p>
            登録銘柄と `feeds.json` の見出しを照合し、危険語・注目語に基づいて確認順に並べます。
          </p>
        </div>
        <button type="button" className="primary-button" onClick={onAddSampleStocks}>
          サンプル銘柄を追加
        </button>
      </div>

      {feedError ? <p className="alert-message">{feedError}</p> : null}

      <div className="toolbar">
        <div className="segmented-control" aria-label="ソースフィルタ">
          {sourceOptions.map((source) => (
            <button
              key={source}
              type="button"
              className={sourceFilter === source ? "active" : ""}
              onClick={() => setSourceFilter(source)}
            >
              {source === "all" ? "すべて" : sourceLabels[source]}
            </button>
          ))}
        </div>
        <label className="inline-check">
          <input
            type="checkbox"
            checked={showChecked}
            onChange={(event) => setShowChecked(event.target.checked)}
          />
          確認済み・無視も表示
        </label>
      </div>

      {stocks.length === 0 ? (
        <div className="empty-state">
          <h3>登録銘柄がありません</h3>
          <p>銘柄ページで登録するか、サンプル銘柄を追加すると候補が表示されます。</p>
        </div>
      ) : null}

      {stocks.length > 0 && filteredItems.length === 0 ? (
        <div className="empty-state">
          <h3>表示できる候補がありません</h3>
          <p>フィルタ、確認状態、登録銘柄名や別名を確認してください。</p>
        </div>
      ) : null}

      <CandidateSection
        title="重大・注意候補"
        items={alertItems}
        onCheckChange={onCheckChange}
      />
      <CandidateSection
        title="ポジティブ材料"
        items={positiveItems}
        onCheckChange={onCheckChange}
      />
      <CandidateSection
        title="確認資料"
        items={neutralItems}
        onCheckChange={onCheckChange}
      />
    </section>
  );
}

function CandidateSection({
  title,
  items,
  onCheckChange
}: {
  title: string;
  items: DashboardItem[];
  onCheckChange: (check: FeedCheckState) => void;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="candidate-section">
      <div className="section-heading">
        <h3>{title}</h3>
        <span>{items.length}件</span>
      </div>
      <div className="feed-list">
        {items.map((item) => (
          <FeedCard
            key={`${item.stock.id}:${item.feed.id}`}
            matched={item}
            checkState={item.checkState}
            onCheckChange={onCheckChange}
          />
        ))}
      </div>
    </section>
  );
}

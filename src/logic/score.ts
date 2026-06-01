import type { FeedSource, MatchedFeed, Severity, WatchLevel } from "../types";

const severityWeight: Record<Severity, number> = {
  critical: 120,
  high: 90,
  medium: 55,
  low: 25,
  positive: 35,
  neutral: 15
};

const sourceWeight: Record<FeedSource, number> = {
  tdnet: 45,
  edinet: 35,
  news: 20,
  sample: 8,
  manual: 25
};

const watchWeight: Record<WatchLevel, number> = {
  manual: 0,
  weekly: 5,
  daily: 12,
  priority: 22
};

const freshnessScore = (publishedAt?: string) => {
  if (!publishedAt) {
    return 0;
  }

  const published = new Date(publishedAt).getTime();
  if (Number.isNaN(published)) {
    return 0;
  }

  const diffDays = Math.max(0, (Date.now() - published) / 86_400_000);
  if (diffDays <= 1) {
    return 20;
  }

  if (diffDays <= 7) {
    return 12;
  }

  if (diffDays <= 30) {
    return 5;
  }

  return 0;
};

export function scoreMatchedFeed(matched: MatchedFeed): number {
  const riskScore = matched.risks.reduce(
    (sum, risk) => sum + risk.score + severityWeight[risk.rule.severity],
    0
  );

  return (
    matched.stockMatchScore +
    riskScore +
    sourceWeight[matched.feed.source] +
    watchWeight[matched.stock.watchLevel] +
    freshnessScore(matched.feed.publishedAt)
  );
}

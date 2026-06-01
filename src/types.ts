export type Severity =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "positive"
  | "neutral";

export type CheckStatus = "unread" | "checked" | "pending" | "ignored";

export type WatchLevel = "manual" | "weekly" | "daily" | "priority";

export type FeedSource = "tdnet" | "edinet" | "news" | "sample" | "manual";

export type Stock = {
  id: string;
  code: string;
  name: string;
  aliases: string[];
  market?: string;
  watchReason: string;
  riskMemo: string;
  watchLevel: WatchLevel;
  createdAt: string;
  updatedAt: string;
};

export type FeedItem = {
  id: string;
  title: string;
  url: string;
  source: FeedSource;
  publishedAt?: string;
  companyName?: string;
  code?: string;
  documentType?: string;
  raw?: Record<string, unknown>;
};

export type RiskRule = {
  id: string;
  category: string;
  severity: Severity;
  keywords: string[];
  title: string;
  summary: string;
  why: string[];
  checkPoints: string[];
  beginnerNote?: string;
  falsePositiveNote?: string;
};

export type FeedCheckState = {
  feedId: string;
  stockId?: string;
  status: CheckStatus;
  userMemo: string;
  updatedAt: string;
};

export type MatchedRisk = {
  rule: RiskRule;
  score: number;
  matchedKeywords: string[];
};

export type MatchedFeed = {
  feed: FeedItem;
  stock: Stock;
  stockMatchScore: number;
  risks: MatchedRisk[];
};

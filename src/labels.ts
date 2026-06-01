import type { CheckStatus, FeedSource, Severity, WatchLevel } from "./types";

export const severityLabels: Record<Severity, string> = {
  critical: "重大",
  high: "高",
  medium: "中",
  low: "低",
  positive: "ポジティブ",
  neutral: "確認"
};

export const statusLabels: Record<CheckStatus, string> = {
  unread: "未確認",
  checked: "確認済み",
  pending: "保留",
  ignored: "無視"
};

export const sourceLabels: Record<FeedSource, string> = {
  tdnet: "TDnet/適時開示",
  edinet: "EDINET",
  news: "ニュース",
  sample: "サンプル",
  manual: "手動"
};

export const watchLevelLabels: Record<WatchLevel, string> = {
  manual: "手動",
  weekly: "週1",
  daily: "毎日",
  priority: "重点監視"
};

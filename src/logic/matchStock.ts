import type { FeedItem, Stock } from "../types";

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[ 　\t\r\n]/g, "")
    .replace(/株式会社/g, "")
    .replace(/（株）|\(株\)/g, "")
    .replace(/ホールディングス/g, "hd")
    .replace(/ｈｄ/g, "hd")
    .replace(/ＨＤ/g, "hd");

const normalizeCode = (value: string) => value.trim().toUpperCase();

const includesNormalized = (target: string | undefined, candidate: string) => {
  if (!target || !candidate) {
    return false;
  }

  return normalizeText(target).includes(normalizeText(candidate));
};

export function scoreStockMatch(stock: Stock, feed: FeedItem): number {
  let score = 0;
  const stockCode = normalizeCode(stock.code);
  const feedCode = feed.code ? normalizeCode(feed.code) : "";

  if (stockCode && feedCode && stockCode === feedCode) {
    score += 100;
  }

  if (includesNormalized(feed.companyName, stock.name)) {
    score += 80;
  }

  if (includesNormalized(feed.title, stock.name)) {
    score += 50;
  }

  if (stockCode && includesNormalized(feed.title, stockCode)) {
    score += 45;
  }

  for (const alias of stock.aliases) {
    if (alias && includesNormalized(feed.title, alias)) {
      score += 35;
    }

    if (alias && includesNormalized(feed.companyName, alias)) {
      score += 45;
    }
  }

  const compactStockName = normalizeText(stock.name);
  const compactCompanyName = normalizeText(feed.companyName ?? "");

  if (
    compactStockName.length >= 3 &&
    compactCompanyName.length >= 3 &&
    (compactStockName.includes(compactCompanyName) ||
      compactCompanyName.includes(compactStockName))
  ) {
    score += 30;
  }

  return score;
}

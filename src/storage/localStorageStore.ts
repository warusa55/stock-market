import type { FeedCheckState, Stock } from "../types";

const STOCKS_KEY = "disclosure-reading-note:stocks";
const CHECKS_KEY = "disclosure-reading-note:checks";

type ExportedLocalData = {
  version?: string;
  exportedAt?: string;
  stocks?: unknown;
  checks?: unknown;
};

const safeParseArray = <T>(key: string, validator: (value: unknown) => value is T): T[] => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(validator) : [];
  } catch {
    return [];
  }
};

const isStock = (value: unknown): value is Stock => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const stock = value as Stock;
  return (
    typeof stock.id === "string" &&
    typeof stock.code === "string" &&
    typeof stock.name === "string" &&
    Array.isArray(stock.aliases) &&
    typeof stock.watchReason === "string" &&
    typeof stock.riskMemo === "string" &&
    typeof stock.watchLevel === "string" &&
    typeof stock.createdAt === "string" &&
    typeof stock.updatedAt === "string"
  );
};

const isCheck = (value: unknown): value is FeedCheckState => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const check = value as FeedCheckState;
  return (
    typeof check.feedId === "string" &&
    typeof check.status === "string" &&
    typeof check.userMemo === "string" &&
    typeof check.updatedAt === "string"
  );
};

export function loadStocks(): Stock[] {
  return safeParseArray(STOCKS_KEY, isStock);
}

export function saveStocks(stocks: Stock[]): void {
  localStorage.setItem(STOCKS_KEY, JSON.stringify(stocks));
}

export function loadChecks(): FeedCheckState[] {
  return safeParseArray(CHECKS_KEY, isCheck);
}

export function saveChecks(checks: FeedCheckState[]): void {
  localStorage.setItem(CHECKS_KEY, JSON.stringify(checks));
}

export function upsertCheckState(check: FeedCheckState): void {
  const checks = loadChecks();
  const index = checks.findIndex(
    (item) => item.feedId === check.feedId && item.stockId === check.stockId
  );

  if (index >= 0) {
    checks[index] = check;
  } else {
    checks.push(check);
  }

  saveChecks(checks);
}

export function clearAllLocalData(): void {
  localStorage.removeItem(STOCKS_KEY);
  localStorage.removeItem(CHECKS_KEY);
}

export function exportLocalData(): string {
  return JSON.stringify(
    {
      version: "0.1",
      exportedAt: new Date().toISOString(),
      stocks: loadStocks(),
      checks: loadChecks()
    },
    null,
    2
  );
}

export function importLocalData(json: string): { ok: boolean; error?: string } {
  let parsed: ExportedLocalData;

  try {
    parsed = JSON.parse(json) as ExportedLocalData;
  } catch {
    return { ok: false, error: "JSONの形式が正しくありません。" };
  }

  if (!parsed || typeof parsed !== "object") {
    return { ok: false, error: "インポート対象の形式が正しくありません。" };
  }

  if (!Array.isArray(parsed.stocks) || !Array.isArray(parsed.checks)) {
    return { ok: false, error: "stocks と checks の配列が必要です。" };
  }

  const stocks = parsed.stocks.filter(isStock);
  const checks = parsed.checks.filter(isCheck);

  if (stocks.length !== parsed.stocks.length || checks.length !== parsed.checks.length) {
    return { ok: false, error: "stocks または checks に不正な項目があります。" };
  }

  saveStocks(stocks);
  saveChecks(checks);
  return { ok: true };
}

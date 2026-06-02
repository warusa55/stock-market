import { stockDomainId } from "./stock-data.js";

export const stockAcquisitionSources = [
  {
    id: "official_disclosure",
    label: "適時開示",
    sourceType: "official",
    description: "会社が発表した適時開示やIR資料を入力する。"
  },
  {
    id: "company_ir",
    label: "会社IR",
    sourceType: "official",
    description: "会社サイトのIRニュース、決算資料、説明資料を入力する。"
  },
  {
    id: "edinet",
    label: "EDINET",
    sourceType: "official",
    description: "大量保有報告書や有価証券報告書などの法定開示を入力する。"
  },
  {
    id: "news",
    label: "ニュース",
    sourceType: "news",
    description: "ニュース記事や外部メディアの見出し・本文を入力する。"
  },
  {
    id: "memo",
    label: "手動メモ",
    sourceType: "manual",
    description: "ユーザーが見た内容を手動で入力する。"
  }
];

const requestDefinitions = {
  official_disclosure: {
    label: "TDnet適時開示",
    statusWhenReady: "ready",
    summary: "銘柄コードに紐づく適時開示、決算短信、自己株式取得などを確認する。",
    keywords: ["適時開示", "決算短信", "自己株式取得", "業績予想の修正"]
  },
  company_ir: {
    label: "会社IR",
    statusWhenReady: "planned",
    summary: "会社IRページのニュース、決算資料、説明資料を確認する。",
    keywords: ["IR", "決算", "ニュースリリース"]
  },
  edinet: {
    label: "EDINET開示",
    statusWhenReady: "planned",
    summary: "大量保有報告書、有価証券報告書、変更報告書を確認する。",
    keywords: ["大量保有報告書", "変更報告書", "有価証券報告書"]
  },
  news: {
    label: "ニュース",
    statusWhenReady: "ready",
    summary: "ニュース見出しと本文から、開示語句に引っかかる材料を確認する。",
    keywords: ["ニュース", "株価材料", "決算", "TOB"]
  }
};

function normalizeText(value) {
  return String(value ?? "").toLowerCase();
}

function parseUrl(value) {
  try {
    return new URL(String(value ?? ""));
  } catch {
    return null;
  }
}

export function extractTickerCode(value) {
  const text = String(value ?? "");
  const match = text.match(/(?:^|[^\dA-Za-z])(\d{4}[A-Za-z]?)(?=$|[^\dA-Za-z])/);
  return match?.[1]?.toUpperCase() ?? "";
}

export function inferStockSourceKindFromUrl(value) {
  const url = parseUrl(value);
  if (!url) {
    return "";
  }

  const host = normalizeText(url.hostname);
  const path = normalizeText(url.pathname);
  const text = `${host} ${path}`;

  if (text.includes("edinet")) {
    return "edinet";
  }
  if (text.includes("tdnet") || text.includes("release.tdnet") || text.includes("jpx.co.jp")) {
    return "official_disclosure";
  }
  if (host.startsWith("ir.") || path.includes("/ir") || path.includes("/investor")) {
    return "company_ir";
  }
  if (
    text.includes("news") ||
    text.includes("nikkei") ||
    text.includes("kabutan") ||
    text.includes("yahoo") ||
    text.includes("bloomberg") ||
    text.includes("reuters")
  ) {
    return "news";
  }

  return "news";
}

export function findStockAcquisitionSource(sourceKind) {
  return (
    stockAcquisitionSources.find((source) => source.id === sourceKind) ??
    stockAcquisitionSources.find((source) => source.id === "memo")
  );
}

function createRequest({ sourceKind, tickerCode, subjectName, url }) {
  const source = findStockAcquisitionSource(sourceKind);
  const definition = requestDefinitions[source.id];
  if (!definition) {
    return null;
  }

  const hasTarget = Boolean(tickerCode || subjectName || url);
  const status = hasTarget ? definition.statusWhenReady : "needs_target";

  return {
    id: `stock-acquire-${source.id}-${tickerCode || "input"}`,
    domainId: stockDomainId,
    sourceKind: source.id,
    sourceType: source.sourceType,
    label: definition.label,
    status,
    summary: definition.summary,
    query: {
      tickerCode,
      subjectName,
      url,
      keywords: definition.keywords
    }
  };
}

function createUrlRequest({ tickerCode, subjectName, url, sourceKind }) {
  if (!url) {
    return null;
  }

  const source = findStockAcquisitionSource(sourceKind || inferStockSourceKindFromUrl(url));
  return {
    id: `stock-acquire-url-${tickerCode || "input"}`,
    domainId: stockDomainId,
    sourceKind: source.id,
    sourceType: source.sourceType,
    label: "URL本文取得",
    status: "ready",
    summary: "入力URLからタイトルと本文抜粋を取り込み、株用の辞書・eventType推定へ流す。",
    query: {
      tickerCode,
      subjectName,
      url,
      keywords: ["title", "bodyExcerpt"]
    }
  };
}

export function createStockAcquisitionRequests(input = {}) {
  const tickerCode =
    input.subjectCode?.trim() ||
    input.tickerCode?.trim() ||
    extractTickerCode([input.subjectName, input.title, input.bodyExcerpt, input.tags].join(" "));
  const inferredSourceKind = input.sourceKind || inferStockSourceKindFromUrl(input.url);
  const sourceIds =
    inferredSourceKind && inferredSourceKind !== "memo"
      ? [inferredSourceKind]
      : ["official_disclosure", "company_ir", "edinet", "news"];
  const urlRequest = createUrlRequest({
    tickerCode,
    subjectName: input.subjectName,
    url: input.url,
    sourceKind: inferredSourceKind
  });
  const sourceRequests = sourceIds
    .map((sourceKind) =>
      createRequest({
        sourceKind,
        tickerCode,
        subjectName: input.subjectName,
        url: input.url
      })
    )
    .filter(Boolean);

  return [urlRequest, ...sourceRequests].filter(Boolean);
}

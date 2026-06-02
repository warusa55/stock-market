import { inferStockEventType } from "./stock-input.js";

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeTickerCode(value) {
  return normalizeText(value).toUpperCase();
}

function normalizeCompanyCode(value, fallback) {
  const text = normalizeText(value).toUpperCase();
  const listedCode = text.match(/^(\d{4}|\d{3}[A-Z])0$/);
  if (listedCode) {
    return listedCode[1];
  }
  return text || normalizeTickerCode(fallback);
}

function unwrapTdnetItem(item) {
  return item?.Tdnet ?? item?.tdnet ?? item ?? {};
}

export function normalizeTdnetItem(item, { tickerCode = "" } = {}) {
  const source = unwrapTdnetItem(item);
  const code = normalizeCompanyCode(source.company_code, tickerCode);
  const title = normalizeText(source.title) || "TDnet適時開示";
  const companyName = normalizeText(source.company_name);
  const publishedAt = normalizeText(source.pubdate).replace(" ", "T");
  const url = normalizeText(source.document_url);
  const inference = inferStockEventType({
    subjectCode: code,
    subjectName: companyName,
    title,
    bodyExcerpt: companyName
  });

  return {
    id: source.id ? `tdnet-${source.id}` : `tdnet-${code}-${title}`,
    provider: "yanoshin_tdnet",
    sourceKind: "official_disclosure",
    sourceType: "official",
    tickerCode: code,
    companyName,
    title,
    bodyExcerpt: [
      companyName ? `${companyName}の適時開示。` : "TDnet適時開示。",
      publishedAt ? `開示日時: ${publishedAt.replace("T", " ")}。` : "",
      inference.eventType ? `推定eventType: ${inference.eventType}。` : ""
    ]
      .filter(Boolean)
      .join(""),
    url,
    publishedAt: publishedAt || undefined,
    tags: [
      "tdnet",
      "official_disclosure",
      code ? `ticker:${code}` : "",
      inference.eventType || ""
    ].filter(Boolean),
    eventType: inference.eventType,
    sourceStatus: url ? "available" : "unknown",
    raw: source
  };
}

export function normalizeTdnetResponse(payload, { tickerCode = "" } = {}) {
  const items = Array.isArray(payload?.items) ? payload.items : [];

  return {
    provider: "yanoshin_tdnet",
    totalCount: Number(payload?.total_count ?? items.length),
    condition: normalizeText(payload?.condition_desc),
    items: items.map((item) => normalizeTdnetItem(item, { tickerCode }))
  };
}

import {
  createInformationItemFromInput,
  createSubjectFromInput
} from "../../core/dictionary-match.js";
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

export const stockEventTypeRules = [
  {
    eventType: "self_share_buyback_status",
    cardKind: "buyback-status",
    eventMapId: "stock-event-self-share-buyback",
    termIds: ["stock-term-self-share-buyback-status", "stock-term-self-share-buyback"],
    keywords: ["自己株式の取得状況", "取得状況に関するお知らせ", "自社株買いの途中経過"]
  },
  {
    eventType: "self_share_buyback_end",
    cardKind: "buyback-end",
    eventMapId: "stock-event-self-share-buyback",
    termIds: ["stock-term-self-share-buyback-end", "stock-term-self-share-buyback"],
    keywords: ["自己株式の取得終了", "取得終了", "取得結果"]
  },
  {
    eventType: "self_share_buyback_decision",
    cardKind: "buyback",
    eventMapId: "stock-event-self-share-buyback",
    termIds: ["stock-term-self-share-buyback"],
    keywords: ["自己株式取得に係る事項の決定", "自己株式取得の決定", "自社株買い"]
  },
  {
    eventType: "downward_revision",
    cardKind: "downward-revision",
    eventMapId: "stock-event-earnings-revision",
    termIds: ["stock-term-downward-revision", "stock-term-earnings-digest"],
    keywords: ["下方修正", "業績予想の修正", "通期業績予想の修正", "減益予想"]
  },
  {
    eventType: "upward_revision",
    cardKind: "upward-revision",
    eventMapId: "stock-event-earnings-revision",
    termIds: ["stock-term-upward-revision", "stock-term-earnings-digest"],
    keywords: ["上方修正", "業績予想の修正", "通期業績予想の修正", "増益予想"]
  },
  {
    eventType: "earnings_digest",
    cardKind: "earnings-digest",
    eventMapId: "stock-event-earnings-revision",
    termIds: ["stock-term-earnings-digest"],
    keywords: ["決算短信", "決算発表", "四半期決算", "通期決算"]
  },
  {
    eventType: "stock_acquisition_rights",
    cardKind: "stock-acquisition-rights",
    eventMapId: "stock-event-stock-acquisition-rights",
    termIds: ["stock-term-stock-acquisition-rights", "stock-term-dilution"],
    keywords: ["新株予約権", "第三者割当", "希薄化", "ワラント"]
  },
  {
    eventType: "tob_start",
    cardKind: "tob",
    eventMapId: "stock-event-tob",
    termIds: ["stock-term-tob"],
    keywords: ["TOB", "公開買付", "買付価格", "買付期間"]
  },
  {
    eventType: "large_shareholding_report",
    cardKind: "large-shareholding",
    eventMapId: undefined,
    termIds: ["stock-term-large-shareholding-report"],
    keywords: ["大量保有報告書", "変更報告書", "保有割合"]
  }
];

function normalizeText(value) {
  return String(value ?? "").toLowerCase();
}

function inputSearchText(input) {
  return [
    input?.subjectCode,
    input?.subjectName,
    input?.title,
    input?.bodyExcerpt,
    input?.url,
    input?.tags,
    input?.eventType,
    input?.sourceKind
  ]
    .filter(Boolean)
    .join(" ");
}

export function extractTickerCode(value) {
  const text = String(value ?? "");
  const match = text.match(/(?:^|[^\dA-Za-z])(\d{4}[A-Za-z]?)(?=$|[^\dA-Za-z])/);
  return match?.[1]?.toUpperCase() ?? "";
}

export function inferStockEventType(input) {
  if (input?.eventType) {
    const explicitRule = stockEventTypeRules.find((rule) => rule.eventType === input.eventType);
    return {
      eventType: input.eventType,
      cardKind: explicitRule?.cardKind ?? "general",
      eventMapId: explicitRule?.eventMapId,
      termIds: explicitRule?.termIds ?? [],
      confidence: "explicit",
      matchedKeywords: []
    };
  }

  const text = normalizeText(inputSearchText(input));
  const matches = stockEventTypeRules
    .map((rule) => {
      const matchedKeywords = rule.keywords.filter((keyword) => {
        return text.includes(normalizeText(keyword));
      });

      return {
        ...rule,
        matchedKeywords,
        score: matchedKeywords.reduce((sum, keyword) => sum + keyword.length, 0)
      };
    })
    .filter((match) => match.matchedKeywords.length > 0)
    .sort((a, b) => b.score - a.score);

  const best = matches[0];
  if (!best) {
    return {
      eventType: "",
      cardKind: "general",
      eventMapId: undefined,
      termIds: [],
      confidence: "none",
      matchedKeywords: []
    };
  }

  return {
    eventType: best.eventType,
    cardKind: best.cardKind,
    eventMapId: best.eventMapId,
    termIds: best.termIds,
    confidence: best.score >= 8 ? "high" : "medium",
    matchedKeywords: best.matchedKeywords
  };
}

export function findStockAcquisitionSource(sourceKind) {
  return (
    stockAcquisitionSources.find((source) => source.id === sourceKind) ??
    stockAcquisitionSources.find((source) => source.id === "memo")
  );
}

export function createStockInputContext({ input, baseSubject }) {
  const tickerCode =
    input?.subjectCode?.trim() ||
    extractTickerCode([input?.subjectName, input?.title, input?.bodyExcerpt, input?.tags].join(" "));
  const inference = inferStockEventType(input);
  const source = findStockAcquisitionSource(input?.sourceKind);
  const subjectName = input?.subjectName?.trim() || tickerCode || baseSubject.name;
  const subject = createSubjectFromInput({
    id: tickerCode ? `subject-stock-${tickerCode}` : "subject-stock-input",
    domainId: stockDomainId,
    type: "listed-company",
    name: subjectName,
    description: input?.subjectMemo,
    tags: [tickerCode ? `ticker:${tickerCode}` : "", input?.tags].filter(Boolean).join(",")
  });
  const item = createInformationItemFromInput({
    id: tickerCode ? `item-stock-${tickerCode}-input` : "item-stock-input",
    domainId: stockDomainId,
    subjectId: subject.id,
    sourceType: source.sourceType,
    title: input?.title,
    bodyExcerpt: input?.bodyExcerpt,
    url: input?.url,
    tags: [source.id, tickerCode ? `ticker:${tickerCode}` : "", input?.tags].filter(Boolean).join(","),
    eventType: inference.eventType
  });

  item.raw = {
    ...item.raw,
    tickerCode,
    sourceKind: source.id,
    sourceLabel: source.label,
    inferredEventType: inference.eventType,
    inferenceConfidence: inference.confidence,
    matchedKeywords: inference.matchedKeywords
  };

  const timelineItem = {
    id: tickerCode ? `timeline-stock-${tickerCode}-input` : "timeline-stock-input",
    domainId: stockDomainId,
    subjectId: subject.id,
    itemId: item.id,
    title: item.title,
    occurredAt: item.publishedAt ?? item.capturedAt,
    summary: item.bodyExcerpt || item.title,
    tags: item.tags ?? [],
    relatedTermIds: inference.termIds,
    relatedEventMapIds: inference.eventMapId ? [inference.eventMapId] : [],
    eventNodeId: undefined
  };

  return {
    subject,
    item,
    timelineItem,
    inference,
    source
  };
}

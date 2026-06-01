import { DomainPluginBase } from "../../core/plugin-base.js";
import { createReflectionReport } from "../../core/reflection.js";
import { observeScoring } from "../../core/scoring.js";
import {
  fundCheckpoints,
  fundDictionaries,
  fundDomainId,
  fundEventMaps,
  fundInformationItems,
  fundTimelineItems
} from "./fund-data.js";

function textOf(item) {
  return [item?.title, item?.bodyExcerpt, ...(item?.tags ?? []), item?.raw?.eventType]
    .filter(Boolean)
    .join(" ");
}

function detectFundKind(item) {
  const text = textOf(item);

  if (
    text.includes("index_rate_context") ||
    text.includes("NASDAQ100") ||
    text.includes("金利") ||
    text.includes("interest-rate")
  ) {
    return "price-context";
  }
  if (text.includes("monthly_report") || text.includes("月次") || text.includes("組入")) {
    return "monthly-report";
  }
  if (text.includes("currency_hedge_context") || text.includes("為替ヘッジ")) {
    return "currency-hedge";
  }

  return "general";
}

const cardTemplates = {
  "price-context": {
    id: "card-fund-price-context",
    title: "今日の1枚: NASDAQ100系投信に関係する話",
    subtitle: "指数、金利、為替をつないで見る",
    shortExplanation:
      "米国長期金利が上がると、大型グロース株が売られやすくなり、NASDAQ100系投信の基準価額にも影響することがあります。",
    focusPoints: ["米10年債利回り", "NASDAQ100の動き", "ドル円と為替ヘッジの有無"],
    todayTakeaway: "投資信託は世界観カード。商品構造と外部環境をつないで読む。",
    relatedTermIds: ["fund-term-index", "fund-term-interest-rate", "fund-term-fx", "fund-term-nav"],
    relatedEventMapIds: ["fund-event-price-context"],
    nextActions: [
      {
        id: "fund-open-interest-rate",
        label: "金利を見る",
        type: "open_dictionary",
        targetId: "fund-term-interest-rate"
      },
      {
        id: "fund-open-price-context",
        label: "値動きの流れを見る",
        type: "open_event_map",
        targetId: "fund-event-price-context"
      }
    ],
    difficulty: "normal"
  },
  "monthly-report": {
    id: "card-fund-monthly-report",
    title: "今日の1枚: 月次レポート",
    subtitle: "投信の中身と規模の変化を見る",
    shortExplanation: "月次レポートは、組入上位銘柄、地域比率、セクター比率、純資産総額を見る入口です。",
    focusPoints: ["組入上位銘柄", "地域比率とセクター比率", "純資産総額の増減"],
    todayTakeaway: "投信は価格だけでなく、中身が何に寄っているかを見る。",
    relatedTermIds: [
      "fund-term-top-holdings",
      "fund-term-region-ratio",
      "fund-term-sector-ratio",
      "fund-term-net-assets"
    ],
    relatedEventMapIds: ["fund-event-price-context", "fund-event-rebalance"],
    nextActions: [
      {
        id: "fund-open-holdings",
        label: "組入上位を見る",
        type: "open_dictionary",
        targetId: "fund-term-top-holdings"
      },
      {
        id: "fund-open-rebalance-map",
        label: "リバランスを見る",
        type: "open_event_map",
        targetId: "fund-event-rebalance"
      }
    ],
    difficulty: "easy"
  },
  "currency-hedge": {
    id: "card-fund-currency-hedge",
    title: "今日の1枚: 為替ヘッジ",
    subtitle: "同じ指数でも円建ての値動きが変わる",
    shortExplanation: "為替ヘッジの有無によって、海外資産の投信は基準価額の動き方が変わります。",
    focusPoints: ["ヘッジありか", "ヘッジコストはあるか", "円高・円安でどう動くか"],
    todayTakeaway: "海外投信では、指数本体と為替の影響を分けて読む。",
    relatedTermIds: ["fund-term-currency-hedge", "fund-term-fx", "fund-term-nav"],
    relatedEventMapIds: ["fund-event-price-context"],
    nextActions: [
      {
        id: "fund-open-currency-hedge",
        label: "為替ヘッジを見る",
        type: "open_dictionary",
        targetId: "fund-term-currency-hedge"
      },
      {
        id: "fund-open-price-context",
        label: "値動きの流れを見る",
        type: "open_event_map",
        targetId: "fund-event-price-context"
      }
    ],
    difficulty: "normal"
  },
  general: {
    id: "card-fund-general",
    title: "今日の1枚: 投資信託の確認",
    subtitle: "商品構造と外部環境を見る",
    shortExplanation: "投資信託では、商品が何に連動し、どの外部環境の影響を受けるかを確認します。",
    focusPoints: ["ベンチマークは何か", "中身は何か", "外部環境は何か"],
    todayTakeaway: "投資信託は世界観カードとして読む。",
    relatedTermIds: ["fund-term-benchmark", "fund-term-top-holdings"],
    relatedEventMapIds: ["fund-event-price-context"],
    nextActions: [],
    difficulty: "easy"
  }
};

function createCardFromTemplate({ template, subject, item, now }) {
  return {
    ...template,
    id: template.id,
    domainId: fundDomainId,
    subjectId: subject?.id,
    itemId: item?.id,
    createdAt: now
  };
}

export class FundPlugin extends DomainPluginBase {
  constructor() {
    super({
      id: fundDomainId,
      name: "Fund Plugin",
      version: "0.1.0",
      dictionaries: fundDictionaries,
      eventMaps: fundEventMaps,
      cardRules: [
        {
          id: "fund-product-one-card",
          name: "Fund product one-card rule",
          description: "投資信託の商品構造や外部環境から、世界観カードを生成する。"
        }
      ],
      scoringRules: [
        {
          id: "fund-observation-only",
          name: "Fund observation only",
          description: "投信カードの理解反応と補足確認を観察する。"
        }
      ],
      reflectionPrompts: [
        {
          id: "fund-general-and-strict",
          name: "Fund general and strict observation",
          prompt: "売買判断ではなく、商品構造と外部環境の読み方に関する観察コメントを返す。"
        }
      ]
    });
  }

  createCard({ subject, item, now = new Date().toISOString() } = {}) {
    const source = item ?? fundInformationItems[0];
    const kind = detectFundKind(source);
    const template = cardTemplates[kind] ?? cardTemplates.general;

    return createCardFromTemplate({
      template,
      subject,
      item: source,
      now
    });
  }

  createCards(contexts = fundInformationItems.map((item) => ({ item }))) {
    return super.createCards(contexts);
  }

  createCheckpoints({ card } = {}) {
    if (!card) {
      return fundCheckpoints;
    }

    return fundCheckpoints.filter((checkpoint) => checkpoint.relatedCardIds?.includes(card.id));
  }

  score(input) {
    return observeScoring({
      domainId: this.id,
      logs: input.logs ?? [],
      cards: input.cards ?? this.createCards(),
      dictionaryEntries: input.dictionaryEntries ?? fundDictionaries,
      eventMaps: input.eventMaps ?? fundEventMaps,
      timelineItems: input.timelineItems ?? fundTimelineItems
    });
  }

  reflect({ logs, periodStart, periodEnd, targetUserId }) {
    return createReflectionReport({
      domainId: this.id,
      logs,
      periodStart,
      periodEnd,
      targetUserId
    });
  }
}

export function createFundPlugin() {
  return new FundPlugin();
}

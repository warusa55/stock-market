import {
  createOneCardFromTemplate,
  TemplateDrivenPluginBase
} from "../../core/template-driven-plugin.js";
import {
  stockCheckpoints,
  stockDictionaries,
  stockDomainId,
  stockEventMaps,
  stockInformationItems,
  stockTimelineItems
} from "./stock-data.js";

function progressRate(item) {
  const total = item?.raw?.acquiredAmountTotal;
  const max = item?.raw?.maxAmount;
  if (typeof total !== "number" || typeof max !== "number" || max <= 0) {
    return null;
  }
  return Math.round((total / max) * 100);
}

function detectStockKind(item, { plugin }) {
  const eventType = item?.raw?.eventType;
  if (eventType === "self_share_buyback_status") {
    return "buyback-status";
  }
  if (eventType === "self_share_buyback_end") {
    return "buyback-end";
  }
  if (eventType === "downward_revision") {
    return "downward-revision";
  }
  if (eventType === "upward_revision") {
    return "upward-revision";
  }
  if (eventType === "tob_start") {
    return "tob";
  }

  const text = plugin.getItemSearchText(item);

  if (text.includes("取得状況")) {
    return "buyback-status";
  }
  if (text.includes("取得終了")) {
    return "buyback-end";
  }
  if (text.includes("自己株式") || text.includes("自社株買い")) {
    return "buyback";
  }
  if (text.includes("downward_revision") || text.includes("下方修正")) {
    return "downward-revision";
  }
  if (text.includes("upward_revision") || text.includes("上方修正")) {
    return "upward-revision";
  }
  if (text.includes("新株予約権") || text.includes("第三者割当")) {
    return "stock-acquisition-rights";
  }
  if (text.includes("tob") || text.includes("TOB") || text.includes("公開買付")) {
    return "tob";
  }

  return "general";
}

const cardTemplates = {
  "buyback-status": {
    id: "card-stock-buyback-status",
    title: "今日の1枚: 自己株式の取得状況",
    subtitle: "決まっていた自社株買いの途中経過を見る",
    shortExplanation: "すでに決まっていた自己株式取得が、今どれくらい進んだかを確認する資料です。",
    focusPoints: ["当月いくら買ったか", "累計でいくら買ったか", "上限に対して何％進んだか"],
    todayTakeaway: "自己株式取得は「決定」「状況」「終了」で意味が違う。",
    relatedTermIds: ["stock-term-self-share-buyback-status", "stock-term-self-share-buyback"],
    relatedEventMapIds: ["stock-event-self-share-buyback"],
    nextActions: [
      {
        id: "stock-open-buyback-status",
        label: "取得状況を見る",
        type: "open_dictionary",
        targetId: "stock-term-self-share-buyback-status"
      },
      {
        id: "stock-open-buyback-map",
        label: "今ここを見る",
        type: "open_event_map",
        targetId: "stock-event-self-share-buyback"
      },
      {
        id: "stock-mark-understood",
        label: "分かった",
        type: "mark_understood"
      }
    ],
    difficulty: "easy"
  },
  "downward-revision": {
    id: "card-stock-downward-revision",
    title: "今日の1枚: 業績予想の下方修正",
    subtitle: "何が悪化したかと、理由が一時的かを見る",
    shortExplanation: "会社が以前出していた業績予想を低い方向へ修正した発表です。",
    focusPoints: ["売上と利益のどちらが変わったか", "修正理由は一時要因か", "配当予想も変わったか"],
    todayTakeaway: "下方修正は悪材料という結論の前に、どの前提が崩れたかを見る。",
    relatedTermIds: ["stock-term-downward-revision", "stock-term-earnings-digest"],
    relatedEventMapIds: ["stock-event-earnings-revision"],
    nextActions: [
      {
        id: "stock-open-downward-revision",
        label: "下方修正を見る",
        type: "open_dictionary",
        targetId: "stock-term-downward-revision"
      },
      {
        id: "stock-open-earnings-map",
        label: "修正の流れを見る",
        type: "open_event_map",
        targetId: "stock-event-earnings-revision"
      }
    ],
    difficulty: "normal"
  },
  "upward-revision": {
    id: "card-stock-upward-revision",
    title: "今日の1枚: 業績予想の上方修正",
    subtitle: "期待の変化と継続性を見る",
    shortExplanation: "会社が以前出していた業績予想を高い方向へ修正した発表です。",
    focusPoints: ["何が伸びたか", "一時的な要因か", "通期への影響はあるか"],
    todayTakeaway: "上方修正は、伸びた理由と市場がどこまで織り込んでいたかを分けて読む。",
    relatedTermIds: ["stock-term-upward-revision", "stock-term-earnings-digest"],
    relatedEventMapIds: ["stock-event-earnings-revision"],
    nextActions: [
      {
        id: "stock-open-upward-revision",
        label: "上方修正を見る",
        type: "open_dictionary",
        targetId: "stock-term-upward-revision"
      },
      {
        id: "stock-open-earnings-map",
        label: "修正の流れを見る",
        type: "open_event_map",
        targetId: "stock-event-earnings-revision"
      }
    ],
    difficulty: "normal"
  },
  "stock-acquisition-rights": {
    id: "card-stock-acquisition-rights",
    title: "今日の1枚: 新株予約権",
    subtitle: "資金調達と希薄化の両方を見る",
    shortExplanation: "将来株式が増える可能性のある権利を発行する発表です。",
    focusPoints: ["割当先は誰か", "行使価格はいくらか", "希薄化率はどれくらいか"],
    todayTakeaway: "新株予約権は発行時点で終わりではなく、行使状況まで追うイベントです。",
    relatedTermIds: ["stock-term-stock-acquisition-rights", "stock-term-dilution"],
    relatedEventMapIds: ["stock-event-stock-acquisition-rights"],
    nextActions: [
      {
        id: "stock-open-rights",
        label: "新株予約権を見る",
        type: "open_dictionary",
        targetId: "stock-term-stock-acquisition-rights"
      },
      {
        id: "stock-open-rights-map",
        label: "行使の流れを見る",
        type: "open_event_map",
        targetId: "stock-event-stock-acquisition-rights"
      }
    ],
    difficulty: "hard"
  },
  tob: {
    id: "card-stock-tob-start",
    title: "今日の1枚: TOB開始",
    subtitle: "買付価格、期間、成立条件を見る",
    shortExplanation: "市場外で条件を示して株式を買い集める手続きが始まった発表です。",
    focusPoints: ["買付価格はいくらか", "買付期間はいつまでか", "成立条件は何か"],
    todayTakeaway: "TOBは発表だけで成立ではなく、条件と応募状況まで見る。",
    relatedTermIds: ["stock-term-tob"],
    relatedEventMapIds: ["stock-event-tob"],
    nextActions: [
      {
        id: "stock-open-tob",
        label: "TOBを見る",
        type: "open_dictionary",
        targetId: "stock-term-tob"
      },
      {
        id: "stock-open-tob-map",
        label: "成立までを見る",
        type: "open_event_map",
        targetId: "stock-event-tob"
      }
    ],
    difficulty: "normal"
  },
  general: {
    id: "card-stock-general",
    title: "今日の1枚: 個別株の開示",
    subtitle: "会社に何が起きたかを見る",
    shortExplanation: "個別株では、会社に起きた出来事と、その出来事がどの段階かを確認します。",
    focusPoints: ["何のイベントか", "今どの段階か", "次に何が起こり得るか"],
    todayTakeaway: "個別株は出来事カードとして読む。",
    relatedTermIds: [],
    relatedEventMapIds: [],
    nextActions: [],
    difficulty: "easy"
  }
};

export class StockPlugin extends TemplateDrivenPluginBase {
  constructor() {
    super({
      id: stockDomainId,
      name: "Stock Plugin",
      version: "0.1.0",
      dictionaries: stockDictionaries,
      eventMaps: stockEventMaps,
      informationItems: stockInformationItems,
      timelineItems: stockTimelineItems,
      checkpoints: stockCheckpoints,
      cardTemplates,
      defaultCardKind: "general",
      detectCardKind: detectStockKind,
      cardRules: [
        {
          id: "stock-disclosure-one-card",
          name: "Stock disclosure one-card rule",
          description: "個別株の適時開示やニュースから、出来事カードを生成する。"
        }
      ],
      scoringRules: [
        {
          id: "stock-observation-only",
          name: "Stock observation only",
          description: "個別株カードの理解反応と補足確認を観察する。"
        }
      ],
      reflectionPrompts: [
        {
          id: "stock-general-and-strict",
          name: "Stock general and strict observation",
          prompt: "銘柄判断ではなく、開示の読み方に関する観察コメントを返す。"
        }
      ]
    });
  }

  createCardFromTemplate({ template, subject, item, now }) {
    const rate = progressRate(item);
    const focusPoints =
      rate == null || !template
        ? template?.focusPoints
        : [...template.focusPoints, `進捗率は約${rate}%か`];

    return createOneCardFromTemplate({
      domainId: this.id,
      template,
      subject,
      item,
      now,
      overrides: focusPoints ? { focusPoints } : {}
    });
  }
}

export function createStockPlugin() {
  return new StockPlugin();
}

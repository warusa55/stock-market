import { TemplateDrivenPluginBase } from "../../core/template-driven-plugin.js";
import {
  onboardingCheckpoints,
  onboardingDictionaries,
  onboardingDomainId,
  onboardingEventMaps,
  onboardingInformationItems,
  onboardingTimelineItems
} from "./onboarding-data.js";

function detectOnboardingKind(item, { plugin }) {
  const eventType = item?.raw?.eventType;
  if (eventType === "delivery_request") {
    return "delivery-request";
  }
  if (eventType === "invoice_mismatch") {
    return "invoice-mismatch";
  }
  if (eventType === "contract_change") {
    return "contract-change";
  }

  const text = plugin.getItemSearchText(item);

  if (
    text.includes("仕様変更") ||
    text.includes("契約") ||
    text.includes("contract")
  ) {
    return "contract-change";
  }
  if (
    text.includes("最短納期") ||
    text.includes("納期") ||
    text.includes("delivery")
  ) {
    return "delivery-request";
  }
  if (
    text.includes("請求書") ||
    text.includes("請求") ||
    text.includes("invoice")
  ) {
    return "invoice-mismatch";
  }

  return "general";
}

const onboardingCardTemplates = {
  "delivery-request": {
    id: "card-onboarding-delivery-request",
    title: "今日の1枚: 最短納期でお願いできますか？",
    subtitle: "すぐ確約せず、確認対象と権限を切り分ける",
    shortExplanation:
      "顧客の希望を受けた場面です。すぐに納期を約束せず、在庫、回答権限、他案件への影響を確認します。",
    focusPoints: ["在庫はあるか", "納期回答の権限は誰にあるか", "確約してよい段階か"],
    todayTakeaway: "「確認します」は返答ではなく、次の行動の約束。",
    relatedTermIds: [
      "onboarding-term-delivery-date",
      "onboarding-term-checking",
      "onboarding-term-approval"
    ],
    relatedEventMapIds: ["onboarding-event-delivery-answer", "onboarding-event-inquiry-handling"],
    nextActions: [
      {
        id: "onboarding-open-delivery-date",
        label: "納期を見る",
        type: "open_dictionary",
        targetId: "onboarding-term-delivery-date"
      },
      {
        id: "onboarding-open-delivery-map",
        label: "納期回答の流れを見る",
        type: "open_event_map",
        targetId: "onboarding-event-delivery-answer"
      },
      {
        id: "onboarding-mark-later",
        label: "あとで見る",
        type: "mark_later"
      }
    ],
    difficulty: "easy"
  },
  "invoice-mismatch": {
    id: "card-onboarding-invoice-mismatch",
    title: "今日の1枚: 請求書の金額が違うと言われた",
    subtitle: "請求書だけでなく、契約・見積・納品を照合する",
    shortExplanation:
      "金額違いの指摘を受けた場面です。請求書単体ではなく、契約条件、見積、納品実績と照合します。",
    focusPoints: ["契約条件と合っているか", "納品実績と合っているか", "修正権限は誰にあるか"],
    todayTakeaway: "請求違いは、請求書ではなく前提のズレから見る。",
    relatedTermIds: [
      "onboarding-term-invoice",
      "onboarding-term-contract",
      "onboarding-term-escalation"
    ],
    relatedEventMapIds: ["onboarding-event-invoice-check", "onboarding-event-order-process"],
    nextActions: [
      {
        id: "onboarding-open-invoice",
        label: "請求を見る",
        type: "open_dictionary",
        targetId: "onboarding-term-invoice"
      },
      {
        id: "onboarding-open-invoice-map",
        label: "確認の流れを見る",
        type: "open_event_map",
        targetId: "onboarding-event-invoice-check"
      }
    ],
    difficulty: "normal"
  },
  "contract-change": {
    id: "card-onboarding-contract-change",
    title: "今日の1枚: 契約前に仕様変更の相談が来た",
    subtitle: "見積、納期、承認、契約条件への影響を見る",
    shortExplanation:
      "契約前の仕様変更相談です。変更そのものより、見積や納期、承認、契約条件にどう影響するかを整理します。",
    focusPoints: ["見積の範囲は変わるか", "納期に影響するか", "誰の承認が必要か"],
    todayTakeaway: "契約前の変更は、要望ではなく条件変更として読む。",
    relatedTermIds: [
      "onboarding-term-estimate",
      "onboarding-term-contract",
      "onboarding-term-approval"
    ],
    relatedEventMapIds: ["onboarding-event-order-process", "onboarding-event-inquiry-handling"],
    nextActions: [
      {
        id: "onboarding-open-estimate",
        label: "見積を見る",
        type: "open_dictionary",
        targetId: "onboarding-term-estimate"
      },
      {
        id: "onboarding-open-order-map",
        label: "受注処理を見る",
        type: "open_event_map",
        targetId: "onboarding-event-order-process"
      }
    ],
    difficulty: "normal"
  },
  general: {
    id: "card-onboarding-general",
    title: "今日の1枚: 業務ケース",
    subtitle: "確認対象、権限、次の行動を見る",
    shortExplanation: "業務ケースでは、すぐ答えを出す前に、何を確認し、誰に上げるかを切り分けます。",
    focusPoints: ["何を受け取ったか", "何を確認するか", "誰に上げるか"],
    todayTakeaway: "新人教育では、正解暗記よりも現在地と次の行動を掴む。",
    relatedTermIds: ["onboarding-term-first-response", "onboarding-term-escalation"],
    relatedEventMapIds: ["onboarding-event-inquiry-handling"],
    nextActions: [],
    difficulty: "easy"
  }
};

export class OnboardingPlugin extends TemplateDrivenPluginBase {
  constructor() {
    super({
      id: onboardingDomainId,
      name: "Onboarding Plugin",
      version: "0.1.0",
      dictionaries: onboardingDictionaries,
      eventMaps: onboardingEventMaps,
      informationItems: onboardingInformationItems,
      timelineItems: onboardingTimelineItems,
      checkpoints: onboardingCheckpoints,
      cardTemplates: onboardingCardTemplates,
      defaultCardKind: "general",
      detectCardKind: detectOnboardingKind,
      cardRules: [
        {
          id: "onboarding-case-one-card",
          name: "Onboarding case one-card rule",
          description: "仮想業務ケースから、確認対象・権限・次の行動を示す1枚カードを生成する。"
        }
      ],
      scoringRules: [
        {
          id: "onboarding-observation-only",
          name: "Onboarding observation only",
          description: "新人教育の理解反応と補足確認を、評価ではなく観察として扱う。"
        }
      ],
      reflectionPrompts: [
        {
          id: "onboarding-general-and-strict",
          name: "Onboarding general and strict observation",
          prompt: "人事評価ではなく、詰まりやすい確認対象と次の行動を観察コメントとして返す。"
        }
      ]
    });
  }
}

export function createOnboardingPlugin() {
  return new OnboardingPlugin();
}

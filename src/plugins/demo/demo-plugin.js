import { DomainPluginBase } from "../../core/plugin-base.js";
import { createReflectionReport } from "../../core/reflection.js";
import { observeScoring } from "../../core/scoring.js";
import {
  demoCards,
  demoCheckpoints,
  demoDictionaries,
  demoDomainId,
  demoEventMaps
} from "./demo-data.js";

export class DemoContextPlugin extends DomainPluginBase {
  constructor() {
    super({
      id: demoDomainId,
      name: "Demo Context Plugin",
      version: "0.1.0",
      dictionaries: demoDictionaries,
      eventMaps: demoEventMaps,
      cardRules: [
        {
          id: "demo-one-card",
          name: "Demo one-card rule",
          description: "sample sourceTypeの情報片を、基底フロー確認用の1枚カードに変換する。"
        }
      ],
      scoringRules: [
        {
          id: "observation-only",
          name: "Observation only",
          description: "理解反応と補足確認の傾向だけを観察する。"
        }
      ],
      reflectionPrompts: [
        {
          id: "general-and-strict",
          name: "General and strict observation",
          prompt: "一般論と辛口の両方を、断定評価ではなく観察コメントとして返す。"
        }
      ]
    });
  }

  createCard({ item } = {}) {
    if (!item) {
      return demoCards[0];
    }

    return demoCards.find((card) => card.itemId === item.id) ?? null;
  }

  createCheckpoints({ card } = {}) {
    if (!card) {
      return demoCheckpoints;
    }

    return demoCheckpoints.filter((checkpoint) => checkpoint.relatedCardIds?.includes(card.id));
  }

  score(input) {
    return observeScoring({
      domainId: this.id,
      logs: input.logs ?? [],
      cards: input.cards ?? demoCards,
      dictionaryEntries: input.dictionaryEntries ?? demoDictionaries,
      eventMaps: input.eventMaps ?? demoEventMaps,
      timelineItems: input.timelineItems ?? []
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

export function createDemoPlugin() {
  return new DemoContextPlugin();
}

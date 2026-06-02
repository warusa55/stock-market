import assert from "node:assert/strict";
import test from "node:test";
import {
  itemSearchText,
  TemplateDrivenPluginBase
} from "../src/core/template-driven-plugin.js";

const domainId = "template-test";

function createPlugin() {
  return new TemplateDrivenPluginBase({
    id: domainId,
    name: "Template Test Plugin",
    version: "0.1.0",
    dictionaries: [],
    eventMaps: [],
    informationItems: [
      {
        id: "item-template-001",
        domainId,
        subjectIds: ["subject-template-001"],
        sourceType: "case",
        title: "納期の相談",
        bodyExcerpt: "確認対象を切り分ける。",
        capturedAt: "2026-06-02T00:00:00.000Z",
        tags: ["delivery"],
        raw: {
          eventType: "delivery_request"
        }
      }
    ],
    checkpoints: [
      {
        id: "checkpoint-template-001",
        domainId,
        title: "確認",
        prompt: "何を見るか",
        relatedCardIds: ["card-template-delivery"]
      }
    ],
    timelineItems: [
      {
        id: "timeline-template-001",
        domainId,
        subjectId: "subject-template-001",
        title: "相談を受けた",
        occurredAt: "2026-06-02T00:00:00.000Z",
        summary: "納期相談を受けた。",
        tags: ["delivery"]
      }
    ],
    cardTemplates: {
      delivery: {
        id: "card-template-delivery",
        title: "今日の1枚: 納期相談",
        shortExplanation: "納期相談の初動を見る。",
        focusPoints: ["在庫", "権限"],
        todayTakeaway: "確約前に確認する。",
        relatedTermIds: [],
        relatedEventMapIds: [],
        nextActions: [],
        difficulty: "easy"
      },
      general: {
        id: "card-template-general",
        title: "今日の1枚: 一般",
        shortExplanation: "一般カード。",
        focusPoints: ["対象"],
        todayTakeaway: "小さく見る。",
        relatedTermIds: [],
        relatedEventMapIds: [],
        nextActions: [],
        difficulty: "easy"
      }
    },
    detectCardKind: (item, { plugin }) => {
      return plugin.getItemSearchText(item).includes("delivery_request") ? "delivery" : "general";
    }
  });
}

test("itemSearchText joins stable item fields for plugin-side detection", () => {
  const text = itemSearchText({
    title: "請求確認",
    bodyExcerpt: "契約と納品を照合する。",
    tags: ["invoice"],
    raw: {
      eventType: "invoice_mismatch"
    }
  });

  assert.match(text, /請求確認/);
  assert.match(text, /invoice/);
  assert.match(text, /invoice_mismatch/);
});

test("TemplateDrivenPluginBase creates cards from templates and default items", () => {
  const plugin = createPlugin();
  const card = plugin.createCard({
    now: "2026-06-02T00:00:00.000Z"
  });

  assert.equal(card.id, "card-template-delivery");
  assert.equal(card.domainId, domainId);
  assert.equal(card.itemId, "item-template-001");
  assert.equal(card.createdAt, "2026-06-02T00:00:00.000Z");
  assert.equal(plugin.createCards().length, 1);
});

test("TemplateDrivenPluginBase filters checkpoints by relatedCardIds", () => {
  const plugin = createPlugin();
  const card = plugin.createCard();

  assert.equal(plugin.createCheckpoints({ card })[0].id, "checkpoint-template-001");
  assert.equal(plugin.createCheckpoints({ card: { id: "missing" } }).length, 0);
  assert.equal(plugin.createCheckpoints({}).length, 1);
});

test("TemplateDrivenPluginBase delegates scoring and reflection as observation", () => {
  const plugin = createPlugin();
  const log = {
    id: "log-template-001",
    userId: "user-template",
    sessionId: "session-template",
    domainId,
    cardId: "card-template-delivery",
    openedAt: "2026-06-02T00:00:00.000Z",
    closedAt: "2026-06-02T00:01:00.000Z",
    readDurationMs: 60000,
    openedDictionaryIds: [],
    openedEventMapIds: [],
    selectedActions: [],
    finalReaction: "unclear"
  };

  const score = plugin.score({ logs: [log] });
  const report = plugin.reflect({
    logs: [log],
    periodStart: "2026-06-01T00:00:00.000Z",
    periodEnd: "2026-06-02T00:00:00.000Z",
    now: () => "2026-06-02T00:00:00.000Z"
  });

  assert.equal(score.domainId, domainId);
  assert.match(score.traits[0].interpretation, /断定ではなく/);
  assert.equal(report.domainId, domainId);
  assert.match(report.strictComment, /次に決めること/);
});

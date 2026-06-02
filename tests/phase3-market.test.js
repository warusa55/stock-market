import assert from "node:assert/strict";
import test from "node:test";
import { TemplateDrivenPluginBase } from "../src/core/template-driven-plugin.js";
import { createMarketRegistry } from "../src/plugins/market/index.js";
import { createFundPlugin } from "../src/plugins/fund/fund-plugin.js";
import { fundInformationItems, fundSubject } from "../src/plugins/fund/fund-data.js";
import { createStockPlugin } from "../src/plugins/stock/stock-plugin.js";
import { stockInformationItems, stockSubject } from "../src/plugins/stock/stock-data.js";

test("stock plugin derives from TemplateDrivenPluginBase and exposes stock dictionaries", () => {
  const plugin = createStockPlugin();

  assert.ok(plugin instanceof TemplateDrivenPluginBase);
  assert.equal(plugin.id, "stock");
  assert.equal(plugin.findDictionaryEntry("自社株買い").id, "stock-term-self-share-buyback");
  assert.equal(plugin.findEventMap("stock-event-self-share-buyback").nodes.length, 4);
});

test("stock plugin creates an individual stock event card", () => {
  const plugin = createStockPlugin();
  const card = plugin.createCard({
    subject: stockSubject,
    item: stockInformationItems[0],
    now: "2026-06-02T00:00:00.000Z"
  });

  assert.equal(card.domainId, "stock");
  assert.equal(card.subjectId, stockSubject.id);
  assert.equal(card.itemId, "item-stock-buyback-status");
  assert.equal(card.id, "card-stock-buyback-status");
  assert.ok(card.focusPoints.some((point) => point.includes("進捗率")));
  assert.deepEqual(card.relatedEventMapIds, ["stock-event-self-share-buyback"]);
});

test("stock plugin maps TOB items to the TOB event map", () => {
  const plugin = createStockPlugin();
  const card = plugin.createCard({
    subject: stockSubject,
    item: stockInformationItems[2],
    now: "2026-06-02T00:00:00.000Z"
  });

  assert.equal(card.id, "card-stock-tob-start");
  assert.equal(card.relatedTermIds[0], "stock-term-tob");
  assert.equal(plugin.createCheckpoints({ card })[0].id, "checkpoint-stock-tob");
});

test("fund plugin derives from TemplateDrivenPluginBase and exposes fund dictionaries", () => {
  const plugin = createFundPlugin();

  assert.ok(plugin instanceof TemplateDrivenPluginBase);
  assert.equal(plugin.id, "fund");
  assert.equal(plugin.findDictionaryEntry("インデックス").id, "fund-term-index");
  assert.equal(plugin.findEventMap("fund-event-price-context").nodes.length, 4);
});

test("fund plugin creates a world-context card for investment trusts", () => {
  const plugin = createFundPlugin();
  const card = plugin.createCard({
    subject: fundSubject,
    item: fundInformationItems[0],
    now: "2026-06-02T00:00:00.000Z"
  });

  assert.equal(card.domainId, "fund");
  assert.equal(card.subjectId, fundSubject.id);
  assert.equal(card.itemId, "item-fund-nasdaq-rate");
  assert.equal(card.id, "card-fund-price-context");
  assert.ok(card.focusPoints.includes("米10年債利回り"));
  assert.deepEqual(card.relatedEventMapIds, ["fund-event-price-context"]);
});

test("fund plugin maps monthly reports to portfolio checkpoints", () => {
  const plugin = createFundPlugin();
  const card = plugin.createCard({
    subject: fundSubject,
    item: fundInformationItems[1],
    now: "2026-06-02T00:00:00.000Z"
  });

  assert.equal(card.id, "card-fund-monthly-report");
  assert.equal(plugin.createCheckpoints({ card })[0].id, "checkpoint-fund-monthly-report");
});

test("market registry registers stock and fund plugins together", () => {
  const registry = createMarketRegistry();
  const ids = registry.list().map((plugin) => plugin.id);

  assert.deepEqual(ids, ["stock", "fund"]);
  assert.equal(registry.require("stock").name, "Stock Plugin");
  assert.equal(registry.require("fund").name, "Fund Plugin");
});

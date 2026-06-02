import assert from "node:assert/strict";
import test from "node:test";
import { TemplateDrivenPluginBase } from "../src/core/template-driven-plugin.js";
import { createMarketRegistry } from "../src/plugins/market/index.js";
import { executeAcquisitionRequest, loadContextData } from "../apps/web/data-source.js";
import { createFundPlugin } from "../src/plugins/fund/fund-plugin.js";
import { fundInformationItems, fundSubject } from "../src/plugins/fund/fund-data.js";
import { createStockPlugin } from "../src/plugins/stock/stock-plugin.js";
import { stockInformationItems, stockSubject } from "../src/plugins/stock/stock-data.js";

test("stock plugin derives from TemplateDrivenPluginBase and exposes stock dictionaries", () => {
  const plugin = createStockPlugin();

  assert.ok(plugin instanceof TemplateDrivenPluginBase);
  assert.equal(plugin.id, "stock");
  assert.equal(plugin.findDictionaryEntry("自社株買い").id, "stock-term-self-share-buyback");
  assert.equal(plugin.findDictionaryEntry("決算発表").id, "stock-term-earnings-digest");
  assert.equal(plugin.findDictionaryEntry("適時開示").id, "stock-term-timely-disclosure");
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

test("market web data source creates stock cards from manual input and dictionary hits", async () => {
  const data = await loadContextData({
    search: "?domain=stock",
    input: {
      subjectName: "サンプル電機",
      subjectCode: "7203",
      sourceKind: "official_disclosure",
      title: "自己株式の取得状況に関するお知らせ",
      bodyExcerpt: "自社株買いの途中経過を確認する。",
      tags: "self-share-buyback,status"
    }
  });

  assert.equal(data.registryId, "market");
  assert.equal(data.domainId, "stock");
  assert.equal(data.card.id, "card-stock-buyback-status");
  assert.equal(data.item.sourceType, "official");
  assert.equal(data.item.raw.tickerCode, "7203");
  assert.equal(data.item.raw.inferredEventType, "self_share_buyback_status");
  assert.ok(data.dictionaryMatches.some((match) => match.entry.id === "stock-term-self-share-buyback"));
  assert.ok(data.dictionaryMatches.some((match) => match.entry.id === "stock-term-self-share-buyback-status"));
  assert.equal(data.eventMap.id, "stock-event-self-share-buyback");
});

test("market web data source infers stock revision events from input text", async () => {
  const data = await loadContextData({
    search: "?domain=stock",
    input: {
      subjectName: "サンプル電機",
      subjectCode: "7203",
      sourceKind: "official_disclosure",
      title: "通期業績予想の修正に関するお知らせ",
      bodyExcerpt: "需要減速により営業利益の見通しを下方修正する。",
      tags: "earnings-forecast"
    }
  });

  assert.equal(data.card.id, "card-stock-downward-revision");
  assert.equal(data.item.raw.inferredEventType, "downward_revision");
  assert.ok(data.dictionaryMatches.some((match) => match.entry.id === "stock-term-downward-revision"));
  assert.equal(data.eventMap.id, "stock-event-earnings-revision");
  assert.equal(data.timeline[0].relatedEventMapIds[0], "stock-event-earnings-revision");
});

test("market web data source enriches stock input from URL content", async () => {
  const data = await loadContextData({
    search: "?domain=stock",
    input: {
      subjectCode: "7203",
      url: "https://www.release.tdnet.info/inbs/140120260602000001.pdf"
    },
    fetchUrlContent: async () => ({
      title: "自己株式の取得終了に関するお知らせ",
      bodyExcerpt: "取得結果と消却予定を確認する開示。"
    })
  });

  assert.equal(data.card.id, "card-stock-buyback-end");
  assert.equal(data.item.title, "自己株式の取得終了に関するお知らせ");
  assert.equal(data.item.raw.sourceKind, "official_disclosure");
  assert.equal(data.item.raw.urlContentStatus, "ok");
  assert.ok(data.acquisitionRequests.some((request) => request.label === "URL本文取得"));
});

test("market web data source executes URL acquisition into input patch", async () => {
  const initialData = await loadContextData({
    search: "?domain=stock",
    input: {
      subjectCode: "186A",
      url: "https://www.release.tdnet.info/inbs/example.html"
    }
  });
  const request = initialData.acquisitionRequests.find((item) => item.label === "URL本文取得");
  const result = await executeAcquisitionRequest({
    search: "?domain=stock",
    input: {
      subjectCode: "186A",
      url: "https://www.release.tdnet.info/inbs/example.html"
    },
    request,
    fetchUrlContent: async () => ({
      title: "自己株式の取得状況に関するお知らせ",
      bodyExcerpt: "自社株買いの途中経過を確認する。"
    })
  });

  assert.equal(result.status, "completed");
  assert.equal(result.inputPatch.subjectCode, "186A");
  assert.equal(result.inputPatch.sourceKind, "official_disclosure");
  assert.equal(result.inputPatch.title, "自己株式の取得状況に関するお知らせ");
});

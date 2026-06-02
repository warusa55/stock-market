import assert from "node:assert/strict";
import test from "node:test";
import {
  createStockInputContext,
  extractTickerCode,
  inferStockEventType
} from "../src/plugins/stock/stock-input.js";
import { stockSubject } from "../src/plugins/stock/stock-data.js";

test("extractTickerCode finds listed company codes from input text", () => {
  assert.equal(extractTickerCode("7203 トヨタ自動車"), "7203");
  assert.equal(extractTickerCode("ticker:6758"), "6758");
  assert.equal(extractTickerCode("コードなし"), "");
});

test("inferStockEventType detects buyback status from disclosure text", () => {
  const inference = inferStockEventType({
    title: "自己株式の取得状況に関するお知らせ"
  });

  assert.equal(inference.eventType, "self_share_buyback_status");
  assert.equal(inference.cardKind, "buyback-status");
  assert.equal(inference.confidence, "high");
});

test("inferStockEventType respects explicit eventType values", () => {
  const inference = inferStockEventType({
    eventType: "tob_start",
    title: "別の見出し"
  });

  assert.equal(inference.eventType, "tob_start");
  assert.equal(inference.cardKind, "tob");
  assert.equal(inference.confidence, "explicit");
});

test("createStockInputContext carries ticker, source and event inference", () => {
  const context = createStockInputContext({
    baseSubject: stockSubject,
    input: {
      subjectName: "サンプル電機",
      subjectCode: "7203",
      sourceKind: "official_disclosure",
      title: "自己株式の取得状況に関するお知らせ",
      bodyExcerpt: "自社株買いの途中経過を確認する。"
    }
  });

  assert.equal(context.subject.id, "subject-stock-7203");
  assert.equal(context.item.sourceType, "official");
  assert.equal(context.item.raw.tickerCode, "7203");
  assert.equal(context.item.raw.sourceKind, "official_disclosure");
  assert.equal(context.item.raw.inferredEventType, "self_share_buyback_status");
  assert.ok(context.item.raw.acquisitionRequestIds.includes("stock-acquire-official_disclosure-7203"));
  assert.deepEqual(context.timelineItem.relatedEventMapIds, ["stock-event-self-share-buyback"]);
  assert.ok(context.timelineItem.relatedTermIds.includes("stock-term-self-share-buyback-status"));
});

test("createStockInputContext infers source kind from URL", () => {
  const context = createStockInputContext({
    baseSubject: stockSubject,
    input: {
      subjectCode: "7203",
      url: "https://disclosure2.edinet-fsa.go.jp/example",
      title: "大量保有報告書",
      bodyExcerpt: "保有割合の変更報告書が提出された。"
    }
  });

  assert.equal(context.item.sourceType, "official");
  assert.equal(context.item.raw.sourceKind, "edinet");
  assert.equal(context.item.raw.inferredEventType, "large_shareholding_report");
  assert.equal(context.acquisitionRequests[0].label, "URL本文取得");
});

import assert from "node:assert/strict";
import test from "node:test";
import { normalizeTdnetItem, normalizeTdnetResponse } from "../src/plugins/stock/tdnet-acquisition.js";

const sampleItem = {
  Tdnet: {
    id: "1256305",
    pubdate: "2026-05-28 18:45:00",
    company_code: "72030",
    company_name: "トヨタ自",
    title: "自己株式の取得状況に関するお知らせ",
    document_url: "https://webapi.yanoshin.jp/rd.php?https://www.release.tdnet.info/inbs/sample.pdf"
  }
};

test("normalizeTdnetItem maps Yanoshin TDnet fields to acquisition items", () => {
  const item = normalizeTdnetItem(sampleItem, { tickerCode: "7203" });

  assert.equal(item.id, "tdnet-1256305");
  assert.equal(item.provider, "yanoshin_tdnet");
  assert.equal(item.tickerCode, "7203");
  assert.equal(item.sourceKind, "official_disclosure");
  assert.equal(item.sourceType, "official");
  assert.equal(item.title, "自己株式の取得状況に関するお知らせ");
  assert.equal(item.eventType, "self_share_buyback_status");
  assert.ok(item.tags.includes("ticker:7203"));
  assert.ok(item.url.includes("release.tdnet.info"));
});

test("normalizeTdnetResponse returns normalized result list", () => {
  const result = normalizeTdnetResponse(
    {
      total_count: 1,
      condition_desc: "7203の適時開示情報一覧",
      items: [sampleItem]
    },
    { tickerCode: "7203" }
  );

  assert.equal(result.provider, "yanoshin_tdnet");
  assert.equal(result.totalCount, 1);
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].tickerCode, "7203");
});

test("normalizeTdnetItem maps three digit alpha company codes", () => {
  const item = normalizeTdnetItem(
    {
      Tdnet: {
        id: "alpha-1",
        pubdate: "2026-06-03 15:00:00",
        company_code: "186A0",
        company_name: "サンプル新興株",
        title: "決算短信",
        document_url: "https://example.test/186a.pdf"
      }
    },
    { tickerCode: "186A" }
  );

  assert.equal(item.tickerCode, "186A");
  assert.ok(item.tags.includes("ticker:186A"));
});

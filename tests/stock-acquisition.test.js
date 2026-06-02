import assert from "node:assert/strict";
import test from "node:test";
import {
  createStockAcquisitionInputPatch,
  createStockAcquisitionRequests,
  inferStockSourceKindFromUrl
} from "../src/plugins/stock/stock-acquisition.js";

test("inferStockSourceKindFromUrl maps stock source hosts", () => {
  assert.equal(
    inferStockSourceKindFromUrl("https://www.release.tdnet.info/inbs/140120260602000001.pdf"),
    "official_disclosure"
  );
  assert.equal(inferStockSourceKindFromUrl("https://disclosure2.edinet-fsa.go.jp/example"), "edinet");
  assert.equal(inferStockSourceKindFromUrl("https://kabutan.jp/news/marketnews/?b=n2026060201"), "news");
});

test("createStockAcquisitionRequests creates ticker based source candidates", () => {
  const requests = createStockAcquisitionRequests({
    subjectCode: "7203",
    subjectName: "サンプル電機"
  });

  assert.deepEqual(
    requests.map((request) => request.sourceKind),
    ["official_disclosure", "company_ir", "edinet", "news"]
  );
  assert.ok(requests.every((request) => request.query.tickerCode === "7203"));
  assert.equal(requests[0].query.provider, "yanoshin_tdnet");
  assert.equal(requests[0].query.externalUrl, "https://webapi.yanoshin.jp/webapi/tdnet/list/7203.html");
});

test("createStockAcquisitionRequests supports three digit alpha listed codes", () => {
  const requests = createStockAcquisitionRequests({
    subjectCode: "186A",
    subjectName: "サンプル新興株"
  });

  assert.equal(requests[0].status, "ready");
  assert.equal(requests[0].query.tickerCode, "186A");
  assert.equal(requests[0].query.externalUrl, "https://webapi.yanoshin.jp/webapi/tdnet/list/186A.html");
});

test("createStockAcquisitionRequests keeps TDnet visible when a non-url sourceKind is selected", () => {
  const requests = createStockAcquisitionRequests({
    subjectCode: "186A",
    subjectName: "サンプル新興株",
    sourceKind: "company_ir"
  });

  assert.deepEqual(
    requests.map((request) => request.sourceKind),
    ["official_disclosure", "company_ir", "edinet", "news"]
  );
});

test("createStockAcquisitionRequests narrows requests by url source", () => {
  const requests = createStockAcquisitionRequests({
    subjectCode: "7203",
    url: "https://disclosure2.edinet-fsa.go.jp/example"
  });

  assert.equal(requests[0].label, "URL本文取得");
  assert.deepEqual(
    requests.map((request) => request.sourceKind),
    ["edinet", "edinet"]
  );
});

test("createStockAcquisitionInputPatch selects sources without creating fake item text", () => {
  const request = createStockAcquisitionRequests({
    subjectCode: "186A",
    subjectName: "サンプル株"
  })[0];
  const patch = createStockAcquisitionInputPatch(request, {
    currentInput: {
      tags: "watch"
    }
  });

  assert.equal(patch.subjectCode, "186A");
  assert.equal(patch.sourceKind, "official_disclosure");
  assert.equal(patch.title, undefined);
  assert.ok(patch.tags.includes("ticker:186A"));
});

test("createStockAcquisitionInputPatch applies URL content when available", () => {
  const request = createStockAcquisitionRequests({
    subjectCode: "186A",
    url: "https://www.release.tdnet.info/inbs/example.html"
  })[0];
  const patch = createStockAcquisitionInputPatch(request, {
    content: {
      title: "自己株式の取得状況に関するお知らせ",
      bodyExcerpt: "自社株買いの途中経過。"
    }
  });

  assert.equal(patch.title, "自己株式の取得状況に関するお知らせ");
  assert.equal(patch.bodyExcerpt, "自社株買いの途中経過。");
  assert.equal(patch.urlContent.status, "ok");
});

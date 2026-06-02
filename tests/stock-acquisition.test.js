import assert from "node:assert/strict";
import test from "node:test";
import {
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

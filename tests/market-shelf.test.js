import assert from "node:assert/strict";
import test from "node:test";
import {
  createEmptyMarketShelf,
  createTimelineItemsFromShelf,
  getSelectedShelfItem,
  getSelectedShelfSubject,
  listItemsForSubject,
  normalizeMarketShelf,
  restoreInputFromShelf,
  saveInputToMarketShelf,
  selectShelfItem,
  selectShelfSubject
} from "../apps/web/market-shelf.js";

function createIdFactory() {
  let count = 0;
  return (prefix) => {
    count += 1;
    return `${prefix}-${count}`;
  };
}

test("normalizeMarketShelf tolerates missing or malformed state", () => {
  assert.deepEqual(normalizeMarketShelf(null), createEmptyMarketShelf());
  assert.deepEqual(normalizeMarketShelf({ subjects: "bad", items: "bad" }), createEmptyMarketShelf());
});

test("saveInputToMarketShelf creates a subject and item from input", () => {
  const result = saveInputToMarketShelf(
    createEmptyMarketShelf(),
    {
      subjectName: "アクセルスペース",
      subjectCode: "402A",
      subjectType: "listed-company",
      subjectMemo: "監視銘柄",
      sourceType: "official",
      sourceKind: "official_disclosure",
      title: "自己株式の取得状況に関するお知らせ",
      bodyExcerpt: "自社株買いの途中経過。",
      tags: "self-share-buyback,status",
      eventType: "self_share_buyback_status"
    },
    {
      domainId: "stock",
      now: new Date("2026-06-02T00:00:00.000Z"),
      idFactory: createIdFactory()
    }
  );

  assert.equal(result.subject.code, "402A");
  assert.equal(result.item.sourceKind, "official_disclosure");
  assert.equal(result.shelf.selectedSubjectId, result.subject.id);
  assert.equal(result.shelf.selectedItemId, result.item.id);
  assert.ok(result.subject.tags.includes("ticker:402A"));
});

test("saveInputToMarketShelf updates same code subject and adds multiple items", () => {
  const idFactory = createIdFactory();
  const first = saveInputToMarketShelf(
    createEmptyMarketShelf(),
    {
      subjectName: "日本製鉄",
      subjectCode: "5401",
      title: "決算短信",
      bodyExcerpt: "通期決算を確認する。",
      tags: "earnings"
    },
    {
      domainId: "stock",
      now: new Date("2026-06-01T00:00:00.000Z"),
      idFactory
    }
  );
  const second = saveInputToMarketShelf(
    first.shelf,
    {
      subjectName: "日本製鉄",
      subjectCode: "5401",
      title: "業績予想の修正に関するお知らせ",
      bodyExcerpt: "上方修正を確認する。",
      tags: "upward-revision"
    },
    {
      domainId: "stock",
      now: new Date("2026-06-02T00:00:00.000Z"),
      idFactory
    }
  );

  assert.equal(second.shelf.subjects.length, 1);
  assert.equal(second.shelf.items.length, 2);
  assert.equal(listItemsForSubject(second.shelf, second.subject.id)[0].title, "業績予想の修正に関するお知らせ");
});

test("saveInputToMarketShelf avoids exact duplicate item by subject title and url", () => {
  const idFactory = createIdFactory();
  const input = {
    subjectName: "サンプル電機",
    subjectCode: "7203",
    title: "公開買付け開始に関する発表",
    url: "https://example.test/tob"
  };
  const first = saveInputToMarketShelf(createEmptyMarketShelf(), input, { idFactory });
  const second = saveInputToMarketShelf(first.shelf, input, { idFactory });

  assert.equal(second.shelf.subjects.length, 1);
  assert.equal(second.shelf.items.length, 1);
  assert.equal(second.shelf.selectedItemId, first.item.id);
});

test("selectShelfSubject and selectShelfItem update selected ids", () => {
  const idFactory = createIdFactory();
  const first = saveInputToMarketShelf(
    createEmptyMarketShelf(),
    { subjectName: "A社", subjectCode: "1001", title: "決算短信" },
    { idFactory, now: new Date("2026-06-01T00:00:00.000Z") }
  );
  const second = saveInputToMarketShelf(
    first.shelf,
    { subjectName: "B社", subjectCode: "1002", title: "大量保有報告書" },
    { idFactory, now: new Date("2026-06-02T00:00:00.000Z") }
  );
  const selectedFirstSubject = selectShelfSubject(second.shelf, first.subject.id);
  const selectedSecondItem = selectShelfItem(selectedFirstSubject, second.item.id);

  assert.equal(getSelectedShelfSubject(selectedFirstSubject).id, first.subject.id);
  assert.equal(getSelectedShelfItem(selectedFirstSubject).subjectId, first.subject.id);
  assert.equal(getSelectedShelfSubject(selectedSecondItem).id, second.subject.id);
  assert.equal(getSelectedShelfItem(selectedSecondItem).id, second.item.id);
});

test("restoreInputFromShelf and createTimelineItemsFromShelf bridge shelf back to existing input flow", () => {
  const subject = {
    id: "subject-1",
    domainId: "stock",
    subjectType: "listed-company",
    code: "186A",
    name: "サンプル株",
    memo: "監視",
    tags: []
  };
  const item = {
    id: "item-1",
    subjectId: "subject-1",
    domainId: "stock",
    sourceType: "news",
    sourceKind: "news",
    title: "ニュース観測メモ",
    bodyExcerpt: "株価材料の観測。",
    url: "https://example.test/news",
    tags: ["news"],
    eventType: "",
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-02T00:00:00.000Z"
  };

  assert.deepEqual(restoreInputFromShelf(subject, item), {
    subjectName: "サンプル株",
    subjectCode: "186A",
    subjectType: "listed-company",
    subjectMemo: "監視",
    sourceType: "news",
    sourceKind: "news",
    title: "ニュース観測メモ",
    bodyExcerpt: "株価材料の観測。",
    url: "https://example.test/news",
    tags: "news",
    eventType: ""
  });

  assert.deepEqual(createTimelineItemsFromShelf(subject, [item])[0], {
    id: "timeline-item-1",
    domainId: "stock",
    subjectId: "subject-1",
    itemId: "item-1",
    title: "ニュース観測メモ",
    occurredAt: "2026-06-02T00:00:00.000Z",
    summary: "株価材料の観測。",
    tags: ["news"],
    relatedTermIds: [],
    relatedEventMapIds: [],
    eventNodeId: undefined
  });
});

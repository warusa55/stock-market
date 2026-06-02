import assert from "node:assert/strict";
import test from "node:test";
import { loadContextData } from "../apps/web/data-source.js";

test("web data source falls back to demo plugin on base", async () => {
  const data = await loadContextData({
    search: "?registry=demo"
  });

  assert.equal(data.registryId, "demo");
  assert.equal(data.domainId, "demo-context");
  assert.equal(data.card.id, "card-demo-001");
  assert.ok(data.dictionary.length > 0);
  assert.ok(data.eventMap.nodes.length > 0);
  assert.equal(data.checkpoint.id, "checkpoint-demo-001");
});

test("web data source builds cards and matches dictionary from input", async () => {
  const data = await loadContextData({
    search: "?registry=demo",
    input: {
      subjectName: "入力対象",
      sourceType: "manual",
      title: "現在地を確認するメモ",
      bodyExcerpt: "見るポイントとチェックポイントを整理する。",
      tags: "reading",
      eventType: ""
    }
  });

  assert.equal(data.subject.name, "入力対象");
  assert.equal(data.item.title, "現在地を確認するメモ");
  assert.equal(data.card.itemId, "item-input-demo-context");
  assert.ok(data.dictionaryMatches.some((match) => match.entry.id === "term-current-point"));
  assert.ok(data.dictionaryMatches.some((match) => match.entry.id === "term-focus-point"));
});

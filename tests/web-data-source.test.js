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

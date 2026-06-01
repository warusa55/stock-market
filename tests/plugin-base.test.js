import assert from "node:assert/strict";
import test from "node:test";
import { DomainPluginBase } from "../src/core/plugin-base.js";
import { PluginRegistry } from "../src/core/registry.js";
import { createDemoPlugin, DemoContextPlugin } from "../src/plugins/demo/demo-plugin.js";

test("DomainPluginBase exposes immutable plugin definition data", () => {
  const plugin = new DomainPluginBase({
    id: "base-test",
    name: "Base Test",
    version: "0.1.0",
    dictionaries: [
      {
        id: "term-a",
        term: "A",
        aliases: ["alpha"],
        category: "demo",
        status: "verified",
        shortExplanation: "short",
        whyItMatters: [],
        firstCheckpoints: []
      }
    ]
  });

  assert.equal(plugin.findDictionaryEntry("alpha").id, "term-a");
  assert.throws(() => plugin.dictionaries.push({}), /object is not extensible|read only/i);
  assert.equal(plugin.createCard(), null);
});

test("derived plugins can override card and reflection behavior", () => {
  const plugin = createDemoPlugin();

  assert.ok(plugin instanceof DomainPluginBase);
  assert.ok(plugin instanceof DemoContextPlugin);
  assert.equal(plugin.createCard({ item: { id: "item-demo-001" } }).id, "card-demo-001");

  const report = plugin.reflect({
    logs: [],
    periodStart: "2026-06-01T00:00:00.000Z",
    periodEnd: "2026-06-02T00:00:00.000Z"
  });

  assert.equal(report.domainId, "demo-context");
  assert.match(report.generalComment, /操作ログ/);
});

test("PluginRegistry rejects duplicate plugin ids", () => {
  const registry = new PluginRegistry();
  const plugin = createDemoPlugin();

  registry.register(plugin);

  assert.equal(registry.require("demo-context"), plugin);
  assert.throws(() => registry.register(createDemoPlugin()), /already registered/);
});

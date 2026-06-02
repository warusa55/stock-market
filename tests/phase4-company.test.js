import assert from "node:assert/strict";
import test from "node:test";
import { TemplateDrivenPluginBase } from "../src/core/template-driven-plugin.js";
import { createCompanyRegistry } from "../src/plugins/company/index.js";
import { createOnboardingPlugin } from "../src/plugins/onboarding/onboarding-plugin.js";
import {
  onboardingInformationItems,
  onboardingSubject
} from "../src/plugins/onboarding/onboarding-data.js";

test("onboarding plugin derives from TemplateDrivenPluginBase and exposes business dictionaries", () => {
  const plugin = createOnboardingPlugin();

  assert.ok(plugin instanceof TemplateDrivenPluginBase);
  assert.equal(plugin.id, "onboarding");
  assert.equal(plugin.findDictionaryEntry("エスカレーション").id, "onboarding-term-escalation");
  assert.equal(plugin.findEventMap("onboarding-event-inquiry-handling").nodes.length, 5);
});

test("onboarding plugin creates delivery request cards", () => {
  const plugin = createOnboardingPlugin();
  const card = plugin.createCard({
    subject: onboardingSubject,
    item: onboardingInformationItems[0],
    now: "2026-06-02T00:00:00.000Z"
  });

  assert.equal(card.domainId, "onboarding");
  assert.equal(card.subjectId, onboardingSubject.id);
  assert.equal(card.itemId, "item-onboarding-delivery-request");
  assert.equal(card.id, "card-onboarding-delivery-request");
  assert.ok(card.focusPoints.includes("在庫はあるか"));
  assert.deepEqual(card.relatedEventMapIds, [
    "onboarding-event-delivery-answer",
    "onboarding-event-inquiry-handling"
  ]);
});

test("onboarding plugin maps invoice mismatch cases to invoice checkpoints", () => {
  const plugin = createOnboardingPlugin();
  const card = plugin.createCard({
    subject: onboardingSubject,
    item: onboardingInformationItems[1],
    now: "2026-06-02T00:00:00.000Z"
  });

  assert.equal(card.id, "card-onboarding-invoice-mismatch");
  assert.equal(card.relatedTermIds[0], "onboarding-term-invoice");
  assert.equal(plugin.createCheckpoints({ card })[0].id, "checkpoint-onboarding-invoice-mismatch");
});

test("onboarding plugin maps contract change cases to order process checkpoints", () => {
  const plugin = createOnboardingPlugin();
  const card = plugin.createCard({
    subject: onboardingSubject,
    item: onboardingInformationItems[2],
    now: "2026-06-02T00:00:00.000Z"
  });

  assert.equal(card.id, "card-onboarding-contract-change");
  assert.equal(card.relatedEventMapIds[0], "onboarding-event-order-process");
  assert.equal(plugin.createCheckpoints({ card })[0].id, "checkpoint-onboarding-contract-change");
});

test("company registry registers onboarding plugin", () => {
  const registry = createCompanyRegistry();
  const ids = registry.list().map((plugin) => plugin.id);

  assert.deepEqual(ids, ["onboarding"]);
  assert.equal(registry.require("onboarding").name, "Onboarding Plugin");
});

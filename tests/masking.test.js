import assert from "node:assert/strict";
import test from "node:test";
import { maskInteractionLogs, maskRecord, maskText } from "../src/core/masking.js";

test("maskText masks common personal data and caller supplied terms", () => {
  const result = maskText("田中さん: demo@example.com / 03-1234-5678", {
    sensitiveTerms: ["田中"]
  });

  assert.equal(result.text.includes("demo@example.com"), false);
  assert.equal(result.text.includes("03-1234-5678"), false);
  assert.equal(result.text.includes("田中"), false);
  assert.match(result.text, /EMAIL_001/);
  assert.match(result.text, /PHONE_001/);
  assert.match(result.text, /TERM_001/);
});

test("maskRecord masks sensitive keyed fields", () => {
  const result = maskRecord({
    customerName: "Example Corp",
    note: "contact admin@example.com",
    nested: {
      phone: "090-1111-2222"
    }
  });

  assert.equal(result.data.customerName, "FIELD_001");
  assert.equal(result.data.note.includes("admin@example.com"), false);
  assert.equal(result.data.nested.phone, "FIELD_002");
});

test("maskInteractionLogs keeps observation counts but tokenizes ids", () => {
  const [first, second] = maskInteractionLogs([
    {
      userId: "user-a",
      sessionId: "session-a",
      domainId: "demo-context",
      subjectId: "subject-a",
      cardId: "card-a",
      itemId: "item-a",
      readDurationMs: 1000,
      openedDictionaryIds: ["term-a", "term-b"],
      openedEventMapIds: ["event-a"],
      selectedActions: ["open-a"],
      finalReaction: "unclear"
    },
    {
      userId: "user-a",
      sessionId: "session-b",
      domainId: "demo-context",
      subjectId: "subject-a",
      cardId: "card-b",
      itemId: "item-b",
      readDurationMs: 2000,
      openedDictionaryIds: [],
      openedEventMapIds: [],
      selectedActions: [],
      finalReaction: "understood"
    }
  ]);

  assert.equal(first.user, second.user);
  assert.equal(first.subject, second.subject);
  assert.equal(first.card, "CARD_001");
  assert.equal(second.card, "CARD_002");
  assert.equal(first.openedDictionaryCount, 2);
  assert.equal(first.openedEventMapCount, 1);
});

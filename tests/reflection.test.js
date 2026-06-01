import assert from "node:assert/strict";
import test from "node:test";
import { createReflectionReport } from "../src/core/reflection.js";
import { observeScoring } from "../src/core/scoring.js";

const logs = [
  {
    id: "log-1",
    userId: "user-1",
    sessionId: "session-1",
    domainId: "demo-context",
    subjectId: "subject-1",
    cardId: "card-1",
    itemId: "item-1",
    openedAt: "2026-06-01T00:00:00.000Z",
    closedAt: "2026-06-01T00:01:00.000Z",
    readDurationMs: 60000,
    openedDictionaryIds: ["term-a", "term-b"],
    openedEventMapIds: ["event-a"],
    openedTimelineIds: [],
    selectedCheckpointIds: ["checkpoint-a"],
    selectedActions: ["open-term"],
    finalReaction: "unclear"
  },
  {
    id: "log-2",
    userId: "user-1",
    sessionId: "session-2",
    domainId: "demo-context",
    subjectId: "subject-1",
    cardId: "card-2",
    itemId: "item-2",
    openedAt: "2026-06-01T00:02:00.000Z",
    closedAt: "2026-06-01T00:03:00.000Z",
    readDurationMs: 60000,
    openedDictionaryIds: ["term-c", "term-d"],
    openedEventMapIds: [],
    openedTimelineIds: [],
    selectedCheckpointIds: [],
    selectedActions: [],
    finalReaction: "later"
  }
];

test("createReflectionReport returns observation comments without ability judgement", () => {
  const report = createReflectionReport({
    domainId: "demo-context",
    logs,
    periodStart: "2026-06-01T00:00:00.000Z",
    periodEnd: "2026-06-02T00:00:00.000Z",
    now: () => "2026-06-02T00:00:00.000Z"
  });

  assert.equal(report.id, "reflection-demo-context-2026-06-02");
  assert.equal(report.nextTrainingCards.length, 2);
  assert.match(report.strictComment, /次に決めること/);
  assert.doesNotMatch(report.strictComment, /能力|ランク|評価/);
});

test("observeScoring treats scores as observation values", () => {
  const result = observeScoring({
    domainId: "demo-context",
    logs,
    cards: [],
    dictionaryEntries: [],
    eventMaps: []
  });

  assert.equal(result.domainId, "demo-context");
  assert.equal(result.traits.length, 2);
  assert.match(result.traits[0].interpretation, /断定ではなく/);
  assert.match(result.cautions.join(" "), /ランク付け/);
});

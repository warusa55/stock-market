import assert from "node:assert/strict";
import test from "node:test";
import {
  clearTodayCardState,
  createInitialTodayCardState,
  createSampleTodayCard,
  createTodayCard,
  getTodayDateKey,
  loadTodayCardState,
  renderTodayCardFloating,
  resolveTodayCardState,
  saveTodayCardState,
  updateTodayCardStateStatus
} from "../apps/web/today-card-floating.js";

function createMemoryStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.get(key) ?? null;
    },
    setItem(key, value) {
      store.set(key, value);
    },
    removeItem(key) {
      store.delete(key);
    }
  };
}

test("getTodayDateKey uses local date parts", () => {
  assert.equal(getTodayDateKey(new Date(2026, 5, 2, 23, 59)), "2026-06-02");
});

test("createTodayCard maps existing one-card data into floating card data", () => {
  const card = createTodayCard(
    {
      id: "card-stock-buyback-status",
      title: "今日の1枚: 自己株式の取得状況",
      shortExplanation: "途中経過を見る。",
      focusPoints: ["今月いくら買ったか"],
      todayTakeaway: "決定と状況は違う。",
      relatedTermIds: ["stock-term-self-share-buyback-status"],
      relatedEventMapIds: ["stock-event-self-share-buyback"],
      itemId: "item-1"
    },
    {
      subject: { name: "サンプル電機" },
      now: new Date(2026, 5, 2)
    }
  );

  assert.equal(card.id, "card-stock-buyback-status");
  assert.equal(card.dateKey, "2026-06-02");
  assert.equal(card.subjectLabel, "サンプル電機");
  assert.deepEqual(card.relatedEventMapIds, ["stock-event-self-share-buyback"]);
});

test("createTodayCard returns sample card when source card is missing", () => {
  const card = createSampleTodayCard({ now: new Date(2026, 5, 2) });

  assert.equal(card.id, "sample-self-stock-progress");
  assert.equal(card.dateKey, "2026-06-02");
  assert.ok(card.focusPoints.length > 0);
});

test("resolveTodayCardState creates new state and resets on date change", () => {
  const storage = createMemoryStorage();
  const card = createSampleTodayCard({ now: new Date(2026, 5, 2) });
  const first = resolveTodayCardState(card, { storage, now: new Date(2026, 5, 2, 9) });

  assert.equal(first.status, "new");
  assert.equal(loadTodayCardState(storage).cardId, card.id);

  const minimized = updateTodayCardStateStatus(first, "minimized", {
    now: new Date(2026, 5, 2, 10)
  });
  saveTodayCardState(minimized, storage);

  const nextDayCard = createSampleTodayCard({ now: new Date(2026, 5, 3) });
  const next = resolveTodayCardState(nextDayCard, { storage, now: new Date(2026, 5, 3, 9) });

  assert.equal(next.status, "new");
  assert.equal(next.dateKey, "2026-06-03");
});

test("renderTodayCardFloating renders panel for new and mini for completed", () => {
  const card = createSampleTodayCard({ now: new Date(2026, 5, 2) });
  const state = createInitialTodayCardState(card, { now: new Date(2026, 5, 2) });
  const panelHtml = renderTodayCardFloating(card, state);
  const completedHtml = renderTodayCardFloating(card, updateTodayCardStateStatus(state, "completed"));

  assert.match(panelHtml, /today-card-panel/);
  assert.match(panelHtml, /30秒で見る/);
  assert.match(completedHtml, /today-card-mini/);
  assert.match(completedHtml, /完了済み/);
});

test("clearTodayCardState removes stored state", () => {
  const storage = createMemoryStorage();
  const card = createSampleTodayCard({ now: new Date(2026, 5, 2) });

  saveTodayCardState(createInitialTodayCardState(card), storage);
  clearTodayCardState(storage);

  assert.equal(loadTodayCardState(storage), null);
});

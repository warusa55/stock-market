export const TODAY_CARD_STATE_KEY = "stock-market:today-card-state";

const panelStatuses = new Set(["new", "opened"]);
const validStatuses = new Set(["new", "opened", "minimized", "later", "completed", "dismissed"]);

function nowIso(now) {
  return now instanceof Date ? now.toISOString() : new Date(now).toISOString();
}

function defaultEscapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function listHtml(values, escapeHtml) {
  return `<ul class="focus-list">${values.map((value) => `<li>${escapeHtml(value)}</li>`).join("")}</ul>`;
}

function shortTitle(value, maxLength = 26) {
  const text = String(value ?? "").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

export function getTodayDateKey(now = new Date()) {
  const date = now instanceof Date ? now : new Date(now);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createSampleTodayCard({ now = new Date() } = {}) {
  return {
    id: "sample-self-stock-progress",
    dateKey: getTodayDateKey(now),
    title: "自己株式の取得状況に関するお知らせ",
    subjectLabel: "サンプル銘柄",
    shortExplanation:
      "これは「新しく自社株買いを決めた」発表ではなく、すでに決まっていた自社株買いの途中経過を知らせるものです。",
    focusPoints: [
      "今月いくら買ったか",
      "累計でどれくらい買ったか",
      "上限額に対して何％進んだか",
      "取得終了か、まだ継続中か"
    ],
    todayTakeaway: "自己株式取得は「決定」「取得状況」「終了」で意味が違います。今回は途中経過です。",
    relatedTermIds: [],
    relatedEventMapIds: []
  };
}

export function createTodayCard(card, { subject, now = new Date() } = {}) {
  if (!card) {
    return createSampleTodayCard({ now });
  }

  return {
    id: card.id ?? "today-card-input",
    dateKey: getTodayDateKey(now),
    title: card.title ?? "今日の1枚",
    subjectLabel: subject?.name ?? card.subtitle,
    shortExplanation: card.shortExplanation ?? "今日これだけ見てみる？",
    focusPoints: Array.isArray(card.focusPoints) ? card.focusPoints : [],
    todayTakeaway: card.todayTakeaway ?? "",
    relatedTermIds: card.relatedTermIds ?? [],
    relatedEventMapIds: card.relatedEventMapIds ?? [],
    sourceItemId: card.itemId
  };
}

export function loadTodayCardState(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(TODAY_CARD_STATE_KEY);
    if (!raw) {
      return null;
    }

    const state = JSON.parse(raw);
    if (!state || !validStatuses.has(state.status)) {
      return null;
    }

    return state;
  } catch {
    return null;
  }
}

export function saveTodayCardState(state, storage = globalThis.localStorage) {
  storage?.setItem(TODAY_CARD_STATE_KEY, JSON.stringify(state));
}

export function clearTodayCardState(storage = globalThis.localStorage) {
  storage?.removeItem(TODAY_CARD_STATE_KEY);
}

export function createInitialTodayCardState(card, { now = new Date() } = {}) {
  const timestamp = nowIso(now);
  return {
    cardId: card.id,
    dateKey: card.dateKey,
    status: "new",
    firstShownAt: timestamp,
    updatedAt: timestamp
  };
}

export function resolveTodayCardState(card, { storage = globalThis.localStorage, now = new Date() } = {}) {
  const current = loadTodayCardState(storage);
  const next =
    !current || current.cardId !== card.id || current.dateKey !== card.dateKey
      ? createInitialTodayCardState(card, { now })
      : current;

  if (next !== current) {
    saveTodayCardState(next, storage);
  }

  return next;
}

export function updateTodayCardStateStatus(state, status, { now = new Date() } = {}) {
  const timestamp = nowIso(now);
  const next = {
    ...state,
    status,
    updatedAt: timestamp
  };

  if (status === "opened") {
    next.openedAt = timestamp;
  }
  if (status === "completed") {
    next.completedAt = timestamp;
  }

  return next;
}

export function renderTodayCardFloating(card, state, escapeHtml = defaultEscapeHtml) {
  if (!card || !state || state.status === "dismissed") {
    return "";
  }

  return panelStatuses.has(state.status)
    ? renderTodayCardPanel(card, state, escapeHtml)
    : renderTodayCardMini(card, state, escapeHtml);
}

export function renderTodayCardMini(card, state, escapeHtml = defaultEscapeHtml) {
  const statusLabel =
    state.status === "completed" ? "完了済み" : state.status === "later" ? "あとで" : "右下に待機中";

  return `
    <button class="today-card-mini ${state.status === "completed" ? "completed" : ""}" data-today-card-expand="true" aria-label="今日の1枚を開く">
      <span>今日の1枚</span>
      <strong>${escapeHtml(shortTitle(card.title))}</strong>
      <small>${escapeHtml(statusLabel)}</small>
    </button>
  `;
}

export function renderTodayCardPanel(card, state, escapeHtml = defaultEscapeHtml) {
  const hasDictionary = (card.relatedTermIds ?? []).length > 0;
  const hasEventMap = (card.relatedEventMapIds ?? []).length > 0;

  return `
    <aside class="today-card-panel" aria-label="今日の1枚">
      <div class="today-card-panel-head">
        <div>
          <p class="eyebrow">今日これだけ見てみる？</p>
          <h2>${escapeHtml(card.title)}</h2>
          ${card.subjectLabel ? `<p class="subtitle">${escapeHtml(card.subjectLabel)}</p>` : ""}
        </div>
        <button class="icon-button" type="button" data-today-card-status="minimized" aria-label="今日の1枚を閉じる">x</button>
      </div>
      <p>${escapeHtml(card.shortExplanation)}</p>
      <h3>今日見るところ</h3>
      ${listHtml(card.focusPoints, escapeHtml)}
      <h3>今日の理解</h3>
      <p>${escapeHtml(card.todayTakeaway)}</p>
      <div class="action-row">
        <button class="tool-button active" type="button" data-today-card-status="opened">30秒で見る</button>
        <button class="tool-button" type="button" data-today-card-view="dictionary"${hasDictionary ? "" : " disabled"}>図鑑で見る</button>
        <button class="tool-button" type="button" data-today-card-view="event-map"${hasEventMap ? "" : " disabled"}>地図を見る</button>
        <button class="tool-button" type="button" data-today-card-status="later">あとで</button>
        <button class="tool-button" type="button" data-today-card-status="completed">分かった</button>
      </div>
      <p class="today-card-note">学習用の確認ポイントです。売買判断ではありません。</p>
    </aside>
  `;
}

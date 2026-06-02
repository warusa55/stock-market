import { executeAcquisitionRequest, loadContextData } from "./data-source.js";
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
} from "./market-shelf.js";
import {
  createTodayCard,
  renderTodayCardFloating,
  resolveTodayCardState,
  saveTodayCardState,
  updateTodayCardStateStatus
} from "./today-card-floating.js";

const defaultInput = {
  subjectName: "",
  subjectCode: "",
  subjectType: "",
  subjectMemo: "",
  sourceType: "manual",
  sourceKind: "",
  title: "",
  bodyExcerpt: "",
  url: "",
  tags: "",
  eventType: ""
};

function isInputEmpty(input) {
  return Object.values(input ?? {}).every((value) => String(value ?? "").trim() === "");
}

function createDefaultState() {
  return {
    input: { ...defaultInput },
    marketShelf: createEmptyMarketShelf(),
    openedDictionaryIds: [],
    openedEventMapIds: [],
    selectedActions: [],
    selectedCheckpointIds: [],
    acquisitionStatus: "",
    acquisitionResults: [],
    finalReaction: ""
  };
}

(async function () {
  let data = await loadContextData();
  let storageKey = `context-platform-${data.registryId}-${data.domainId}-state`;
  const viewTitles = {
    home: "概要",
    input: "入力",
    dictionary: "用語図鑑",
    "event-map": "イベントマップ",
    timeline: "タイムライン",
    checkpoint: "チェックポイント",
    reflection: "振り返り"
  };

  let state = loadState();
  if (!isInputEmpty(state.input)) {
    data = await loadContextData({
      input: state.input
    });
  }
  let todayCard = createTodayCard(data.card, { subject: data.subject });
  let todayCardState = resolveTodayCardState(todayCard);

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey)) ?? {};
      const next = {
        ...createDefaultState(),
        ...parsed,
        input: {
          ...defaultInput,
          ...(parsed.input ?? {})
        },
        marketShelf: normalizeMarketShelf(parsed.marketShelf)
      };
      const selectedSubject = getSelectedShelfSubject(next.marketShelf);
      const selectedItem = getSelectedShelfItem(next.marketShelf);

      if (selectedSubject && selectedItem && isInputEmpty(next.input)) {
        next.input = restoreInputFromShelf(selectedSubject, selectedItem);
      }

      return next;
    } catch {
      return createDefaultState();
    }
  }

  function saveState() {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  async function refreshDataFromInput() {
    data = await loadContextData({
      input: state.input
    });
    storageKey = `context-platform-${data.registryId}-${data.domainId}-state`;
    saveState();
    renderAll();
  }

  function addUnique(key, value) {
    if (!state[key].includes(value)) {
      state[key].push(value);
      saveState();
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function listHtml(values, className = "plain-list") {
    return `<ul class="${className}">${values.map((value) => `<li>${escapeHtml(value)}</li>`).join("")}</ul>`;
  }

  function switchView(viewId) {
    document.querySelectorAll(".view").forEach((view) => {
      view.classList.toggle("active", view.id === viewId);
    });
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.toggle("active", item.dataset.view === viewId);
    });
    document.getElementById("view-title").textContent = viewTitles[viewId];
  }

  function selectedShelfSubject() {
    return getSelectedShelfSubject(state.marketShelf);
  }

  function selectedShelfItem() {
    return getSelectedShelfItem(state.marketShelf);
  }

  function selectedShelfItems() {
    const subject = selectedShelfSubject();
    return subject ? listItemsForSubject(state.marketShelf, subject.id) : [];
  }

  function overviewSubject() {
    return selectedShelfSubject() ?? {
      id: data.subject.id,
      domainId: data.domainId,
      subjectType: data.subject.type,
      code: currentTickerCode(),
      name: data.subject.name,
      memo: data.subject.description ?? "",
      tags: data.subject.tags ?? []
    };
  }

  function overviewItem() {
    const shelfItem = selectedShelfItem();
    if (shelfItem) {
      return shelfItem;
    }

    return {
      id: data.item?.id ?? "current-item",
      subjectId: data.subject.id,
      domainId: data.domainId,
      sourceType: data.item?.sourceType ?? "manual",
      sourceKind: data.item?.raw?.sourceKind ?? "",
      title: data.item?.title ?? "材料なし",
      bodyExcerpt: data.item?.bodyExcerpt ?? "",
      url: data.item?.url ?? "",
      tags: data.item?.tags ?? [],
      eventType: data.item?.raw?.eventType ?? data.item?.raw?.inferredEventType ?? ""
    };
  }

  function overviewTimelineItems() {
    const subject = selectedShelfSubject();
    const items = selectedShelfItems();
    if (subject && items.length > 0) {
      return createTimelineItemsFromShelf(subject, items);
    }

    return data.timeline;
  }

  function currentTickerCode() {
    const subject = selectedShelfSubject();
    return (
      subject?.code ??
      data.item?.raw?.tickerCode ??
      state.input?.subjectCode ??
      data.subject?.tags?.find((tag) => String(tag).startsWith("ticker:"))?.slice("ticker:".length) ??
      ""
    );
  }

  function currentSourceLabel() {
    const item = selectedShelfItem();
    return item?.sourceKind || data.item?.raw?.sourceLabel || data.item?.sourceType || state.input?.sourceKind || "未指定";
  }

  function renderTimelinePreview(items = data.timeline.slice(0, 3)) {
    if (items.length === 0) {
      return `<p class="subtitle">まだ材料がありません。</p>`;
    }

    return `
      <div class="compact-list">
        ${items
          .map((item) => {
            return `
              <article class="compact-item">
                <span class="tag">${new Date(item.occurredAt).toLocaleDateString("ja-JP")}</span>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.summary)}</p>
              </article>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderHome() {
    const subject = overviewSubject();
    const item = overviewItem();
    const timelineItems = overviewTimelineItems();
    document.getElementById("home").innerHTML = `
      <div class="layout-grid">
        <article class="card holding-card">
          <div class="card-title">
            <div>
              <h2>${escapeHtml(subject.name)}</h2>
              <p class="subtitle">保有・監視銘柄の入口</p>
            </div>
            <span class="status-pill">${escapeHtml(data.domainName)}</span>
          </div>
          <div class="summary-grid">
            <div class="summary-metric">
              <span class="muted">コード/ID</span>
              <strong>${escapeHtml(currentTickerCode() || "未入力")}</strong>
            </div>
            <div class="summary-metric">
              <span class="muted">取得元</span>
              <strong>${escapeHtml(currentSourceLabel())}</strong>
            </div>
            <div class="summary-metric">
              <span class="muted">検出語句</span>
              <strong>${escapeHtml(String(data.dictionaryMatches.length))}</strong>
            </div>
          </div>
          <h3>最新材料</h3>
          <article class="compact-item featured">
            <span class="tag">${escapeHtml(item.sourceType ?? "manual")}</span>
            <h3>${escapeHtml(item.title ?? "材料なし")}</h3>
            <p>${escapeHtml(item.bodyExcerpt || "入力または取得から、ここに最新材料を表示します。")}</p>
          </article>
          <div class="action-row">
            <button class="tool-button active" data-view="input">銘柄/材料を入力</button>
            <button class="tool-button" data-view="timeline">時系列を見る</button>
            <button class="tool-button" data-view="dictionary">図鑑を見る</button>
          </div>
        </article>
        <aside class="panel">
          <h2>マイ棚</h2>
          ${renderMarketShelf()}
        </aside>
      </div>
      <section class="panel overview-section">
        <h2>最近の流れ</h2>
        ${renderTimelinePreview(timelineItems)}
      </section>
      <section class="panel overview-section">
        <h2>保存済み材料</h2>
        ${renderSavedShelfItems()}
      </section>
      <section class="panel overview-section">
        <div class="layout-grid">
          <div>
            <h2>検出語句</h2>
            ${renderMatches()}
          </div>
          <div>
            <h2>取得候補</h2>
            ${renderAcquisitionRequests()}
          </div>
        </div>
      </section>
    `;
  }

  function inputValue(name) {
    return escapeHtml(state.input?.[name] ?? "");
  }

  function isUrlAcquisitionRequest(request) {
    return request?.id?.includes("-url-");
  }

  function acquisitionButtonLabel(request) {
    if (request.status === "needs_target") {
      return "対象なし";
    }
    return isUrlAcquisitionRequest(request) || request.query?.provider === "yanoshin_tdnet" ? "取得" : "開く";
  }

  async function runAcquisitionRequest(request) {
    if (!request || request.status === "needs_target") {
      return;
    }

    if (request.query?.externalUrl && !isUrlAcquisitionRequest(request)) {
      window.open(request.query.externalUrl, "_blank", "noopener");
    }

    const result = await executeAcquisitionRequest({
      search: globalThis.location?.search ?? "",
      input: state.input,
      request
    });

    state.input = {
      ...state.input,
      ...result.inputPatch
    };
    state.acquisitionStatus = result.status;
    state.acquisitionResults = result.acquiredItems ?? [];
    saveState();
    await refreshDataFromInput();
    switchView(result.acquiredItems?.length > 0 ? "input" : "home");
  }

  function saveCurrentInputToShelf(input) {
    const result = saveInputToMarketShelf(state.marketShelf, input, {
      domainId: data.domainId
    });
    state.marketShelf = result.shelf;
    state.input = restoreInputFromShelf(result.subject, result.item);
    saveState();
    return result;
  }

  async function selectSubjectFromShelf(subjectId) {
    state.marketShelf = selectShelfSubject(state.marketShelf, subjectId);
    const subject = selectedShelfSubject();
    const item = selectedShelfItem();

    if (subject && item) {
      state.input = restoreInputFromShelf(subject, item);
    }

    saveState();
    await refreshDataFromInput();
    switchView("home");
  }

  async function selectItemFromShelf(itemId) {
    state.marketShelf = selectShelfItem(state.marketShelf, itemId);
    const subject = selectedShelfSubject();
    const item = selectedShelfItem();

    if (subject && item) {
      state.input = restoreInputFromShelf(subject, item);
    }

    saveState();
    await refreshDataFromInput();
    switchView("home");
  }

  async function applyAcquisitionResult(index, { save = false } = {}) {
    const item = state.acquisitionResults[index];
    if (!item) {
      return;
    }

    state.input = {
      ...state.input,
      subjectName: state.input.subjectName || item.companyName || "",
      subjectCode: state.input.subjectCode || item.tickerCode || "",
      sourceType: item.sourceType || "official",
      sourceKind: item.sourceKind || "official_disclosure",
      title: item.title || "",
      bodyExcerpt: item.bodyExcerpt || "",
      url: item.url || "",
      tags: (item.tags ?? []).join(","),
      eventType: item.eventType || "",
      sourceStatus: item.sourceStatus || "available"
    };

    if (save) {
      saveCurrentInputToShelf(state.input);
    }

    saveState();
    await refreshDataFromInput();
    switchView(save ? "home" : "input");
  }

  function renderInput() {
    const acquisitionSources =
      data.acquisitionSources?.length > 0
        ? data.acquisitionSources
        : [
            { id: "memo", label: "手動メモ" },
            { id: "official_disclosure", label: "適時開示" },
            { id: "company_ir", label: "会社IR" },
            { id: "edinet", label: "EDINET" },
            { id: "news", label: "ニュース" }
          ];

    document.getElementById("input").innerHTML = `
      <div class="layout-grid">
        <form class="panel input-form" id="context-input-form">
          <h2>対象</h2>
          <label>
            <span>名前</span>
            <input name="subjectName" value="${inputValue("subjectName")}" autocomplete="off">
          </label>
          <label>
            <span>コード/ID</span>
            <input name="subjectCode" value="${inputValue("subjectCode")}" autocomplete="off">
          </label>
          <label>
            <span>種別</span>
            <input name="subjectType" value="${inputValue("subjectType")}" autocomplete="off">
          </label>
          <label>
            <span>メモ</span>
            <textarea name="subjectMemo" rows="3">${inputValue("subjectMemo")}</textarea>
          </label>
          <h2>情報</h2>
          <label>
            <span>sourceType</span>
            <select name="sourceType">
              ${["manual", "official", "news", "document", "case", "sample"]
                .map((value) => {
                  const selected = state.input.sourceType === value ? " selected" : "";
                  return `<option value="${value}"${selected}>${value}</option>`;
                })
                .join("")}
            </select>
          </label>
          <label>
            <span>取得元</span>
            <select name="sourceKind">
              <option value=""${state.input.sourceKind ? "" : " selected"}>未指定</option>
              ${acquisitionSources
                .map((source) => {
                  const selected = state.input.sourceKind === source.id ? " selected" : "";
                  return `<option value="${escapeHtml(source.id)}"${selected}>${escapeHtml(source.label)}</option>`;
                })
                .join("")}
            </select>
          </label>
          <label>
            <span>タイトル</span>
            <input name="title" value="${inputValue("title")}" autocomplete="off">
          </label>
          <label>
            <span>本文/メモ</span>
            <textarea name="bodyExcerpt" rows="5">${inputValue("bodyExcerpt")}</textarea>
          </label>
          <label>
            <span>URL</span>
            <input name="url" value="${inputValue("url")}" autocomplete="off">
          </label>
          <label>
            <span>tags</span>
            <input name="tags" value="${inputValue("tags")}" autocomplete="off">
          </label>
          <label>
            <span>eventType</span>
            <input name="eventType" value="${inputValue("eventType")}" autocomplete="off">
          </label>
          <div class="action-row">
            <button class="tool-button active" type="submit" name="intent" value="apply">反映/候補更新</button>
            <button class="tool-button" type="submit" name="intent" value="save">保存</button>
            <button class="tool-button" type="submit" name="intent" value="save-home">保存して概要へ</button>
            <button class="tool-button" type="button" data-clear-input="true">クリア</button>
          </div>
        </form>
        <aside class="panel">
          <h2>検出語句</h2>
          ${renderMatches()}
          <h2>取得候補</h2>
          ${renderAcquisitionRequests()}
          <h2>取得結果</h2>
          ${renderAcquisitionResults()}
        </aside>
      </div>
    `;
  }

  function renderMatches() {
    const matches = data.dictionaryMatches ?? [];
    if (matches.length === 0) {
      return `<p class="subtitle">なし</p>`;
    }

    return `
      <div class="match-list">
        ${matches
          .map((match) => {
            return `
              <button class="match-chip" data-open-term="${escapeHtml(match.entry.id)}">
                <strong>${escapeHtml(match.entry.term)}</strong>
                <span>${escapeHtml(match.matchedTerms.join(", "))}</span>
              </button>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderAcquisitionRequests() {
    const requests = data.acquisitionRequests ?? [];
    if (requests.length === 0) {
      return `<p class="subtitle">なし</p>`;
    }

    return `
      <div class="acquisition-list">
        ${requests
          .map((request) => {
            const keywords = request.query?.keywords ?? [];
            return `
              <article class="acquisition-item">
                <div>
                  <span class="tag">${escapeHtml(request.status)}</span>
                  <h3>${escapeHtml(request.label)}</h3>
                </div>
                <p>${escapeHtml(request.summary)}</p>
                ${keywords.length > 0 ? `<p class="muted">${escapeHtml(keywords.join(", "))}</p>` : ""}
                <div class="action-row">
                  <button class="tool-button" type="button" data-acquire="${escapeHtml(request.id)}"${request.status === "needs_target" ? " disabled" : ""}>${escapeHtml(acquisitionButtonLabel(request))}</button>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderAcquisitionResults() {
    const results = state.acquisitionResults ?? [];
    if (results.length === 0) {
      return `<p class="subtitle">まだ取得結果がありません。</p>`;
    }

    return `
      <div class="acquisition-list">
        ${results
          .map((item, index) => {
            return `
              <article class="acquisition-item">
                <div>
                  <span class="tag">${escapeHtml(item.sourceKind ?? "source")}</span>
                  <span class="tag">${escapeHtml(item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("ja-JP") : "日付なし")}</span>
                </div>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.bodyExcerpt || "本文メモなし")}</p>
                <p class="muted">${escapeHtml([item.companyName, item.url ? "URLあり" : "URLなし", item.eventType].filter(Boolean).join(" / "))}</p>
                <div class="action-row">
                  <button class="tool-button" type="button" data-acquired-index="${index}">入力へ反映</button>
                  <button class="tool-button active" type="button" data-acquired-save="${index}">保存</button>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderMarketShelf() {
    const shelf = normalizeMarketShelf(state.marketShelf);
    if (shelf.subjects.length === 0) {
      return `
        <p class="subtitle">まだマイ棚に銘柄がありません。</p>
        <p class="subtitle">入力画面から銘柄と材料を保存してください。</p>
      `;
    }

    return `
      <div class="shelf-list">
        ${shelf.subjects
          .map((subject) => {
            const items = listItemsForSubject(shelf, subject.id);
            const latestItem = items[0];
            const active = shelf.selectedSubjectId === subject.id ? " active" : "";
            const signal = latestItem?.eventType || latestItem?.tags?.slice(0, 2).join(", ") || "材料未分類";

            return `
              <button class="shelf-subject${active}" type="button" data-shelf-subject="${escapeHtml(subject.id)}">
                <span class="tag">${escapeHtml(subject.code || "no-code")}</span>
                <strong>${escapeHtml(subject.name)}</strong>
                <span>${escapeHtml(`材料 ${items.length}件`)}</span>
                <small>${escapeHtml(latestItem?.title ?? "保存済み材料なし")}</small>
                <small class="muted">${escapeHtml(signal)}</small>
              </button>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderSavedShelfItems() {
    const subject = selectedShelfSubject();
    const items = selectedShelfItems();
    if (!subject) {
      return `<p class="subtitle">マイ棚から銘柄を選ぶと、保存済み材料がここに出ます。</p>`;
    }
    if (items.length === 0) {
      return `<p class="subtitle">この銘柄にはまだ材料がありません。</p>`;
    }

    return `
      <div class="saved-item-list">
        ${items
          .map((item) => {
            const active = state.marketShelf.selectedItemId === item.id ? " active" : "";
            const meta = [
              item.url ? "URLあり" : "URLなし",
              item.sourceKind || item.sourceType,
              item.eventType,
              ...(item.tags ?? []).slice(0, 3)
            ]
              .filter(Boolean)
              .join(" / ");

            return `
              <article class="saved-item${active}">
                <div class="saved-item-head">
                  <span class="tag">${new Date(item.updatedAt).toLocaleDateString("ja-JP")}</span>
                  <span class="tag">${escapeHtml(item.sourceType)}</span>
                </div>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.bodyExcerpt || "本文メモなし")}</p>
                <p class="muted">${escapeHtml(meta)}</p>
                <div class="action-row">
                  <button class="tool-button${active}" type="button" data-shelf-item="${escapeHtml(item.id)}">この材料で見る</button>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderDictionary() {
    document.getElementById("dictionary").innerHTML = `
      <div class="grid-list">
        ${data.dictionary
          .map((entry) => {
            const opened = state.openedDictionaryIds.includes(entry.id);
            return `
              <article class="dictionary-card">
                <div>
                  <span class="tag">${escapeHtml(entry.category)}</span>
                  <h2>${escapeHtml(entry.term)}</h2>
                </div>
                <p>${escapeHtml(entry.shortExplanation)}</p>
                ${opened ? `<h3>まず見るところ</h3>${listHtml(entry.firstCheckpoints)}` : ""}
                <button class="tool-button${opened ? " active" : ""}" data-open-term="${escapeHtml(entry.id)}">${opened ? "開いた" : "開く"}</button>
              </article>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderEventMap() {
    document.getElementById("event-map").innerHTML = `
      <div class="panel">
        <h2>${escapeHtml(data.eventMap.title)}</h2>
        <div class="map-flow">
          ${data.eventMap.nodes
            .map((node) => {
              const current = node.id === data.eventMap.currentNodeId ? " current" : "";
              return `
                <article class="map-node${current}">
                  <h3>${escapeHtml(node.label)}</h3>
                  <p>${escapeHtml(node.shortExplanation)}</p>
                  ${listHtml(node.checkpoints)}
                </article>
              `;
            })
            .join("")}
        </div>
      </div>
    `;
  }

  function renderTimeline() {
    document.getElementById("timeline").innerHTML = `
      <div class="grid-list">
        ${data.timeline
          .map((item) => {
            return `
              <article class="timeline-card">
                <span class="tag">${new Date(item.occurredAt).toLocaleDateString("ja-JP")}</span>
                <h2>${escapeHtml(item.title)}</h2>
                <p>${escapeHtml(item.summary)}</p>
              </article>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderCheckpoint() {
    const checkpoint = data.checkpoint;
    document.getElementById("checkpoint").innerHTML = `
      <div class="layout-grid">
        <section class="panel">
          <h2>${escapeHtml(checkpoint.title)}</h2>
          <p>${escapeHtml(checkpoint.prompt)}</p>
          <div class="checkpoint-options">
            ${(checkpoint.options ?? [])
              .map((option) => {
                const active = state.selectedCheckpointIds.includes(option.id) ? " active" : "";
                return `
                  <button class="checkpoint-option${active}" data-checkpoint="${escapeHtml(option.id)}">
                    <strong>${escapeHtml(option.label)}</strong>
                    <span class="muted">${escapeHtml(option.meaning)}</span>
                  </button>
                `;
              })
              .join("")}
          </div>
        </section>
        <aside class="panel">
          <h2>蓄積</h2>
          ${renderMetrics()}
        </aside>
      </div>
    `;
  }

  function renderMetrics() {
    return `
      <div class="log-strip">
        <div class="log-metric">
          <span class="muted">図鑑</span>
          <span class="metric-value">${state.openedDictionaryIds.length}</span>
        </div>
        <div class="log-metric">
          <span class="muted">地図</span>
          <span class="metric-value">${state.openedEventMapIds.length}</span>
        </div>
        <div class="log-metric">
          <span class="muted">確認</span>
          <span class="metric-value">${state.selectedCheckpointIds.length}</span>
        </div>
      </div>
    `;
  }

  function renderReflection() {
    const openedContextCount = state.openedDictionaryIds.length + state.openedEventMapIds.length;
    const finalReaction = state.finalReaction || "未選択";
    const strict =
      finalReaction === "unclear"
        ? "不明のまま補足を増やすより、次に決めることを1つに切る必要があります。"
        : "次はタイムラインか比較へ進める状態です。";

    document.getElementById("reflection").innerHTML = `
      <div class="layout-grid">
        <section class="panel">
          <h2>一般論</h2>
          <p>補足情報を確認しながら、カードの意味と現在地を掴もうとする動きが見られます。</p>
          <h2>辛口</h2>
          <p>${escapeHtml(strict)}</p>
        </section>
        <aside class="panel">
          <h2>観察ログ</h2>
          ${renderMetrics()}
          <p class="subtitle">補足を開いた合計: ${openedContextCount} / 最終反応: ${escapeHtml(finalReaction)}</p>
        </aside>
      </div>
    `;
  }

  function renderAll() {
    todayCard = createTodayCard(data.card, { subject: data.subject });
    todayCardState = resolveTodayCardState(todayCard);
    document.getElementById("subject-name").textContent = data.subject.name;
    renderHome();
    renderInput();
    renderDictionary();
    renderEventMap();
    renderTimeline();
    renderCheckpoint();
    renderReflection();
    renderTodayCard();
  }

  function renderTodayCard() {
    let root = document.getElementById("today-card-floating-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "today-card-floating-root";
      document.body.append(root);
    }

    root.innerHTML = renderTodayCardFloating(todayCard, todayCardState, escapeHtml);
  }

  document.addEventListener("click", async (event) => {
    const navItem = event.target.closest("[data-view]");
    if (navItem) {
      switchView(navItem.dataset.view);
      return;
    }

    const shelfSubject = event.target.closest("[data-shelf-subject]");
    if (shelfSubject) {
      await selectSubjectFromShelf(shelfSubject.dataset.shelfSubject);
      return;
    }

    const shelfItem = event.target.closest("[data-shelf-item]");
    if (shelfItem) {
      await selectItemFromShelf(shelfItem.dataset.shelfItem);
      return;
    }

    const todayCardExpand = event.target.closest("[data-today-card-expand]");
    if (todayCardExpand) {
      todayCardState = updateTodayCardStateStatus(todayCardState, "opened");
      saveTodayCardState(todayCardState);
      renderTodayCard();
      return;
    }

    const todayCardStatus = event.target.closest("[data-today-card-status]");
    if (todayCardStatus) {
      todayCardState = updateTodayCardStateStatus(todayCardState, todayCardStatus.dataset.todayCardStatus);
      saveTodayCardState(todayCardState);
      renderTodayCard();
      return;
    }

    const todayCardView = event.target.closest("[data-today-card-view]");
    if (todayCardView) {
      if (todayCardView.dataset.todayCardView === "dictionary") {
        (todayCard.relatedTermIds ?? []).forEach((id) => addUnique("openedDictionaryIds", id));
        renderAll();
        switchView("dictionary");
      } else if (todayCardView.dataset.todayCardView === "event-map") {
        (todayCard.relatedEventMapIds ?? []).forEach((id) => addUnique("openedEventMapIds", id));
        renderAll();
        switchView("event-map");
      }
      return;
    }

    const acquire = event.target.closest("[data-acquire]");
    if (acquire) {
      const request = (data.acquisitionRequests ?? []).find((item) => item.id === acquire.dataset.acquire);
      await runAcquisitionRequest(request);
      return;
    }

    const acquiredIndex = event.target.closest("[data-acquired-index]");
    if (acquiredIndex) {
      await applyAcquisitionResult(Number(acquiredIndex.dataset.acquiredIndex));
      return;
    }

    const acquiredSave = event.target.closest("[data-acquired-save]");
    if (acquiredSave) {
      await applyAcquisitionResult(Number(acquiredSave.dataset.acquiredSave), { save: true });
      return;
    }

    const action = event.target.closest("[data-action]");
    if (action) {
      const actionData = (data.card.nextActions ?? []).find((item) => item.id === action.dataset.action);
      if (!actionData) {
        return;
      }
      addUnique("selectedActions", actionData.id);
      if (actionData.type === "open_dictionary") {
        addUnique("openedDictionaryIds", actionData.targetId);
        renderAll();
        switchView("dictionary");
      } else if (actionData.type === "open_event_map") {
        addUnique("openedEventMapIds", actionData.targetId);
        renderAll();
        switchView("event-map");
      } else {
        renderAll();
      }
      return;
    }

    const reaction = event.target.closest("[data-reaction]");
    if (reaction) {
      state.finalReaction = reaction.dataset.reaction;
      saveState();
      renderAll();
      return;
    }

    const term = event.target.closest("[data-open-term]");
    if (term) {
      addUnique("openedDictionaryIds", term.dataset.openTerm);
      renderAll();
      return;
    }

    const checkpoint = event.target.closest("[data-checkpoint]");
    if (checkpoint) {
      addUnique("selectedCheckpointIds", checkpoint.dataset.checkpoint);
      renderAll();
    }

    const clearInput = event.target.closest("[data-clear-input]");
    if (clearInput) {
      state.input = { ...defaultInput };
      saveState();
      refreshDataFromInput();
    }
  });

  document.addEventListener("submit", async (event) => {
    if (event.target.id !== "context-input-form") {
      return;
    }

    event.preventDefault();
    const formData = new FormData(event.target);
    formData.delete("intent");
    const intent = event.submitter?.value ?? "apply";
    state.input = Object.fromEntries(formData.entries());

    if (intent === "save" || intent === "save-home") {
      saveCurrentInputToShelf(state.input);
    }

    saveState();
    await refreshDataFromInput();
    switchView(intent === "save" ? "input" : "home");
  });

  renderAll();
})();

import { executeAcquisitionRequest, loadContextData } from "./data-source.js";
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
  let todayCard = createTodayCard(data.card, { subject: data.subject });
  let todayCardState = resolveTodayCardState(todayCard);

  function loadState() {
    try {
      return {
        input: { ...defaultInput },
        openedDictionaryIds: [],
        openedEventMapIds: [],
        selectedActions: [],
        selectedCheckpointIds: [],
        acquisitionStatus: "",
        finalReaction: "",
        ...(JSON.parse(localStorage.getItem(storageKey)) ?? {})
      };
    } catch {
      return {
        input: { ...defaultInput },
        openedDictionaryIds: [],
        openedEventMapIds: [],
        selectedActions: [],
        selectedCheckpointIds: [],
        acquisitionStatus: "",
        finalReaction: ""
      };
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

  function currentTickerCode() {
    return (
      data.item?.raw?.tickerCode ??
      state.input?.subjectCode ??
      data.subject?.tags?.find((tag) => String(tag).startsWith("ticker:"))?.slice("ticker:".length) ??
      ""
    );
  }

  function currentSourceLabel() {
    return data.item?.raw?.sourceLabel ?? data.item?.sourceType ?? state.input?.sourceKind ?? "未指定";
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
    document.getElementById("home").innerHTML = `
      <div class="layout-grid">
        <article class="card holding-card">
          <div class="card-title">
            <div>
              <h2>${escapeHtml(data.subject.name)}</h2>
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
            <span class="tag">${escapeHtml(data.item?.sourceType ?? "manual")}</span>
            <h3>${escapeHtml(data.item?.title ?? "材料なし")}</h3>
            <p>${escapeHtml(data.item?.bodyExcerpt || "入力または取得から、ここに最新材料を表示します。")}</p>
          </article>
          <div class="action-row">
            <button class="tool-button active" data-view="input">銘柄/材料を入力</button>
            <button class="tool-button" data-view="timeline">時系列を見る</button>
            <button class="tool-button" data-view="dictionary">図鑑を見る</button>
          </div>
        </article>
        <aside class="panel">
          <h2>検出語句</h2>
          ${renderMatches()}
          <h2>取得候補</h2>
          ${renderAcquisitionRequests()}
        </aside>
      </div>
      <section class="panel overview-section">
        <h2>最近の流れ</h2>
        ${renderTimelinePreview()}
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
    return isUrlAcquisitionRequest(request) ? "取得" : "開く";
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
    saveState();
    await refreshDataFromInput();
    switchView("home");
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
            <button class="tool-button active" type="submit">反映</button>
            <button class="tool-button" type="button" data-clear-input="true">クリア</button>
          </div>
        </form>
        <aside class="panel">
          <h2>検出語句</h2>
          ${renderMatches()}
          <h2>取得候補</h2>
          ${renderAcquisitionRequests()}
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

  document.addEventListener("submit", (event) => {
    if (event.target.id !== "context-input-form") {
      return;
    }

    event.preventDefault();
    const formData = new FormData(event.target);
    state.input = Object.fromEntries(formData.entries());
    saveState();
    refreshDataFromInput();
    switchView("home");
  });

  renderAll();
})();

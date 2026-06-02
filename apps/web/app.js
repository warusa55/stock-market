import { loadContextData } from "./data-source.js";

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
    home: "今日の1枚",
    input: "入力",
    dictionary: "用語図鑑",
    "event-map": "イベントマップ",
    timeline: "タイムライン",
    checkpoint: "チェックポイント",
    reflection: "振り返り"
  };

  let state = loadState();

  function loadState() {
    try {
      return {
        input: { ...defaultInput },
        openedDictionaryIds: [],
        openedEventMapIds: [],
        selectedActions: [],
        selectedCheckpointIds: [],
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

  function renderHome() {
    const card = data.card;
    document.getElementById("home").innerHTML = `
      <div class="layout-grid">
        <article class="card">
          <div class="card-title">
            <div>
              <h2>${escapeHtml(card.title)}</h2>
              <p class="subtitle">${escapeHtml(card.subtitle)}</p>
            </div>
            <span class="status-pill">${escapeHtml(card.difficulty ?? "normal")}</span>
          </div>
          <p>${escapeHtml(card.shortExplanation)}</p>
          <h3>見るポイント</h3>
          ${listHtml(card.focusPoints, "focus-list")}
          <h3>今日の理解</h3>
          <p>${escapeHtml(card.todayTakeaway)}</p>
          <div class="action-row">
            ${(card.nextActions ?? [])
              .map((action) => {
                const active = state.selectedActions.includes(action.id) ? " active" : "";
                return `<button class="tool-button${active}" data-action="${escapeHtml(action.id)}">${escapeHtml(action.label)}</button>`;
              })
              .join("")}
          </div>
        </article>
        <aside class="panel">
          <h2>検出語句</h2>
          ${renderMatches()}
          <div class="action-row">
            <button class="tool-button" data-view="input">入力</button>
          </div>
          <h2>反応</h2>
          <div class="reaction-row">
            ${[
              ["understood", "分かった"],
              ["somewhat_understood", "なんとなく"],
              ["unclear", "まだ分からん"],
              ["important", "重要そう"]
            ]
              .map(([id, label]) => {
                const active = state.finalReaction === id ? " active" : "";
                return `<button class="tool-button warn${active}" data-reaction="${id}">${label}</button>`;
              })
              .join("")}
          </div>
        </aside>
      </div>
    `;
  }

  function inputValue(name) {
    return escapeHtml(state.input?.[name] ?? "");
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
    document.getElementById("subject-name").textContent = data.subject.name;
    renderHome();
    renderInput();
    renderDictionary();
    renderEventMap();
    renderTimeline();
    renderCheckpoint();
    renderReflection();
  }

  document.addEventListener("click", (event) => {
    const navItem = event.target.closest("[data-view]");
    if (navItem) {
      switchView(navItem.dataset.view);
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

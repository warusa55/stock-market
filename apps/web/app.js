(function () {
  const data = window.CONTEXT_DEMO;
  const storageKey = "context-platform-demo-state";
  const viewTitles = {
    home: "今日の1枚",
    dictionary: "用語図鑑",
    "event-map": "イベントマップ",
    timeline: "タイムライン",
    checkpoint: "チェックポイント",
    reflection: "振り返り"
  };

  const state = loadState();

  function loadState() {
    try {
      return {
        openedDictionaryIds: [],
        openedEventMapIds: [],
        selectedActions: [],
        selectedCheckpointIds: [],
        finalReaction: "",
        ...(JSON.parse(localStorage.getItem(storageKey)) ?? {})
      };
    } catch {
      return {
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
            <span class="status-pill">easy</span>
          </div>
          <p>${escapeHtml(card.shortExplanation)}</p>
          <h3>見るポイント</h3>
          ${listHtml(card.focusPoints, "focus-list")}
          <h3>今日の理解</h3>
          <p>${escapeHtml(card.todayTakeaway)}</p>
          <div class="action-row">
            ${card.nextActions
              .map((action) => {
                const active = state.selectedActions.includes(action.id) ? " active" : "";
                return `<button class="tool-button${active}" data-action="${escapeHtml(action.id)}">${escapeHtml(action.label)}</button>`;
              })
              .join("")}
          </div>
        </article>
        <aside class="panel">
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
            ${checkpoint.options
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
      const actionData = data.card.nextActions.find((item) => item.id === action.dataset.action);
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
  });

  renderAll();
})();

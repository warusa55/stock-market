import {
  createInformationItemFromInput,
  createSubjectFromInput,
  matchDictionaryEntries,
  relatedEventMapIdsFromMatches
} from "../../src/core/dictionary-match.js";

const registryLoaders = {
  market: async () => {
    const module = await import("../../src/plugins/market/index.js");
    return {
      id: "market",
      module,
      registry: module.createMarketRegistry(),
      defaultDomainId: "stock"
    };
  },
  company: async () => {
    const module = await import("../../src/plugins/company/index.js");
    return {
      id: "company",
      module,
      registry: module.createCompanyRegistry(),
      defaultDomainId: "onboarding"
    };
  },
  demo: async () => {
    const [pluginModule, dataModule] = await Promise.all([
      import("../../src/plugins/demo/demo-plugin.js"),
      import("../../src/plugins/demo/demo-data.js")
    ]);
    const plugin = pluginModule.createDemoPlugin();
    return {
      id: "demo",
      plugin,
      subject: dataModule.demoSubject,
      informationItems: dataModule.demoInformationItems,
      timelineItems: dataModule.demoTimelineItems,
      defaultDomainId: plugin.id
    };
  }
};

const exportPrefixByDomain = {
  fund: "fund",
  onboarding: "onboarding",
  stock: "stock"
};

const acquisitionErrorMessages = {
  blocked_url: "このURLは取得対象外です。",
  fetch_failed: "URL本文を取得できませんでした。",
  invalid_ticker: "銘柄コードが不正です。",
  invalid_url: "URLが不正です。",
  no_content: "取得できる本文がありませんでした。",
  no_items: "該当するTDnet開示候補がありません。",
  tdnet_fetch_failed: "TDnet候補を取得できませんでした。",
  url_fetch_failed: "URL本文を取得できませんでした。"
};

function createAcquisitionError(error, details = {}) {
  const raw = typeof error === "object" && error ? error : {};
  const code = raw.code ?? raw.error ?? (typeof error === "string" ? error : "fetch_failed");

  return {
    ...details,
    ...raw,
    code,
    message: raw.message ?? details.message ?? acquisitionErrorMessages[code] ?? "取得に失敗しました。"
  };
}

async function readResponseError(response, fallbackCode) {
  let payload = {};

  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  return createAcquisitionError(payload.error ?? fallbackCode, {
    status: payload.status ?? response.status
  });
}

function getAcquisitionResultError(result) {
  if (!result?.error) {
    return null;
  }

  return createAcquisitionError(result.error, {
    status: result.status
  });
}

function getSearchParams(options) {
  if (options.search) {
    return new URLSearchParams(options.search);
  }
  if (globalThis.location?.search) {
    return new URLSearchParams(globalThis.location.search);
  }
  return new URLSearchParams();
}

function shouldFetchUrlContent(input) {
  return Boolean(
    input?.url &&
      (!String(input.title ?? "").trim() || !String(input.bodyExcerpt ?? "").trim())
  );
}

async function defaultFetchUrlContent(url) {
  if (!globalThis.fetch || !globalThis.location?.origin) {
    return null;
  }

  const response = await fetch(`/api/url-content?url=${encodeURIComponent(url)}`);
  if (!response.ok) {
    return {
      error: await readResponseError(response, "url_fetch_failed")
    };
  }

  return response.json();
}

async function defaultFetchStockDisclosures(request) {
  if (!globalThis.fetch || !request?.query?.tickerCode) {
    return null;
  }

  const response = await fetch(
    `/api/stock/tdnet?ticker=${encodeURIComponent(request.query.tickerCode)}&limit=10`
  );
  if (!response.ok) {
    return {
      error: await readResponseError(response, "tdnet_fetch_failed")
    };
  }

  return response.json();
}

async function enrichInputFromUrlContent(input, fetchUrlContent) {
  if (!shouldFetchUrlContent(input)) {
    return input;
  }

  const fetcher = fetchUrlContent ?? defaultFetchUrlContent;
  try {
    const content = await fetcher(input.url);
    if (!content) {
      return input;
    }
    const error = getAcquisitionResultError(content);
    if (error) {
      return {
        ...input,
        urlContent: {
          status: "failed",
          error: error.code,
          message: error.message
        }
      };
    }

    return {
      ...input,
      title: String(input.title ?? "").trim() || content.title,
      bodyExcerpt: String(input.bodyExcerpt ?? "").trim() || content.bodyExcerpt,
      urlContent: {
        ...content,
        status: "ok"
      }
    };
  } catch {
    return {
      ...input,
      urlContent: {
        status: "failed"
      }
    };
  }
}

function isUrlContentRequest(request) {
  return Boolean(request?.id?.includes("-url-") && request?.query?.url);
}

function isTdnetRequest(request) {
  return request?.query?.provider === "yanoshin_tdnet" && request?.query?.tickerCode;
}

function mergeTags(...groups) {
  return [
    ...new Set(
      groups
        .flatMap((group) => (Array.isArray(group) ? group : String(group ?? "").split(",")))
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  ].join(",");
}

function createGenericAcquisitionInputPatch(request, { content, currentInput = {} } = {}) {
  const keywords = request?.query?.keywords ?? [];
  const tickerCode = request?.query?.tickerCode ?? currentInput.subjectCode ?? "";
  const patch = {
    subjectCode: tickerCode,
    subjectName: currentInput.subjectName || request?.query?.subjectName || "",
    sourceType: request?.sourceType ?? currentInput.sourceType ?? "manual",
    sourceKind: request?.sourceKind ?? currentInput.sourceKind ?? "",
    url: request?.query?.url || currentInput.url || "",
    tags: mergeTags(currentInput.tags, request?.sourceKind, tickerCode ? `ticker:${tickerCode}` : "", keywords)
  };

  if (content) {
    patch.title = currentInput.title || content.title || "";
    patch.bodyExcerpt = currentInput.bodyExcerpt || content.bodyExcerpt || "";
    patch.urlContent = {
      ...content,
      status: "ok"
    };
  }

  return patch;
}

async function tryLoadRegistry(id) {
  try {
    return await registryLoaders[id]();
  } catch {
    return null;
  }
}

async function loadRequestedRegistry(requestedRegistry) {
  if (requestedRegistry) {
    return (await tryLoadRegistry(requestedRegistry)) ?? (await registryLoaders.demo());
  }

  return (
    (await tryLoadRegistry("market")) ??
    (await tryLoadRegistry("company")) ??
    (await registryLoaders.demo())
  );
}

function pickDomain(registrySource, requestedDomainId) {
  if (registrySource.plugin) {
    return registrySource.plugin;
  }

  const domainId = requestedDomainId ?? registrySource.defaultDomainId;
  return registrySource.registry.get(domainId) ?? registrySource.registry.list()[0];
}

function pickExport(module, domainId, suffix) {
  const prefix = exportPrefixByDomain[domainId] ?? domainId;
  return module?.[`${prefix}${suffix}`];
}

function pickSubject(registrySource, plugin) {
  return (
    registrySource.subject ??
    pickExport(registrySource.module, plugin.id, "Subject") ?? {
      id: `subject-${plugin.id}`,
      domainId: plugin.id,
      type: "domain",
      name: plugin.name
    }
  );
}

function pickInformationItems(registrySource, plugin) {
  return (
    registrySource.informationItems ??
    pickExport(registrySource.module, plugin.id, "InformationItems") ??
    plugin.listInformationItems?.() ??
    []
  );
}

function pickTimelineItems(registrySource, plugin) {
  return (
    registrySource.timelineItems ??
    pickExport(registrySource.module, plugin.id, "TimelineItems") ??
    plugin.listTimelineItems?.() ??
    []
  );
}

function pickEventMap(plugin, card, timelineItems, dictionaryMatches) {
  const maps = plugin.listEventMaps();
  const matchedEventMapIds = relatedEventMapIdsFromMatches(dictionaryMatches);
  const preferredMapId =
    card?.relatedEventMapIds?.[0] ??
    matchedEventMapIds[0] ??
    timelineItems[0]?.relatedEventMapIds?.[0];
  const eventMap = maps.find((map) => map.id === preferredMapId) ?? maps[0];

  if (!eventMap) {
    return {
      id: "empty-event-map",
      title: "イベントマップ",
      nodes: [],
      currentNodeId: null
    };
  }

  return {
    ...eventMap,
    currentNodeId: timelineItems.find((item) => item.relatedEventMapIds?.includes(eventMap.id))
      ?.eventNodeId ?? eventMap.nodes[1]?.id ?? eventMap.nodes[0]?.id
  };
}

function pickCheckpoint(plugin, card) {
  return (
    plugin.createCheckpoints({ card })[0] ?? {
      id: `checkpoint-${card?.id ?? "empty"}`,
      domainId: plugin.id,
      title: "チェックポイント",
      prompt: "このカードの反応を選ぶ",
      options: []
    }
  );
}

function createFallbackCard(plugin, subject, item, dictionaryMatches) {
  const relatedTermIds = dictionaryMatches.map((match) => match.entry.id);
  const relatedEventMapIds = relatedEventMapIdsFromMatches(dictionaryMatches);

  return {
    id: `card-input-${plugin.id}`,
    domainId: plugin.id,
    subjectId: subject?.id,
    itemId: item?.id,
    title: `今日の1枚: ${item?.title ?? "手入力メモ"}`,
    subtitle: subject?.name,
    shortExplanation: item?.bodyExcerpt || "入力された情報から、まず見るところを小さく切ります。",
    focusPoints:
      dictionaryMatches.length > 0
        ? dictionaryMatches.slice(0, 3).map((match) => match.entry.term)
        : ["何の情報か", "どの言葉が気になるか", "次に見るものは何か"],
    todayTakeaway:
      dictionaryMatches.length > 0
        ? "入力された情報から、辞書に引っかかった言葉を入口にする。"
        : "入力された情報を、1枚カードとして小さく読む。",
    relatedTermIds,
    relatedEventMapIds,
    nextActions: [
      ...relatedTermIds.slice(0, 2).map((termId) => ({
        id: `open-${termId}`,
        label: "用語を見る",
        type: "open_dictionary",
        targetId: termId
      })),
      ...relatedEventMapIds.slice(0, 1).map((eventMapId) => ({
        id: `open-${eventMapId}`,
        label: "今ここを見る",
        type: "open_event_map",
        targetId: eventMapId
      }))
    ],
    difficulty: "easy",
    createdAt: item?.capturedAt ?? new Date().toISOString()
  };
}

function buildInputContext(plugin, baseSubject, input) {
  if (!input || Object.values(input).every((value) => String(value ?? "").trim() === "")) {
    return null;
  }

  const pluginInputContext = plugin.createInputContext?.({ input, baseSubject });
  if (pluginInputContext) {
    return pluginInputContext;
  }

  const subject = createSubjectFromInput({
    id: `subject-input-${plugin.id}`,
    domainId: plugin.id,
    type: input.subjectType || baseSubject.type || "manual",
    name: input.subjectName || baseSubject.name,
    description: input.subjectMemo,
    tags: input.tags
  });
  const item = createInformationItemFromInput({
    id: `item-input-${plugin.id}`,
    domainId: plugin.id,
    subjectId: subject.id,
    sourceType: input.sourceType || "manual",
    title: input.title,
    bodyExcerpt: input.bodyExcerpt,
    url: input.url,
    tags: input.tags,
    eventType: input.eventType
  });
  const timelineItem = {
    id: `timeline-input-${plugin.id}`,
    domainId: plugin.id,
    subjectId: subject.id,
    itemId: item.id,
    title: item.title,
    occurredAt: item.publishedAt ?? item.capturedAt,
    summary: item.bodyExcerpt || item.title,
    tags: item.tags ?? [],
    relatedTermIds: [],
    relatedEventMapIds: [],
    eventNodeId: undefined
  };

  return {
    subject,
    item,
    timelineItem
  };
}

export async function loadContextData(options = {}) {
  const params = getSearchParams(options);
  const registrySource = await loadRequestedRegistry(params.get("registry"));
  const plugin = pickDomain(registrySource, params.get("domain"));
  const baseSubject = pickSubject(registrySource, plugin);
  const informationItems = pickInformationItems(registrySource, plugin);
  const timelineItems = pickTimelineItems(registrySource, plugin);
  const input = await enrichInputFromUrlContent(options.input, options.fetchUrlContent);
  const inputContext = buildInputContext(plugin, baseSubject, input);
  const subject = inputContext?.subject ?? baseSubject;
  const item = inputContext?.item ?? informationItems[0];
  const dictionary = plugin.listDictionaryEntries();
  const dictionaryMatches = matchDictionaryEntries(dictionary, item);
  const card =
    plugin.createCard({
      subject,
      item
    }) ?? createFallbackCard(plugin, subject, item, dictionaryMatches);
  const timeline = inputContext ? [inputContext.timelineItem, ...timelineItems] : timelineItems;
  const acquisitionRequests =
    inputContext?.acquisitionRequests ?? (input ? plugin.createAcquisitionRequests?.(input) ?? [] : []);

  return {
    registryId: registrySource.id,
    domainId: plugin.id,
    domainName: plugin.name,
    subject,
    item,
    card,
    dictionary,
    dictionaryMatches,
    eventMap: pickEventMap(plugin, card, timeline, dictionaryMatches),
    timeline,
    checkpoint: pickCheckpoint(plugin, card),
    acquisitionSources: plugin.listAcquisitionSources?.() ?? [],
    acquisitionRequests
  };
}

export async function executeAcquisitionRequest(options = {}) {
  const params = getSearchParams(options);
  const registrySource = await loadRequestedRegistry(params.get("registry"));
  const plugin = pickDomain(registrySource, params.get("domain"));
  const request = options.request;
  const currentInput = options.input ?? {};
  const fetcher = options.fetchUrlContent ?? defaultFetchUrlContent;
  const stockDisclosureFetcher = options.fetchStockDisclosures ?? defaultFetchStockDisclosures;
  let content = null;
  let acquiredItems = [];
  let status = "selected";
  let error = null;

  if (isUrlContentRequest(request)) {
    try {
      const result = await fetcher(request.query.url);
      error = getAcquisitionResultError(result);
      content = error ? null : result;
      status = content ? "completed" : "failed";
      if (!content && !error) {
        error = createAcquisitionError("no_content");
      }
    } catch (caughtError) {
      status = "failed";
      error = createAcquisitionError("url_fetch_failed", {
        detail: caughtError?.message
      });
    }
  } else if (isTdnetRequest(request)) {
    try {
      const result = await stockDisclosureFetcher(request);
      error = getAcquisitionResultError(result);
      acquiredItems = error ? [] : result?.items ?? [];
      content = acquiredItems[0] ?? null;
      status = error ? "failed" : content ? "completed" : "missing";
      if (!content && !error) {
        error = createAcquisitionError("no_items");
      }
    } catch (caughtError) {
      status = "failed";
      error = createAcquisitionError("tdnet_fetch_failed", {
        detail: caughtError?.message
      });
    }
  }

  const inputPatch =
    plugin.createAcquisitionInputPatch?.({ request, currentInput, content }) ??
    createGenericAcquisitionInputPatch(request, { currentInput, content });

  return {
    status,
    error,
    inputPatch,
    acquiredItems,
    externalUrl: isUrlContentRequest(request) ? "" : request?.query?.externalUrl ?? ""
  };
}

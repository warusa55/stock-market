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

function getSearchParams(options) {
  if (options.search) {
    return new URLSearchParams(options.search);
  }
  if (globalThis.location?.search) {
    return new URLSearchParams(globalThis.location.search);
  }
  return new URLSearchParams();
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

function pickEventMap(plugin, card, timelineItems) {
  const maps = plugin.listEventMaps();
  const preferredMapId = card?.relatedEventMapIds?.[0] ?? timelineItems[0]?.relatedEventMapIds?.[0];
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

export async function loadContextData(options = {}) {
  const params = getSearchParams(options);
  const registrySource = await loadRequestedRegistry(params.get("registry"));
  const plugin = pickDomain(registrySource, params.get("domain"));
  const subject = pickSubject(registrySource, plugin);
  const informationItems = pickInformationItems(registrySource, plugin);
  const timelineItems = pickTimelineItems(registrySource, plugin);
  const item = informationItems[0];
  const card = plugin.createCard({
    subject,
    item
  });

  return {
    registryId: registrySource.id,
    domainId: plugin.id,
    domainName: plugin.name,
    subject,
    card,
    dictionary: plugin.listDictionaryEntries(),
    eventMap: pickEventMap(plugin, card, timelineItems),
    timeline: timelineItems,
    checkpoint: pickCheckpoint(plugin, card)
  };
}

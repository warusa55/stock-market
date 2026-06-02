export function createEmptyMarketShelf() {
  return {
    subjects: [],
    items: [],
    selectedSubjectId: "",
    selectedItemId: ""
  };
}

function nowIso(now) {
  return now instanceof Date ? now.toISOString() : new Date(now).toISOString();
}

function parseTags(value) {
  return Array.isArray(value)
    ? value.map((tag) => String(tag).trim()).filter(Boolean)
    : String(value ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
}

function uniqueTags(values) {
  return [...new Set(values.filter(Boolean))];
}

function createShelfId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeSubject(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  return {
    id: String(value.id ?? "").trim(),
    domainId: String(value.domainId ?? "stock").trim() || "stock",
    subjectType: String(value.subjectType ?? value.type ?? "listed-company").trim() || "listed-company",
    code: String(value.code ?? value.subjectCode ?? "").trim(),
    name: String(value.name ?? value.subjectName ?? "").trim() || "未設定銘柄",
    memo: String(value.memo ?? value.subjectMemo ?? "").trim(),
    tags: parseTags(value.tags),
    createdAt: value.createdAt ?? new Date().toISOString(),
    updatedAt: value.updatedAt ?? value.createdAt ?? new Date().toISOString()
  };
}

function normalizeItem(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  return {
    id: String(value.id ?? "").trim(),
    subjectId: String(value.subjectId ?? "").trim(),
    domainId: String(value.domainId ?? "stock").trim() || "stock",
    sourceType: String(value.sourceType ?? "manual").trim() || "manual",
    sourceKind: String(value.sourceKind ?? "").trim(),
    title: String(value.title ?? "").trim() || "手入力メモ",
    bodyExcerpt: String(value.bodyExcerpt ?? "").trim(),
    url: String(value.url ?? "").trim(),
    tags: parseTags(value.tags),
    eventType: String(value.eventType ?? "").trim(),
    sourceStatus: value.sourceStatus ?? "unknown",
    createdAt: value.createdAt ?? new Date().toISOString(),
    updatedAt: value.updatedAt ?? value.createdAt ?? new Date().toISOString()
  };
}

export function normalizeMarketShelf(value) {
  const empty = createEmptyMarketShelf();
  if (!value || typeof value !== "object") {
    return empty;
  }

  const subjects = (Array.isArray(value.subjects) ? value.subjects : [])
    .map(normalizeSubject)
    .filter((subject) => subject?.id);
  const subjectIds = new Set(subjects.map((subject) => subject.id));
  const items = (Array.isArray(value.items) ? value.items : [])
    .map(normalizeItem)
    .filter((item) => item?.id && subjectIds.has(item.subjectId));
  const itemIds = new Set(items.map((item) => item.id));
  const selectedSubjectId = subjectIds.has(value.selectedSubjectId) ? value.selectedSubjectId : "";
  const selectedItemId = itemIds.has(value.selectedItemId) ? value.selectedItemId : "";

  return {
    subjects,
    items,
    selectedSubjectId,
    selectedItemId
  };
}

function isSameSubject(subject, input, domainId) {
  const code = String(input.subjectCode ?? "").trim();
  const name = String(input.subjectName ?? "").trim();

  if (subject.domainId !== domainId) {
    return false;
  }
  if (code) {
    return subject.code === code;
  }

  return Boolean(name && subject.name === name);
}

function findLatestItemForSubject(items, subjectId) {
  return [...items]
    .filter((item) => item.subjectId === subjectId)
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))[0];
}

export function listItemsForSubject(shelf, subjectId) {
  return normalizeMarketShelf(shelf).items
    .filter((item) => item.subjectId === subjectId)
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

export function getSelectedShelfSubject(shelf) {
  const normalized = normalizeMarketShelf(shelf);
  return normalized.subjects.find((subject) => subject.id === normalized.selectedSubjectId) ?? null;
}

export function getSelectedShelfItem(shelf) {
  const normalized = normalizeMarketShelf(shelf);
  return normalized.items.find((item) => item.id === normalized.selectedItemId) ?? null;
}

export function saveInputToMarketShelf(
  shelf,
  input,
  { domainId = "stock", now = new Date(), idFactory = createShelfId } = {}
) {
  const normalized = normalizeMarketShelf(shelf);
  const timestamp = nowIso(now);
  const inputTags = parseTags(input.tags);
  const subjectCode = String(input.subjectCode ?? "").trim();
  const subjectName = String(input.subjectName ?? "").trim() || subjectCode || "未設定銘柄";
  const existingSubject = normalized.subjects.find((subject) => isSameSubject(subject, input, domainId));
  const subject =
    existingSubject ??
    normalizeSubject({
      id: idFactory("subject"),
      domainId,
      subjectType: input.subjectType || "listed-company",
      code: subjectCode,
      name: subjectName,
      memo: input.subjectMemo,
      tags: uniqueTags([subjectCode ? `ticker:${subjectCode}` : "", ...inputTags]),
      createdAt: timestamp,
      updatedAt: timestamp
    });
  const updatedSubject = {
    ...subject,
    subjectType: input.subjectType || subject.subjectType,
    code: subjectCode || subject.code,
    name: subjectName,
    memo: String(input.subjectMemo ?? subject.memo ?? "").trim(),
    tags: uniqueTags([subjectCode ? `ticker:${subjectCode}` : "", ...subject.tags, ...inputTags]),
    updatedAt: timestamp
  };
  const itemDraft = normalizeItem({
    id: idFactory("item"),
    subjectId: updatedSubject.id,
    domainId,
    sourceType: input.sourceType || "manual",
    sourceKind: input.sourceKind,
    title: input.title,
    bodyExcerpt: input.bodyExcerpt,
    url: input.url,
    tags: inputTags,
    eventType: input.eventType,
    sourceStatus: input.sourceStatus || "unknown",
    createdAt: timestamp,
    updatedAt: timestamp
  });
  const existingItem = normalized.items.find((item) => {
    return item.subjectId === updatedSubject.id && item.title === itemDraft.title && item.url === itemDraft.url;
  });
  const savedItem = existingItem ? { ...existingItem, ...itemDraft, id: existingItem.id, createdAt: existingItem.createdAt } : itemDraft;
  const subjects = existingSubject
    ? normalized.subjects.map((candidate) => (candidate.id === updatedSubject.id ? updatedSubject : candidate))
    : [...normalized.subjects, updatedSubject];
  const items = existingItem
    ? normalized.items.map((candidate) => (candidate.id === savedItem.id ? savedItem : candidate))
    : [...normalized.items, savedItem];

  return {
    shelf: {
      subjects,
      items,
      selectedSubjectId: updatedSubject.id,
      selectedItemId: savedItem.id
    },
    subject: updatedSubject,
    item: savedItem
  };
}

export function selectShelfSubject(shelf, subjectId) {
  const normalized = normalizeMarketShelf(shelf);
  const subject = normalized.subjects.find((candidate) => candidate.id === subjectId);
  if (!subject) {
    return normalized;
  }

  const latestItem = findLatestItemForSubject(normalized.items, subject.id);
  return {
    ...normalized,
    selectedSubjectId: subject.id,
    selectedItemId: latestItem?.id ?? ""
  };
}

export function selectShelfItem(shelf, itemId) {
  const normalized = normalizeMarketShelf(shelf);
  const item = normalized.items.find((candidate) => candidate.id === itemId);
  if (!item) {
    return normalized;
  }

  return {
    ...normalized,
    selectedSubjectId: item.subjectId,
    selectedItemId: item.id
  };
}

export function restoreInputFromShelf(subject, item) {
  return {
    subjectName: subject?.name ?? "",
    subjectCode: subject?.code ?? "",
    subjectType: subject?.subjectType ?? "",
    subjectMemo: subject?.memo ?? "",
    sourceType: item?.sourceType ?? "manual",
    sourceKind: item?.sourceKind ?? "",
    title: item?.title ?? "",
    bodyExcerpt: item?.bodyExcerpt ?? "",
    url: item?.url ?? "",
    tags: (item?.tags ?? []).join(","),
    eventType: item?.eventType ?? ""
  };
}

export function createTimelineItemsFromShelf(subject, items) {
  return [...items].map((item) => ({
    id: `timeline-${item.id}`,
    domainId: item.domainId,
    subjectId: subject.id,
    itemId: item.id,
    title: item.title,
    occurredAt: item.updatedAt ?? item.createdAt,
    summary: item.bodyExcerpt || item.title,
    tags: item.tags ?? [],
    relatedTermIds: [],
    relatedEventMapIds: [],
    eventNodeId: undefined
  }));
}

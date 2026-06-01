const DEFAULT_PATTERNS = [
  {
    label: "EMAIL",
    pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
  },
  {
    label: "POSTAL",
    pattern: /\b\d{3}-\d{4}\b/g
  },
  {
    label: "PHONE",
    pattern: /(?<!\d)(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?){2,4}\d{3,4}(?!\d)/g
  },
  {
    label: "CONTRACT",
    pattern: /\b(?:CN|CTR|ORD|INV)[-_:]?[A-Z0-9-]{4,}\b/gi
  }
];

const SENSITIVE_KEY_PARTS = [
  "name",
  "email",
  "phone",
  "address",
  "customer",
  "company",
  "contract",
  "memo",
  "secret",
  "氏名",
  "住所",
  "電話",
  "顧客",
  "会社",
  "契約",
  "メモ",
  "社外秘"
];

function createState() {
  return {
    counters: new Map(),
    replacements: new Map()
  };
}

function nextToken(state, label, original) {
  if (state.replacements.has(original)) {
    return state.replacements.get(original);
  }

  const next = (state.counters.get(label) ?? 0) + 1;
  state.counters.set(label, next);
  const token = `${label}_${String(next).padStart(3, "0")}`;
  state.replacements.set(original, token);
  return token;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function maskString(value, options, state) {
  let masked = value;

  for (const { label, pattern } of DEFAULT_PATTERNS) {
    masked = masked.replace(pattern, (match) => nextToken(state, label, match));
  }

  const sensitiveTerms = [...(options.sensitiveTerms ?? [])]
    .filter((term) => typeof term === "string" && term.length > 0)
    .sort((a, b) => b.length - a.length);

  for (const term of sensitiveTerms) {
    const pattern = new RegExp(escapeRegExp(term), "g");
    masked = masked.replace(pattern, (match) => nextToken(state, "TERM", match));
  }

  return masked;
}

function isSensitiveKey(key) {
  const normalized = key.toLowerCase();
  return SENSITIVE_KEY_PARTS.some((part) => normalized.includes(part.toLowerCase()));
}

function maskValue(value, options, state, key = "") {
  if (value == null) {
    return value;
  }

  if (typeof value === "string") {
    if (key && isSensitiveKey(key)) {
      return nextToken(state, "FIELD", value);
    }
    return maskString(value, options, state);
  }

  if (Array.isArray(value)) {
    return value.map((item) => maskValue(item, options, state));
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => {
        return [entryKey, maskValue(entryValue, options, state, entryKey)];
      })
    );
  }

  return value;
}

export function maskText(text, options = {}) {
  const state = createState();
  const value = maskString(String(text), options, state);
  return {
    text: value,
    replacements: Object.fromEntries(state.replacements)
  };
}

export function maskRecord(record, options = {}) {
  const state = createState();
  const data = maskValue(record, options, state);
  return {
    data,
    replacements: Object.fromEntries(state.replacements)
  };
}

export function createLogMaskerState() {
  return {
    counters: new Map(),
    values: new Map()
  };
}

function logToken(state, label, value) {
  if (value == null || value === "") {
    return undefined;
  }

  const key = `${label}:${value}`;
  if (state.values.has(key)) {
    return state.values.get(key);
  }

  const next = (state.counters.get(label) ?? 0) + 1;
  state.counters.set(label, next);
  const token = `${label}_${String(next).padStart(3, "0")}`;
  state.values.set(key, token);
  return token;
}

export function maskInteractionLog(log, state = createLogMaskerState()) {
  return {
    user: logToken(state, "USER", log.userId),
    session: logToken(state, "SESSION", log.sessionId),
    domain: log.domainId,
    subject: logToken(state, "SUBJECT", log.subjectId),
    card: logToken(state, "CARD", log.cardId),
    item: logToken(state, "ITEM", log.itemId),
    readDurationMs: log.readDurationMs ?? null,
    openedDictionaryCount: log.openedDictionaryIds?.length ?? 0,
    openedEventMapCount: log.openedEventMapIds?.length ?? 0,
    openedTimelineCount: log.openedTimelineIds?.length ?? 0,
    selectedCheckpointCount: log.selectedCheckpointIds?.length ?? 0,
    selectedActionCount: log.selectedActions?.length ?? 0,
    finalReaction: log.finalReaction
  };
}

export function maskInteractionLogs(logs) {
  const state = createLogMaskerState();
  return logs.map((log) => maskInteractionLog(log, state));
}

import { itemSearchText } from "./template-driven-plugin.js";

function normalizeText(value) {
  return String(value ?? "").toLowerCase();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

export function createInformationItemFromInput({
  id = "item-user-input",
  domainId,
  subjectId,
  sourceType = "manual",
  title,
  bodyExcerpt,
  url,
  tags,
  eventType,
  now = () => new Date().toISOString()
}) {
  const tagList = Array.isArray(tags)
    ? tags
    : String(tags ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

  return {
    id,
    domainId,
    subjectIds: subjectId ? [subjectId] : [],
    sourceType,
    title: String(title ?? "").trim() || "手入力メモ",
    bodyExcerpt: String(bodyExcerpt ?? "").trim(),
    url: String(url ?? "").trim() || undefined,
    capturedAt: now(),
    tags: tagList,
    raw: eventType
      ? {
          eventType
        }
      : {}
  };
}

export function createSubjectFromInput({
  id = "subject-user-input",
  domainId,
  type = "manual",
  name,
  description,
  tags,
  now = () => new Date().toISOString()
}) {
  const tagList = Array.isArray(tags)
    ? tags
    : String(tags ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

  const timestamp = now();

  return {
    id,
    domainId,
    type,
    name: String(name ?? "").trim() || "手入力対象",
    description: String(description ?? "").trim() || undefined,
    tags: tagList,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function matchDictionaryEntries(entries, input) {
  const searchText = normalizeText(
    typeof input === "string" ? input : [itemSearchText(input), input?.url].filter(Boolean).join(" ")
  );

  return entries
    .map((entry) => {
      const terms = unique([entry.term, ...(entry.aliases ?? [])]);
      const matchedTerms = terms.filter((term) => searchText.includes(normalizeText(term)));

      return {
        entry,
        matchedTerms,
        score: matchedTerms.reduce((sum, term) => sum + normalizeText(term).length, 0)
      };
    })
    .filter((match) => match.matchedTerms.length > 0)
    .sort((a, b) => b.score - a.score || a.entry.term.localeCompare(b.entry.term));
}

export function relatedEventMapIdsFromMatches(matches) {
  return unique(matches.flatMap((match) => match.entry.relatedEventMapIds ?? []));
}

export function relatedTermIdsFromMatches(matches) {
  return matches.map((match) => match.entry.id);
}

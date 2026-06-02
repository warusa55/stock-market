import { DomainPluginBase } from "./plugin-base.js";
import { createReflectionReport } from "./reflection.js";
import { observeScoring } from "./scoring.js";

function list(value) {
  return Array.isArray(value) ? Object.freeze([...value]) : Object.freeze([]);
}

function object(value) {
  return value && typeof value === "object" ? Object.freeze({ ...value }) : Object.freeze({});
}

export function itemSearchText(item) {
  return [item?.title, item?.bodyExcerpt, ...(item?.tags ?? []), item?.raw?.eventType]
    .filter(Boolean)
    .join(" ");
}

export function createOneCardFromTemplate({ domainId, template, subject, item, now, overrides = {} }) {
  if (!template) {
    return null;
  }

  return {
    ...template,
    ...overrides,
    id: overrides.id ?? template.id,
    domainId,
    subjectId: overrides.subjectId ?? subject?.id,
    itemId: overrides.itemId ?? item?.id,
    createdAt: overrides.createdAt ?? now
  };
}

export class TemplateDrivenPluginBase extends DomainPluginBase {
  constructor(definition) {
    super(definition);

    this.informationItems = list(definition.informationItems);
    this.timelineItems = list(definition.timelineItems);
    this.checkpoints = list(definition.checkpoints);
    this.cardTemplates = object(definition.cardTemplates);
    this.defaultCardKind = definition.defaultCardKind ?? "general";
    this.detectCardKind =
      typeof definition.detectCardKind === "function"
        ? definition.detectCardKind
        : () => this.defaultCardKind;
  }

  listInformationItems() {
    return this.informationItems;
  }

  listTimelineItems() {
    return this.timelineItems;
  }

  listCheckpoints() {
    return this.checkpoints;
  }

  listCardTemplates() {
    return this.cardTemplates;
  }

  getItemSearchText(item) {
    return itemSearchText(item);
  }

  resolveCardTemplate(kind) {
    return this.cardTemplates[kind] ?? this.cardTemplates[this.defaultCardKind] ?? null;
  }

  createCard({ subject, item, now = new Date().toISOString() } = {}) {
    const source = item ?? this.informationItems[0];
    const kind = this.detectCardKind(source, { subject, plugin: this });
    const template = this.resolveCardTemplate(kind);

    return this.createCardFromTemplate({
      template,
      subject,
      item: source,
      now,
      kind
    });
  }

  createCardFromTemplate({ template, subject, item, now }) {
    return createOneCardFromTemplate({
      domainId: this.id,
      template,
      subject,
      item,
      now
    });
  }

  createCards(contexts = this.informationItems.map((item) => ({ item }))) {
    return super.createCards(contexts);
  }

  createCheckpoints({ card } = {}) {
    if (!card) {
      return [...this.checkpoints];
    }

    return this.checkpoints.filter((checkpoint) => checkpoint.relatedCardIds?.includes(card.id));
  }

  score(input = {}) {
    return observeScoring({
      domainId: this.id,
      logs: input.logs ?? [],
      cards: input.cards ?? this.createCards(),
      dictionaryEntries: input.dictionaryEntries ?? this.dictionaries,
      eventMaps: input.eventMaps ?? this.eventMaps,
      timelineItems: input.timelineItems ?? this.timelineItems
    });
  }

  reflect({ logs, periodStart, periodEnd, targetUserId, now } = {}) {
    return createReflectionReport({
      domainId: this.id,
      logs,
      periodStart,
      periodEnd,
      targetUserId,
      now
    });
  }
}

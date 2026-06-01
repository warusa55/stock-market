function requireText(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${fieldName} is required`);
  }
  return value;
}

function list(value) {
  return Array.isArray(value) ? Object.freeze([...value]) : Object.freeze([]);
}

export class DomainPluginBase {
  constructor(definition) {
    if (!definition || typeof definition !== "object") {
      throw new TypeError("definition is required");
    }

    this.id = requireText(definition.id, "definition.id");
    this.name = requireText(definition.name, "definition.name");
    this.version = requireText(definition.version, "definition.version");
    this.dictionaries = list(definition.dictionaries);
    this.eventMaps = list(definition.eventMaps);
    this.cardRules = list(definition.cardRules);
    this.scoringRules = list(definition.scoringRules);
    this.reflectionPrompts = list(definition.reflectionPrompts);
  }

  getDefinition() {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      dictionaries: [...this.dictionaries],
      eventMaps: [...this.eventMaps],
      cardRules: [...this.cardRules],
      scoringRules: [...this.scoringRules],
      reflectionPrompts: [...this.reflectionPrompts]
    };
  }

  listDictionaryEntries() {
    return this.dictionaries;
  }

  listEventMaps() {
    return this.eventMaps;
  }

  findDictionaryEntry(idOrTerm) {
    return this.dictionaries.find((entry) => {
      return entry.id === idOrTerm || entry.term === idOrTerm || entry.aliases?.includes(idOrTerm);
    });
  }

  findEventMap(id) {
    return this.eventMaps.find((map) => map.id === id);
  }

  createCard() {
    return null;
  }

  createCards(contexts) {
    if (!Array.isArray(contexts)) {
      return [];
    }

    return contexts.map((context) => this.createCard(context)).filter(Boolean);
  }

  createCheckpoints() {
    return [];
  }

  score() {
    return null;
  }

  reflect() {
    return null;
  }

  toJSON() {
    return this.getDefinition();
  }
}

export function createDomainPlugin(definition) {
  return new DomainPluginBase(definition);
}

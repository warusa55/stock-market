function nowIso(now) {
  return typeof now === "function" ? now() : new Date().toISOString();
}

function elapsedMs(start, end) {
  const started = Date.parse(start);
  const ended = Date.parse(end);
  if (!Number.isFinite(started) || !Number.isFinite(ended)) {
    return undefined;
  }
  return Math.max(0, ended - started);
}

export class InteractionSession {
  constructor({
    id,
    domainId,
    userId,
    subjectId,
    cardId,
    itemId,
    now = () => new Date().toISOString()
  }) {
    if (!id) {
      throw new TypeError("id is required");
    }
    if (!domainId) {
      throw new TypeError("domainId is required");
    }

    this.id = id;
    this.domainId = domainId;
    this.userId = userId;
    this.subjectId = subjectId;
    this.cardId = cardId;
    this.itemId = itemId;
    this.now = now;
    this.openedAt = nowIso(now);
    this.openedDictionaryIds = new Set();
    this.openedEventMapIds = new Set();
    this.openedTimelineIds = new Set();
    this.selectedCheckpointIds = new Set();
    this.selectedActions = new Set();
  }

  openDictionary(id) {
    if (id) {
      this.openedDictionaryIds.add(id);
    }
  }

  openEventMap(id) {
    if (id) {
      this.openedEventMapIds.add(id);
    }
  }

  openTimeline(id) {
    if (id) {
      this.openedTimelineIds.add(id);
    }
  }

  selectCheckpoint(id) {
    if (id) {
      this.selectedCheckpointIds.add(id);
    }
  }

  selectAction(id) {
    if (id) {
      this.selectedActions.add(id);
    }
  }

  snapshot() {
    return {
      id: `log-${this.id}`,
      userId: this.userId,
      sessionId: this.id,
      domainId: this.domainId,
      subjectId: this.subjectId,
      cardId: this.cardId,
      itemId: this.itemId,
      openedAt: this.openedAt,
      openedDictionaryIds: [...this.openedDictionaryIds],
      openedEventMapIds: [...this.openedEventMapIds],
      openedTimelineIds: [...this.openedTimelineIds],
      selectedCheckpointIds: [...this.selectedCheckpointIds],
      selectedActions: [...this.selectedActions]
    };
  }

  finish(finalReaction) {
    const closedAt = nowIso(this.now);
    return {
      ...this.snapshot(),
      closedAt,
      readDurationMs: elapsedMs(this.openedAt, closedAt),
      finalReaction
    };
  }
}

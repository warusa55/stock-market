export type DomainId = string;

export type SourceType =
  | "official"
  | "news"
  | "document"
  | "manual"
  | "case"
  | "sample"
  | string;

export type Difficulty = "easy" | "normal" | "hard";

export type DictionaryStatus = "draft" | "reviewing" | "verified";

export type EventNodeType = "start" | "middle" | "end" | "branch" | "optional";

export type ActionType =
  | "open_dictionary"
  | "open_event_map"
  | "open_timeline"
  | "open_comparison"
  | "mark_understood"
  | "mark_later"
  | "external_link"
  | string;

export type FinalReaction =
  | "understood"
  | "somewhat_understood"
  | "unclear"
  | "later"
  | "important"
  | "skipped"
  | string;

export interface CardRule {
  id: string;
  name: string;
  description: string;
}

export interface ScoringRule {
  id: string;
  name: string;
  description: string;
}

export interface ReflectionPrompt {
  id: string;
  name: string;
  prompt: string;
}

export interface Subject {
  id: string;
  domainId: DomainId;
  type: string;
  name: string;
  aliases?: string[];
  description?: string;
  tags?: string[];
  userMemo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InformationItem {
  id: string;
  domainId: DomainId;
  subjectIds: string[];
  sourceType: SourceType;
  title: string;
  bodyExcerpt?: string;
  url?: string;
  publishedAt?: string;
  capturedAt: string;
  tags?: string[];
  raw?: Record<string, unknown>;
}

export interface NextAction {
  id: string;
  label: string;
  type: ActionType;
  targetId?: string;
  url?: string;
}

export interface OneCard {
  id: string;
  domainId: DomainId;
  subjectId?: string;
  itemId?: string;
  title: string;
  subtitle?: string;
  shortExplanation: string;
  focusPoints: string[];
  todayTakeaway: string;
  relatedTermIds?: string[];
  relatedEventMapIds?: string[];
  nextActions?: NextAction[];
  difficulty?: Difficulty;
  createdAt: string;
}

export interface DictionaryEntry {
  id: string;
  domainId: DomainId;
  term: string;
  aliases?: string[];
  category: string;
  status: DictionaryStatus;
  shortExplanation: string;
  whyItMatters: string[];
  firstCheckpoints: string[];
  commonMisreadings?: string[];
  sourceHints?: string[];
  relatedEventMapIds?: string[];
  relatedTermIds?: string[];
}

export interface EventMap {
  id: string;
  domainId: DomainId;
  title: string;
  category: string;
  description: string;
  nodes: EventNode[];
  edges: EventEdge[];
  relatedTermIds?: string[];
}

export interface EventNode {
  id: string;
  label: string;
  shortExplanation: string;
  checkpoints: string[];
  commonMisreadings?: string[];
  nodeType?: EventNodeType;
}

export interface EventEdge {
  from: string;
  to: string;
  label?: string;
  condition?: string;
}

export interface TimelineItem {
  id: string;
  domainId: DomainId;
  subjectId: string;
  itemId?: string;
  title: string;
  occurredAt: string;
  summary: string;
  tags: string[];
  relatedTermIds?: string[];
  relatedEventMapIds?: string[];
  eventNodeId?: string;
}

export interface Checkpoint {
  id: string;
  domainId: DomainId;
  title: string;
  prompt: string;
  options?: CheckpointOption[];
  freeTextEnabled?: boolean;
  relatedCardIds?: string[];
  relatedTermIds?: string[];
  relatedEventMapIds?: string[];
}

export interface CheckpointOption {
  id: string;
  label: string;
  meaning?: string;
}

export interface InteractionLog {
  id: string;
  userId?: string;
  sessionId: string;
  domainId: DomainId;
  subjectId?: string;
  cardId?: string;
  itemId?: string;
  openedAt: string;
  closedAt?: string;
  readDurationMs?: number;
  openedDictionaryIds: string[];
  openedEventMapIds: string[];
  openedTimelineIds?: string[];
  selectedCheckpointIds?: string[];
  selectedActions: string[];
  finalReaction?: FinalReaction;
  metadata?: Record<string, unknown>;
}

export interface ScoringInput {
  domainId: DomainId;
  logs: InteractionLog[];
  cards: OneCard[];
  dictionaryEntries: DictionaryEntry[];
  eventMaps: EventMap[];
  timelineItems?: TimelineItem[];
}

export interface ScoringResult {
  domainId: DomainId;
  summary: string;
  traits: ScoringTrait[];
  cautions: string[];
  nextSuggestions: string[];
}

export interface ScoringTrait {
  id: string;
  label: string;
  score?: number;
  evidence: string[];
  interpretation: string;
  alternativeInterpretations?: string[];
}

export interface ReflectionReport {
  id: string;
  domainId: DomainId;
  targetUserId?: string;
  periodStart: string;
  periodEnd: string;
  generalComment: string;
  strictComment?: string;
  observedPatterns: string[];
  possibleRisks: string[];
  nextTrainingCards: string[];
  createdAt: string;
}

export interface CardContext {
  subject?: Subject;
  item?: InformationItem;
  now?: string;
}

export interface CheckpointContext {
  card?: OneCard;
  subject?: Subject;
  item?: InformationItem;
}

export interface ReflectionContext {
  logs: InteractionLog[];
  periodStart: string;
  periodEnd: string;
  targetUserId?: string;
  now?: () => string;
}

export interface DomainPluginDefinition {
  id: DomainId;
  name: string;
  version: string;
  dictionaries?: DictionaryEntry[];
  eventMaps?: EventMap[];
  cardRules?: CardRule[];
  scoringRules?: ScoringRule[];
  reflectionPrompts?: ReflectionPrompt[];
}

export declare class DomainPluginBase {
  id: DomainId;
  name: string;
  version: string;
  dictionaries: readonly DictionaryEntry[];
  eventMaps: readonly EventMap[];
  cardRules: readonly CardRule[];
  scoringRules: readonly ScoringRule[];
  reflectionPrompts: readonly ReflectionPrompt[];

  constructor(definition: DomainPluginDefinition);
  getDefinition(): Required<DomainPluginDefinition>;
  listDictionaryEntries(): readonly DictionaryEntry[];
  listEventMaps(): readonly EventMap[];
  findDictionaryEntry(idOrTerm: string): DictionaryEntry | undefined;
  findEventMap(id: string): EventMap | undefined;
  createCard(context: CardContext): OneCard | null;
  createCards(contexts: CardContext[]): OneCard[];
  createCheckpoints(context: CheckpointContext): Checkpoint[];
  score(input: ScoringInput): ScoringResult | null;
  reflect(context: ReflectionContext): ReflectionReport | null;
  toJSON(): Required<DomainPluginDefinition>;
}

export interface OneCardTemplate {
  id: string;
  title: string;
  subtitle?: string;
  shortExplanation: string;
  focusPoints: string[];
  todayTakeaway: string;
  relatedTermIds?: string[];
  relatedEventMapIds?: string[];
  nextActions?: NextAction[];
  difficulty?: Difficulty;
}

export interface TemplateDrivenPluginDefinition extends DomainPluginDefinition {
  informationItems?: InformationItem[];
  timelineItems?: TimelineItem[];
  checkpoints?: Checkpoint[];
  cardTemplates?: Record<string, OneCardTemplate>;
  defaultCardKind?: string;
  detectCardKind?: (
    item: InformationItem | undefined,
    context: { subject?: Subject; plugin: TemplateDrivenPluginBase }
  ) => string;
}

export interface DictionaryMatch {
  entry: DictionaryEntry;
  matchedTerms: string[];
  score: number;
}

export declare function createInformationItemFromInput(params: {
  id?: string;
  domainId: DomainId;
  subjectId?: string;
  sourceType?: SourceType;
  title?: string;
  bodyExcerpt?: string;
  url?: string;
  tags?: string[] | string;
  eventType?: string;
  now?: () => string;
}): InformationItem;

export declare function createSubjectFromInput(params: {
  id?: string;
  domainId: DomainId;
  type?: string;
  name?: string;
  description?: string;
  tags?: string[] | string;
  now?: () => string;
}): Subject;

export declare function matchDictionaryEntries(
  entries: DictionaryEntry[],
  input: InformationItem | string
): DictionaryMatch[];

export declare function relatedEventMapIdsFromMatches(matches: DictionaryMatch[]): string[];

export declare function relatedTermIdsFromMatches(matches: DictionaryMatch[]): string[];

export declare function itemSearchText(item?: InformationItem): string;

export declare function createOneCardFromTemplate(params: {
  domainId: DomainId;
  template: OneCardTemplate | null;
  subject?: Subject;
  item?: InformationItem;
  now: string;
  overrides?: Partial<OneCard>;
}): OneCard | null;

export declare class TemplateDrivenPluginBase extends DomainPluginBase {
  informationItems: readonly InformationItem[];
  timelineItems: readonly TimelineItem[];
  checkpoints: readonly Checkpoint[];
  cardTemplates: Readonly<Record<string, OneCardTemplate>>;
  defaultCardKind: string;

  constructor(definition: TemplateDrivenPluginDefinition);
  listInformationItems(): readonly InformationItem[];
  listTimelineItems(): readonly TimelineItem[];
  listCheckpoints(): readonly Checkpoint[];
  listCardTemplates(): Readonly<Record<string, OneCardTemplate>>;
  getItemSearchText(item?: InformationItem): string;
  resolveCardTemplate(kind: string): OneCardTemplate | null;
  createCardFromTemplate(params: {
    template: OneCardTemplate;
    subject?: Subject;
    item?: InformationItem;
    now: string;
    kind?: string;
  }): OneCard | null;
}

export declare class PluginRegistry {
  register(plugin: DomainPluginBase): PluginRegistry;
  get(id: DomainId): DomainPluginBase | undefined;
  require(id: DomainId): DomainPluginBase;
  list(): DomainPluginBase[];
  clear(): void;
}

export const demoDomainId = "demo-context";

export const demoSubject = {
  id: "subject-demo-001",
  domainId: demoDomainId,
  type: "demo-case",
  name: "共有メモ確認",
  aliases: ["デモケース"],
  description: "特定ドメインに寄せない、文脈確認のためのデモ対象。",
  tags: ["demo", "base"],
  createdAt: "2026-06-02T00:00:00.000Z",
  updatedAt: "2026-06-02T00:00:00.000Z"
};

export const demoInformationItems = [
  {
    id: "item-demo-001",
    domainId: demoDomainId,
    subjectIds: [demoSubject.id],
    sourceType: "sample",
    title: "共有された変更メモ",
    bodyExcerpt: "前提が一部変わったため、確認対象と次の行動を整理する必要がある。",
    capturedAt: "2026-06-02T00:00:00.000Z",
    tags: ["change", "memo"]
  }
];

export const demoDictionaries = [
  {
    id: "term-current-point",
    domainId: demoDomainId,
    term: "現在地",
    aliases: ["今ここ"],
    category: "reading",
    status: "verified",
    shortExplanation: "情報の意味ではなく、出来事の流れの中で今どこにいるかを示す見方。",
    whyItMatters: ["次に見るものを減らせる。", "始まり・途中・終わりの取り違えを避けられる。"],
    firstCheckpoints: ["これは新しい話か。", "途中経過か。", "次に起きることはあるか。"],
    commonMisreadings: ["単語の意味だけ分かれば十分だと思ってしまう。"],
    relatedEventMapIds: ["event-context-reading"]
  },
  {
    id: "term-focus-point",
    domainId: demoDomainId,
    term: "見るポイント",
    category: "reading",
    status: "verified",
    shortExplanation: "最初に見る箇所を少数に絞ったもの。",
    whyItMatters: ["情報量を小さくできる。", "初心者が最初の一歩を選びやすくなる。"],
    firstCheckpoints: ["3つ以下に絞れているか。", "次の行動につながるか。"],
    relatedEventMapIds: ["event-context-reading"]
  },
  {
    id: "term-checkpoint",
    domainId: demoDomainId,
    term: "チェックポイント",
    category: "reflection",
    status: "verified",
    shortExplanation: "理解を確定する場所ではなく、今どこまで掴んだかを一度まとめる区切り。",
    whyItMatters: ["自由メモより軽い。", "次に見る方向を選びやすい。"],
    firstCheckpoints: ["分かったか。", "まだ分からないか。", "あとで見るか。"]
  }
];

export const demoEventMaps = [
  {
    id: "event-context-reading",
    domainId: demoDomainId,
    title: "文脈確認フロー",
    category: "base-flow",
    description: "情報を受け取ってから、現在地を見つけ、次の行動に進むまでの共通フロー。",
    nodes: [
      {
        id: "received",
        label: "受け取る",
        shortExplanation: "まず対象になる情報を1つに絞る。",
        checkpoints: ["対象は1つか。"],
        nodeType: "start"
      },
      {
        id: "find-current-point",
        label: "現在地を見る",
        shortExplanation: "出来事の流れのどこにいるかを確認する。",
        checkpoints: ["始まり・途中・終わりのどれか。"],
        nodeType: "middle"
      },
      {
        id: "open-context",
        label: "補足を開く",
        shortExplanation: "必要になった用語や関連イベントだけを開く。",
        checkpoints: ["開きすぎていないか。"],
        nodeType: "middle"
      },
      {
        id: "choose-next",
        label: "次を選ぶ",
        shortExplanation: "次に見るものか、保留か、理解済みかを選ぶ。",
        checkpoints: ["次の行動が1つに絞れているか。"],
        nodeType: "end"
      }
    ],
    edges: [
      { from: "received", to: "find-current-point" },
      { from: "find-current-point", to: "open-context" },
      { from: "open-context", to: "choose-next" }
    ],
    relatedTermIds: ["term-current-point", "term-focus-point", "term-checkpoint"]
  }
];

export const demoCards = [
  {
    id: "card-demo-001",
    domainId: demoDomainId,
    subjectId: demoSubject.id,
    itemId: "item-demo-001",
    title: "今日の1枚: 共有された変更メモ",
    subtitle: "前提が変わった情報を、次の行動へ落とす",
    shortExplanation: "変更内容そのものより、今どの段階で、何を確認すれば次へ進めるかを見るカードです。",
    focusPoints: ["何が変わったか", "今どの段階か", "次に確認するものは何か"],
    todayTakeaway: "情報を全部読む前に、現在地と見るポイントを小さく切る。",
    relatedTermIds: ["term-current-point", "term-focus-point"],
    relatedEventMapIds: ["event-context-reading"],
    nextActions: [
      {
        id: "open-current-point",
        label: "現在地を見る",
        type: "open_dictionary",
        targetId: "term-current-point"
      },
      {
        id: "open-flow",
        label: "流れを見る",
        type: "open_event_map",
        targetId: "event-context-reading"
      },
      {
        id: "mark-later",
        label: "あとで見る",
        type: "mark_later"
      }
    ],
    difficulty: "easy",
    createdAt: "2026-06-02T00:00:00.000Z"
  }
];

export const demoTimelineItems = [
  {
    id: "timeline-demo-001",
    domainId: demoDomainId,
    subjectId: demoSubject.id,
    itemId: "item-demo-001",
    title: "変更メモを受け取った",
    occurredAt: "2026-06-02T00:00:00.000Z",
    summary: "前提の変更を確認し、次の行動を整理する必要が出た。",
    tags: ["received"],
    relatedTermIds: ["term-current-point"],
    relatedEventMapIds: ["event-context-reading"],
    eventNodeId: "received"
  }
];

export const demoCheckpoints = [
  {
    id: "checkpoint-demo-001",
    domainId: demoDomainId,
    title: "今日の理解",
    prompt: "今のカードで掴んだところを選ぶ",
    options: [
      {
        id: "understood-current-point",
        label: "現在地は分かった",
        meaning: "出来事の流れの中で今どこかを掴めている。"
      },
      {
        id: "need-more-context",
        label: "補足を見たい",
        meaning: "用語かイベントの確認が必要。"
      },
      {
        id: "later",
        label: "あとで見る",
        meaning: "今は保留する。"
      }
    ],
    freeTextEnabled: false,
    relatedCardIds: ["card-demo-001"],
    relatedTermIds: ["term-current-point", "term-focus-point"],
    relatedEventMapIds: ["event-context-reading"]
  }
];

export const demoLogs = [
  {
    id: "log-demo-001",
    userId: "demo-user",
    sessionId: "session-demo-001",
    domainId: demoDomainId,
    subjectId: demoSubject.id,
    cardId: "card-demo-001",
    itemId: "item-demo-001",
    openedAt: "2026-06-02T00:00:00.000Z",
    closedAt: "2026-06-02T00:01:24.000Z",
    readDurationMs: 84000,
    openedDictionaryIds: ["term-current-point"],
    openedEventMapIds: ["event-context-reading"],
    openedTimelineIds: [],
    selectedCheckpointIds: ["understood-current-point"],
    selectedActions: ["open-current-point", "open-flow"],
    finalReaction: "somewhat_understood"
  }
];

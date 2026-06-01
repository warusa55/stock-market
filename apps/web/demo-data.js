window.CONTEXT_DEMO = {
  domainId: "demo-context",
  subject: {
    id: "subject-demo-001",
    name: "共有メモ確認",
    type: "demo-case"
  },
  card: {
    id: "card-demo-001",
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
    ]
  },
  dictionary: [
    {
      id: "term-current-point",
      term: "現在地",
      category: "reading",
      shortExplanation: "情報の意味ではなく、出来事の流れの中で今どこにいるかを示す見方。",
      whyItMatters: ["次に見るものを減らせる。", "始まり・途中・終わりの取り違えを避けられる。"],
      firstCheckpoints: ["これは新しい話か。", "途中経過か。", "次に起きることはあるか。"]
    },
    {
      id: "term-focus-point",
      term: "見るポイント",
      category: "reading",
      shortExplanation: "最初に見る箇所を少数に絞ったもの。",
      whyItMatters: ["情報量を小さくできる。", "初心者が最初の一歩を選びやすくなる。"],
      firstCheckpoints: ["3つ以下に絞れているか。", "次の行動につながるか。"]
    },
    {
      id: "term-checkpoint",
      term: "チェックポイント",
      category: "reflection",
      shortExplanation: "理解を確定する場所ではなく、今どこまで掴んだかを一度まとめる区切り。",
      whyItMatters: ["自由メモより軽い。", "次に見る方向を選びやすい。"],
      firstCheckpoints: ["分かったか。", "まだ分からないか。", "あとで見るか。"]
    }
  ],
  eventMap: {
    id: "event-context-reading",
    title: "文脈確認フロー",
    currentNodeId: "find-current-point",
    nodes: [
      {
        id: "received",
        label: "受け取る",
        shortExplanation: "まず対象になる情報を1つに絞る。",
        checkpoints: ["対象は1つか。"]
      },
      {
        id: "find-current-point",
        label: "現在地を見る",
        shortExplanation: "出来事の流れのどこにいるかを確認する。",
        checkpoints: ["始まり・途中・終わりのどれか。"]
      },
      {
        id: "open-context",
        label: "補足を開く",
        shortExplanation: "必要になった用語や関連イベントだけを開く。",
        checkpoints: ["開きすぎていないか。"]
      },
      {
        id: "choose-next",
        label: "次を選ぶ",
        shortExplanation: "次に見るものか、保留か、理解済みかを選ぶ。",
        checkpoints: ["次の行動が1つに絞れているか。"]
      }
    ]
  },
  timeline: [
    {
      id: "timeline-demo-001",
      title: "変更メモを受け取った",
      occurredAt: "2026-06-02T00:00:00.000Z",
      summary: "前提の変更を確認し、次の行動を整理する必要が出た。",
      tags: ["received"]
    }
  ],
  checkpoint: {
    id: "checkpoint-demo-001",
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
    ]
  }
};

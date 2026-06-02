export const stockDomainId = "stock";

export const stockSubject = {
  id: "subject-stock-001",
  domainId: stockDomainId,
  type: "listed-company",
  name: "サンプル電機",
  aliases: ["SAMPLE ELECTRIC"],
  description: "個別株pluginの動作確認用の上場会社サンプル。",
  tags: ["stock", "sample"],
  createdAt: "2026-06-02T00:00:00.000Z",
  updatedAt: "2026-06-02T00:00:00.000Z"
};

export const stockInformationItems = [
  {
    id: "item-stock-buyback-status",
    domainId: stockDomainId,
    subjectIds: [stockSubject.id],
    sourceType: "official",
    title: "自己株式の取得状況に関するお知らせ",
    bodyExcerpt:
      "すでに決定している自己株式取得について、当月の取得株式数、取得価額、累計進捗を報告する資料。",
    publishedAt: "2026-06-02T00:00:00.000Z",
    capturedAt: "2026-06-02T00:00:00.000Z",
    tags: ["self-share-buyback", "status"],
    raw: {
      eventType: "self_share_buyback_status",
      acquiredAmountThisMonth: 120000000,
      acquiredAmountTotal: 480000000,
      maxAmount: 1000000000
    }
  },
  {
    id: "item-stock-downward-revision",
    domainId: stockDomainId,
    subjectIds: [stockSubject.id],
    sourceType: "official",
    title: "通期業績予想の修正に関するお知らせ",
    bodyExcerpt: "売上高と営業利益の見通しを下方修正し、背景として需要減速と原材料費の上昇を説明している。",
    publishedAt: "2026-06-02T00:00:00.000Z",
    capturedAt: "2026-06-02T00:00:00.000Z",
    tags: ["earnings-forecast", "downward-revision"],
    raw: {
      eventType: "downward_revision"
    }
  },
  {
    id: "item-stock-tob-start",
    domainId: stockDomainId,
    subjectIds: [stockSubject.id],
    sourceType: "news",
    title: "公開買付け開始に関する発表",
    bodyExcerpt: "買付価格、買付期間、成立条件が示され、対象会社の賛同有無が注目されている。",
    publishedAt: "2026-06-02T00:00:00.000Z",
    capturedAt: "2026-06-02T00:00:00.000Z",
    tags: ["tob", "tender-offer"],
    raw: {
      eventType: "tob_start"
    }
  }
];

export const stockDictionaries = [
  {
    id: "stock-term-timely-disclosure",
    domainId: stockDomainId,
    term: "適時開示",
    aliases: ["TDnet", "開示情報", "開示"],
    category: "source",
    status: "verified",
    shortExplanation: "上場会社が投資判断に重要な情報を市場へ速やかに知らせる開示。",
    whyItMatters: ["会社発の一次情報として、ニュースより先に重要イベントを確認できることがある。"],
    firstCheckpoints: ["会社名と銘柄コードは合っているか。", "何のイベントか。", "決定・状況・結果のどの段階か。"]
  },
  {
    id: "stock-term-self-share-buyback",
    domainId: stockDomainId,
    term: "自己株式取得",
    aliases: ["自社株買い", "自己株式の取得"],
    category: "capital-policy",
    status: "verified",
    shortExplanation: "会社が市場などから自社の株式を買い戻すこと。",
    whyItMatters: ["発行済株式数や需給に影響することがある。", "株主還元策として見られることがある。"],
    firstCheckpoints: ["取得枠はいくらか。", "取得期間はいつまでか。", "決定・状況・終了のどの段階か。"],
    commonMisreadings: ["取得決定と取得完了を同じ意味で読んでしまう。"],
    sourceHints: ["適時開示", "自己株式取得状況のお知らせ"],
    relatedEventMapIds: ["stock-event-self-share-buyback"],
    relatedTermIds: ["stock-term-self-share-buyback-status", "stock-term-self-share-buyback-end"]
  },
  {
    id: "stock-term-self-share-buyback-status",
    domainId: stockDomainId,
    term: "自己株式の取得状況",
    aliases: ["取得状況", "自社株買いの途中経過"],
    category: "capital-policy",
    status: "verified",
    shortExplanation: "すでに決まった自社株買いが、今どれくらい進んだかを示す途中経過。",
    whyItMatters: ["上限に対する進捗を確認できる。", "残りの買付余地を考える入口になる。"],
    firstCheckpoints: ["当月取得額はいくらか。", "累計取得額はいくらか。", "上限に対して何％進んだか。"],
    commonMisreadings: ["新しく自社株買いが決まった発表だと思ってしまう。"],
    relatedEventMapIds: ["stock-event-self-share-buyback"],
    relatedTermIds: ["stock-term-self-share-buyback"]
  },
  {
    id: "stock-term-self-share-buyback-end",
    domainId: stockDomainId,
    term: "自己株式の取得終了",
    aliases: ["取得終了", "取得結果"],
    category: "capital-policy",
    status: "verified",
    shortExplanation: "予定していた自己株式取得が終わったことを示す発表。",
    whyItMatters: ["買付による需給支えが一区切りになる。", "次に消却があるかを見る入口になる。"],
    firstCheckpoints: ["上限まで買い切ったか。", "期間終了か。", "消却予定があるか。"],
    relatedEventMapIds: ["stock-event-self-share-buyback"]
  },
  {
    id: "stock-term-stock-acquisition-rights",
    domainId: stockDomainId,
    term: "新株予約権",
    aliases: ["ワラント"],
    category: "financing",
    status: "verified",
    shortExplanation: "一定条件で新株を取得できる権利。資金調達やインセンティブ設計で使われる。",
    whyItMatters: ["将来の株式数増加につながることがある。", "行使条件によって希薄化のタイミングが変わる。"],
    firstCheckpoints: ["誰に発行するか。", "行使価格はいくらか。", "行使期間はいつか。"],
    commonMisreadings: ["発行時点ですぐ全株が増えると思ってしまう。"],
    relatedEventMapIds: ["stock-event-stock-acquisition-rights"],
    relatedTermIds: ["stock-term-dilution"]
  },
  {
    id: "stock-term-third-party-allotment",
    domainId: stockDomainId,
    term: "第三者割当",
    aliases: ["第三者割当増資"],
    category: "financing",
    status: "verified",
    shortExplanation: "特定の相手に株式や新株予約権を割り当てる資金調達の方法。",
    whyItMatters: ["資金使途と割当先の意図を見る必要がある。", "既存株主の希薄化につながることがある。"],
    firstCheckpoints: ["割当先は誰か。", "資金使途は何か。", "希薄化率はどれくらいか。"],
    relatedTermIds: ["stock-term-dilution", "stock-term-stock-acquisition-rights"]
  },
  {
    id: "stock-term-dilution",
    domainId: stockDomainId,
    term: "希薄化",
    aliases: ["希薄化率"],
    category: "financing",
    status: "verified",
    shortExplanation: "株式数が増えることで、既存株主の1株あたりの持ち分が薄まること。",
    whyItMatters: ["資金調達のメリットと株主負担を同時に見る必要がある。"],
    firstCheckpoints: ["何株増えるか。", "希薄化率はいくらか。", "調達資金で何をするか。"]
  },
  {
    id: "stock-term-downward-revision",
    domainId: stockDomainId,
    term: "下方修正",
    aliases: ["減益予想"],
    category: "earnings",
    status: "verified",
    shortExplanation: "会社が以前出した業績予想を低い方向に修正すること。",
    whyItMatters: ["期待されていた利益水準が変わる。", "原因が一時的か構造的かを見る入口になる。"],
    firstCheckpoints: ["売上と利益のどちらが悪化したか。", "理由は一時要因か。", "配当予想も変わったか。"],
    commonMisreadings: ["下方修正なら必ず悪材料だけだと決めつける。"],
    relatedEventMapIds: ["stock-event-earnings-revision"]
  },
  {
    id: "stock-term-upward-revision",
    domainId: stockDomainId,
    term: "上方修正",
    aliases: ["増益予想"],
    category: "earnings",
    status: "verified",
    shortExplanation: "会社が以前出した業績予想を高い方向に修正すること。",
    whyItMatters: ["市場の期待や株価評価が変わることがある。"],
    firstCheckpoints: ["何が伸びたか。", "一時的な要因か。", "通期への影響はあるか。"],
    relatedEventMapIds: ["stock-event-earnings-revision"]
  },
  {
    id: "stock-term-earnings-digest",
    domainId: stockDomainId,
    term: "決算短信",
    aliases: ["決算発表", "四半期決算", "通期決算"],
    category: "earnings",
    status: "verified",
    shortExplanation: "上場会社が決算内容を速報的に開示する資料。",
    whyItMatters: ["売上・利益・進捗・見通しを見る入口になる。"],
    firstCheckpoints: ["売上は増えたか。", "利益は増えたか。", "通期予想は変わったか。"]
  },
  {
    id: "stock-term-large-shareholding-report",
    domainId: stockDomainId,
    term: "大量保有報告書",
    aliases: ["変更報告書", "保有割合"],
    category: "shareholder",
    status: "verified",
    shortExplanation: "一定割合以上の株式を保有した投資家が提出する報告書。",
    whyItMatters: ["大株主の変化や投資家の意図を見る入口になる。"],
    firstCheckpoints: ["誰が保有したか。", "保有目的は何か。", "増やしたか減らしたか。"]
  },
  {
    id: "stock-term-tob",
    domainId: stockDomainId,
    term: "TOB",
    aliases: ["公開買付", "公開買付け"],
    category: "ma",
    status: "verified",
    shortExplanation: "市場外で一定価格・期間を示して株式を買い集める手続き。",
    whyItMatters: ["買付価格、成立条件、対象会社の意見が株価に影響しやすい。"],
    firstCheckpoints: ["買付価格はいくらか。", "買付期間はいつまでか。", "成立条件は何か。"],
    commonMisreadings: ["発表されたら必ず成立すると考えてしまう。"],
    relatedEventMapIds: ["stock-event-tob"]
  }
];

export const stockEventMaps = [
  {
    id: "stock-event-self-share-buyback",
    domainId: stockDomainId,
    title: "自己株式取得",
    category: "capital-policy",
    description: "自己株式取得の決定から、途中経過、終了、消却までの流れ。",
    nodes: [
      {
        id: "decided",
        label: "取得決定",
        shortExplanation: "会社が自社株買いの枠、期間、上限を決めた段階。",
        checkpoints: ["取得枠", "取得期間", "取得方法"],
        nodeType: "start"
      },
      {
        id: "status",
        label: "取得状況",
        shortExplanation: "すでに決まった自社株買いの進捗を報告する段階。",
        checkpoints: ["当月取得額", "累計取得額", "進捗率"],
        commonMisreadings: ["新規決定と取り違える。"],
        nodeType: "middle"
      },
      {
        id: "finished",
        label: "取得終了",
        shortExplanation: "取得枠の利用または期間が終わった段階。",
        checkpoints: ["買い切ったか", "残枠はあるか"],
        nodeType: "end"
      },
      {
        id: "cancelled",
        label: "消却",
        shortExplanation: "取得した自己株式を消す段階。1株あたり指標に影響することがある。",
        checkpoints: ["消却株数", "消却後の発行済株式数"],
        nodeType: "optional"
      }
    ],
    edges: [
      { from: "decided", to: "status" },
      { from: "status", to: "finished" },
      { from: "finished", to: "cancelled", label: "消却する場合" }
    ],
    relatedTermIds: [
      "stock-term-self-share-buyback",
      "stock-term-self-share-buyback-status",
      "stock-term-self-share-buyback-end"
    ]
  },
  {
    id: "stock-event-stock-acquisition-rights",
    domainId: stockDomainId,
    title: "新株予約権",
    category: "financing",
    description: "新株予約権の発行から、行使、完了または失効までの流れ。",
    nodes: [
      {
        id: "issued",
        label: "発行決定",
        shortExplanation: "割当先、行使価格、資金使途などを発表する段階。",
        checkpoints: ["割当先", "行使価格", "希薄化率"],
        nodeType: "start"
      },
      {
        id: "exercise-start",
        label: "行使開始",
        shortExplanation: "権利を使って株式が増え始める可能性がある段階。",
        checkpoints: ["行使期間", "行使条件"],
        nodeType: "middle"
      },
      {
        id: "exercise-status",
        label: "行使状況",
        shortExplanation: "どれだけ行使されたかを確認する段階。",
        checkpoints: ["行使株数", "未行使残", "調達額"],
        nodeType: "middle"
      },
      {
        id: "completed-or-expired",
        label: "完了 / 失効",
        shortExplanation: "行使が終わった、または権利が失効した段階。",
        checkpoints: ["最終希薄化率", "資金調達額"],
        nodeType: "end"
      }
    ],
    edges: [
      { from: "issued", to: "exercise-start" },
      { from: "exercise-start", to: "exercise-status" },
      { from: "exercise-status", to: "completed-or-expired" }
    ],
    relatedTermIds: ["stock-term-stock-acquisition-rights", "stock-term-dilution"]
  },
  {
    id: "stock-event-earnings-revision",
    domainId: stockDomainId,
    title: "業績予想修正",
    category: "earnings",
    description: "会社が出していた業績予想を上方または下方へ修正する流れ。",
    nodes: [
      {
        id: "original-forecast",
        label: "元の予想",
        shortExplanation: "以前に会社が示していた売上・利益の見通し。",
        checkpoints: ["前回予想", "前提条件"],
        nodeType: "start"
      },
      {
        id: "revision",
        label: "修正発表",
        shortExplanation: "予想値を変更し、その理由を説明する段階。",
        checkpoints: ["売上", "利益", "修正理由"],
        nodeType: "middle"
      },
      {
        id: "market-reaction",
        label: "市場評価",
        shortExplanation: "修正内容が市場の期待と比べてどう見られるかを確認する段階。",
        checkpoints: ["株価反応", "コンセンサスとの差"],
        nodeType: "end"
      }
    ],
    edges: [
      { from: "original-forecast", to: "revision" },
      { from: "revision", to: "market-reaction" }
    ],
    relatedTermIds: ["stock-term-downward-revision", "stock-term-upward-revision"]
  },
  {
    id: "stock-event-tob",
    domainId: stockDomainId,
    title: "TOB",
    category: "ma",
    description: "TOBの開始予定から、開始、条件変更、成立または不成立までの流れ。",
    nodes: [
      {
        id: "planned",
        label: "開始予定",
        shortExplanation: "TOBの方針や予定が示された段階。",
        checkpoints: ["予定価格", "開始条件"],
        nodeType: "start"
      },
      {
        id: "started",
        label: "開始",
        shortExplanation: "買付価格、買付期間、成立条件が正式に示された段階。",
        checkpoints: ["買付価格", "期間", "応募条件"],
        nodeType: "middle"
      },
      {
        id: "changed",
        label: "条件変更",
        shortExplanation: "価格や期間などが変わる可能性がある段階。",
        checkpoints: ["価格変更", "期間延長", "応募状況"],
        nodeType: "optional"
      },
      {
        id: "result",
        label: "成立 / 不成立",
        shortExplanation: "応募数や条件により結果が決まる段階。",
        checkpoints: ["成立条件", "応募株数", "上場維持"],
        nodeType: "end"
      }
    ],
    edges: [
      { from: "planned", to: "started" },
      { from: "started", to: "changed", label: "必要な場合" },
      { from: "started", to: "result" },
      { from: "changed", to: "result" }
    ],
    relatedTermIds: ["stock-term-tob"]
  }
];

export const stockTimelineItems = [
  {
    id: "timeline-stock-001",
    domainId: stockDomainId,
    subjectId: stockSubject.id,
    itemId: "item-stock-buyback-status",
    title: "自己株式の取得状況が開示された",
    occurredAt: "2026-06-02T00:00:00.000Z",
    summary: "取得決定済みの自社株買いについて、当月と累計の取得額が示された。",
    tags: ["capital-policy", "self-share-buyback"],
    relatedTermIds: ["stock-term-self-share-buyback-status"],
    relatedEventMapIds: ["stock-event-self-share-buyback"],
    eventNodeId: "status"
  }
];

export const stockCheckpoints = [
  {
    id: "checkpoint-stock-buyback-status",
    domainId: stockDomainId,
    title: "自己株式取得の現在地",
    prompt: "この開示で掴むべきところを選ぶ",
    options: [
      {
        id: "stock-buyback-stage-understood",
        label: "途中経過だと分かった",
        meaning: "新規決定ではなく、取得状況の確認として読めている。"
      },
      {
        id: "stock-buyback-progress-check",
        label: "進捗率を見たい",
        meaning: "取得上限に対する現在の進み具合を見る必要がある。"
      },
      {
        id: "stock-buyback-later",
        label: "あとで見る",
        meaning: "今は保留する。"
      }
    ],
    freeTextEnabled: false,
    relatedCardIds: ["card-stock-buyback-status"],
    relatedTermIds: ["stock-term-self-share-buyback-status"],
    relatedEventMapIds: ["stock-event-self-share-buyback"]
  },
  {
    id: "checkpoint-stock-earnings-revision",
    domainId: stockDomainId,
    title: "業績予想修正の読み方",
    prompt: "修正発表でまず確認するところを選ぶ",
    options: [
      {
        id: "stock-revision-profit",
        label: "利益の変化を見る",
        meaning: "売上だけでなく利益への影響を確認する。"
      },
      {
        id: "stock-revision-reason",
        label: "理由を見る",
        meaning: "一時要因か構造的な変化かを分けて読む。"
      },
      {
        id: "stock-revision-later",
        label: "あとで見る",
        meaning: "今は保留する。"
      }
    ],
    freeTextEnabled: false,
    relatedCardIds: ["card-stock-downward-revision"],
    relatedTermIds: ["stock-term-downward-revision", "stock-term-upward-revision"],
    relatedEventMapIds: ["stock-event-earnings-revision"]
  },
  {
    id: "checkpoint-stock-tob",
    domainId: stockDomainId,
    title: "TOBの成立条件",
    prompt: "TOBでまず見るものを選ぶ",
    options: [
      {
        id: "stock-tob-price",
        label: "買付価格を見る",
        meaning: "市場価格との差を確認する。"
      },
      {
        id: "stock-tob-condition",
        label: "成立条件を見る",
        meaning: "応募数や下限条件を確認する。"
      },
      {
        id: "stock-tob-later",
        label: "あとで見る",
        meaning: "今は保留する。"
      }
    ],
    freeTextEnabled: false,
    relatedCardIds: ["card-stock-tob-start"],
    relatedTermIds: ["stock-term-tob"],
    relatedEventMapIds: ["stock-event-tob"]
  }
];

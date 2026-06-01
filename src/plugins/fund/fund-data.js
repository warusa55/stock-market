export const fundDomainId = "fund";

export const fundSubject = {
  id: "subject-fund-001",
  domainId: fundDomainId,
  type: "investment-trust",
  name: "サンプルNASDAQ100インデックス",
  aliases: ["NASDAQ100 sample fund"],
  description: "投資信託pluginの動作確認用のインデックスファンドサンプル。",
  tags: ["fund", "sample", "index"],
  createdAt: "2026-06-02T00:00:00.000Z",
  updatedAt: "2026-06-02T00:00:00.000Z"
};

export const fundInformationItems = [
  {
    id: "item-fund-nasdaq-rate",
    domainId: fundDomainId,
    subjectIds: [fundSubject.id],
    sourceType: "sample",
    title: "NASDAQ100系投信に関係する話",
    bodyExcerpt:
      "米国長期金利の上昇を受け、大型グロース株が売られ、NASDAQ100系投信の基準価額にも影響が出ている。",
    capturedAt: "2026-06-02T00:00:00.000Z",
    tags: ["nasdaq100", "interest-rate", "growth-stock"],
    raw: {
      eventType: "index_rate_context"
    }
  },
  {
    id: "item-fund-monthly-report",
    domainId: fundDomainId,
    subjectIds: [fundSubject.id],
    sourceType: "document",
    title: "月次レポート: 組入上位銘柄と地域比率",
    bodyExcerpt: "組入上位銘柄、地域比率、セクター比率、純資産総額の推移を確認できる資料。",
    capturedAt: "2026-06-02T00:00:00.000Z",
    tags: ["monthly-report", "holding", "asset-allocation"],
    raw: {
      eventType: "monthly_report"
    }
  },
  {
    id: "item-fund-currency-hedge",
    domainId: fundDomainId,
    subjectIds: [fundSubject.id],
    sourceType: "sample",
    title: "為替ヘッジあり投信の値動き",
    bodyExcerpt: "為替ヘッジの有無により、同じ指数に連動する投信でも基準価額の動きが変わることがある。",
    capturedAt: "2026-06-02T00:00:00.000Z",
    tags: ["currency-hedge", "fx"],
    raw: {
      eventType: "currency_hedge_context"
    }
  }
];

export const fundDictionaries = [
  {
    id: "fund-term-index",
    domainId: fundDomainId,
    term: "指数",
    aliases: ["インデックス"],
    category: "structure",
    status: "verified",
    shortExplanation: "市場やテーマの値動きを一定ルールで数値化したもの。",
    whyItMatters: ["投信が何に連動するかを見る入口になる。"],
    firstCheckpoints: ["どの市場か。", "どの銘柄群か。", "算出ルールは何か。"],
    relatedTermIds: ["fund-term-benchmark"]
  },
  {
    id: "fund-term-benchmark",
    domainId: fundDomainId,
    term: "ベンチマーク",
    category: "structure",
    status: "verified",
    shortExplanation: "投信が目標や比較対象にする指数や基準。",
    whyItMatters: ["投信の成績を何と比べるかが分かる。"],
    firstCheckpoints: ["ベンチマークは何か。", "為替込みか。", "配当込みか。"],
    relatedTermIds: ["fund-term-index"]
  },
  {
    id: "fund-term-trust-fee",
    domainId: fundDomainId,
    term: "信託報酬",
    category: "cost",
    status: "verified",
    shortExplanation: "投信を保有している間に継続的にかかる運用管理費用。",
    whyItMatters: ["長期保有ではコスト差が効きやすい。"],
    firstCheckpoints: ["年率はいくらか。", "同じ指数の商品と比べて高いか。", "実質コストはあるか。"],
    commonMisreadings: ["買う時だけ支払う手数料だと思ってしまう。"]
  },
  {
    id: "fund-term-nav",
    domainId: fundDomainId,
    term: "基準価額",
    category: "price",
    status: "verified",
    shortExplanation: "投信の1口または一定口数あたりの値段を示す数値。",
    whyItMatters: ["投信の値動きを見る基本単位になる。"],
    firstCheckpoints: ["前日比はいくらか。", "分配金の影響はあるか。", "指数や為替と比べる。"],
    relatedEventMapIds: ["fund-event-price-context"]
  },
  {
    id: "fund-term-net-assets",
    domainId: fundDomainId,
    term: "純資産総額",
    category: "scale",
    status: "verified",
    shortExplanation: "投信全体に集まっている資産の規模。",
    whyItMatters: ["資金流入や運用規模を見る入口になる。"],
    firstCheckpoints: ["増えているか。", "急減していないか。", "同種ファンドと比べる。"]
  },
  {
    id: "fund-term-currency-hedge",
    domainId: fundDomainId,
    term: "為替ヘッジ",
    category: "fx",
    status: "verified",
    shortExplanation: "為替変動の影響を抑えるための仕組み。",
    whyItMatters: ["同じ海外資産でも、為替ヘッジの有無で値動きが変わる。"],
    firstCheckpoints: ["ヘッジありか。", "ヘッジコストはあるか。", "円高・円安でどう動くか。"],
    commonMisreadings: ["為替の影響が完全になくなると思ってしまう。"],
    relatedEventMapIds: ["fund-event-price-context"]
  },
  {
    id: "fund-term-distribution",
    domainId: fundDomainId,
    term: "分配金",
    category: "income",
    status: "verified",
    shortExplanation: "投信の決算時に投資家へ支払われるお金。",
    whyItMatters: ["分配後に基準価額が下がることがある。"],
    firstCheckpoints: ["普通分配か。", "特別分配か。", "基準価額への影響はあるか。"],
    relatedEventMapIds: ["fund-event-distribution"]
  },
  {
    id: "fund-term-rebalance",
    domainId: fundDomainId,
    term: "リバランス",
    category: "operation",
    status: "verified",
    shortExplanation: "決められた方針に合わせて組入比率を調整すること。",
    whyItMatters: ["指数や運用方針に沿った構成へ戻す動きが分かる。"],
    firstCheckpoints: ["いつ行われるか。", "何を増やしたか。", "何を減らしたか。"],
    relatedEventMapIds: ["fund-event-rebalance"]
  },
  {
    id: "fund-term-region-ratio",
    domainId: fundDomainId,
    term: "地域比率",
    category: "portfolio",
    status: "verified",
    shortExplanation: "投信の投資先がどの国や地域に分かれているかを示す比率。",
    whyItMatters: ["地域ごとの景気、為替、政策の影響を考える入口になる。"],
    firstCheckpoints: ["米国比率はどれくらいか。", "新興国比率はあるか。", "地域偏りは強いか。"]
  },
  {
    id: "fund-term-sector-ratio",
    domainId: fundDomainId,
    term: "セクター比率",
    category: "portfolio",
    status: "verified",
    shortExplanation: "投信の投資先がどの業種に分かれているかを示す比率。",
    whyItMatters: ["金利や景気に影響されやすい領域を見つけやすい。"],
    firstCheckpoints: ["テック比率は高いか。", "金融やヘルスケアはあるか。", "1業種に偏っていないか。"]
  },
  {
    id: "fund-term-top-holdings",
    domainId: fundDomainId,
    term: "組入上位銘柄",
    category: "portfolio",
    status: "verified",
    shortExplanation: "投信が多く保有している銘柄の一覧。",
    whyItMatters: ["投信が実質的に何に賭けているかを見やすい。"],
    firstCheckpoints: ["上位銘柄の集中度は高いか。", "同じ銘柄に偏っていないか。", "指数の特徴と合っているか。"]
  },
  {
    id: "fund-term-interest-rate",
    domainId: fundDomainId,
    term: "金利",
    category: "macro",
    status: "verified",
    shortExplanation: "お金を借りたり貸したりするときの利率。株式や債券の評価に影響する。",
    whyItMatters: ["グロース株や債券価格に影響しやすい。"],
    firstCheckpoints: ["米10年債利回りはどう動いたか。", "利下げ期待はあるか。", "株式指数への影響はあるか。"],
    relatedEventMapIds: ["fund-event-price-context"]
  },
  {
    id: "fund-term-fx",
    domainId: fundDomainId,
    term: "為替",
    category: "macro",
    status: "verified",
    shortExplanation: "異なる通貨同士の交換比率。",
    whyItMatters: ["海外資産の円建て基準価額に影響する。"],
    firstCheckpoints: ["円高か円安か。", "ヘッジありか。", "指数本体と為替のどちらが効いたか。"],
    relatedEventMapIds: ["fund-event-price-context"],
    relatedTermIds: ["fund-term-currency-hedge"]
  }
];

export const fundEventMaps = [
  {
    id: "fund-event-price-context",
    domainId: fundDomainId,
    title: "投信の値動き確認",
    category: "price-context",
    description: "外部環境から指数、為替、基準価額までのつながりを見る流れ。",
    nodes: [
      {
        id: "macro-context",
        label: "外部環境",
        shortExplanation: "金利、為替、政策など、投信の外側にある材料を見る段階。",
        checkpoints: ["金利", "為替", "政策"],
        nodeType: "start"
      },
      {
        id: "index-move",
        label: "指数の動き",
        shortExplanation: "連動対象の指数や組入銘柄がどう動いたかを見る段階。",
        checkpoints: ["指数", "大型銘柄", "セクター"],
        nodeType: "middle"
      },
      {
        id: "fund-nav",
        label: "基準価額",
        shortExplanation: "指数、為替、費用などが投信の基準価額に反映される段階。",
        checkpoints: ["前日比", "為替影響", "分配金影響"],
        nodeType: "middle"
      },
      {
        id: "monthly-check",
        label: "月次確認",
        shortExplanation: "月次レポートで組入や純資産の変化を確認する段階。",
        checkpoints: ["組入上位銘柄", "地域比率", "純資産総額"],
        nodeType: "end"
      }
    ],
    edges: [
      { from: "macro-context", to: "index-move" },
      { from: "index-move", to: "fund-nav" },
      { from: "fund-nav", to: "monthly-check" }
    ],
    relatedTermIds: [
      "fund-term-interest-rate",
      "fund-term-fx",
      "fund-term-nav",
      "fund-term-top-holdings"
    ]
  },
  {
    id: "fund-event-rebalance",
    domainId: fundDomainId,
    title: "リバランス",
    category: "operation",
    description: "方針確認から構成変更、組入比率の変化までを見る流れ。",
    nodes: [
      {
        id: "policy",
        label: "方針確認",
        shortExplanation: "運用方針や指数ルールを確認する段階。",
        checkpoints: ["指数ルール", "運用方針"],
        nodeType: "start"
      },
      {
        id: "composition-change",
        label: "構成変更",
        shortExplanation: "銘柄や比率の変更が行われる段階。",
        checkpoints: ["追加銘柄", "除外銘柄", "比率変更"],
        nodeType: "middle"
      },
      {
        id: "impact-check",
        label: "影響確認",
        shortExplanation: "値動きやリスク特性への影響を確認する段階。",
        checkpoints: ["セクター偏り", "地域偏り", "集中度"],
        nodeType: "end"
      }
    ],
    edges: [
      { from: "policy", to: "composition-change" },
      { from: "composition-change", to: "impact-check" }
    ],
    relatedTermIds: ["fund-term-rebalance", "fund-term-sector-ratio", "fund-term-region-ratio"]
  },
  {
    id: "fund-event-distribution",
    domainId: fundDomainId,
    title: "分配金",
    category: "income",
    description: "分配方針から決算、分配、基準価額への反映までの流れ。",
    nodes: [
      {
        id: "policy",
        label: "分配方針",
        shortExplanation: "分配する方針か、再投資重視かを見る段階。",
        checkpoints: ["毎月分配か", "年1回か", "無分配型か"],
        nodeType: "start"
      },
      {
        id: "settlement",
        label: "決算",
        shortExplanation: "投信の決算で分配有無が決まる段階。",
        checkpoints: ["決算日", "分配原資"],
        nodeType: "middle"
      },
      {
        id: "paid",
        label: "分配",
        shortExplanation: "分配金が支払われる段階。",
        checkpoints: ["普通分配", "特別分配"],
        nodeType: "middle"
      },
      {
        id: "nav-reflection",
        label: "基準価額反映",
        shortExplanation: "分配後に基準価額へ反映される段階。",
        checkpoints: ["分配落ち", "基準価額"],
        nodeType: "end"
      }
    ],
    edges: [
      { from: "policy", to: "settlement" },
      { from: "settlement", to: "paid" },
      { from: "paid", to: "nav-reflection" }
    ],
    relatedTermIds: ["fund-term-distribution", "fund-term-nav"]
  }
];

export const fundTimelineItems = [
  {
    id: "timeline-fund-001",
    domainId: fundDomainId,
    subjectId: fundSubject.id,
    itemId: "item-fund-nasdaq-rate",
    title: "米国長期金利の上昇を確認",
    occurredAt: "2026-06-02T00:00:00.000Z",
    summary: "大型グロース株とNASDAQ100系投信の基準価額を見る入口になる。",
    tags: ["macro", "interest-rate"],
    relatedTermIds: ["fund-term-interest-rate", "fund-term-nav"],
    relatedEventMapIds: ["fund-event-price-context"],
    eventNodeId: "macro-context"
  }
];

export const fundCheckpoints = [
  {
    id: "checkpoint-fund-price-context",
    domainId: fundDomainId,
    title: "投信の値動きの見方",
    prompt: "今日の値動きでまず見るところを選ぶ",
    options: [
      {
        id: "fund-price-index",
        label: "指数を見る",
        meaning: "連動対象の指数がどう動いたかを確認する。"
      },
      {
        id: "fund-price-fx",
        label: "為替を見る",
        meaning: "海外資産の場合、円建て基準価額への影響を確認する。"
      },
      {
        id: "fund-price-later",
        label: "あとで見る",
        meaning: "今は保留する。"
      }
    ],
    freeTextEnabled: false,
    relatedCardIds: ["card-fund-price-context"],
    relatedTermIds: ["fund-term-index", "fund-term-interest-rate", "fund-term-fx"],
    relatedEventMapIds: ["fund-event-price-context"]
  },
  {
    id: "checkpoint-fund-monthly-report",
    domainId: fundDomainId,
    title: "月次レポートの見方",
    prompt: "月次レポートでまず見るところを選ぶ",
    options: [
      {
        id: "fund-monthly-holdings",
        label: "組入上位を見る",
        meaning: "投信の中身が何に寄っているかを見る。"
      },
      {
        id: "fund-monthly-net-assets",
        label: "純資産を見る",
        meaning: "資金流入や規模の変化を見る。"
      },
      {
        id: "fund-monthly-later",
        label: "あとで見る",
        meaning: "今は保留する。"
      }
    ],
    freeTextEnabled: false,
    relatedCardIds: ["card-fund-monthly-report"],
    relatedTermIds: ["fund-term-top-holdings", "fund-term-net-assets"],
    relatedEventMapIds: ["fund-event-price-context", "fund-event-rebalance"]
  },
  {
    id: "checkpoint-fund-currency-hedge",
    domainId: fundDomainId,
    title: "為替ヘッジの確認",
    prompt: "為替ヘッジでまず見るところを選ぶ",
    options: [
      {
        id: "fund-hedge-enabled",
        label: "ヘッジ有無を見る",
        meaning: "為替の影響をどれくらい受けるか確認する。"
      },
      {
        id: "fund-hedge-cost",
        label: "コストを見る",
        meaning: "ヘッジコストが基準価額に影響するか確認する。"
      },
      {
        id: "fund-hedge-later",
        label: "あとで見る",
        meaning: "今は保留する。"
      }
    ],
    freeTextEnabled: false,
    relatedCardIds: ["card-fund-currency-hedge"],
    relatedTermIds: ["fund-term-currency-hedge", "fund-term-fx"],
    relatedEventMapIds: ["fund-event-price-context"]
  }
];

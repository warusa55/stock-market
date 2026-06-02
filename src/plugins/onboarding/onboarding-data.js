export const onboardingDomainId = "onboarding";

export const onboardingSubject = {
  id: "subject-onboarding-001",
  domainId: onboardingDomainId,
  type: "training-case",
  name: "架空商事 営業サポート研修",
  aliases: ["営業サポート研修"],
  description: "新人教育pluginの動作確認用の仮想会社・仮想部署。",
  tags: ["onboarding", "sample", "workflow"],
  createdAt: "2026-06-02T00:00:00.000Z",
  updatedAt: "2026-06-02T00:00:00.000Z"
};

export const onboardingInformationItems = [
  {
    id: "item-onboarding-delivery-request",
    domainId: onboardingDomainId,
    subjectIds: [onboardingSubject.id],
    sourceType: "case",
    title: "顧客から「最短納期でお願いできますか？」と連絡が来た",
    bodyExcerpt:
      "在庫、回答権限、他案件への影響を確認する前に、納期を確約してよいか判断する必要がある。",
    capturedAt: "2026-06-02T00:00:00.000Z",
    tags: ["delivery", "first-response", "approval"],
    raw: {
      eventType: "delivery_request"
    }
  },
  {
    id: "item-onboarding-invoice-mismatch",
    domainId: onboardingDomainId,
    subjectIds: [onboardingSubject.id],
    sourceType: "case",
    title: "顧客から請求書の金額が違うと言われた",
    bodyExcerpt: "契約、見積、納品実績、請求条件を照合して、修正が必要かを確認する場面。",
    capturedAt: "2026-06-02T00:00:00.000Z",
    tags: ["invoice", "contract", "escalation"],
    raw: {
      eventType: "invoice_mismatch"
    }
  },
  {
    id: "item-onboarding-contract-change",
    domainId: onboardingDomainId,
    subjectIds: [onboardingSubject.id],
    sourceType: "case",
    title: "契約前に仕様変更の相談が来た",
    bodyExcerpt: "見積、納期、承認、契約条件への影響を整理して、誰に確認するかを決める場面。",
    capturedAt: "2026-06-02T00:00:00.000Z",
    tags: ["contract", "estimate", "approval"],
    raw: {
      eventType: "contract_change"
    }
  }
];

export const onboardingDictionaries = [
  {
    id: "onboarding-term-first-response",
    domainId: onboardingDomainId,
    term: "一次対応",
    category: "communication",
    status: "verified",
    shortExplanation: "最初に受けた人が、状況を崩さず次の確認へつなぐ対応。",
    whyItMatters: ["初動で確約しすぎると、後続の調整が難しくなる。", "相手を待たせる時も次の行動を示せる。"],
    firstCheckpoints: ["何を受け取ったか。", "何を確認するか。", "いつ返すか。"],
    commonMisreadings: ["すぐ結論を出すことが良い一次対応だと思ってしまう。"],
    relatedEventMapIds: ["onboarding-event-inquiry-handling"]
  },
  {
    id: "onboarding-term-escalation",
    domainId: onboardingDomainId,
    term: "エスカレーション",
    category: "communication",
    status: "verified",
    shortExplanation: "自分の判断範囲を超える内容を、適切な相手へ引き上げること。",
    whyItMatters: ["権限外の確約を避けられる。", "対応の遅れや責任範囲の曖昧さを減らせる。"],
    firstCheckpoints: ["誰に上げるか。", "何を添えるか。", "期限はいつか。"],
    commonMisreadings: ["丸投げと同じだと思ってしまう。"],
    relatedEventMapIds: ["onboarding-event-inquiry-handling"]
  },
  {
    id: "onboarding-term-checking",
    domainId: onboardingDomainId,
    term: "確認中",
    category: "communication",
    status: "verified",
    shortExplanation: "返答を保留する言葉ではなく、確認対象と次の返答時点を示す状態。",
    whyItMatters: ["相手に待つ理由が伝わる。", "自分の次の行動も明確になる。"],
    firstCheckpoints: ["何を確認中か。", "誰に確認しているか。", "いつ返すか。"],
    commonMisreadings: ["確認します、だけで返答が完了したと思ってしまう。"],
    relatedEventMapIds: ["onboarding-event-delivery-answer"]
  },
  {
    id: "onboarding-term-approval",
    domainId: onboardingDomainId,
    term: "承認",
    category: "authority",
    status: "verified",
    shortExplanation: "決められた権限者が、条件や内容を確認して進める許可を出すこと。",
    whyItMatters: ["勝手な約束や条件変更を防げる。", "責任範囲を明確にできる。"],
    firstCheckpoints: ["誰の承認が必要か。", "金額や納期の条件は何か。", "承認前に伝えてよい範囲はどこか。"],
    relatedEventMapIds: ["onboarding-event-order-process", "onboarding-event-delivery-answer"]
  },
  {
    id: "onboarding-term-delivery-date",
    domainId: onboardingDomainId,
    term: "納期",
    category: "order",
    status: "verified",
    shortExplanation: "商品や成果物を届ける期限。回答前に在庫、作業量、承認、影響範囲を確認する。",
    whyItMatters: ["一度確約すると、後から変更しづらい。", "他案件や社内工程にも影響する。"],
    firstCheckpoints: ["在庫はあるか。", "回答権限は誰か。", "他案件への影響はあるか。"],
    commonMisreadings: ["希望納期をそのまま約束してしまう。"],
    relatedEventMapIds: ["onboarding-event-delivery-answer"]
  },
  {
    id: "onboarding-term-estimate",
    domainId: onboardingDomainId,
    term: "見積",
    category: "order",
    status: "verified",
    shortExplanation: "提供内容、金額、条件を契約前に示す資料や工程。",
    whyItMatters: ["契約や請求の前提になる。", "仕様変更があると見積の再確認が必要になる。"],
    firstCheckpoints: ["対象範囲は何か。", "金額は正しいか。", "有効期限や条件はあるか。"],
    relatedEventMapIds: ["onboarding-event-order-process"]
  },
  {
    id: "onboarding-term-invoice",
    domainId: onboardingDomainId,
    term: "請求",
    category: "billing",
    status: "verified",
    shortExplanation: "納品や契約条件に基づいて、相手へ支払いを求める工程。",
    whyItMatters: ["金額違いは契約、見積、納品、税区分など複数箇所に原因があり得る。"],
    firstCheckpoints: ["契約条件と合っているか。", "納品実績と合っているか。", "修正権限は誰か。"],
    commonMisreadings: ["請求書だけ見れば原因が分かると思ってしまう。"],
    relatedEventMapIds: ["onboarding-event-invoice-check", "onboarding-event-order-process"]
  },
  {
    id: "onboarding-term-contract",
    domainId: onboardingDomainId,
    term: "契約",
    category: "order",
    status: "verified",
    shortExplanation: "提供内容、金額、責任範囲、条件を合意する工程。",
    whyItMatters: ["契約前後で、変更できる範囲や必要な承認が変わる。"],
    firstCheckpoints: ["契約前か後か。", "変更条件はあるか。", "誰の承認が必要か。"],
    relatedEventMapIds: ["onboarding-event-order-process"]
  },
  {
    id: "onboarding-term-knowledge-base",
    domainId: onboardingDomainId,
    term: "ナレッジ化",
    category: "learning",
    status: "verified",
    shortExplanation: "対応で得た判断基準や注意点を、次回使える形で残すこと。",
    whyItMatters: ["同じ問い合わせで迷う時間を減らせる。", "教育担当が詰まりやすい箇所を見つけやすい。"],
    firstCheckpoints: ["何が判断ポイントだったか。", "誰に確認したか。", "次回の初動は何か。"],
    relatedEventMapIds: ["onboarding-event-inquiry-handling", "onboarding-event-invoice-check"]
  }
];

export const onboardingEventMaps = [
  {
    id: "onboarding-event-inquiry-handling",
    domainId: onboardingDomainId,
    title: "問い合わせ対応",
    category: "communication",
    description: "問い合わせを受けてから、切り分け、エスカレーション、回答、ナレッジ化までの流れ。",
    nodes: [
      {
        id: "received",
        label: "受付",
        shortExplanation: "相手の要望や問題を受け取る段階。",
        checkpoints: ["誰からか", "何を求めているか", "期限はあるか"],
        nodeType: "start"
      },
      {
        id: "triage",
        label: "一次切り分け",
        shortExplanation: "自分で確認できることと、上げるべきことを分ける段階。",
        checkpoints: ["事実", "権限", "影響範囲"],
        nodeType: "middle"
      },
      {
        id: "escalated",
        label: "エスカレーション",
        shortExplanation: "判断権限のある相手へ、必要情報を添えて確認する段階。",
        checkpoints: ["確認相手", "添付情報", "期限"],
        nodeType: "middle"
      },
      {
        id: "answered",
        label: "回答",
        shortExplanation: "確認した内容を、相手に伝わる形で返す段階。",
        checkpoints: ["結論", "条件", "次の行動"],
        nodeType: "middle"
      },
      {
        id: "knowledge",
        label: "ナレッジ化",
        shortExplanation: "次回の判断材料として、対応の要点を残す段階。",
        checkpoints: ["判断基準", "注意点", "再利用できる文面"],
        nodeType: "end"
      }
    ],
    edges: [
      { from: "received", to: "triage" },
      { from: "triage", to: "escalated", label: "権限外の場合" },
      { from: "triage", to: "answered", label: "自分で回答できる場合" },
      { from: "escalated", to: "answered" },
      { from: "answered", to: "knowledge" }
    ],
    relatedTermIds: [
      "onboarding-term-first-response",
      "onboarding-term-escalation",
      "onboarding-term-knowledge-base"
    ]
  },
  {
    id: "onboarding-event-order-process",
    domainId: onboardingDomainId,
    title: "受注処理",
    category: "order",
    description: "見積から承認、契約、納品、請求、入金までの流れ。",
    nodes: [
      {
        id: "estimate",
        label: "見積",
        shortExplanation: "提供範囲、金額、条件を提示する段階。",
        checkpoints: ["範囲", "金額", "期限"],
        nodeType: "start"
      },
      {
        id: "approval",
        label: "承認",
        shortExplanation: "条件や金額について社内の許可を得る段階。",
        checkpoints: ["承認者", "条件", "記録"],
        nodeType: "middle"
      },
      {
        id: "contract",
        label: "契約",
        shortExplanation: "提供条件に合意する段階。",
        checkpoints: ["契約範囲", "変更条件", "責任範囲"],
        nodeType: "middle"
      },
      {
        id: "delivery",
        label: "納品",
        shortExplanation: "商品や成果物を届ける段階。",
        checkpoints: ["納期", "検収", "差戻し"],
        nodeType: "middle"
      },
      {
        id: "invoice",
        label: "請求",
        shortExplanation: "契約や納品に基づいて請求する段階。",
        checkpoints: ["請求金額", "税区分", "支払条件"],
        nodeType: "middle"
      },
      {
        id: "payment",
        label: "入金",
        shortExplanation: "支払いを確認する段階。",
        checkpoints: ["入金日", "消込", "差額"],
        nodeType: "end"
      }
    ],
    edges: [
      { from: "estimate", to: "approval" },
      { from: "approval", to: "contract" },
      { from: "contract", to: "delivery" },
      { from: "delivery", to: "invoice" },
      { from: "invoice", to: "payment" }
    ],
    relatedTermIds: [
      "onboarding-term-estimate",
      "onboarding-term-approval",
      "onboarding-term-contract",
      "onboarding-term-invoice"
    ]
  },
  {
    id: "onboarding-event-delivery-answer",
    domainId: onboardingDomainId,
    title: "納期回答",
    category: "delivery",
    description: "納期の希望を受けてから、在庫、権限、影響を確認し、回答するまでの流れ。",
    nodes: [
      {
        id: "request",
        label: "依頼受付",
        shortExplanation: "相手の希望納期と背景を受け取る段階。",
        checkpoints: ["希望日", "数量", "背景"],
        nodeType: "start"
      },
      {
        id: "inventory-check",
        label: "在庫確認",
        shortExplanation: "在庫や作業枠があるかを確認する段階。",
        checkpoints: ["在庫", "作業枠", "代替案"],
        nodeType: "middle"
      },
      {
        id: "authority-check",
        label: "権限確認",
        shortExplanation: "その納期を確約してよいかを確認する段階。",
        checkpoints: ["回答権限", "承認者", "影響範囲"],
        nodeType: "middle"
      },
      {
        id: "reply",
        label: "回答",
        shortExplanation: "確約できる範囲、または確認中の内容を返す段階。",
        checkpoints: ["結論", "条件", "次回返答時点"],
        nodeType: "middle"
      },
      {
        id: "share-impact",
        label: "影響共有",
        shortExplanation: "他案件や社内工程への影響を関係者へ共有する段階。",
        checkpoints: ["影響案件", "関係者", "記録"],
        nodeType: "end"
      }
    ],
    edges: [
      { from: "request", to: "inventory-check" },
      { from: "inventory-check", to: "authority-check" },
      { from: "authority-check", to: "reply" },
      { from: "reply", to: "share-impact" }
    ],
    relatedTermIds: [
      "onboarding-term-delivery-date",
      "onboarding-term-checking",
      "onboarding-term-approval"
    ]
  },
  {
    id: "onboarding-event-invoice-check",
    domainId: onboardingDomainId,
    title: "請求確認",
    category: "billing",
    description: "請求金額の指摘を受けてから、契約・見積・納品を照合し、修正または回答する流れ。",
    nodes: [
      {
        id: "reported",
        label: "指摘受付",
        shortExplanation: "相手から金額違いなどの指摘を受ける段階。",
        checkpoints: ["対象請求書", "指摘内容", "期限"],
        nodeType: "start"
      },
      {
        id: "invoice-check",
        label: "請求内容確認",
        shortExplanation: "請求書の明細、税区分、支払条件を確認する段階。",
        checkpoints: ["明細", "税区分", "支払条件"],
        nodeType: "middle"
      },
      {
        id: "source-check",
        label: "契約/納品照合",
        shortExplanation: "契約、見積、納品実績と請求内容を照合する段階。",
        checkpoints: ["契約", "見積", "納品実績"],
        nodeType: "middle"
      },
      {
        id: "fix-or-answer",
        label: "修正/回答",
        shortExplanation: "修正が必要か、正しい請求として説明するかを決める段階。",
        checkpoints: ["修正権限", "回答文面", "再発防止"],
        nodeType: "middle"
      },
      {
        id: "knowledge",
        label: "ナレッジ化",
        shortExplanation: "同じ請求ミスを避けるため、確認手順を残す段階。",
        checkpoints: ["原因", "確認手順", "再利用メモ"],
        nodeType: "end"
      }
    ],
    edges: [
      { from: "reported", to: "invoice-check" },
      { from: "invoice-check", to: "source-check" },
      { from: "source-check", to: "fix-or-answer" },
      { from: "fix-or-answer", to: "knowledge" }
    ],
    relatedTermIds: ["onboarding-term-invoice", "onboarding-term-contract", "onboarding-term-knowledge-base"]
  }
];

export const onboardingTimelineItems = [
  {
    id: "timeline-onboarding-001",
    domainId: onboardingDomainId,
    subjectId: onboardingSubject.id,
    itemId: "item-onboarding-delivery-request",
    title: "納期短縮の相談を受けた",
    occurredAt: "2026-06-02T00:00:00.000Z",
    summary: "希望納期を受け、在庫と回答権限を確認する必要が出た。",
    tags: ["delivery", "first-response"],
    relatedTermIds: ["onboarding-term-delivery-date", "onboarding-term-checking"],
    relatedEventMapIds: ["onboarding-event-delivery-answer"],
    eventNodeId: "request"
  }
];

export const onboardingCheckpoints = [
  {
    id: "checkpoint-onboarding-delivery-request",
    domainId: onboardingDomainId,
    title: "納期回答の初動",
    prompt: "この場面でまず見るところを選ぶ",
    options: [
      {
        id: "onboarding-delivery-inventory",
        label: "在庫を見る",
        meaning: "希望納期に対応できる材料があるか確認する。"
      },
      {
        id: "onboarding-delivery-authority",
        label: "権限を見る",
        meaning: "自分が確約してよい範囲か確認する。"
      },
      {
        id: "onboarding-delivery-later",
        label: "あとで見る",
        meaning: "今は保留する。"
      }
    ],
    freeTextEnabled: false,
    relatedCardIds: ["card-onboarding-delivery-request"],
    relatedTermIds: ["onboarding-term-delivery-date", "onboarding-term-approval"],
    relatedEventMapIds: ["onboarding-event-delivery-answer"]
  },
  {
    id: "checkpoint-onboarding-invoice-mismatch",
    domainId: onboardingDomainId,
    title: "請求違いの確認",
    prompt: "請求金額の指摘でまず見るところを選ぶ",
    options: [
      {
        id: "onboarding-invoice-contract",
        label: "契約を見る",
        meaning: "請求条件の前提を確認する。"
      },
      {
        id: "onboarding-invoice-delivery",
        label: "納品を見る",
        meaning: "請求対象の実績を確認する。"
      },
      {
        id: "onboarding-invoice-escalate",
        label: "上げる",
        meaning: "修正権限のある相手へ確認する。"
      }
    ],
    freeTextEnabled: false,
    relatedCardIds: ["card-onboarding-invoice-mismatch"],
    relatedTermIds: ["onboarding-term-invoice", "onboarding-term-contract", "onboarding-term-escalation"],
    relatedEventMapIds: ["onboarding-event-invoice-check"]
  },
  {
    id: "checkpoint-onboarding-contract-change",
    domainId: onboardingDomainId,
    title: "契約前の仕様変更",
    prompt: "仕様変更相談でまず見るところを選ぶ",
    options: [
      {
        id: "onboarding-contract-estimate",
        label: "見積を見る",
        meaning: "範囲や金額が変わるか確認する。"
      },
      {
        id: "onboarding-contract-approval",
        label: "承認を見る",
        meaning: "誰の承認が必要か確認する。"
      },
      {
        id: "onboarding-contract-later",
        label: "あとで見る",
        meaning: "今は保留する。"
      }
    ],
    freeTextEnabled: false,
    relatedCardIds: ["card-onboarding-contract-change"],
    relatedTermIds: ["onboarding-term-estimate", "onboarding-term-contract", "onboarding-term-approval"],
    relatedEventMapIds: ["onboarding-event-order-process"]
  }
];

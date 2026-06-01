import type { RiskRule } from "../types";

export const riskDictionary: RiskRule[] = [
  {
    id: "performance-downward-revision",
    category: "業績悪化",
    severity: "high",
    keywords: ["下方修正", "業績予想の修正", "通期業績予想の修正"],
    title: "業績予想の修正",
    summary: "会社が以前出していた売上・利益見通しを変えた可能性があります。",
    why: [
      "利益水準や成長前提が変わると、会社の見え方が大きく変わります。",
      "上方修正か下方修正か、売上と利益のどちらが動いたかで意味が変わります。"
    ],
    checkPoints: [
      "修正前と修正後の売上・営業利益・純利益",
      "修正理由が一時要因か継続要因か",
      "会社が次の打ち手を説明しているか"
    ],
    beginnerNote: "タイトルだけでは良し悪しを決めず、修正後の数字と理由を並べて確認します。",
    falsePositiveNote: "上方修正も同じ語で拾うことがあります。本文の方向を確認してください。"
  },
  {
    id: "performance-loss-turnaround",
    category: "業績悪化",
    severity: "high",
    keywords: ["赤字転落", "最終赤字", "純損失"],
    title: "赤字転落・純損失",
    summary: "黒字前提だった会社が赤字になる、または損失が続いている可能性があります。",
    why: [
      "赤字が続くと資金調達や事業継続の前提を確認する必要が出ます。",
      "成長投資による赤字と、本業悪化による赤字では見方が異なります。"
    ],
    checkPoints: ["赤字の理由", "現金残高と借入", "来期以降の黒字化計画"],
    beginnerNote: "赤字そのものより、理由と手元資金を一緒に見ます。"
  },
  {
    id: "performance-operating-loss",
    category: "業績悪化",
    severity: "high",
    keywords: ["営業損失", "経常損失"],
    title: "営業損失・経常損失",
    summary: "本業または通常の事業活動で利益が出ていない可能性があります。",
    why: [
      "営業損失は本業の採算性を見る重要なサインです。",
      "経常損失は金融費用なども含めた通常収益力の悪化を示すことがあります。"
    ],
    checkPoints: ["売上総利益率", "固定費の増減", "一時費用か構造的な損失か"],
    beginnerNote: "売上が伸びていても、利益が伴っているかを確認します。"
  },
  {
    id: "performance-impairment",
    category: "業績悪化",
    severity: "high",
    keywords: ["減損", "減損損失"],
    title: "減損損失",
    summary: "保有資産や投資の価値を引き下げる会計処理が発生した可能性があります。",
    why: [
      "将来見込んでいた収益が弱くなったサインの場合があります。",
      "会計上の損失でも、事業計画の前提変更が隠れていることがあります。"
    ],
    checkPoints: ["対象資産", "減損額", "今後のキャッシュへの影響"],
    beginnerNote: "現金がすぐ出ていく損失か、会計上の評価損かを分けて見ます。"
  },
  {
    id: "performance-extraordinary-loss",
    category: "業績悪化",
    severity: "medium",
    keywords: ["特別損失"],
    title: "特別損失",
    summary: "通常の営業活動とは別の大きな損失が出た可能性があります。",
    why: [
      "単発でも利益や純資産に大きく影響することがあります。",
      "同じ理由で繰り返し発生していないかを見る必要があります。"
    ],
    checkPoints: ["損失の内容", "金額の大きさ", "再発可能性"],
    beginnerNote: "一時的か繰り返す問題かを必ず確認します。"
  },
  {
    id: "dividend-cut",
    category: "配当悪化",
    severity: "high",
    keywords: ["減配", "無配", "復配見送り"],
    title: "減配・無配",
    summary: "配当方針や株主還元が悪化した可能性があります。",
    why: [
      "配当目的の投資家にとっては重要な変化です。",
      "業績や資金繰りの悪化が背景にある場合があります。"
    ],
    checkPoints: ["減配理由", "配当性向", "現金残高と今後の投資計画"],
    beginnerNote: "配当だけでなく、なぜ配当を変えたのかを確認します。"
  },
  {
    id: "dividend-forecast-revision",
    category: "配当悪化",
    severity: "medium",
    keywords: ["配当予想の修正"],
    title: "配当予想の修正",
    summary: "会社が予定していた配当額を変更した可能性があります。",
    why: [
      "増配・減配のどちらも投資家の見方に影響します。",
      "業績予想の変更と同時に出ることがあります。"
    ],
    checkPoints: ["修正前後の配当額", "増配か減配か", "業績見通しとの関係"],
    beginnerNote: "タイトルだけでは方向が分からないので、修正後の数字を見ます。",
    falsePositiveNote: "増配も同じ語で検出されます。"
  },
  {
    id: "dilution-third-party-allotment",
    category: "希薄化・資金調達",
    severity: "critical",
    keywords: ["第三者割当", "新株発行"],
    title: "第三者割当・新株発行",
    summary: "新しい株式を発行して資金調達する可能性があります。",
    why: [
      "発行済み株式数が増えると、1株あたりの価値が薄まることがあります。",
      "誰に、どの価格で、何のために発行するかが重要です。"
    ],
    checkPoints: ["発行株数と希薄化率", "発行価格と直近株価の差", "資金使途と割当先"],
    beginnerNote: "希薄化率が高いほど、既存株主への影響を慎重に見ます。"
  },
  {
    id: "dilution-stock-acquisition-rights",
    category: "希薄化・資金調達",
    severity: "critical",
    keywords: ["新株予約権", "MSワラント", "行使価額修正条項"],
    title: "新株予約権・MSワラント",
    summary: "将来株式が増える可能性のある資金調達です。",
    why: [
      "行使が進むと株式数が増え、希薄化が発生します。",
      "行使価額修正条項がある場合、株価下落局面で影響が大きくなることがあります。"
    ],
    checkPoints: ["潜在株式数", "行使価額", "行使価額修正条項の有無"],
    beginnerNote: "すぐ株式が増えなくても、将来増える可能性を確認します。"
  },
  {
    id: "dilution-explicit",
    category: "希薄化・資金調達",
    severity: "high",
    keywords: ["希薄化"],
    title: "希薄化",
    summary: "既存株主の持分割合や1株価値が薄まる可能性があります。",
    why: [
      "株式数の増加は1株あたり利益や議決権割合に影響します。",
      "資金調達が成長投資に使われるか、赤字補填かで評価が変わります。"
    ],
    checkPoints: ["希薄化率", "調達資金の使い道", "既存株主への説明"],
    beginnerNote: "希薄化率と資金使途をセットで見ます。"
  },
  {
    id: "funding-debt",
    category: "希薄化・資金調達",
    severity: "medium",
    keywords: ["資金調達", "借入", "社債発行", "劣後債"],
    title: "資金調達・借入",
    summary: "会社が外部から資金を集める可能性があります。",
    why: [
      "成長投資の資金なら前向きな場合もあります。",
      "運転資金不足の補填なら資金繰り確認が必要です。"
    ],
    checkPoints: ["調達方法", "返済条件", "資金使途"],
    beginnerNote: "株式発行か借入かで株主への影響が違います。"
  },
  {
    id: "going-concern",
    category: "継続企業・資金繰り",
    severity: "critical",
    keywords: ["継続企業の前提", "重要な疑義", "GC注記"],
    title: "継続企業の前提",
    summary: "会社が事業を続けられるかについて重要な注意情報が出ている可能性があります。",
    why: [
      "上場企業の開示の中でも特に重い確認ポイントです。",
      "資金繰り、債務超過、赤字継続など複数の問題が背景にあることがあります。"
    ],
    checkPoints: ["疑義や注記の内容", "解消策", "手元資金と借入返済予定"],
    beginnerNote: "最優先で一次情報を開き、会社が何を問題として説明しているかを読みます。"
  },
  {
    id: "important-events",
    category: "継続企業・資金繰り",
    severity: "high",
    keywords: ["重要事象", "資金繰り"],
    title: "重要事象・資金繰り",
    summary: "事業継続や資金の回り方に注意が必要な情報です。",
    why: [
      "重要事象は今後の継続企業注記につながる場合があります。",
      "資金繰りの説明は短期的な安全性を見る手がかりです。"
    ],
    checkPoints: ["事象の内容", "解消計画", "いつまで資金が持つか"],
    beginnerNote: "利益だけでなく、現金が足りるかを確認します。"
  },
  {
    id: "insolvency",
    category: "継続企業・資金繰り",
    severity: "critical",
    keywords: ["債務超過"],
    title: "債務超過",
    summary: "負債が資産を上回っている可能性があります。",
    why: [
      "財務の安全性に大きな懸念が出ます。",
      "上場維持基準や資金調達条件にも影響します。"
    ],
    checkPoints: ["債務超過額", "解消期限", "資本増強策"],
    beginnerNote: "純資産の推移と解消策を確認します。"
  },
  {
    id: "audit-firm-change",
    category: "会計・監査",
    severity: "high",
    keywords: ["監査法人の異動", "会計監査人の異動"],
    title: "監査法人・会計監査人の異動",
    summary: "監査を担当する法人が変わる可能性があります。",
    why: [
      "通常の任期満了だけでなく、会計処理の見解相違が背景にある場合があります。",
      "変更理由と前任監査人の意見を確認する必要があります。"
    ],
    checkPoints: ["異動理由", "見解相違の有無", "後任監査人"],
    beginnerNote: "理由欄に不自然な説明がないかを見ます。"
  },
  {
    id: "audit-opinion",
    category: "会計・監査",
    severity: "critical",
    keywords: ["監査意見", "限定付適正意見", "意見不表明"],
    title: "監査意見の注意",
    summary: "財務諸表への監査人の見方に注意が必要な可能性があります。",
    why: [
      "限定付適正意見や意見不表明は投資判断上かなり重い情報です。",
      "決算の信頼性に関わるため、必ず一次情報を確認します。"
    ],
    checkPoints: ["意見の種類", "理由", "対象となる会計処理"],
    beginnerNote: "監査意見は決算の信頼性を見る重要な項目です。"
  },
  {
    id: "accounting-problem",
    category: "会計・監査",
    severity: "critical",
    keywords: ["不適切会計", "過年度決算訂正", "調査委員会"],
    title: "不適切会計・調査",
    summary: "過去の決算や会計処理に問題が見つかった可能性があります。",
    why: [
      "過去の利益や財務数値が変わる可能性があります。",
      "ガバナンスや内部統制の問題につながることがあります。"
    ],
    checkPoints: ["対象期間", "影響額", "再発防止策"],
    beginnerNote: "訂正後の数字だけでなく、なぜ起きたかを確認します。"
  },
  {
    id: "correction-report",
    category: "会計・監査",
    severity: "medium",
    keywords: ["訂正報告書", "訂正有価証券報告書"],
    title: "訂正報告書",
    summary: "過去に提出した書類の内容が訂正された可能性があります。",
    why: [
      "軽微な誤記から重要な数値変更まで幅があります。",
      "訂正理由と影響額で重要度を判断します。"
    ],
    checkPoints: ["訂正対象", "訂正理由", "業績や財務への影響"],
    beginnerNote: "どの数字がどれだけ変わったかを見ます。"
  },
  {
    id: "internal-control",
    category: "会計・監査",
    severity: "high",
    keywords: ["内部統制"],
    title: "内部統制",
    summary: "決算や業務プロセスの管理体制に不備がある可能性があります。",
    why: [
      "内部統制の不備は会計ミスや不正の再発リスクにつながります。",
      "改善計画の具体性が重要です。"
    ],
    checkPoints: ["不備の内容", "重要な欠陥かどうか", "改善策"],
    beginnerNote: "会社の数字を作る仕組みが信頼できるかを見る項目です。"
  },
  {
    id: "listing-delisting",
    category: "上場維持・上場廃止",
    severity: "critical",
    keywords: ["上場廃止", "整理銘柄"],
    title: "上場廃止・整理銘柄",
    summary: "上場を維持できない、または上場廃止手続きに入る可能性があります。",
    why: [
      "流動性や取引機会に直接関わる重大情報です。",
      "保有継続の前提そのものを見直す必要があります。"
    ],
    checkPoints: ["指定理由", "今後の日程", "会社の対応方針"],
    beginnerNote: "期限と取引できる期間を必ず確認します。"
  },
  {
    id: "listing-supervision",
    category: "上場維持・上場廃止",
    severity: "high",
    keywords: ["監理銘柄", "特設注意市場銘柄"],
    title: "監理銘柄・特設注意市場銘柄",
    summary: "取引所から上場維持に関する注意対象になっている可能性があります。",
    why: [
      "上場廃止に近づく前段階のサインになることがあります。",
      "指定理由と改善計画が重要です。"
    ],
    checkPoints: ["指定区分", "指定理由", "解除条件"],
    beginnerNote: "取引所の発表と会社の説明を両方確認します。"
  },
  {
    id: "listing-standards",
    category: "上場維持・上場廃止",
    severity: "high",
    keywords: ["上場維持基準", "改善期間"],
    title: "上場維持基準",
    summary: "時価総額、流通株式、株主数などの基準に注意が必要な可能性があります。",
    why: [
      "基準未達が続くと上場維持に影響します。",
      "改善計画が実現可能かを確認する必要があります。"
    ],
    checkPoints: ["未達基準", "改善期限", "改善策の進捗"],
    beginnerNote: "どの基準に届いていないのかを具体的に見ます。"
  },
  {
    id: "legal-lawsuit",
    category: "訴訟・行政処分",
    severity: "high",
    keywords: ["訴訟", "損害賠償"],
    title: "訴訟・損害賠償",
    summary: "訴訟や損害賠償請求が発生している可能性があります。",
    why: [
      "賠償額や事業停止リスクが業績に影響することがあります。",
      "見通しが不透明な場合、追加損失に注意が必要です。"
    ],
    checkPoints: ["請求額", "争点", "業績への影響見込み"],
    beginnerNote: "金額だけでなく、事業にどれだけ関係するかを見ます。"
  },
  {
    id: "legal-administrative-action",
    category: "訴訟・行政処分",
    severity: "critical",
    keywords: ["行政処分", "業務停止", "課徴金", "命令", "処分"],
    title: "行政処分・業務停止",
    summary: "監督官庁から処分や命令を受けた可能性があります。",
    why: [
      "業務停止は売上や信用に直接影響します。",
      "再発防止策の実効性が重要です。"
    ],
    checkPoints: ["処分内容", "対象事業", "停止期間や課徴金額"],
    beginnerNote: "会社発表だけでなく、可能なら官庁側の発表も確認します。"
  },
  {
    id: "governance-ceo-change",
    category: "経営陣・ガバナンス",
    severity: "medium",
    keywords: ["代表取締役の異動", "社長交代"],
    title: "代表取締役・社長交代",
    summary: "経営トップが変わる可能性があります。",
    why: [
      "成長戦略や資本政策が変わるきっかけになります。",
      "突然の交代は背景確認が必要です。"
    ],
    checkPoints: ["交代理由", "後任の経歴", "経営方針の変更有無"],
    beginnerNote: "定期的な交代か、急な交代かで見方が変わります。"
  },
  {
    id: "governance-resignation",
    category: "経営陣・ガバナンス",
    severity: "high",
    keywords: ["役員辞任", "取締役辞任", "辞任"],
    title: "役員辞任",
    summary: "役員が任期途中で辞任した可能性があります。",
    why: [
      "健康上の理由など通常のケースもあります。",
      "不祥事、見解相違、業績不振が背景にある場合は注意が必要です。"
    ],
    checkPoints: ["辞任理由", "後任体制", "同時期の他の開示"],
    beginnerNote: "理由が短すぎる場合は、関連開示も探して確認します。"
  },
  {
    id: "shareholder-major-change",
    category: "大株主・支配権",
    severity: "medium",
    keywords: ["主要株主の異動", "筆頭株主の異動", "大株主の異動"],
    title: "主要株主の異動",
    summary: "大きな株主の保有比率が変わった可能性があります。",
    why: [
      "支配権や株主提案の可能性に影響します。",
      "需給面で株価の動きに影響することがあります。"
    ],
    checkPoints: ["異動した株主", "保有比率", "異動理由"],
    beginnerNote: "誰が増やしたか、誰が減らしたかを分けて見ます。"
  },
  {
    id: "shareholder-large-holding",
    category: "大株主・支配権",
    severity: "neutral",
    keywords: ["大量保有", "大量保有報告書", "変更報告書"],
    title: "大量保有・変更報告書",
    summary: "5%超の保有や保有割合の変化が報告された可能性があります。",
    why: [
      "大株主の動きは会社支配や需給の手がかりになります。",
      "保有目的が純投資か重要提案行為かで意味が変わります。"
    ],
    checkPoints: ["保有者", "保有割合", "保有目的"],
    beginnerNote: "EDINETの書類で保有目的欄を確認します。"
  },
  {
    id: "shareholder-tob",
    category: "大株主・支配権",
    severity: "high",
    keywords: ["TOB", "公開買付"],
    title: "TOB・公開買付",
    summary: "会社の株式を市場外で買い集める提案が出ている可能性があります。",
    why: [
      "買付価格、成立条件、上場維持方針が投資家に大きく影響します。",
      "賛同・反対の意見表明も重要です。"
    ],
    checkPoints: ["買付価格", "買付予定数", "上場維持方針"],
    beginnerNote: "市場価格との差と成立条件を確認します。"
  },
  {
    id: "business-delay",
    category: "事業リスク",
    severity: "medium",
    keywords: ["延期", "遅延"],
    title: "延期・遅延",
    summary: "計画、製品、案件、開発などが遅れている可能性があります。",
    why: [
      "売上計上時期や費用計画に影響することがあります。",
      "一度の遅延か、構造的な遅れかを確認します。"
    ],
    checkPoints: ["遅延対象", "新しい予定", "業績影響"],
    beginnerNote: "いつまで遅れるのか、会社が説明しているかを見ます。"
  },
  {
    id: "business-cancel",
    category: "事業リスク",
    severity: "high",
    keywords: ["中止", "撤退", "失注", "解約", "契約終了"],
    title: "中止・撤退・失注",
    summary: "事業や契約が終了した可能性があります。",
    why: [
      "将来売上や成長ストーリーに影響することがあります。",
      "重要顧客や大型案件の場合、影響が大きくなります。"
    ],
    checkPoints: ["対象案件", "売上影響", "代替策"],
    beginnerNote: "その案件が会社全体に占める大きさを確認します。"
  },
  {
    id: "business-recall",
    category: "事業リスク",
    severity: "high",
    keywords: ["回収", "リコール"],
    title: "回収・リコール",
    summary: "製品やサービスに問題があり、回収対応が必要な可能性があります。",
    why: [
      "費用負担、信用低下、行政対応につながることがあります。",
      "対象範囲が広いほど影響が大きくなります。"
    ],
    checkPoints: ["対象製品", "回収範囲", "費用見込み"],
    beginnerNote: "一時費用だけでなく、ブランドへの影響も見ます。"
  },
  {
    id: "earnings-release",
    category: "決算・月次確認",
    severity: "neutral",
    keywords: ["決算短信", "四半期決算"],
    title: "決算発表",
    summary: "決算資料が出ています。業績の実績値を確認するタイミングです。",
    why: [
      "売上・利益・進捗率を定期的に確認できます。",
      "会社の説明資料と合わせると、見通しの変化を読みやすくなります。"
    ],
    checkPoints: ["売上と営業利益", "通期計画に対する進捗", "来期見通し"],
    beginnerNote: "前年同期比だけでなく、会社計画との進捗も見ます。"
  },
  {
    id: "earnings-presentation",
    category: "決算・月次確認",
    severity: "neutral",
    keywords: ["決算説明資料"],
    title: "決算説明資料",
    summary: "会社が決算内容を説明する資料です。",
    why: [
      "数字の背景や事業ごとの状況が分かることがあります。",
      "今後の見通しやリスクへの説明を確認できます。"
    ],
    checkPoints: ["セグメント別動向", "質疑応答や補足", "次期見通し"],
    beginnerNote: "短信の数字だけで分からない背景を探します。"
  },
  {
    id: "monthly-report",
    category: "決算・月次確認",
    severity: "neutral",
    keywords: ["月次", "月次業績"],
    title: "月次情報",
    summary: "月ごとの売上や店舗数などの進捗を確認できます。",
    why: [
      "決算前に事業の足元を確認する材料になります。",
      "短期変動が大きい業種ではノイズもあります。"
    ],
    checkPoints: ["前年同月比", "既存店と全店の違い", "季節要因"],
    beginnerNote: "1か月だけで判断せず、数か月の流れを見ます。"
  },
  {
    id: "positive-upward-revision",
    category: "ポジティブ材料",
    severity: "positive",
    keywords: ["上方修正"],
    title: "上方修正",
    summary: "会社の業績見通しが上向いた可能性があります。",
    why: [
      "売上や利益が想定より強い可能性があります。",
      "一時的な要因か継続的な改善かで評価が変わります。"
    ],
    checkPoints: ["上方修正の理由", "修正幅", "来期以降に続くか"],
    beginnerNote: "良いニュースでも、すでに株価に織り込まれている場合があります。"
  },
  {
    id: "positive-dividend-increase",
    category: "ポジティブ材料",
    severity: "positive",
    keywords: ["増配"],
    title: "増配",
    summary: "株主還元が増える可能性があります。",
    why: [
      "利益や財務に余力があるサインの場合があります。",
      "記念配当など一時的な増配もあります。"
    ],
    checkPoints: ["普通配当か記念配当か", "配当性向", "来期も続くか"],
    beginnerNote: "一度だけの増配か継続的な方針かを確認します。"
  },
  {
    id: "positive-buyback",
    category: "ポジティブ材料",
    severity: "positive",
    keywords: ["自社株買い", "自己株式取得"],
    title: "自社株買い・自己株式取得",
    summary: "会社が自社株を買う可能性があります。",
    why: [
      "1株あたり利益の改善や株主還元として見られることがあります。",
      "取得枠を発表しても、必ず全額買うとは限りません。"
    ],
    checkPoints: ["取得上限株数", "取得上限金額", "取得期間"],
    beginnerNote: "発表された枠と実際の取得状況を分けて見ます。"
  },
  {
    id: "positive-profit-turnaround",
    category: "ポジティブ材料",
    severity: "positive",
    keywords: ["黒字転換"],
    title: "黒字転換",
    summary: "赤字だった会社が黒字に転じる可能性があります。",
    why: [
      "事業改善の節目になることがあります。",
      "一時益による黒字化か、本業改善かを確認します。"
    ],
    checkPoints: ["営業利益の黒字化か", "一時益の有無", "継続性"],
    beginnerNote: "最終利益だけでなく営業利益も見ます。"
  },
  {
    id: "positive-large-order",
    category: "ポジティブ材料",
    severity: "positive",
    keywords: ["大型受注", "受注"],
    title: "大型受注・受注",
    summary: "新しい受注や大きな案件を獲得した可能性があります。",
    why: [
      "将来売上につながる前向きな材料です。",
      "利益率や納期、売上計上時期は別途確認が必要です。"
    ],
    checkPoints: ["受注金額", "売上計上時期", "利益への影響"],
    beginnerNote: "受注額が大きくても、利益がどれくらい出るかは別問題です。"
  },
  {
    id: "positive-partnership",
    category: "ポジティブ材料",
    severity: "positive",
    keywords: ["業務提携", "資本業務提携"],
    title: "提携",
    summary: "他社との提携で事業拡大を狙う可能性があります。",
    why: [
      "販路、技術、資本面の支援につながる場合があります。",
      "提携の具体性が低い場合は過度な期待に注意します。"
    ],
    checkPoints: ["提携相手", "役割分担", "収益化時期"],
    beginnerNote: "何を一緒に行い、いつ売上につながるかを確認します。"
  },
  {
    id: "positive-grant",
    category: "ポジティブ材料",
    severity: "positive",
    keywords: ["採択", "補助金"],
    title: "採択・補助金",
    summary: "公募や補助金に採択された可能性があります。",
    why: [
      "研究開発や設備投資の資金負担を軽くする場合があります。",
      "補助金額や条件によって実際の効果は変わります。"
    ],
    checkPoints: ["採択額", "対象事業", "自己負担の有無"],
    beginnerNote: "補助金は売上ではなく、費用補助であることが多いです。"
  },
  {
    id: "positive-mass-production",
    category: "ポジティブ材料",
    severity: "positive",
    keywords: ["量産開始"],
    title: "量産開始",
    summary: "開発段階から量産段階へ進んだ可能性があります。",
    why: [
      "売上拡大の前段階として注目されます。",
      "量産しても採算や販売先が重要です。"
    ],
    checkPoints: ["量産品目", "顧客や販売先", "利益率"],
    beginnerNote: "量産開始と利益貢献の時期は分けて考えます。"
  },
  {
    id: "edinet-securities-report",
    category: "中立だが確認したい材料",
    severity: "neutral",
    keywords: ["有価証券報告書", "四半期報告書", "半期報告書"],
    title: "法定開示書類",
    summary: "財務、事業、リスク、役員情報などを確認できる書類です。",
    why: [
      "会社の基本情報やリスクがまとまっています。",
      "短信やニュースより詳しい一次情報です。"
    ],
    checkPoints: ["事業等のリスク", "経営成績", "大株主の状況"],
    beginnerNote: "最初は全部読まず、リスクと業績の欄から確認します。"
  },
  {
    id: "edinet-extraordinary-report",
    category: "中立だが確認したい材料",
    severity: "neutral",
    keywords: ["臨時報告書"],
    title: "臨時報告書",
    summary: "重要な事実が発生したときに提出される法定開示書類です。",
    why: [
      "株主総会、主要株主、資本政策などの重要事項が含まれることがあります。",
      "タイトルだけでは内容が分からないため、本文確認が必要です。"
    ],
    checkPoints: ["提出理由", "発生事実", "会社への影響"],
    beginnerNote: "EDINETで提出理由を確認します。"
  },
  {
    id: "edinet-registration-statement",
    category: "中立だが確認したい材料",
    severity: "neutral",
    keywords: ["有価証券届出書"],
    title: "有価証券届出書",
    summary: "新株や社債などの発行に関する法定書類の可能性があります。",
    why: [
      "資金調達条件やリスク情報が詳しく書かれます。",
      "希薄化や返済条件を確認する材料になります。"
    ],
    checkPoints: ["発行条件", "資金使途", "リスク情報"],
    beginnerNote: "資金調達の条件を確認する入口になります。"
  }
];

export const riskCategories = Array.from(
  new Set(riskDictionary.map((rule) => rule.category))
);

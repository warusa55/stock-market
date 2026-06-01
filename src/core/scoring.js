function average(values) {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percent(value, total) {
  if (total === 0) {
    return 0;
  }
  return Math.round((value / total) * 100);
}

export function summarizeInteractionLogs(logs) {
  const reactions = new Map();

  for (const log of logs) {
    const reaction = log.finalReaction ?? "unknown";
    reactions.set(reaction, (reactions.get(reaction) ?? 0) + 1);
  }

  return {
    total: logs.length,
    reactions: Object.fromEntries(reactions),
    averageReadDurationMs: Math.round(average(logs.map((log) => log.readDurationMs ?? 0))),
    averageDictionaryOpenCount: average(logs.map((log) => log.openedDictionaryIds?.length ?? 0)),
    averageEventMapOpenCount: average(logs.map((log) => log.openedEventMapIds?.length ?? 0))
  };
}

export function observeScoring(input) {
  const logs = input.logs ?? [];
  const summary = summarizeInteractionLogs(logs);
  const unclearCount = (summary.reactions.unclear ?? 0) + (summary.reactions.later ?? 0);
  const understoodCount =
    (summary.reactions.understood ?? 0) + (summary.reactions.somewhat_understood ?? 0);

  return {
    domainId: input.domainId,
    summary:
      logs.length === 0
        ? "まだ観察できる操作ログがありません。"
        : `${logs.length}件の操作ログから、理解反応と補足確認の傾向を観察しました。`,
    traits: [
      {
        id: "reaction-balance",
        label: "理解反応",
        score: percent(understoodCount, logs.length),
        evidence: [
          `理解系の反応: ${understoodCount}件`,
          `不明・あとで見る反応: ${unclearCount}件`
        ],
        interpretation:
          "反応の比率は到達度の断定ではなく、カードの粒度や補足導線を見直すための観察値です。",
        alternativeInterpretations: [
          "カードが難しすぎる可能性があります。",
          "ユーザーが慎重に確認している可能性があります。"
        ]
      },
      {
        id: "context-exploration",
        label: "補足確認",
        score: Math.round(summary.averageDictionaryOpenCount + summary.averageEventMapOpenCount),
        evidence: [
          `用語図鑑を開いた平均回数: ${summary.averageDictionaryOpenCount.toFixed(1)}回`,
          `イベントマップを開いた平均回数: ${summary.averageEventMapOpenCount.toFixed(1)}回`
        ],
        interpretation:
          "補足情報への移動量から、どこで文脈を足す必要があったかを観察します。",
        alternativeInterpretations: [
          "探索量が多いほど理解が低いとは限りません。",
          "関心が高いカードほど補足確認が増えることがあります。"
        ]
      }
    ],
    cautions: [
      "採用合否、人事評価、ランク付け、能力断定には使わない。",
      "ログ量が少ない期間は、傾向ではなく個別操作として読む。"
    ],
    nextSuggestions:
      unclearCount > understoodCount
        ? ["カードの見るポイントを減らす。", "イベントマップの現在地表示を先に出す。"]
        : ["次のカードでは比較ビューかタイムラインへの導線を増やす。"]
  };
}

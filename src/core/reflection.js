import { maskInteractionLogs } from "./masking.js";
import { summarizeInteractionLogs } from "./scoring.js";

function reportId(domainId, periodEnd) {
  return `reflection-${domainId}-${periodEnd.slice(0, 10)}`;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

export function createReflectionReport({
  domainId,
  logs,
  periodStart,
  periodEnd,
  targetUserId,
  now = () => new Date().toISOString()
}) {
  const safeLogs = Array.isArray(logs) ? logs : [];
  const maskedLogs = maskInteractionLogs(safeLogs);
  const summary = summarizeInteractionLogs(safeLogs);
  const unclearCount = (summary.reactions.unclear ?? 0) + (summary.reactions.later ?? 0);
  const understoodCount =
    (summary.reactions.understood ?? 0) + (summary.reactions.somewhat_understood ?? 0);
  const openedContextCount = maskedLogs.reduce((sum, log) => {
    return sum + log.openedDictionaryCount + log.openedEventMapCount + log.openedTimelineCount;
  }, 0);

  const observedPatterns = [];
  if (safeLogs.length === 0) {
    observedPatterns.push("まだ観察できる操作ログがありません。");
  } else {
    observedPatterns.push(`${safeLogs.length}件の操作ログがあります。`);
    observedPatterns.push(`補足情報を開いた合計回数は${openedContextCount}回です。`);
    observedPatterns.push(`理解系の反応は${understoodCount}件、不明・保留系の反応は${unclearCount}件です。`);
  }

  const possibleRisks = [];
  if (unclearCount > understoodCount) {
    possibleRisks.push("カードの粒度が大きすぎると、次の行動を選びにくくなる可能性があります。");
  }
  if (summary.averageDictionaryOpenCount >= 2) {
    possibleRisks.push("確認項目が増えすぎると、判断の現在地が見えにくくなる可能性があります。");
  }
  if (possibleRisks.length === 0) {
    possibleRisks.push("現時点では大きなリスク傾向は観察されていません。");
  }

  const nextTrainingCards = unique(
    safeLogs
      .filter((log) => log.finalReaction === "unclear" || log.finalReaction === "later")
      .map((log) => log.cardId)
  ).slice(0, 5);

  return {
    id: reportId(domainId, periodEnd),
    domainId,
    targetUserId,
    periodStart,
    periodEnd,
    generalComment:
      safeLogs.length === 0
        ? "まだ振り返りに使える操作ログがありません。"
        : "補足情報を確認しながら、カードの意味と現在地を掴もうとする動きが見られます。",
    strictComment:
      unclearCount > understoodCount
        ? "不明・保留の反応が多い期間です。確認を増やすだけでなく、次に決めることを小さく切る必要があります。"
        : "現時点では大きな停滞は見えません。次は比較や時系列に進んでもよい状態です。",
    observedPatterns,
    possibleRisks,
    nextTrainingCards,
    createdAt: now()
  };
}

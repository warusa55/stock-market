import type { MatchedRisk, RiskRule, Severity } from "../types";

const severityWeight: Record<Severity, number> = {
  critical: 9,
  high: 6,
  medium: 4,
  low: 2,
  positive: 3,
  neutral: 1
};

const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, "");

export function matchRisks(input: string, rules: RiskRule[]): MatchedRisk[] {
  const normalizedInput = normalize(input);

  return rules
    .map((rule) => {
      const matchedKeywords = rule.keywords.filter((keyword) =>
        normalizedInput.includes(normalize(keyword))
      );

      if (matchedKeywords.length === 0) {
        return undefined;
      }

      const keywordScore = matchedKeywords.reduce(
        (sum, keyword) => sum + Math.max(1, keyword.length / 2),
        0
      );

      return {
        rule,
        matchedKeywords,
        score: keywordScore + severityWeight[rule.severity]
      };
    })
    .filter((risk): risk is MatchedRisk => Boolean(risk))
    .sort((a, b) => b.score - a.score);
}

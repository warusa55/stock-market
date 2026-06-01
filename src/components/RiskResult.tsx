import { severityLabels } from "../labels";
import type { MatchedRisk } from "../types";

type RiskResultProps = {
  risk: MatchedRisk;
};

export function RiskResult({ risk }: RiskResultProps) {
  return (
    <section className={`risk-result severity-${risk.rule.severity}`}>
      <div className="risk-heading">
        <span className={`severity-pill severity-${risk.rule.severity}`}>
          {severityLabels[risk.rule.severity]}
        </span>
        <div>
          <h4>{risk.rule.title}</h4>
          <p>{risk.rule.summary}</p>
        </div>
      </div>

      <div className="keyword-row">
        <span>検出キーワード</span>
        <div>
          {risk.matchedKeywords.map((keyword) => (
            <mark key={keyword}>{keyword}</mark>
          ))}
        </div>
      </div>

      <div className="risk-columns">
        <div>
          <h5>なぜ注意？</h5>
          <ul>
            {risk.rule.why.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h5>見るポイント</h5>
          <ul>
            {risk.rule.checkPoints.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {risk.rule.beginnerNote ? (
        <p className="note-line">
          <strong>初心者メモ:</strong> {risk.rule.beginnerNote}
        </p>
      ) : null}

      {risk.rule.falsePositiveNote ? (
        <p className="note-line muted">
          <strong>誤検知・注意点:</strong> {risk.rule.falsePositiveNote}
        </p>
      ) : null}
    </section>
  );
}

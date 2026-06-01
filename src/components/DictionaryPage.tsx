import { useMemo, useState } from "react";
import { riskCategories, riskDictionary } from "../data/riskDictionary";
import { severityLabels } from "../labels";
import type { Severity } from "../types";

const severities: Array<Severity | "all"> = [
  "all",
  "critical",
  "high",
  "medium",
  "low",
  "positive",
  "neutral"
];

export function DictionaryPage() {
  const [category, setCategory] = useState("all");
  const [severity, setSeverity] = useState<Severity | "all">("all");
  const [query, setQuery] = useState("");

  const filteredRules = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return riskDictionary.filter((rule) => {
      if (category !== "all" && rule.category !== category) {
        return false;
      }

      if (severity !== "all" && rule.severity !== severity) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [rule.title, rule.category, ...rule.keywords]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [category, query, severity]);

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <h2>辞書</h2>
          <p>見出しを分類する危険語・注目語の固定辞書です。v0.1では編集しません。</p>
        </div>
        <span className="count-badge">{filteredRules.length} / {riskDictionary.length}件</span>
      </div>

      <div className="filter-grid">
        <label>
          <span>カテゴリ</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">すべて</option>
            {riskCategories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>重要度</span>
          <select
            value={severity}
            onChange={(event) => setSeverity(event.target.value as Severity | "all")}
          >
            {severities.map((item) => (
              <option key={item} value={item}>
                {item === "all" ? "すべて" : severityLabels[item]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>キーワード検索</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="第三者割当、決算短信など"
          />
        </label>
      </div>

      <div className="dictionary-list">
        {filteredRules.map((rule) => (
          <details key={rule.id} className={`dictionary-card severity-${rule.severity}`}>
            <summary>
              <span className={`severity-pill severity-${rule.severity}`}>
                {severityLabels[rule.severity]}
              </span>
              <strong>{rule.title}</strong>
              <span>{rule.category}</span>
            </summary>
            <p>{rule.summary}</p>
            <div className="keyword-row">
              <span>キーワード</span>
              <div>
                {rule.keywords.map((keyword) => (
                  <mark key={keyword}>{keyword}</mark>
                ))}
              </div>
            </div>
            <div className="risk-columns">
              <div>
                <h4>なぜ注意？</h4>
                <ul>
                  {rule.why.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4>見るポイント</h4>
                <ul>
                  {rule.checkPoints.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            {rule.beginnerNote ? <p className="note-line">{rule.beginnerNote}</p> : null}
            {rule.falsePositiveNote ? (
              <p className="note-line muted">{rule.falsePositiveNote}</p>
            ) : null}
          </details>
        ))}
      </div>
    </section>
  );
}

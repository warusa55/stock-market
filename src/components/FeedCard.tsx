import { sourceLabels, statusLabels } from "../labels";
import { scoreMatchedFeed } from "../logic/score";
import type { CheckStatus, FeedCheckState, MatchedFeed } from "../types";
import { RiskResult } from "./RiskResult";

type FeedCardProps = {
  matched: MatchedFeed;
  checkState?: FeedCheckState;
  onCheckChange: (check: FeedCheckState) => void;
};

const statuses: CheckStatus[] = ["unread", "checked", "pending", "ignored"];

const formatDate = (value?: string) => {
  if (!value) {
    return "日時不明";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
};

export function FeedCard({ matched, checkState, onCheckChange }: FeedCardProps) {
  const current: FeedCheckState = checkState ?? {
    feedId: matched.feed.id,
    stockId: matched.stock.id,
    status: "unread",
    userMemo: "",
    updatedAt: new Date().toISOString()
  };

  const emitChange = (updates: Partial<FeedCheckState>) => {
    onCheckChange({
      ...current,
      ...updates,
      feedId: matched.feed.id,
      stockId: matched.stock.id,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <article className="feed-card">
      <div className="feed-card-top">
        <div>
          <p className="stock-line">
            {matched.stock.name}
            <span>{matched.stock.code}</span>
          </p>
          <h3>
            <a href={matched.feed.url} target="_blank" rel="noreferrer">
              {matched.feed.title}
            </a>
          </h3>
        </div>
        <div className="score-box">
          <span>危なそう度</span>
          <strong>{Math.round(scoreMatchedFeed(matched))}</strong>
        </div>
      </div>

      <dl className="meta-grid">
        <div>
          <dt>ソース</dt>
          <dd>{sourceLabels[matched.feed.source]}</dd>
        </div>
        <div>
          <dt>公開日時</dt>
          <dd>{formatDate(matched.feed.publishedAt)}</dd>
        </div>
        <div>
          <dt>書類種別</dt>
          <dd>{matched.feed.documentType ?? "未分類"}</dd>
        </div>
        <div>
          <dt>一致スコア</dt>
          <dd>{matched.stockMatchScore}</dd>
        </div>
      </dl>

      {matched.risks.length > 0 ? (
        <div className="risk-list">
          {matched.risks.map((risk) => (
            <RiskResult key={risk.rule.id} risk={risk} />
          ))}
        </div>
      ) : (
        <section className="risk-result severity-neutral">
          <div className="risk-heading">
            <span className="severity-pill severity-neutral">確認</span>
            <div>
              <h4>関連候補</h4>
              <p>登録銘柄と一致しました。内容を出典で確認してください。</p>
            </div>
          </div>
        </section>
      )}

      <div className="check-controls" aria-label="確認状態">
        {statuses.map((status) => (
          <button
            key={status}
            type="button"
            className={current.status === status ? "active" : ""}
            onClick={() => emitChange({ status })}
          >
            {statusLabels[status]}
          </button>
        ))}
      </div>

      <label className="memo-field">
        <span>自分のメモ</span>
        <textarea
          value={current.userMemo}
          rows={3}
          onChange={(event) => emitChange({ userMemo: event.target.value })}
          placeholder="一次情報で確認したこと、自分の判断保留理由など"
        />
      </label>
    </article>
  );
}

import { useState } from "react";
import type { FormEvent } from "react";
import { exportLocalData } from "../storage/localStorageStore";
import type { FeedItem } from "../types";

type SettingsPageProps = {
  feedsLoadedAt?: string;
  feedCount: number;
  publicFeedCount: number;
  localFeeds: FeedItem[];
  onReloadFeeds: () => Promise<void>;
  onLocalFeedsChange: (feeds: FeedItem[]) => void;
  onClearLocalData: () => void;
  onImportLocalData: (json: string) => { ok: boolean; error?: string };
};

type ManualFeedForm = {
  title: string;
  url: string;
  companyName: string;
  code: string;
  documentType: string;
  publishedAt: string;
};

const emptyManualFeedForm: ManualFeedForm = {
  title: "",
  url: "",
  companyName: "",
  code: "",
  documentType: "手動見出し",
  publishedAt: ""
};

const createManualFeedId = () =>
  globalThis.crypto?.randomUUID?.() ?? `manual-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const formatDate = (value?: string) => {
  if (!value) {
    return "未読み込み";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "medium"
  }).format(date);
};

export function SettingsPage({
  feedsLoadedAt,
  feedCount,
  publicFeedCount,
  localFeeds,
  onReloadFeeds,
  onLocalFeedsChange,
  onClearLocalData,
  onImportLocalData
}: SettingsPageProps) {
  const [exportText, setExportText] = useState("");
  const [importText, setImportText] = useState("");
  const [message, setMessage] = useState("");
  const [manualFeedForm, setManualFeedForm] = useState<ManualFeedForm>(emptyManualFeedForm);

  const handleClear = () => {
    if (!window.confirm("localStorageに保存した銘柄と確認状態を削除しますか？")) {
      return;
    }

    onClearLocalData();
    setMessage("ローカルデータを削除しました。");
  };

  const handleImport = () => {
    const result = onImportLocalData(importText);
    setMessage(result.ok ? "インポートしました。" : result.error ?? "インポートに失敗しました。");
  };

  const handleReload = async () => {
    await onReloadFeeds();
    setMessage("feeds.jsonを再読み込みしました。");
  };

  const updateManualFeedForm = <K extends keyof ManualFeedForm>(
    key: K,
    value: ManualFeedForm[K]
  ) => {
    setManualFeedForm((current) => ({ ...current, [key]: value }));
  };

  const handleAddManualFeed = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = manualFeedForm.title.trim();
    const url = manualFeedForm.url.trim();

    if (!title || !url) {
      setMessage("手動見出しはタイトルとURLが必要です。");
      return;
    }

    const publishedAt = manualFeedForm.publishedAt
      ? new Date(manualFeedForm.publishedAt).toISOString()
      : new Date().toISOString();

    const feed: FeedItem = {
      id: createManualFeedId(),
      title,
      url,
      source: "manual",
      publishedAt,
      companyName: manualFeedForm.companyName.trim() || undefined,
      code: manualFeedForm.code.trim().toUpperCase() || undefined,
      documentType: manualFeedForm.documentType.trim() || "手動見出し"
    };

    onLocalFeedsChange([feed, ...localFeeds]);
    setManualFeedForm(emptyManualFeedForm);
    setMessage("手動見出しをlocalStorageに保存しました。");
  };

  const handleDeleteManualFeed = (feedId: string) => {
    onLocalFeedsChange(localFeeds.filter((feed) => feed.id !== feedId));
    setMessage("手動見出しを削除しました。");
  };

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <h2>設定</h2>
          <p>個人データはこのブラウザの localStorage に保存され、外部送信しません。</p>
        </div>
      </div>

      {message ? <p className="info-message">{message}</p> : null}

      <section className="settings-panel">
        <h3>見出しデータ</h3>
        <dl className="meta-grid">
          <div>
            <dt>最終読み込み</dt>
            <dd>{formatDate(feedsLoadedAt)}</dd>
          </div>
          <div>
            <dt>件数</dt>
            <dd>{feedCount}件</dd>
          </div>
          <div>
            <dt>feeds.json</dt>
            <dd>{publicFeedCount}件</dd>
          </div>
          <div>
            <dt>localStorage</dt>
            <dd>{localFeeds.length}件</dd>
          </div>
        </dl>
        <button type="button" className="primary-button" onClick={handleReload}>
          手動再読み込み
        </button>
      </section>

      <section className="settings-panel">
        <h3>手動見出し</h3>
        <p>
          ここで追加した見出しは localStorage に保存され、同じURLやIDの `feeds.json`
          より優先されます。
        </p>
        <form className="manual-feed-form" onSubmit={handleAddManualFeed}>
          <div className="form-grid two">
            <label>
              <span>見出し</span>
              <input
                value={manualFeedForm.title}
                onChange={(event) => updateManualFeedForm("title", event.target.value)}
                placeholder="第三者割当による新株予約権の発行に関するお知らせ"
                required
              />
            </label>
            <label>
              <span>URL</span>
              <input
                value={manualFeedForm.url}
                onChange={(event) => updateManualFeedForm("url", event.target.value)}
                placeholder="https://example.com/disclosure"
                required
              />
            </label>
          </div>
          <div className="form-grid">
            <label>
              <span>会社名</span>
              <input
                value={manualFeedForm.companyName}
                onChange={(event) => updateManualFeedForm("companyName", event.target.value)}
                placeholder="アクセルスペースホールディングス"
              />
            </label>
            <label>
              <span>銘柄コード</span>
              <input
                value={manualFeedForm.code}
                onChange={(event) => updateManualFeedForm("code", event.target.value)}
                placeholder="402A"
              />
            </label>
            <label>
              <span>書類種別</span>
              <input
                value={manualFeedForm.documentType}
                onChange={(event) => updateManualFeedForm("documentType", event.target.value)}
                placeholder="適時開示"
              />
            </label>
            <label>
              <span>公開日時</span>
              <input
                type="datetime-local"
                value={manualFeedForm.publishedAt}
                onChange={(event) => updateManualFeedForm("publishedAt", event.target.value)}
              />
            </label>
          </div>
          <button type="submit" className="primary-button">
            手動見出しを追加
          </button>
        </form>

        {localFeeds.length > 0 ? (
          <div className="manual-feed-list">
            {localFeeds.map((feed) => (
              <article key={feed.id} className="manual-feed-card">
                <div>
                  <h4>{feed.title}</h4>
                  <p>
                    {[feed.code, feed.companyName, feed.documentType].filter(Boolean).join(" / ")}
                  </p>
                  <a href={feed.url} target="_blank" rel="noreferrer">
                    {feed.url}
                  </a>
                </div>
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => handleDeleteManualFeed(feed.id)}
                >
                  削除
                </button>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <section className="settings-panel">
        <h3>JSONエクスポート</h3>
        <p>対象は登録銘柄、確認状態、ユーザーメモ、手動見出しです。</p>
        <button type="button" onClick={() => setExportText(exportLocalData())}>
          エクスポート
        </button>
        <textarea value={exportText} readOnly rows={10} />
      </section>

      <section className="settings-panel">
        <h3>JSONインポート</h3>
        <textarea
          value={importText}
          onChange={(event) => setImportText(event.target.value)}
          rows={10}
          placeholder="{ ... }"
        />
        <button type="button" className="primary-button" onClick={handleImport}>
          インポート
        </button>
      </section>

      <section className="settings-panel danger-zone">
        <h3>データ削除</h3>
        <p>登録銘柄、確認状態、ユーザーメモ、手動見出しをこのブラウザから削除します。</p>
        <button type="button" className="danger-button" onClick={handleClear}>
          ローカルデータを削除
        </button>
      </section>
    </section>
  );
}

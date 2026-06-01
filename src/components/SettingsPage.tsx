import { useState } from "react";
import { exportLocalData } from "../storage/localStorageStore";

type SettingsPageProps = {
  feedsLoadedAt?: string;
  feedCount: number;
  onReloadFeeds: () => Promise<void>;
  onClearLocalData: () => void;
  onImportLocalData: (json: string) => { ok: boolean; error?: string };
};

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
  onReloadFeeds,
  onClearLocalData,
  onImportLocalData
}: SettingsPageProps) {
  const [exportText, setExportText] = useState("");
  const [importText, setImportText] = useState("");
  const [message, setMessage] = useState("");

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
        </dl>
        <button type="button" className="primary-button" onClick={handleReload}>
          手動再読み込み
        </button>
      </section>

      <section className="settings-panel">
        <h3>JSONエクスポート</h3>
        <p>対象は登録銘柄と確認状態、ユーザーメモです。</p>
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
        <p>登録銘柄、確認状態、ユーザーメモをこのブラウザから削除します。</p>
        <button type="button" className="danger-button" onClick={handleClear}>
          ローカルデータを削除
        </button>
      </section>
    </section>
  );
}

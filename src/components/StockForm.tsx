import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { watchLevelLabels } from "../labels";
import type { Stock, WatchLevel } from "../types";

type StockFormProps = {
  editingStock?: Stock;
  onCancelEdit: () => void;
  onSave: (stock: Stock) => void;
};

const watchLevels: WatchLevel[] = ["manual", "weekly", "daily", "priority"];

const emptyForm = {
  code: "",
  name: "",
  aliases: "",
  market: "",
  watchReason: "",
  riskMemo: "",
  watchLevel: "manual" as WatchLevel
};

const splitAliases = (value: string) =>
  value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

const createId = () =>
  globalThis.crypto?.randomUUID?.() ?? `stock-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function StockForm({ editingStock, onCancelEdit, onSave }: StockFormProps) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!editingStock) {
      setForm(emptyForm);
      return;
    }

    setForm({
      code: editingStock.code,
      name: editingStock.name,
      aliases: editingStock.aliases.join(", "),
      market: editingStock.market ?? "",
      watchReason: editingStock.watchReason,
      riskMemo: editingStock.riskMemo,
      watchLevel: editingStock.watchLevel
    });
  }, [editingStock]);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const now = new Date().toISOString();
    const stock: Stock = {
      id: editingStock?.id ?? createId(),
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      aliases: splitAliases(form.aliases),
      market: form.market.trim() || undefined,
      watchReason: form.watchReason.trim(),
      riskMemo: form.riskMemo.trim(),
      watchLevel: form.watchLevel,
      createdAt: editingStock?.createdAt ?? now,
      updatedAt: now
    };

    if (!stock.code || !stock.name) {
      return;
    }

    onSave(stock);

    if (!editingStock) {
      setForm(emptyForm);
    }
  };

  return (
    <form className="stock-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          <span>銘柄コード</span>
          <input
            value={form.code}
            onChange={(event) => update("code", event.target.value)}
            placeholder="402A"
            required
          />
        </label>
        <label>
          <span>銘柄名</span>
          <input
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="アクセルスペースホールディングス"
            required
          />
        </label>
        <label>
          <span>市場</span>
          <input
            value={form.market}
            onChange={(event) => update("market", event.target.value)}
            placeholder="グロース"
          />
        </label>
        <label>
          <span>監視頻度</span>
          <select
            value={form.watchLevel}
            onChange={(event) => update("watchLevel", event.target.value as WatchLevel)}
          >
            {watchLevels.map((level) => (
              <option key={level} value={level}>
                {watchLevelLabels[level]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label>
        <span>別名・略称</span>
        <input
          value={form.aliases}
          onChange={(event) => update("aliases", event.target.value)}
          placeholder="アクセルスペース, アクセルスペースHD"
        />
      </label>

      <div className="form-grid two">
        <label>
          <span>応援理由</span>
          <textarea
            value={form.watchReason}
            onChange={(event) => update("watchReason", event.target.value)}
            rows={4}
          />
        </label>
        <label>
          <span>怖いと思っている点</span>
          <textarea
            value={form.riskMemo}
            onChange={(event) => update("riskMemo", event.target.value)}
            rows={4}
          />
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" className="primary-button">
          {editingStock ? "更新" : "追加"}
        </button>
        {editingStock ? (
          <button type="button" className="ghost-button" onClick={onCancelEdit}>
            編集をやめる
          </button>
        ) : null}
      </div>
    </form>
  );
}

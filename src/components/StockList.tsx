import { useState } from "react";
import { watchLevelLabels } from "../labels";
import type { Stock } from "../types";
import { StockForm } from "./StockForm";

type StockListProps = {
  stocks: Stock[];
  onStocksChange: (stocks: Stock[]) => void;
  onAddSampleStocks: () => void;
};

export function StockList({ stocks, onStocksChange, onAddSampleStocks }: StockListProps) {
  const [editingStock, setEditingStock] = useState<Stock | undefined>();

  const saveStock = (stock: Stock) => {
    const exists = stocks.some((item) => item.id === stock.id);
    const next = exists
      ? stocks.map((item) => (item.id === stock.id ? stock : item))
      : [...stocks, stock];

    onStocksChange(next);
    setEditingStock(undefined);
  };

  const deleteStock = (stock: Stock) => {
    if (!window.confirm(`${stock.name} を削除しますか？`)) {
      return;
    }

    onStocksChange(stocks.filter((item) => item.id !== stock.id));
  };

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <h2>銘柄</h2>
          <p>保有株や気になる株を登録します。保有数、取得単価、評価額は扱いません。</p>
        </div>
        <button type="button" className="primary-button" onClick={onAddSampleStocks}>
          サンプル銘柄を追加
        </button>
      </div>

      <StockForm
        editingStock={editingStock}
        onCancelEdit={() => setEditingStock(undefined)}
        onSave={saveStock}
      />

      <div className="stock-list">
        {stocks.map((stock) => (
          <article key={stock.id} className="stock-card">
            <div className="stock-card-heading">
              <div>
                <h3>{stock.name}</h3>
                <p>
                  {stock.code}
                  {stock.market ? ` / ${stock.market}` : ""}
                </p>
              </div>
              <span className="watch-pill">{watchLevelLabels[stock.watchLevel]}</span>
            </div>
            {stock.aliases.length > 0 ? (
              <p className="alias-line">別名: {stock.aliases.join(", ")}</p>
            ) : null}
            <div className="stock-notes">
              <div>
                <h4>応援理由</h4>
                <p>{stock.watchReason || "未入力"}</p>
              </div>
              <div>
                <h4>怖い点</h4>
                <p>{stock.riskMemo || "未入力"}</p>
              </div>
            </div>
            <div className="card-actions">
              <button type="button" onClick={() => setEditingStock(stock)}>
                編集
              </button>
              <button type="button" className="danger-button" onClick={() => deleteStock(stock)}>
                削除
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

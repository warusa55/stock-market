import { Disclaimer } from "./Disclaimer";
import type { ReactNode } from "react";

export type TabKey = "dashboard" | "stocks" | "dictionary" | "settings";

type LayoutProps = {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  children: ReactNode;
};

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "dashboard", label: "今日の注意候補" },
  { key: "stocks", label: "銘柄" },
  { key: "dictionary", label: "辞書" },
  { key: "settings", label: "設定" }
];

export function Layout({ activeTab, onTabChange, children }: LayoutProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">学習補助ツール v0.1</p>
          <h1>開示よみときノート</h1>
        </div>
        <nav className="tab-nav" aria-label="画面切り替え">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={tab.key === activeTab ? "active" : ""}
              type="button"
              onClick={() => onTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>
      <main>{children}</main>
      <Disclaimer />
    </div>
  );
}

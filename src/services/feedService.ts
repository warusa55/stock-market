import type { FeedItem } from "../types";

export type FeedLoadResult = {
  feeds: FeedItem[];
  loadedAt: string;
};

const isFeedItem = (value: unknown): value is FeedItem => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as FeedItem;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.url === "string" &&
    typeof item.source === "string"
  );
};

export async function loadFeeds(): Promise<FeedLoadResult> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/feeds.json`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`feeds.json の読み込みに失敗しました: ${response.status}`);
  }

  const json: unknown = await response.json();
  const feeds = Array.isArray(json) ? json.filter(isFeedItem) : [];

  return {
    feeds,
    loadedAt: new Date().toISOString()
  };
}

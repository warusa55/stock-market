import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const OUTPUT_PATH = "public/data/feeds.json";

const FEED_SOURCES = [
  {
    source: "tdnet",
    kind: "rss",
    url: "https://example.com/tdnet.xml",
    enabled: false
  },
  {
    source: "edinet",
    kind: "rss-or-api",
    url: "https://example.com/edinet.xml",
    enabled: false
  },
  {
    source: "news",
    kind: "rss",
    url: "https://example.com/news.xml",
    enabled: false
  }
];

const todayJst = () => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  return formatter.format(new Date());
};

const htmlDecode = (value) =>
  value
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();

const stripTags = (value) => htmlDecode(value.replace(/<[^>]+>/g, ""));

const extractTag = (block, tag) => {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? stripTags(match[1]) : "";
};

const extractAtomLink = (block) => {
  const match = block.match(/<link[^>]*href=["']([^"']+)["'][^>]*>/i);
  return match ? htmlDecode(match[1]) : "";
};

const hashId = (source, title, url) => {
  const hash = createHash("sha1").update(`${source}:${title}:${url}`).digest("hex").slice(0, 12);
  return `${source}-${hash}`;
};

const sourceDocumentType = (source) => {
  if (source === "tdnet") {
    return "適時開示";
  }

  if (source === "edinet") {
    return "EDINET";
  }

  return "ニュース";
};

const parseXmlFeed = (xml, source) => {
  const rssBlocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];
  const atomBlocks = xml.match(/<entry\b[\s\S]*?<\/entry>/gi) ?? [];
  const blocks = rssBlocks.length > 0 ? rssBlocks : atomBlocks;

  return blocks
    .map((block) => {
      const title = extractTag(block, "title");
      const link = extractTag(block, "link") || extractAtomLink(block);
      const publishedAt =
        extractTag(block, "pubDate") || extractTag(block, "published") || extractTag(block, "updated");

      if (!title || !link) {
        return undefined;
      }

      return {
        id: hashId(source, title, link),
        title,
        url: link,
        source,
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
        documentType: sourceDocumentType(source),
        raw: {
          importedFrom: "rss"
        }
      };
    })
    .filter(Boolean);
};

const fetchText = async (url) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": "disclosure-reading-note/0.1"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timer);
  }
};

const buildSampleFeeds = () => {
  const date = todayJst();
  const idDate = date.replace(/-/g, "");

  const samples = [
    {
      title: "第三者割当による新株予約権の発行に関するお知らせ",
      companyName: "アクセルスペースホールディングス",
      code: "402A",
      time: "09:00:00",
      documentType: "適時開示"
    },
    {
      title: "通期業績予想の修正に関するお知らせ",
      companyName: "アイスペース",
      code: "9348",
      time: "09:15:00",
      documentType: "適時開示"
    },
    {
      title: "自己株式取得に係る事項の決定に関するお知らせ",
      companyName: "サンプル株式会社",
      code: "9999",
      time: "10:00:00",
      documentType: "適時開示"
    },
    {
      title: "継続企業の前提に関する重要事象等",
      companyName: "アクセルスペースホールディングス",
      code: "402A",
      time: "10:30:00",
      documentType: "適時開示"
    },
    {
      title: "監査法人の異動に関するお知らせ",
      companyName: "アイスペース",
      code: "9348",
      time: "11:00:00",
      documentType: "適時開示"
    },
    {
      title: "主要株主の異動に関するお知らせ",
      companyName: "サンプル株式会社",
      code: "9999",
      time: "11:30:00",
      documentType: "適時開示"
    },
    {
      title: "大型受注に関するお知らせ",
      companyName: "アクセルスペースホールディングス",
      code: "402A",
      time: "12:00:00",
      documentType: "適時開示"
    },
    {
      title: "2026年3月期 決算短信",
      companyName: "アイスペース",
      code: "9348",
      time: "13:00:00",
      documentType: "決算短信"
    },
    {
      title: "臨時報告書",
      companyName: "アクセルスペースホールディングス",
      code: "402A",
      time: "14:00:00",
      documentType: "EDINET"
    },
    {
      title: "大量保有報告書",
      companyName: "サンプル株式会社",
      code: "9999",
      time: "14:30:00",
      documentType: "EDINET"
    }
  ];

  return samples.map((sample, index) => ({
    id: `sample-${idDate}-${String(index + 1).padStart(3, "0")}`,
    title: sample.title,
    url: `https://example.com/disclosure/${idDate}-${String(index + 1).padStart(3, "0")}`,
    source: "sample",
    publishedAt: `${date}T${sample.time}+09:00`,
    companyName: sample.companyName,
    code: sample.code,
    documentType: sample.documentType
  }));
};

const uniqueFeeds = (feeds) => {
  const seen = new Set();
  const result = [];

  for (const feed of feeds) {
    const key = feed.url
      ? `url:${feed.url}`
      : `title:${feed.title}:${feed.companyName ?? ""}:${feed.code ?? ""}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(feed);
  }

  return result;
};

const main = async () => {
  const collected = [];

  for (const feedSource of FEED_SOURCES) {
    if (!feedSource.enabled) {
      console.log(`skip ${feedSource.source}: disabled`);
      continue;
    }

    try {
      const xml = await fetchText(feedSource.url);
      const parsed = parseXmlFeed(xml, feedSource.source);
      collected.push(...parsed);
      console.log(`fetched ${feedSource.source}: ${parsed.length} items`);
    } catch (error) {
      console.warn(
        `failed ${feedSource.source}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  const feeds = uniqueFeeds([...collected, ...buildSampleFeeds()]).sort((a, b) =>
    (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "")
  );

  await mkdir("public/data", { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(feeds, null, 2)}\n`, "utf8");
  console.log(`wrote ${OUTPUT_PATH}: ${feeds.length} items`);
};

await main();

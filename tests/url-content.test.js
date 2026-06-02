import assert from "node:assert/strict";
import test from "node:test";
import { extractUrlContentFromHtml } from "../src/core/url-content.js";

test("extractUrlContentFromHtml reads title and description from html", () => {
  const content = extractUrlContentFromHtml(
    `
      <html>
        <head>
          <title>自己株式の取得状況に関するお知らせ</title>
          <meta name="description" content="自己株式取得の途中経過を知らせる開示です。">
        </head>
        <body>
          <script>ignore()</script>
          <p>本文に自社株買いの進捗があります。</p>
        </body>
      </html>
    `,
    { url: "https://example.test/disclosure" }
  );

  assert.equal(content.url, "https://example.test/disclosure");
  assert.equal(content.title, "自己株式の取得状況に関するお知らせ");
  assert.equal(content.bodyExcerpt, "自己株式取得の途中経過を知らせる開示です。");
});

test("extractUrlContentFromHtml falls back to body text", () => {
  const content = extractUrlContentFromHtml("<main>大量保有報告書の変更報告書が提出された。</main>", {
    bodyLimit: 10
  });

  assert.equal(content.title, "URL取得メモ");
  assert.equal(content.bodyExcerpt, "大量保有報告書の変更");
});

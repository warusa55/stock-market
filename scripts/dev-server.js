import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { extractUrlContentFromHtml } from "../src/core/url-content.js";
import { normalizeTdnetResponse } from "../src/plugins/stock/tdnet-acquisition.js";

const DEFAULT_PORT = 6173;
const MAX_PORT_ATTEMPTS = 20;
const FETCH_TIMEOUT_MS = 8000;
const ROOT = process.cwd();

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8"
};

function parsePort() {
  const cliPort = process.argv.find((arg) => arg.startsWith("--port="))?.slice("--port=".length);
  const value = Number(cliPort ?? process.env.PORT ?? DEFAULT_PORT);
  return Number.isInteger(value) && value > 0 ? value : DEFAULT_PORT;
}

function isInsideRoot(filePath) {
  const rootWithSeparator = ROOT.endsWith(sep) ? ROOT : `${ROOT}${sep}`;
  return filePath === ROOT || filePath.startsWith(rootWithSeparator);
}

function resolveRequestPath(pathname) {
  const cleanPath = decodeURIComponent(pathname).replaceAll("\\", "/");
  const filePath = resolve(ROOT, `.${cleanPath}`);

  if (!isInsideRoot(filePath)) {
    return null;
  }

  return filePath;
}

function sendText(response, statusCode, text) {
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8"
  });
  response.end(text);
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

function isBlockedFetchHost(hostname) {
  const host = String(hostname ?? "").toLowerCase();
  return (
    host === "localhost" ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host === "[::1]" ||
    host.startsWith("127.") ||
    host.startsWith("10.") ||
    host.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
  );
}

async function handleUrlContentRequest(url, response) {
  const target = url.searchParams.get("url");
  let targetUrl;

  try {
    targetUrl = new URL(target);
  } catch {
    sendJson(response, 400, { error: "invalid_url" });
    return;
  }

  if (!["http:", "https:"].includes(targetUrl.protocol) || isBlockedFetchHost(targetUrl.hostname)) {
    sendJson(response, 400, { error: "blocked_url" });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const upstream = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "ContextPlatformDevServer/0.1"
      }
    });
    const html = await upstream.text();

    if (!upstream.ok) {
      sendJson(response, upstream.status, { error: "fetch_failed", status: upstream.status });
      return;
    }

    sendJson(response, 200, extractUrlContentFromHtml(html, { url: targetUrl.href }));
  } catch {
    sendJson(response, 502, { error: "fetch_failed" });
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeTickerCode(value) {
  return String(value ?? "").trim().toUpperCase();
}

async function handleStockTdnetRequest(url, response) {
  const ticker = normalizeTickerCode(url.searchParams.get("ticker"));
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 10), 1), 30);

  if (!/^(?:\d{4}|\d{3}[A-Z])$/.test(ticker)) {
    sendJson(response, 400, { error: "invalid_ticker" });
    return;
  }

  const targetUrl = new URL(`https://webapi.yanoshin.jp/webapi/tdnet/list/${encodeURIComponent(ticker)}.json`);
  targetUrl.searchParams.set("limit", String(limit));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const upstream = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "ContextPlatformDevServer/0.1"
      }
    });

    if (!upstream.ok) {
      sendJson(response, upstream.status, { error: "tdnet_fetch_failed", status: upstream.status });
      return;
    }

    const payload = await upstream.json();
    sendJson(response, 200, normalizeTdnetResponse(payload, { tickerCode: ticker }));
  } catch {
    sendJson(response, 502, { error: "tdnet_fetch_failed" });
  } finally {
    clearTimeout(timeout);
  }
}

function createStaticServer() {
  return createServer((request, response) => {
    if (!request.url || request.method !== "GET") {
      sendText(response, 405, "Method not allowed");
      return;
    }

    const url = new URL(request.url, "http://localhost");
    if (url.pathname === "/api/url-content") {
      handleUrlContentRequest(url, response);
      return;
    }
    if (url.pathname === "/api/stock/tdnet") {
      handleStockTdnetRequest(url, response);
      return;
    }

    if (url.pathname === "/") {
      response.writeHead(302, {
        Location: `/apps/web/index.html${url.search}`
      });
      response.end();
      return;
    }

    const filePath = resolveRequestPath(url.pathname);
    if (!filePath) {
      sendText(response, 403, "Forbidden");
      return;
    }

    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      sendText(response, 404, "Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": mimeTypes[extname(filePath)] ?? "application/octet-stream",
      "Cache-Control": "no-store"
    });
    createReadStream(filePath).pipe(response);
  });
}

function listen(server, port) {
  return new Promise((resolveListen, reject) => {
    server.once("error", (error) => {
      if (error.code === "EADDRINUSE") {
        resolveListen(null);
        return;
      }
      reject(error);
    });

    server.listen(port, "127.0.0.1", () => {
      resolveListen(server);
    });
  });
}

async function start() {
  const requestedPort = parsePort();

  for (let offset = 0; offset < MAX_PORT_ATTEMPTS; offset += 1) {
    const port = requestedPort + offset;
    const server = createStaticServer();
    const listeningServer = await listen(server, port);

    if (listeningServer) {
      console.log(`Context Platform dev server`);
      console.log(`Local: http://127.0.0.1:${port}/apps/web/index.html`);
      console.log(`Market stock: http://127.0.0.1:${port}/apps/web/index.html?registry=market&domain=stock`);
      console.log(`Market fund: http://127.0.0.1:${port}/apps/web/index.html?registry=market&domain=fund`);
      console.log(`Company: http://127.0.0.1:${port}/apps/web/index.html?registry=company`);
      return;
    }
  }

  throw new Error(`No free port found from ${requestedPort}`);
}

start().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

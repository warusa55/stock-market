import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";

const DEFAULT_PORT = 6173;
const MAX_PORT_ATTEMPTS = 20;
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

function createStaticServer() {
  return createServer((request, response) => {
    if (!request.url || request.method !== "GET") {
      sendText(response, 405, "Method not allowed");
      return;
    }

    const url = new URL(request.url, "http://localhost");
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

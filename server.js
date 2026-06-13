import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const PORT = 5173;
const ROOT = normalize(process.cwd());

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

export function createStaticServer(rootDirectory = process.cwd()) {
  const root = normalize(rootDirectory);

  return createServer((request, response) => {
    const url = new URL(request.url ?? "/", `http://localhost:${PORT}`);
    const requestedPath = normalize(join(root, decodeURIComponent(url.pathname)));
    const safePath = requestedPath.startsWith(root) ? requestedPath : join(root, "index.html");
    const filePath = resolveFilePath(safePath);

    if (!filePath) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": CONTENT_TYPES[extname(filePath)] ?? "application/octet-stream"
    });
    createReadStream(filePath).pipe(response);
  });
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  createStaticServer(ROOT).listen(PORT, () => {
    console.log(`AI voice drawing tool running at http://localhost:${PORT}`);
  });
}

function resolveFilePath(path) {
  if (!existsSync(path)) return null;
  const stats = statSync(path);
  if (stats.isDirectory()) {
    const indexPath = join(path, "index.html");
    return existsSync(indexPath) ? indexPath : null;
  }
  return path;
}

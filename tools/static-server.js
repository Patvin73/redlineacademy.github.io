const http = require("http");
const path = require("path");
const fs = require("fs");

const rootDir = process.cwd();
const port = Number(process.env.PORT || 8000);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const rel = decoded === "/" ? "/index.html" : decoded;
  const resolved = path.resolve(rootDir, "." + rel);
  if (!resolved.startsWith(rootDir)) return null;
  return resolved;
}

const server = http.createServer((req, res) => {
  const target = safePath(req.url || "/");
  if (!target) {
    res.statusCode = 400;
    res.end("Bad Request");
    return;
  }

  fs.stat(target, (err, stat) => {
    if (err || !stat.isFile()) {
      res.statusCode = 404;
      res.end("Not Found");
      return;
    }

    const ext = path.extname(target).toLowerCase();
    res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");
    fs.createReadStream(target).pipe(res);
  });
});

server.listen(port, "127.0.0.1", () => {
  // eslint-disable-next-line no-console
  console.log(`Static server running at http://localhost:${port}`);
});

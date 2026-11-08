import { createServer } from "node:http"
import { readFile, stat } from "node:fs/promises"
import { dirname, extname, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

const directory = resolve(dirname(fileURLToPath(import.meta.url)), "../dist")
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml; charset=utf-8" }
const port = Number(process.env.PORT || 3000)
try { await stat(resolve(directory, "index.html")) } catch { throw new Error("Run npm run build before npm run preview.") }
createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname)
    let file = resolve(directory, `.${pathname}`)
    if (!file.startsWith(directory + sep) && file !== directory) { response.writeHead(403); response.end(); return }
    if ((await stat(file)).isDirectory()) file = resolve(file, "index.html")
    const body = await readFile(file)
    response.writeHead(200, { "Content-Type": types[extname(file).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" })
    response.end(request.method === "HEAD" ? undefined : body)
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); response.end("Not found")
  }
}).listen(port, "127.0.0.1", () => console.log(`Preview: http://localhost:${port}`))

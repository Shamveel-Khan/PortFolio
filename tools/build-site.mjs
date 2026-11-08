import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import { dirname, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const output = resolve(root, "dist")
const json = async (file) => JSON.parse(await readFile(resolve(root, file), "utf8"))
const localPath = (url) => {
  const file = resolve(root, url.replace(/^\//, "").split(/[?#]/)[0])
  if (!file.startsWith(root + sep)) throw new Error(`Asset escapes the project: ${url}`)
  return file
}
const exists = (file) => typeof file === "string" && existsSync(localPath(file))
const required = (file) => { if (!exists(file)) throw new Error(`Missing required asset: ${file}`) }
const escape = (value) => String(value).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch])

const profile = await json("data/profile.json")
const contact = await json("data/contact.json")
const projects = await json("data/projects.json")
const cosmos = await json("data/cosmos.json")
const seen = new Set()
required(profile.portrait)
for (const project of projects) {
  if (!project.id || seen.has(project.id)) throw new Error(`Duplicate or missing project ID: ${project.id}`)
  seen.add(project.id); required(project.imageUrl)
  if (project.link && !["https:", "http:"].includes(new URL(project.link).protocol)) throw new Error(`Invalid project link: ${project.id}`)
}
for (const link of contact.links) {
  if (!["https:", "http:", "mailto:"].includes(new URL(link.url).protocol)) throw new Error(`Invalid contact link: ${link.id}`)
}
for (const atlas of cosmos.atlases) {
  required(atlas.src); required(atlas.src.replace(/\.webp$/, "-sm.webp"))
}

// The captured cosmos contains references to originals not in this repository.
// Preserve stable image IDs and use the existing atlas for unavailable originals.
cosmos.missingHi = cosmos.images.flatMap((image, index) => exists(image[4]) ? [] : [index])
const imagesByMedia = new Map(cosmos.images.map((image) => [`${image[0]}:${image[1]}`, image]))
const coversByProject = new Map()
for (const image of cosmos.images) if (!coversByProject.has(image[0])) coversByProject.set(image[0], image)
let stillFallbacks = 0, atlasFallbacks = 0, videoFallbacks = 0
for (const [projectIndex, project] of cosmos.projects.entries()) {
  for (const [mediaIndex, media] of project.m.entries()) {
    if (!exists(media.s)) {
      let image = imagesByMedia.get(`${projectIndex}:${mediaIndex}`)
      if (!image) { media.unavailable = true; image = coversByProject.get(projectIndex) }
      if (!image) throw new Error(`No atlas fallback for cosmos media ${projectIndex}:${mediaIndex}`)
      if (exists(image[4])) { media.s = image[4]; stillFallbacks++ }
      else {
        const atlas = cosmos.atlases[image[2]]
        media.s = atlas.src
        media.atlas = { layer: image[2], slot: image[3] }
        media.w = 256; media.h = 192
        atlasFallbacks++
      }
    }
    if (media.v && !exists(media.v)) { delete media.v; videoFallbacks++ }
    required(media.s)
  }
}

const publicFiles = ["index.html", "app.js", "projects.js", "tile-story.js", "style.css", "track.js", "logo.png", "favicon.ico", "favicon-32.png", "apple-touch-icon.png"]
const publicDirectories = ["atlas", "fonts", "full", "hq43", "images", "vendor"]
await rm(output, { recursive: true, force: true })
await mkdir(resolve(output, "data"), { recursive: true })
for (const file of [...publicFiles, ...publicDirectories]) {
  required(file)
  await cp(localPath(file), resolve(output, file), { recursive: true })
}
for (const name of ["profile", "contact", "projects"]) await cp(resolve(root, `data/${name}.json`), resolve(output, `data/${name}.json`))
await writeFile(resolve(output, "data/cosmos.json"), JSON.stringify(cosmos))

let html = await readFile(resolve(output, "index.html"), "utf8")
// Verify direct HTML and CSS references before shipping the output directory.
for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
  const url = match[1]
  if (/^(?:https?:|mailto:|data:|#|\?)/.test(url) || url === "/") continue
  if (!url.includes("/?")) required(url)
}
for (const match of (await readFile(resolve(root, "style.css"), "utf8")).matchAll(/url\(["']?([^)'"\s]+)["']?\)/g)) {
  if (!/^(?:https?:|data:|#)/.test(match[1])) required(match[1])
}

const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
let origin = null
if (host) {
  origin = new URL(host.startsWith("https://") ? host : `https://${host}`).origin
  const image = new URL(profile.portrait, origin).href
  html = html.replace(/(<link rel="canonical" href=")[^"]*/, `$1${escape(origin + "/")}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${escape(origin + "/")}`)
    .replace(/(<meta (?:property="og:image"|name="twitter:image") content=")[^"]*/g, `$1${escape(image)}`)
}
if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") html = html.replace("</head>", '<meta name="robots" content="noindex, nofollow">\n</head>')
const email = contact.links.find((link) => link.url.startsWith("mailto:"))
if (email) html = html.replace(/<a([^>]*?)href="mailto:[^"]*"([^>]*?data-email-link[^>]*)>[^<]*<\/a>/g, `<a$1href="${escape(email.url)}"$2>${escape(email.url.slice(7))}</a>`)
await writeFile(resolve(output, "index.html"), html)
await writeFile(resolve(output, "robots.txt"), process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production" ? "User-agent: *\nDisallow: /\n" : `User-agent: *\nAllow: /\n${origin ? `Sitemap: ${origin}/sitemap.xml\n` : ""}`)
if (origin) await writeFile(resolve(output, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escape(origin)}/</loc></url></urlset>\n`)

// Check that private/local directories can never leak into the static output.
for (const name of [".git", ".env", ".aws", ".agents", ".codex", "tools", "data/cosmos.backup.json"]) {
  if (existsSync(resolve(output, name))) throw new Error(`Unexpected file in deployment: ${name}`)
}
console.log(`Built dist/: ${projects.length} projects, ${cosmos.cells.length} tiles.`)
console.log(`Resolved legacy media: ${stillFallbacks} existing stills, ${atlasFallbacks} atlas previews, ${videoFallbacks} unavailable videos replaced with stills.`)
console.log(`${cosmos.missingHi.length} unavailable high-resolution swaps safely use their original atlas tiles.`)

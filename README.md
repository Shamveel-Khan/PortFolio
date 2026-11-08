# Shamveel Khan — Portfolio

Static Three.js portfolio with one shared tile mesh driving the Hero, Projects, About, and Contact sections. No API keys, database, server functions, or runtime dependencies are required.

## Deploy to Vercel

1. Push this repository, including the new configuration and build scripts, to GitHub.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Use the repository root as **Root Directory**. The checked-in `vercel.json` sets:

   | Setting | Value |
   | --- | --- |
   | Framework Preset | Other |
   | Node.js | 22.x |
   | Install Command | `npm ci --ignore-scripts` |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |

4. Click **Deploy**. No custom environment variables are needed.

To collect traffic statistics, open the project's **Analytics** tab in Vercel,
enable **Web Analytics**, then deploy this version. The HTML already includes
the deferred `/_vercel/insights/script.js` integration; no npm package is needed.
Vercel supplies that endpoint in deployments, so it is not available in the local
static preview. See the [official setup guide](https://vercel.com/docs/analytics/quickstart).

The settings follow [Vercel's project configuration](https://vercel.com/docs/project-configuration/vercel-json). Vercel serves only the generated `dist/` directory. Missing paths return a real 404; there is no catch-all rewrite that could turn a missing JSON file or JavaScript module into HTML.

## Local verification

Use Node.js 22:

```sh
npm ci --ignore-scripts
npm run check
npm run build
npm run preview
```

Open `http://localhost:3000`. Preview serves the production output, including the JSON content, fonts, atlas textures, and correct JavaScript MIME types. Edit source files and rerun the build to update it.

## Update content

- `data/profile.json`: About biography, portrait, education, location, role.
- `data/contact.json`: GitHub, LinkedIn, and email links.
- `data/projects.json`: gallery cards, ordering, categories, and internship visibility.
- `images/`: project images and the About portrait.

Keep each project ID unique. `showInAllCategories: true` makes a single entry appear in every filter without duplicating it in All. A `null` project link displays a card without an outbound link. Email contact uses `mailto:`; no contact API is required.

## Production build

The dependency-free build copies public assets, validates the gallery images, portrait, contact links, atlas variants, HTML and CSS asset paths, and duplicate project IDs. It excludes Git metadata, development scripts, credentials, and cosmos backups from the public output.

The captured `data/cosmos.json` references legacy full-size images and videos that are absent from the repository. The build leaves this source file unchanged and repairs only `dist/data/cosmos.json`: available full-size images are used first, and the existing atlas supplies lower-resolution previews where originals are missing. Missing high-resolution tile upgrades are skipped; existing atlas tiles stay visible. Add the original assets at their referenced paths and rebuild to use them automatically.

On Vercel, public deployment host variables generate absolute canonical/social image URLs and a sitemap. Preview deployments get `noindex` metadata and a disallowing `robots.txt`. HTML, code, and JSON revalidate so content updates do not remain stuck in a browser cache; Vercel still provides automatic static CDN caching.

Before publishing a custom domain, check the generated canonical URL and sitemap. The old analytics identifiers in the captured HTML are inactive outside the original owner's domain; configure your own analytics separately if wanted.

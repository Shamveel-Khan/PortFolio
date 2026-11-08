// These canvases are glyph/path SAMPLERS, never displayed or uploaded as textures.
// Every returned destination is rendered by the portrait's existing InstancedMesh.
const clamp = (x) => Math.max(0, Math.min(1, x))
const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x) }
const range = (x, a, b) => smooth((x - a) / (b - a))
const mix = (a, b, t) => a + (b - a) * t

// Vector silhouettes are sampled to destinations, so icons remain real image tiles.
const ICONS = {
  github: "M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.71 1.25 3.37.96.1-.75.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.16 1.18A11 11 0 0 1 12 6c.98 0 1.97.13 2.89.39 2.19-1.49 3.15-1.18 3.15-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.4-5.27 5.69.42.36.79 1.06.79 2.14v3.16c0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z",
  linkedin: "M2 8h4v14H2ZM4 1a2.4 2.4 0 1 1 0 4.8A2.4 2.4 0 0 1 4 1ZM9 8h4v1.9c.8-1.3 2.1-2.2 4.3-2.2 4 0 4.7 2.6 4.7 6V22h-4v-7.4c0-1.8 0-3.5-2.2-3.5s-2.8 1.7-2.8 3.4V22H9Z",
  gmail: "M2 4h3l7 5.3L19 4h3v16h-4V9.5l-6 4.6-6-4.6V20H2Z"
}

export function createTileStory({ reduced }) {
  const about = document.querySelector("#about-chapter"), contact = document.querySelector("#contact-chapter")
  const content = document.querySelector("#about-content"), contactCopy = document.querySelector("#contact-copy")
  const contactNav = document.querySelector("#contact-icons")
  const state = { active: false, progress: 1, offset: 0, selected: 0, hover: 0, targets: [], revision: 100000, ink: 0, visible: true }
  let profile = null, contacts = null, dirty = true, w = 0, h = 0, n = 0
  let storyHeight = 0, aboutTop = Infinity, contactTop = Infinity, current = "", anchors = [], wasEnabled = true
  let wall = [], aboutShape = [], contactTitle = [], contactShape = []
  const readJSON = async (path) => { const r = await fetch(path); if (!r.ok) throw new Error(path); return r.json() }
  const ready = Promise.all([readJSON("data/profile.json"), readJSON("data/contact.json")]).then(([p, c]) => {
    profile = p; contacts = c
    document.querySelectorAll("[data-profile]").forEach((el) => {
      const key = el.dataset.profile
      if (key === "portrait") { el.src = p.portrait; el.alt = p.portraitAlt; return }
      if (typeof p[key] === "string") el.textContent = p[key]
    })
    document.querySelectorAll("[data-profile-bio]").forEach((el) => {
      el.replaceChildren(...p.biography.map((text) => { const para = document.createElement("p"); para.textContent = text; return para }))
    })
    document.querySelectorAll("[data-profile-interests]").forEach((el) => {
      el.replaceChildren(...p.interests.map((text) => { const span = document.createElement("span"); span.textContent = text; return span }))
    })
    document.querySelectorAll("[data-contact-copy]").forEach((el) => { el.textContent = c[el.dataset.contactCopy] ?? "" })
    const title = `${p.name} | ${p.role}`
    document.title = title
    document.querySelectorAll('meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]').forEach((el) => el.content = p.heroIntro)
    document.querySelectorAll('meta[property="og:title"], meta[name="twitter:title"]').forEach((el) => el.content = title)
    const canonical = document.querySelector('link[rel="canonical"]')
    // Production builds supply an absolute canonical URL. Preserve that URL on
    // preview deployments instead of replacing it with the current preview host.
    if (!/^https?:\/\//.test(canonical.getAttribute("href") || "")) canonical.href = new URL(location.pathname, location.origin).href
    document.querySelector('meta[property="og:url"]').content = canonical.href
    document.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]').forEach((el) => el.content = new URL(p.portrait, new URL(canonical.href).origin).href)
    contactNav.setAttribute("aria-label", `Contact ${p.name}`)
    anchors = c.links.map((link, i) => {
      const a = makeLink(link); a.className = "contact-hit-target"; a.setAttribute("aria-label", link.label)
      const span = document.createElement("span"); span.className = "projects-sr"; span.textContent = link.label; a.append(span)
      a.addEventListener("pointerenter", () => { state.hover = i + 1 })
      a.addEventListener("pointerleave", () => { state.hover = 0 })
      a.addEventListener("focus", () => { state.hover = i + 1 })
      a.addEventListener("blur", () => { state.hover = 0 })
      contactNav.append(a); return a
    })
    document.querySelectorAll("[data-contact-links]").forEach((el) => {
      el.replaceChildren(...c.links.map((link) => { const a = makeLink(link); a.textContent = link.label; return a }))
    })
    document.querySelectorAll("[data-email-link]").forEach((el) => {
      const email = c.links.find((link) => link.url.startsWith("mailto:"))
      if (email) { el.href = email.url; el.textContent = email.url.slice(7) }
    })
    dirty = true
  }).catch((error) => {
    console.error("Portfolio content could not load", error)
    document.querySelector("#story-status").textContent = "About and contact information could not load. Please refresh to try again."
  })
  function makeLink(link) {
    const a = document.createElement("a")
    const url = new URL(link.url, location.href)
    if (["https:", "http:", "mailto:"].includes(url.protocol)) a.href = url.href
    if (url.protocol !== "mailto:") { a.target = "_blank"; a.rel = "noopener noreferrer" }
    return a
  }
  document.querySelectorAll("[data-story-go]").forEach((el) => el.addEventListener("click", () => go(el.dataset.storyGo)))
  document.fonts?.ready.then(() => { dirty = true })
  const observer = new ResizeObserver(() => { measure() })
  observer.observe(document.querySelector(".projects-gallery"))
  function measure() {
    aboutTop = about.getBoundingClientRect().top + scrollY
    contactTop = contact.getBoundingClientRect().top + scrollY
  }

  function layout(width, height, count) {
    const sameMobileViewport = width <= 600 && width === w && Math.abs(height - storyHeight) < 180
    w = width; h = height; n = count
    if (!sameMobileViewport || !storyHeight) storyHeight = height
    const H = storyHeight
    about.style.height = `${H * 4}px`; contact.style.height = `${H * 3.2}px`
    about.style.setProperty("--chapter-height", `${H}px`); contact.style.setProperty("--chapter-height", `${H}px`)
    measure()
    wall = []
    const cols = Math.ceil(Math.sqrt(n * w / H * .75)), rows = Math.ceil(n / cols)
    for (let k = 0; k < n; k++) {
      const col = k % cols, row = Math.floor(k / cols)
      wall.push({ x: (col + .5) * w / cols, y: (row + .5) * H / rows, size: H / rows * (.55 + (k * 17 % 31) / 100), dim: .42 + (k % 7) * .05, group: 0 })
    }
    const canvas = document.createElement("canvas"); canvas.width = Math.ceil(w); canvas.height = Math.ceil(H)
    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    function sample(draw, group, step) {
      ctx.clearRect(0, 0, w, H); ctx.fillStyle = "white"; draw()
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data, out = []
      for (let y = 0; y < H; y += step) for (let x = 0; x < w; x += step) {
        if (pixels[(Math.floor(y) * canvas.width + Math.floor(x)) * 4 + 3] > 110) out.push({ x, y, size: step * .86, dim: 1, group })
      }
      return out
    }
    function text(label, y, size, group = 0, step = 4) {
      return sample(() => { ctx.font = `800 ${size}px Arial, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(label, w / 2, y, w * .9) }, group, step)
    }
    function fill(points) {
      points.sort((a, b) => a.y - b.y || a.x - b.x)
      // Resample densely occupied glyphs to the existing instance budget.
      if (points.length > n) points = Array.from({ length: n }, (_, i) => points[Math.floor(i * points.length / n)])
      return Array.from({ length: n }, (_, k) => points[k] || { ...wall[k], size: 0, dim: 0 })
    }
    const size = Math.min(w * .22, H * .29, 260), step = Math.max(2, size / 46)
    aboutShape = fill(text(profile?.aboutWord || "ABOUT", H * .47, size, 0, step))
    contactTitle = fill(text(contacts?.word || "CONTACT", H * .47, size * .83, 0, step))
    const final = text(contacts?.word || "CONTACT", H * .34, size * .83, 0, step)
    const iconSize = Math.min(w * .135, H * .14, 110), centerY = H * .59
    const links = contacts?.links || [{ icon: "github", label: "GitHub" }, { icon: "linkedin", label: "LinkedIn" }, { icon: "gmail", label: "Gmail" }]
    links.forEach((link, i) => {
      const centerX = w * (.22 + i * .28)
      final.push(...sample(() => {
        ctx.save(); ctx.translate(centerX - iconSize / 2, centerY - iconSize / 2); ctx.scale(iconSize / 24, iconSize / 24)
        ctx.fill(new Path2D(ICONS[link.icon] || ICONS.gmail)); ctx.restore()
      }, i + 1, Math.max(1.6, iconSize / 30)))
      final.push(...sample(() => {
        ctx.font = '500 16px "Inter Tight", sans-serif'; ctx.textAlign = "center"; ctx.textBaseline = "middle"
        ctx.fillText(link.label, centerX, centerY + iconSize / 2 + 32)
      }, i + 1, 1.5))
      // A restrained tiled orbit around each icon doubles as its hit-area cue.
      for (let a = 0; a < Math.PI * 2; a += .07) final.push({ x: centerX + Math.cos(a) * (iconSize * .73), y: centerY + Math.sin(a) * (iconSize * .73), size: 1.4, dim: .3, group: i + 1 })
      if (anchors[i]) Object.assign(anchors[i].style, { left: `${centerX - iconSize * .82}px`, top: `${centerY - iconSize * .82}px`, width: `${iconSize * 1.64}px`, height: `${iconSize * 1.64 + 48}px` })
    })
    contactShape = fill(final)
    state.targets = Array.from({ length: n }, () => ({ x: 0, y: 0, size: 0, group: 0, dim: 0, depth: 160 }))
    state.revision++; dirty = false
  }

  function go(section) {
    measure()
    scrollTo({ top: section === "top" ? 0 : section === "about" ? aboutTop + storyHeight * 2.15 : contactTop + storyHeight * 1.95, behavior: reduced ? "instant" : "smooth" })
  }
  return {
    state, ready, go, get profile() { return profile }, get contacts() { return contacts },
    update(dt, width, height, count, enabled, now) {
      if (enabled && !wasEnabled) dirty = true
      wasEnabled = enabled
      const heightChanged = height !== h && !(width <= 600 && width === w && Math.abs(height - storyHeight) < 180)
      if (dirty || width !== w || heightChanged || count !== n) layout(width, height, count)
      h = height
      const y = scrollY, H = storyHeight
      // Bounds follow gallery filtering and image reflow through ResizeObserver.
      state.active = enabled && y >= aboutTop - H
      if (!state.active) { content.inert = true; contactNav.inert = true; return state }
      const isContact = y >= contactTop - H
      const phase = isContact ? "contact" : "about"
      if (phase !== current) { current = phase; state.revision++ }
      const t = (y - ((isContact ? contactTop : aboutTop) - H)) / H
      const forming = range(t, 1, 1.85), entering = range(t, 0, 1)
      const zoom = !isContact ? range(t, 2.15, 3.1) : 0
      const icons = isContact ? range(t, 2.02, 2.85) : 0
      const reveal = !isContact ? range(t, 2.48, 3.15) : 1
      const depth = mix(160, 9, zoom), scale = 160 / depth
      state.ink = forming; state.visible = isContact || zoom < 1
      if (!isContact) state.hover = 0
      const heading = isContact ? contactTitle : aboutShape
      for (let k = 0; k < n; k++) {
        const a = wall[k], b = heading[k], c = isContact ? contactShape[k] : b, point = state.targets[k]
        const bx = mix(b.x, c.x, icons), by = mix(b.y, c.y, icons)
        const ambient = reduced ? 0 : Math.sin(now * .0004 + k * 1.7) * (1 - forming) * 2
        point.x = w / 2 + (mix(a.x, bx, forming) - w / 2) * scale + ambient
        point.y = H * .47 + (mix(a.y, by, forming) - H * .47) * scale + (1 - entering) * H
        point.size = mix(a.size * entering, mix(b.size, c.size, icons), forming) * scale
        point.dim = mix(a.dim, mix(b.dim, c.dim, icons), forming) * (1 - range(zoom, .35, .94))
        point.depth = depth
        // Contact owns the icon groups for the whole chapter, avoiding GPU
        // attribute churn as icons gather; invisible slots stay zero-sized.
        point.group = isContact ? c.group : 0
      }
      content.style.setProperty("--reveal", reveal)
      content.inert = reveal < .8 || !enabled || document.body.classList.contains("boxed")
      content.setAttribute("aria-hidden", String(content.inert))
      const contactReady = isContact && icons > .96 && !document.body.classList.contains("boxed")
      contactNav.inert = !contactReady; contactNav.setAttribute("aria-hidden", String(!contactReady))
      contactCopy.style.opacity = isContact ? range(t, 2.45, 2.9) : 0
      contactCopy.inert = !contactReady
      contact.classList.toggle("contact-ready", contactReady)
      return state
    }
  }
}

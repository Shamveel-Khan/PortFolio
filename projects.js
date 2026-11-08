// Layout and gallery UI. The canvas below only samples glyph destinations;
// it is never displayed or used as a Three.js texture.
export const categories = [
  ["All", null], ["Full Stack", "Full Stack Development"],
  ["Frontend", "Frontend Development"], ["Backend", "Backend Development"],
  ["AI/ML", "AI/ML"], ["Cybersecurity", "Cybersecurity"], ["SQA", "SQA"]
]

export function matchesProjectCategory(project, index) {
  if (index === 0 || project.showInAllCategories) return true
  const keys = (project.categories || [project.category]).map((category) => category.toLowerCase().replace(/[^a-z]/g, ""))
  const aliases = [[], ["fullstack", "fullstackdevelopment"], ["frontend", "frontenddevelopment"], ["backend", "backenddevelopment"], ["ai", "aiml", "machinelearning", "artificialintelligence"], ["cybersecurity"], ["sqa", "qa", "softwarequalityassurance"]]
  return keys.some((key) => aliases[index]?.includes(key))
}

export function createProjects({ reduced, onExplore }) {
  const root = document.querySelector("#projects"), nav = document.querySelector("#project-categories")
  const grid = document.querySelector("#project-grid"), status = document.querySelector("#project-status")
  const runway = document.querySelector("#project-runway")
  const state = { progress: 0, offset: 0, selected: 1, hover: 0, targets: [], revision: 0, active: true }
  let data = [], cards = [], generation = 0, width = 0, height = 0, storyHeight = 0, budget = 0, end = 1
  let activeFilter = 0, layoutDirty = true, navTop = 0, navBottom = 0
  const buttons = categories.map(([label], index) => {
    const b = document.createElement("button")
    b.type = "button"; b.className = "tile-category"; b.dataset.category = index
    b.setAttribute("aria-label", label); b.setAttribute("aria-pressed", String(index === 0))
    b.setAttribute("aria-controls", "project-grid")
    b.innerHTML = `<span class="projects-sr">${label}</span>`
    b.style.setProperty("--label-width", `${label.length * 8.8}px`)
    b.addEventListener("pointerenter", () => { state.hover = index + 1 })
    b.addEventListener("pointerleave", () => { state.hover = 0 })
    b.addEventListener("focus", () => { state.hover = index + 1 })
    b.addEventListener("blur", () => { state.hover = 0 })
    b.addEventListener("click", () => filter(index))
    nav.append(b)
    return b
  })
  nav.addEventListener("keydown", (e) => {
    const i = buttons.indexOf(document.activeElement)
    if (i < 0 || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return
    e.preventDefault()
    buttons[e.key === "Home" ? 0 : e.key === "End" ? 6 : (i + (e.key === "ArrowRight" ? 1 : 6)) % 7].focus()
  })

  function render() {
    grid.replaceChildren()
    cards = data.map((p) => {
      const article = document.createElement("article"); article.className = "project-card"
      const a = document.createElement(p.link ? "a" : "div")
      a.className = "project-card-content"
      if (p.link) { a.href = p.link; a.target = "_blank"; a.rel = "noopener noreferrer" }
      const media = document.createElement("div"); media.className = "project-card-media"
      const img = document.createElement("img"); img.src = p.imageUrl; img.alt = p.name; img.loading = "lazy"; img.decoding = "async"
      img.width = 960; img.height = 600
      img.addEventListener("error", () => { img.hidden = true; media.classList.add("image-unavailable") }, { once: true })
      const arrow = document.createElement("span"); arrow.className = "project-arrow"; arrow.textContent = "↗"; arrow.setAttribute("aria-hidden", "true")
      media.append(img)
      if (p.link) media.append(arrow)
      const meta = document.createElement("div"); meta.className = "project-card-meta"
      const cat = document.createElement("span"); cat.textContent = p.category
      const date = document.createElement("span"); date.textContent = p.date
      meta.append(cat, date)
      const title = document.createElement("h3"); title.textContent = p.name
      const desc = document.createElement("p"); desc.textContent = p.description
      a.append(media, meta, title, desc); article.append(a); grid.append(article)
      return { article, project: p }
    })
    status.textContent = `${data.length} projects · All disciplines`
  }

  async function filter(index) {
    if (index === activeFilter) return
    activeFilter = index; state.selected = index + 1
    buttons.forEach((b, i) => b.setAttribute("aria-pressed", String(i === index)))
    const token = ++generation
    const visible = cards.filter(({ project }) => matchesProjectCategory(project, index))
    grid.setAttribute("aria-busy", "true")
    // The grid keeps its height during the exit, so a filter never moves the scroll position.
    grid.style.minHeight = `${grid.getBoundingClientRect().height}px`
    const exits = cards.filter(({ article }) => !article.hidden).map(({ article }) => {
      article.getAnimations().forEach((a) => a.cancel())
      return article.animate([{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(10px)" }], { duration: reduced ? 0 : 160, fill: "forwards" }).finished.catch(() => {})
    })
    await Promise.all(exits)
    if (token !== generation) return
    cards.forEach(({ article, project }) => {
      article.getAnimations().forEach((a) => a.cancel())
      article.hidden = !matchesProjectCategory(project, index)
    })
    document.querySelector("#project-empty").hidden = visible.length > 0
    status.textContent = `${visible.length} ${visible.length === 1 ? "project" : "projects"} · ${categories[index][0]}`
    visible.forEach(({ article }, i) => article.animate(
      [{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "translateY(0)" }],
      { duration: reduced ? 0 : 420, delay: reduced ? 0 : Math.min(i * 35, 175), easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" }
    ))
    grid.setAttribute("aria-busy", "false")
    // Retain a small floor to keep the filters within reach when a category is empty.
    grid.style.minHeight = `${Math.min(height * .45, parseFloat(grid.style.minHeight))}px`
  }

  fetch("data/projects.json").then((r) => { if (!r.ok) throw new Error("Project data unavailable"); return r.json() })
    .then((projects) => {
      const seen = new Set()
      data = projects.filter((project) => {
        const key = project.id || project.name.toLowerCase().trim()
        if (seen.has(key)) return false
        seen.add(key); return true
      })
      render()
    })
    .catch(() => { status.textContent = "Projects could not load. Please refresh to try again." })
  document.querySelector("#explore-cosmos").addEventListener("click", onExplore)
  document.querySelector("#projects-top").addEventListener("click", () => scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" }))
  addEventListener("resize", () => {
    // Mobile browser chrome changes viewport height during a swipe. Keep the
    // scroll runway stable; reflow for width/orientation and substantial changes.
    if (innerWidth !== width || innerWidth > 600 || Math.abs(innerHeight - storyHeight) > 180) layoutDirty = true
  }, { passive: true })
  document.fonts?.ready.then(() => { layoutDirty = true })

  function layout(w, h, n) {
    width = w; height = storyHeight = h; budget = n; layoutDirty = false
    // A stable viewport-based runway. Scrolling beyond it carries both the 3D
    // lettering and the HTML gallery up at exactly the browser's scroll speed.
    end = h * 1.4
    const titleSize = Math.min(w * .166, 210)
    const titleY = Math.max(135, h * .255)
    navTop = titleY + titleSize * .5 + 30
    nav.style.top = `${navTop}px`
    nav.style.transform = "none"
    const navHeight = nav.getBoundingClientRect().height
    navBottom = navTop + navHeight
    runway.style.height = `${end + navTop + navHeight + 66}px`
    const cv = document.createElement("canvas"); cv.width = w; cv.height = Math.ceil(navTop + navHeight + 20)
    const ctx = cv.getContext("2d", { willReadFrequently: true })
    const points = []
    function glyphs(text, x, y, size, group, step, maxWidth) {
      ctx.clearRect(0, 0, cv.width, cv.height)
      ctx.fillStyle = "white"; ctx.textAlign = "center"; ctx.textBaseline = "middle"
      ctx.font = `${group ? 500 : 800} ${size}px ${group ? '"Inter Tight", sans-serif' : 'Arial, sans-serif'}`
      ctx.fillText(text, x, y, maxWidth)
      const px = ctx.getImageData(0, 0, cv.width, cv.height).data
      const half = size * .65
      for (let yy = Math.max(0, Math.floor(y - half)); yy < Math.min(cv.height, y + half); yy += step) {
        for (let xx = Math.max(0, Math.floor(x - maxWidth / 2)); xx < Math.min(w, x + maxWidth / 2); xx += step) {
          if (px[(Math.floor(yy) * w + Math.floor(xx)) * 4 + 3] > 100) points.push({ x: xx, y: yy, size: step * .88, group })
        }
      }
    }
    const rects = buttons.map((b) => b.getBoundingClientRect())
    // Adapt sampling density to the EXISTING portrait instance count.
    let density = 1
    do {
      points.length = 0
      glyphs("PROJECTS", w / 2, titleY, titleSize, 0, Math.max(2.2, titleSize / 38) * density, w * .91)
      rects.forEach((r, i) => {
        glyphs(categories[i][0], r.x + r.width / 2, r.y + r.height / 2, 17, i + 1, 1.45 * density, r.width - 20)
        // The pill outlines are also the original 3D tiles.
        const rx = r.width / 2 - 2, ry = r.height / 2 - 2, radius = Math.min(16, ry)
        for (let side = 0; side < 2; side++) for (let x = -rx + radius; x <= rx - radius; x += 4 * density)
          points.push({ x: r.x + r.width / 2 + x, y: r.y + r.height / 2 + (side ? ry : -ry), size: 1.2, group: i + 1, border: true })
        for (let side = 0; side < 2; side++) for (let a = -Math.PI / 2; a <= Math.PI / 2; a += .22 * density)
          points.push({ x: r.x + r.width / 2 + (side ? -1 : 1) * (rx - radius + Math.cos(a) * radius), y: r.y + r.height / 2 + Math.sin(a) * ry, size: 1.2, group: i + 1, border: true })
      })
      density *= 1.08
    } while (points.length > n)
    // Stable screen-order pairing avoids crossing the whole portrait unnecessarily.
    points.sort((a, b) => a.y - b.y || a.x - b.x)
    state.targets = points; state.revision++
  }

  return {
    state,
    update(dt, w, h, n) {
      const mobileChrome = w <= 600 && w === width && Math.abs(h - storyHeight) <= 180
      if (layoutDirty || w !== width || (h !== height && !mobileChrome) || n !== budget) layout(w, h, n)
      height = h
      const y = Math.max(0, scrollY)
      const raw = Math.max(0, Math.min(1, (y - storyHeight * .08) / (end - storyHeight * .08)))
      // Symmetric smoothstep, then a short frame-rate-independent follow.
      const goal = raw * raw * (3 - 2 * raw)
      state.progress += (goal - state.progress) * (reduced ? 1 : 1 - Math.exp(-dt * 14))
      if (Math.abs(goal - state.progress) < .0001) state.progress = goal
      state.offset = Math.max(0, y - end)
      nav.style.transform = `translateY(${-state.offset}px)`
      const ready = state.active && raw > .94 && state.offset < navBottom && !document.body.classList.contains("boxed")
      nav.inert = !ready; nav.setAttribute("aria-hidden", String(!ready))
      root.inert = !state.active || document.documentElement.classList.contains("hero-loading")
      document.body.classList.toggle("projects-formed", ready)
      document.body.style.setProperty("--projects-progress", state.active ? state.progress : 0)
      return state
    },
    invalidate() { layoutDirty = true },
    go() { scrollTo({ top: end, behavior: reduced ? "instant" : "smooth" }) }
  }
}

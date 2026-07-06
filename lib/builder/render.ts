import type { Section, SiteSpec } from "./types";
import { SITE_THEMES } from "./themes";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderSection(section: Section, spec: SiteSpec): string {
  switch (section.type) {
    case "navbar":
      return `
<nav class="sc-nav">
  <div class="sc-container sc-nav-inner">
    <span class="sc-brand">${esc(spec.name)}</span>
    <div class="sc-nav-links">
      ${section.links.map((l) => `<a href="#" onclick="return false">${esc(l)}</a>`).join("\n      ")}
      ${section.cta ? `<button class="sc-btn sc-btn-primary sc-btn-sm">${esc(section.cta)}</button>` : ""}
    </div>
  </div>
</nav>`;

    case "hero":
      return `
<header class="sc-hero">
  <div class="sc-container">
    ${section.kicker ? `<p class="sc-kicker">${esc(section.kicker)}</p>` : ""}
    <h1>${esc(section.headline)}</h1>
    <p class="sc-sub">${esc(section.sub)}</p>
    <div class="sc-hero-actions">
      <button class="sc-btn sc-btn-primary">${esc(section.cta)}</button>
      ${section.secondaryCta ? `<button class="sc-btn sc-btn-ghost">${esc(section.secondaryCta)}</button>` : ""}
    </div>
    ${section.note ? `<p class="sc-note">${esc(section.note)}</p>` : ""}
  </div>
</header>`;

    case "features":
      return `
<section class="sc-section">
  <div class="sc-container">
    <h2>${esc(section.title)}</h2>
    <div class="sc-grid sc-grid-3">
      ${section.items
        .map(
          (f) => `<div class="sc-card">
        <span class="sc-emoji">${f.emoji}</span>
        <h3>${esc(f.title)}</h3>
        <p>${esc(f.desc)}</p>
      </div>`,
        )
        .join("\n      ")}
    </div>
  </div>
</section>`;

    case "productGrid":
      return `
<section class="sc-section">
  <div class="sc-container">
    <h2>${esc(section.title)}</h2>
    <div class="sc-grid sc-grid-4">
      ${section.products
        .map(
          (p) => `<div class="sc-card sc-product">
        ${p.tag ? `<span class="sc-tag">${esc(p.tag)}</span>` : ""}
        <div class="sc-product-img">${p.emoji}</div>
        <h3>${esc(p.name)}</h3>
        <div class="sc-product-row">
          <span class="sc-price">${esc(p.price)}</span>
          <button class="sc-btn sc-btn-primary sc-btn-sm">Add</button>
        </div>
      </div>`,
        )
        .join("\n      ")}
    </div>
  </div>
</section>`;

    case "testimonials":
      return `
<section class="sc-section sc-alt">
  <div class="sc-container">
    <h2>${esc(section.title)}</h2>
    <div class="sc-grid sc-grid-3">
      ${section.items
        .map(
          (t) => `<div class="sc-card sc-quote">
        <p>“${esc(t.quote)}”</p>
        <footer><strong>${esc(t.name)}</strong><span>${esc(t.role)}</span></footer>
      </div>`,
        )
        .join("\n      ")}
    </div>
  </div>
</section>`;

    case "pricing":
      return `
<section class="sc-section">
  <div class="sc-container">
    <h2>${esc(section.title)}</h2>
    <div class="sc-grid sc-grid-3">
      ${section.plans
        .map(
          (p) => `<div class="sc-card sc-plan${p.featured ? " sc-featured" : ""}">
        ${p.featured ? `<span class="sc-tag">Most popular</span>` : ""}
        <h3>${esc(p.name)}</h3>
        <p class="sc-price-big">${esc(p.price)}<span>/${esc(p.period)}</span></p>
        <ul>${p.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
        <button class="sc-btn ${p.featured ? "sc-btn-primary" : "sc-btn-ghost"}">Choose ${esc(p.name)}</button>
      </div>`,
        )
        .join("\n      ")}
    </div>
  </div>
</section>`;

    case "stats":
      return `
<section class="sc-stats">
  <div class="sc-container sc-stats-inner">
    ${section.items
      .map(
        (s) => `<div class="sc-stat"><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></div>`,
      )
      .join("\n    ")}
  </div>
</section>`;

    case "gallery":
      return `
<section class="sc-section">
  <div class="sc-container">
    <h2>${esc(section.title)}</h2>
    <div class="sc-grid sc-grid-3">
      ${section.items
        .map(
          (g, i) => `<figure class="sc-tile sc-tile-${(i % 4) + 1}">
        <span class="sc-tile-emoji">${g.emoji}</span>
        <figcaption>${esc(g.label)}</figcaption>
      </figure>`,
        )
        .join("\n      ")}
    </div>
  </div>
</section>`;

    case "menu":
      return `
<section class="sc-section">
  <div class="sc-container sc-narrow">
    <h2>${esc(section.title)}</h2>
    ${section.groups
      .map(
        (g) => `<div class="sc-menu-group">
      <h3>${esc(g.name)}</h3>
      ${g.items
        .map(
          (i) => `<div class="sc-menu-item">
        <div><strong>${esc(i.name)}</strong>${i.desc ? `<p>${esc(i.desc)}</p>` : ""}</div>
        <span class="sc-dots"></span>
        <span class="sc-price">${esc(i.price)}</span>
      </div>`,
        )
        .join("\n      ")}
    </div>`,
      )
      .join("\n    ")}
  </div>
</section>`;

    case "about":
      return `
<section class="sc-section sc-alt">
  <div class="sc-container sc-narrow">
    <h2>${esc(section.title)}</h2>
    <p class="sc-prose">${esc(section.body)}</p>
  </div>
</section>`;

    case "contact":
      return `
<section class="sc-section">
  <div class="sc-container sc-narrow">
    <h2>${esc(section.title)}</h2>
    <div class="sc-contact">
      ${section.email ? `<div class="sc-contact-row"><span>Email</span><strong>${esc(section.email)}</strong></div>` : ""}
      ${section.phone ? `<div class="sc-contact-row"><span>Phone</span><strong>${esc(section.phone)}</strong></div>` : ""}
      ${section.address ? `<div class="sc-contact-row"><span>Find us</span><strong>${esc(section.address)}</strong></div>` : ""}
      ${section.hours ? `<div class="sc-contact-row"><span>Hours</span><strong>${esc(section.hours)}</strong></div>` : ""}
    </div>
  </div>
</section>`;

    case "cta":
      return `
<section class="sc-banner">
  <div class="sc-container">
    <h2>${esc(section.headline)}</h2>
    ${section.sub ? `<p>${esc(section.sub)}</p>` : ""}
    <button class="sc-btn sc-btn-inverse">${esc(section.button)}</button>
  </div>
</section>`;

    case "emailCapture":
      return `
<section class="sc-section sc-center">
  <div class="sc-container sc-narrow">
    <h2>${esc(section.headline)}</h2>
    ${section.sub ? `<p class="sc-sub">${esc(section.sub)}</p>` : ""}
    <form class="sc-capture" onsubmit="event.preventDefault(); this.querySelector('button').textContent='You’re on the list ✓'">
      <input type="email" required placeholder="${esc(section.placeholder)}" />
      <button class="sc-btn sc-btn-primary" type="submit">${esc(section.button)}</button>
    </form>
  </div>
</section>`;

    case "footer":
      return `
<footer class="sc-footer">
  <div class="sc-container">
    <span class="sc-brand">${esc(spec.name)}</span>
    <p>${esc(section.note ?? `© ${new Date().getFullYear()} ${spec.name}. Built with SiteChat.`)}</p>
  </div>
</footer>`;
  }
}

function css(spec: SiteSpec): string {
  const t = SITE_THEMES[spec.themeId];
  const c = t.colors;
  return `
:root {
  --bg: ${c.bg}; --surface: ${c.surface}; --line: ${c.line}; --text: ${c.text};
  --muted: ${c.muted}; --primary: ${c.primary}; --primary-soft: ${c.primarySoft};
  --on-primary: ${c.onPrimary}; --radius: ${t.radius};
}
* { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { background: var(--bg); color: var(--text); font-family: ${t.font.family}; line-height: 1.6; }
.sc-container { max-width: 1080px; margin: 0 auto; padding: 0 24px; }
.sc-narrow { max-width: 720px; }
h1 { font-size: clamp(2.2rem, 5vw, 3.6rem); line-height: 1.1; letter-spacing: -0.02em; }
h2 { font-size: clamp(1.5rem, 3vw, 2.2rem); margin-bottom: 28px; letter-spacing: -0.01em; }
h3 { font-size: 1.05rem; }
.sc-nav { position: sticky; top: 0; background: color-mix(in srgb, var(--bg) 88%, transparent); backdrop-filter: blur(12px); border-bottom: 1px solid var(--line); z-index: 10; }
.sc-nav-inner { display: flex; align-items: center; justify-content: space-between; height: 64px; }
.sc-brand { font-weight: 700; font-size: 1.15rem; color: var(--primary); }
.sc-nav-links { display: flex; align-items: center; gap: 22px; }
.sc-nav-links a { color: var(--muted); text-decoration: none; font-size: 0.95rem; transition: color .2s; }
.sc-nav-links a:hover { color: var(--text); }
.sc-hero { padding: 96px 0 72px; text-align: center; background: linear-gradient(180deg, var(--primary-soft), var(--bg) 85%); }
.sc-kicker { color: var(--primary); font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.8rem; margin-bottom: 14px; }
.sc-sub { color: var(--muted); font-size: 1.15rem; max-width: 560px; margin: 18px auto 0; }
.sc-hero-actions { display: flex; gap: 12px; justify-content: center; margin-top: 30px; flex-wrap: wrap; }
.sc-note { margin-top: 16px; color: var(--muted); font-size: 0.85rem; }
.sc-btn { border: 1px solid transparent; border-radius: calc(var(--radius) * 0.7); padding: 13px 26px; font-size: 1rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: transform .15s, opacity .2s; }
.sc-btn:hover { transform: translateY(-1px); opacity: 0.92; }
.sc-btn-sm { padding: 8px 16px; font-size: 0.85rem; }
.sc-btn-primary { background: var(--primary); color: var(--on-primary); }
.sc-btn-ghost { background: transparent; color: var(--text); border-color: var(--line); }
.sc-btn-inverse { background: var(--on-primary); color: var(--primary); }
.sc-section { padding: 72px 0; }
.sc-alt { background: var(--surface); }
.sc-center { text-align: center; }
.sc-grid { display: grid; gap: 18px; }
.sc-grid-3 { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
.sc-grid-4 { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
.sc-card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 24px; transition: transform .2s, box-shadow .2s; position: relative; }
.sc-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,0,0,0.08); }
.sc-card p { color: var(--muted); font-size: 0.95rem; margin-top: 6px; }
.sc-emoji { font-size: 1.9rem; display: block; margin-bottom: 12px; }
.sc-product { padding: 16px; }
.sc-product-img { background: var(--primary-soft); border-radius: calc(var(--radius) * 0.7); font-size: 3rem; display: grid; place-items: center; aspect-ratio: 4/3; margin-bottom: 12px; }
.sc-product-row { display: flex; align-items: center; justify-content: space-between; margin-top: 10px; }
.sc-price { font-weight: 700; color: var(--primary); }
.sc-tag { position: absolute; top: 10px; right: 10px; background: var(--primary); color: var(--on-primary); font-size: 0.7rem; font-weight: 700; padding: 3px 10px; border-radius: 99px; z-index: 1; }
.sc-quote p { font-size: 1rem; color: var(--text); }
.sc-quote footer { margin-top: 14px; display: flex; flex-direction: column; }
.sc-quote footer span { color: var(--muted); font-size: 0.85rem; }
.sc-plan ul { list-style: none; margin: 18px 0 22px; }
.sc-plan li { padding: 6px 0; color: var(--muted); font-size: 0.95rem; }
.sc-plan li::before { content: "✓  "; color: var(--primary); font-weight: 700; }
.sc-plan .sc-btn { width: 100%; }
.sc-featured { border-color: var(--primary); box-shadow: 0 0 0 1px var(--primary); }
.sc-price-big { font-size: 2.4rem; font-weight: 700; margin-top: 8px; }
.sc-price-big span { font-size: 1rem; color: var(--muted); font-weight: 400; }
.sc-stats { padding: 40px 0; border-block: 1px solid var(--line); background: var(--surface); }
.sc-stats-inner { display: flex; justify-content: space-around; flex-wrap: wrap; gap: 24px; }
.sc-stat { text-align: center; }
.sc-stat strong { font-size: 2rem; color: var(--primary); display: block; }
.sc-stat span { color: var(--muted); font-size: 0.9rem; }
.sc-tile { border-radius: var(--radius); aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; border: 1px solid var(--line); }
.sc-tile-emoji { font-size: 3.2rem; }
.sc-tile figcaption { font-size: 0.9rem; color: var(--muted); }
.sc-tile-1 { background: var(--primary-soft); }
.sc-tile-2 { background: var(--surface); }
.sc-tile-3 { background: color-mix(in srgb, var(--primary) 14%, var(--bg)); }
.sc-tile-4 { background: color-mix(in srgb, var(--primary) 7%, var(--surface)); }
.sc-menu-group { margin-top: 34px; }
.sc-menu-group h3 { color: var(--primary); text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.85rem; margin-bottom: 14px; }
.sc-menu-item { display: flex; align-items: baseline; gap: 10px; padding: 10px 0; }
.sc-menu-item p { color: var(--muted); font-size: 0.85rem; }
.sc-dots { flex: 1; border-bottom: 2px dotted var(--line); }
.sc-prose { color: var(--muted); font-size: 1.05rem; }
.sc-contact { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; }
.sc-contact-row { display: flex; justify-content: space-between; gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--line); }
.sc-contact-row span { color: var(--muted); }
.sc-banner { background: var(--primary); color: var(--on-primary); text-align: center; padding: 64px 24px; }
.sc-banner h2 { margin-bottom: 8px; }
.sc-banner p { opacity: 0.85; margin-bottom: 24px; }
.sc-capture { display: flex; gap: 10px; justify-content: center; margin-top: 26px; flex-wrap: wrap; }
.sc-capture input { padding: 13px 18px; border-radius: calc(var(--radius) * 0.7); border: 1px solid var(--line); background: var(--surface); color: var(--text); font-size: 1rem; font-family: inherit; min-width: 260px; }
.sc-capture input:focus { outline: 2px solid var(--primary); border-color: transparent; }
.sc-footer { border-top: 1px solid var(--line); padding: 36px 0; text-align: center; }
.sc-footer p { color: var(--muted); font-size: 0.85rem; margin-top: 6px; }
@media (max-width: 640px) { .sc-nav-links a { display: none; } .sc-hero { padding: 64px 0 48px; } .sc-section { padding: 48px 0; } }
`;
}

/** Render a complete, self-contained HTML document from a SiteSpec. */
export function renderSite(spec: SiteSpec): string {
  const t = SITE_THEMES[spec.themeId];
  const fontHref = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    t.font.googleName,
  ).replace(/%20/g, "+")}:wght@${t.font.weights}&display=swap`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(spec.name)}${spec.tagline ? ` — ${esc(spec.tagline)}` : ""}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="${fontHref}" rel="stylesheet" />
<style>${css(spec)}</style>
</head>
<body>
${spec.sections.map((s) => renderSection(s, spec)).join("\n")}
</body>
</html>`;
}

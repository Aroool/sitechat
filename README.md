# SiteChat

**Build websites by talking.** Describe the site you want — SiteChat asks two or three sharp follow-up questions, then builds it live in a side-by-side preview, section by section.

And here's the twist: **the interface itself listens too.** Say *"make yourself dark mode"* and the app restyles itself. Say *"show it on mobile"* and the preview snaps into a phone frame. Say *"move the chat to the right"* and it does. No settings page — the chat **is** the settings.

## What it does

- **Conversational site building** — "create a grocery store website" kicks off a short, chip-answered questionnaire (name → one domain question → visual vibe), then the site streams into the preview with a live build checklist.
- **Five site categories** — online store, SaaS landing page, portfolio, local business, waitlist page — each with subtype-aware content packs (grocery vs. fashion products, photographer vs. developer galleries, cafe vs. dinner menus…).
- **Six visual identities** — fresh, premium, playful, tech, minimal, warm. One sentence ("make it premium") swaps the whole identity: palette, font, radius, everything.
- **Live editing** — "change the headline to …", "add a pricing section", "remove testimonials", "rename it to …".
- **Self-controlling UI** — the assistant has tools for its own interface: `set_app_theme`, `set_chat_side`, `set_preview_device`, `set_zen_mode`, `celebrate` (yes, confetti).
- **Export** — download the generated site as a single self-contained HTML file.

## How it works

```
you ──▶ chat ──▶ engine ─┬─▶ SiteSpec (typed sections + theme) ──▶ renderer ──▶ iframe preview
                         └─▶ UI tools (theme / layout / device / zen / confetti)
```

The core design decision: **the AI never writes site code.** It fills a typed `SiteSpec` — an ordered list of 14 section types plus a theme id — and a deterministic renderer turns the spec into a self-contained HTML document. That keeps output quality reliable, edits surgical, and rendering instant.

Two engines drive the same product:

| Mode | When | What drives it |
|------|------|----------------|
| **Demo** | no API key | a scripted state machine + regex intent detection (`lib/engine/`) |
| **Claude** | `ANTHROPIC_API_KEY` set | a client-side tool-use agent loop (`lib/ai/`) — `ask_user` pauses for chips, `build_site` / `update_site` / UI tools execute in the browser |

The app's own theming mirrors the generated sites': every color resolves to CSS variables keyed off `data-theme` on `<html>`, so "restyle the whole app" is a one-attribute flip.

## Run it

```bash
npm install
npm run dev
```

Works instantly with zero config (demo mode). For Claude mode:

```bash
cp .env.example .env.local   # add your ANTHROPIC_API_KEY
```

## Try saying

- `create an ecommerce website for a grocery store`
- `build a portfolio site for a photographer`
- `make a waitlist page for my coffee shop`
- `change the headline to "Dinner is solved"`
- `add a pricing section` · `remove testimonials`
- `make the site premium` · `make it playful`
- `make yourself dark mode` · `switch to midnight`
- `show it on mobile` · `move the chat to the right` · `zen mode`
- `confetti!`

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind v4 · Zustand · Anthropic SDK (claude-sonnet-5)

## Roadmap

- [ ] Streaming responses in Claude mode
- [ ] More categories (blog, agency, event, nonprofit) — the section library already covers most of them
- [ ] Section reordering by conversation ("move testimonials above pricing")
- [ ] Real image support (Unsplash/generated) behind the emoji placeholders
- [ ] Deploy generated sites to a real subdomain in one message
- [ ] Persist projects (localStorage first, then a database)

---

Built with [Claude Code](https://claude.com/claude-code) — including this README.

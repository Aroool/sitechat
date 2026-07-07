# SiteChat — notes for Claude Code

AI website builder: chat left, live preview right, and the assistant can restyle its own UI.

## Architecture in one breath
User input → `lib/chat/dispatch.ts` → one of three engines: Claude tool loop (`lib/ai/claudeLoop.ts`, key present), Ollama local AI (same loop via the `lib/ai/ollama.ts` adapter, Ollama server detected), or demo engine (`lib/engine/demoEngine.ts`, neither). All produce the same two outputs: a `SiteSpec` (`lib/builder/types.ts`) rendered to HTML by `lib/builder/render.ts` into a sandboxed iframe, and UI-store mutations (`lib/store/uiStore.ts`).

## Invariants — don't break these
- Generated sites are **specs, never free-form code**. New site capabilities = new section type in `types.ts` + renderer case in `render.ts` + (optionally) recipe content in `recipes.ts` + tool schema note in `lib/ai/tools.ts`.
- All app colors go through CSS variables defined per `data-theme` block in `app/globals.css`. No hardcoded colors in components.
- All engines must stay at feature parity: anything a model can do with tools, the regex engine (`lib/engine/intents.ts`) should approximate. Claude and Ollama share one loop — new tools go in `lib/ai/tools.ts` once and work for both.
- Escape all spec content in the renderer (`esc()`), keep the iframe `sandbox="allow-scripts"` (no `allow-same-origin`).

## Commands
- `npm run dev` / `npm run build`
- `npx tsc --noEmit` before every commit

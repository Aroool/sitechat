"use client";

import type Anthropic from "@anthropic-ai/sdk";
import { sid, type Section, type SiteSpec } from "@/lib/builder/types";
import { SITE_THEMES } from "@/lib/builder/themes";
import { useChatStore } from "@/lib/store/chatStore";
import { useSiteStore } from "@/lib/store/siteStore";
import { useUIStore } from "@/lib/store/uiStore";
import { sleep } from "@/lib/utils";

/**
 * Claude mode: a client-side agent loop. The server route is a thin proxy;
 * every tool executes here in the browser, against the same stores the demo
 * engine uses. ask_user pauses the loop — the user's next message resumes it
 * as a tool_result.
 */

type ContentBlock = Anthropic.ContentBlock;
type ToolUseBlock = Anthropic.ToolUseBlock;

let history: Anthropic.MessageParam[] = [];
let pendingAskId: string | null = null;

export function resetClaudeSession() {
  history = [];
  pendingAskId = null;
}

const SECTION_TYPES = new Set([
  "navbar", "hero", "features", "productGrid", "testimonials", "pricing",
  "stats", "gallery", "menu", "about", "contact", "cta", "emailCapture", "footer",
]);

/** Array fields the renderer maps over — must exist even if the model forgot them. */
const ARRAY_FIELDS: Record<string, string[]> = {
  navbar: ["links"],
  features: ["items"],
  productGrid: ["products"],
  testimonials: ["items"],
  pricing: ["plans"],
  stats: ["items"],
  gallery: ["items"],
  menu: ["groups"],
};

const STRING_DEFAULTS: Record<string, Record<string, string>> = {
  hero: { headline: "Welcome", sub: "", cta: "Learn more" },
  features: { title: "Highlights" },
  productGrid: { title: "Products" },
  testimonials: { title: "What people say" },
  pricing: { title: "Pricing" },
  gallery: { title: "Gallery" },
  menu: { title: "Menu" },
  about: { title: "About", body: "" },
  contact: { title: "Contact" },
  cta: { headline: "Ready when you are", button: "Get started" },
  emailCapture: { headline: "Stay in the loop", placeholder: "you@example.com", button: "Subscribe" },
};

function sanitizeSections(raw: unknown[]): Section[] {
  const out: Section[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const s = item as Record<string, unknown>;
    if (typeof s.type !== "string" || !SECTION_TYPES.has(s.type)) continue;
    for (const field of ARRAY_FIELDS[s.type] ?? []) {
      if (!Array.isArray(s[field])) s[field] = [];
    }
    if (s.type === "menu") {
      s.groups = (s.groups as Record<string, unknown>[]).map((g) => ({
        name: typeof g?.name === "string" ? g.name : "Menu",
        items: Array.isArray(g?.items) ? g.items : [],
      }));
    }
    for (const [field, fallback] of Object.entries(STRING_DEFAULTS[s.type] ?? {})) {
      if (typeof s[field] !== "string") s[field] = fallback;
    }
    out.push({ ...s, id: sid(s.type) } as Section);
  }
  return out;
}

async function revealSite(spec: SiteSpec) {
  const site = useSiteStore.getState();
  for (let i = 1; i <= spec.sections.length; i++) {
    site.setSpec({ ...spec, sections: spec.sections.slice(0, i) });
    await sleep(350);
  }
  useUIStore.getState().celebrate();
}

async function executeTool(block: ToolUseBlock): Promise<string> {
  const input = block.input as Record<string, unknown>;
  const ui = useUIStore.getState();
  const site = useSiteStore.getState();

  switch (block.name) {
    case "build_site": {
      const sections = sanitizeSections((input.sections as unknown[]) ?? []);
      if (sections.length === 0) return "Error: no valid sections in spec.";
      const spec: SiteSpec = {
        name: String(input.name ?? "Untitled"),
        tagline: input.tagline ? String(input.tagline) : undefined,
        category: (input.category as SiteSpec["category"]) ?? "saas",
        themeId: (input.themeId as SiteSpec["themeId"]) ?? "minimal",
        sections,
      };
      site.snapshot();
      await revealSite(spec);
      return `Built "${spec.name}" with ${sections.length} sections. It is now visible in the preview.`;
    }

    case "update_site": {
      if (!site.spec) return "Error: no site exists yet — call build_site first.";
      const ops = (input.operations as Record<string, unknown>[]) ?? [];
      const applied: string[] = [];
      site.updateSpec((spec) => {
        for (const op of ops) {
          switch (op.op) {
            case "set_theme":
              spec.themeId = op.themeId as SiteSpec["themeId"];
              applied.push(`theme → ${op.themeId}`);
              break;
            case "rename":
              spec.name = String(op.name);
              applied.push(`renamed → ${op.name}`);
              break;
            case "set_hero_field": {
              const hero = spec.sections.find((s) => s.type === "hero");
              if (hero && typeof op.field === "string") {
                (hero as unknown as Record<string, unknown>)[op.field] = op.value;
                applied.push(`hero.${op.field} updated`);
              }
              break;
            }
            case "add_section": {
              const [section] = sanitizeSections([op.section]);
              if (section) {
                const at =
                  typeof op.position === "number"
                    ? Math.min(op.position, spec.sections.length)
                    : Math.max(spec.sections.findIndex((s) => s.type === "footer"), spec.sections.length - 1);
                spec.sections.splice(at, 0, section);
                applied.push(`added ${section.type}`);
              }
              break;
            }
            case "remove_section":
              spec.sections = spec.sections.filter((s) => s.type !== op.sectionType);
              applied.push(`removed ${op.sectionType}`);
              break;
            case "replace_section": {
              const [section] = sanitizeSections([op.section]);
              if (section) {
                const idx = spec.sections.findIndex((s) => s.type === op.sectionType);
                if (idx >= 0) spec.sections[idx] = section;
                else spec.sections.splice(spec.sections.length - 1, 0, section);
                applied.push(`replaced ${op.sectionType}`);
              }
              break;
            }
          }
        }
        return spec;
      });
      return applied.length ? `Applied: ${applied.join(", ")}.` : "No operations applied.";
    }

    case "undo_change":
      return site.undo()
        ? "Reverted — the site is back to its previous version."
        : "Nothing to undo — no earlier version recorded.";

    case "set_app_theme":
      ui.setTheme(input.theme as Parameters<typeof ui.setTheme>[0]);
      return `App theme is now ${input.theme}.`;
    case "set_chat_side":
      ui.setChatSide(input.side as "left" | "right");
      return `Chat moved to the ${input.side}.`;
    case "set_preview_device":
      ui.setDevice(input.device as "desktop" | "tablet" | "mobile");
      return `Preview device: ${input.device}.`;
    case "set_zen_mode":
      ui.setZen(Boolean(input.on));
      return `Zen mode ${input.on ? "on" : "off"}.`;
    case "celebrate":
      ui.celebrate();
      return "Confetti fired.";
    default:
      return `Unknown tool: ${block.name}`;
  }
}

/** If an ask_user option names a site theme, attach its id so the chip renders as a swatch. */
function matchThemeId(label: string): string | undefined {
  const l = label.toLowerCase();
  return Object.values(SITE_THEMES).find(
    (t) => l.includes(t.id) || l.includes(t.label.toLowerCase()),
  )?.id;
}

function toolDetail(block: ToolUseBlock): string {
  const input = block.input as Record<string, unknown>;
  const first = Object.values(input)[0];
  if (typeof first === "string") return `("${first}")`;
  if (block.name === "build_site") return `("${input.name}")`;
  return "";
}

export async function claudeRespond(
  text: string,
  engine: "claude" | "ollama" = "claude",
): Promise<void> {
  const chat = useChatStore.getState();

  if (pendingAskId) {
    history.push({
      role: "user",
      content: [{ type: "tool_result", tool_use_id: pendingAskId, content: text }],
    });
    pendingAskId = null;
  } else {
    history.push({ role: "user", content: text });
  }

  for (let turn = 0; turn < 8; turn++) {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history, engine }),
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => null)) as { error?: string } | null;
      chat.addAssistantMessage([
        {
          type: "text",
          text: `I hit an API error (${err?.error ?? res.status}). Check the server logs or try again.`,
        },
      ]);
      return;
    }

    const data = (await res.json()) as { content: ContentBlock[] };
    history.push({ role: "assistant", content: data.content });

    const msgId = chat.addAssistantMessage([]);
    const results: { tool_use_id: string; content: string }[] = [];

    for (const block of data.content) {
      if (block.type === "text" && block.text.trim()) {
        chat.appendText(msgId, block.text.trim());
      } else if (block.type === "tool_use") {
        if (block.name === "ask_user") {
          const input = block.input as { question: string; options: string[] };
          chat.appendPart(msgId, {
            type: "chips",
            question: input.question,
            options: (input.options ?? []).map((label, i) => ({
              id: `opt-${i}`,
              label,
              themeId: matchThemeId(label),
            })),
          });
          pendingAskId = block.id;
          return; // pause the loop — user's answer resumes it
        }
        const result = await executeTool(block);
        chat.appendPart(msgId, { type: "tool", name: block.name, detail: toolDetail(block) });
        results.push({ tool_use_id: block.id, content: result });
      }
    }

    if (results.length === 0) return; // plain text turn — done

    history.push({
      role: "user",
      content: results.map((r) => ({
        type: "tool_result" as const,
        tool_use_id: r.tool_use_id,
        content: r.content,
      })),
    });
  }
}

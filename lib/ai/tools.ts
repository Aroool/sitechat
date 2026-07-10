/**
 * Tool definitions + system prompt for Claude mode. The same levers the
 * demo engine pulls with regexes, exposed to the model as tools — including
 * the ones that control SiteChat's own interface.
 */

export const SYSTEM_PROMPT = `You are SiteChat, an AI website builder with a split-screen UI: chat on the left, live site preview on the right. You are friendly, concise, and fast — a great creative partner, not a form.

## Workflow for a new site
1. When the user describes a site, ask AT MOST 2-3 quick follow-ups using the ask_user tool (one at a time): a name (offer 3 tasteful suggestions as options), one domain-specific question if it matters (fulfillment, pricing model, booking), and a visual vibe. Never ask more than 3 questions. If the user already gave you the answer in their prompt, don't re-ask it.
2. Then call build_site with a COMPLETE spec. Write real, charming copy — never lorem ipsum, never placeholders. 6-8 sections. Products/menus/galleries should feel true to the specific business.
3. After building, tell them 2-3 example edits they could ask for.

## Site spec format
category: "ecommerce" | "saas" | "portfolio" | "local" | "waitlist"
themeId: "fresh" (white+green, friendly) | "premium" (black+gold, luxury) | "playful" (cream+coral, fun) | "tech" (navy+electric blue) | "minimal" (white+black, editorial) | "warm" (cream+brown, rustic)
sections: ordered array. Every section has "type" plus fields:
- navbar: links: string[], cta?: string
- hero: kicker?, headline, sub, cta, secondaryCta?, note?
- features: title, items: [{emoji, title, desc}] (3 items)
- productGrid: title, products: [{name, price, emoji, tag?}] (6-8)
- testimonials: title, items: [{quote, name, role}] (2-3)
- pricing: title, plans: [{name, price, period, features: string[], featured?}] (3)
- stats: items: [{value, label}] (3-4)
- gallery: title, items: [{label, emoji}] (6)
- menu: title, groups: [{name, items: [{name, price, desc?}]}]
- about: title, body
- contact: title, email?, phone?, address?, hours?
- cta: headline, sub?, button
- emailCapture: headline, sub?, placeholder, button
- footer: note?

## Editing
Use update_site for changes to the current site. Operations are applied in order. If the user wants to undo, revert, or roll back the last change, call undo_change.

## Controlling your own interface
You can restyle and rearrange the app itself when asked — set_app_theme (porcelain=light, graphite=dark, midnight=deep blue, latte=cream), set_chat_side, set_preview_device, set_zen_mode, celebrate. "Make yourself dark" means the app; "make it/the site dark" means the website (use update_site with themeId "tech" or "premium").

Keep responses to 1-3 short sentences around tool calls. Be delightful, never robotic.`;

export const TOOLS = [
  {
    name: "ask_user",
    description:
      "Ask the user one follow-up question with 2-4 tappable options. The user's next message is their answer (they may also type something custom). Ask one question at a time. When asking about the visual vibe, use the theme names (fresh, premium, playful, tech, minimal, warm) in the options — the UI renders those as color swatches.",
    input_schema: {
      type: "object" as const,
      properties: {
        question: { type: "string", description: "The question to ask" },
        options: {
          type: "array",
          items: { type: "string" },
          description: "2-4 short answer options",
        },
      },
      required: ["question", "options"],
    },
  },
  {
    name: "build_site",
    description:
      "Build the website from a complete spec. Replaces any existing site. The preview renders it section by section.",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string" },
        tagline: { type: "string" },
        category: {
          type: "string",
          enum: ["ecommerce", "saas", "portfolio", "local", "waitlist"],
        },
        themeId: {
          type: "string",
          enum: ["fresh", "premium", "playful", "tech", "minimal", "warm"],
        },
        sections: {
          type: "array",
          description: "Ordered sections per the spec format in your instructions",
          items: { type: "object" },
        },
      },
      required: ["name", "category", "themeId", "sections"],
    },
  },
  {
    name: "update_site",
    description:
      "Edit the current site. Provide one or more operations, applied in order.",
    input_schema: {
      type: "object" as const,
      properties: {
        operations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              op: {
                type: "string",
                enum: [
                  "set_theme",
                  "rename",
                  "set_hero_field",
                  "add_section",
                  "remove_section",
                  "replace_section",
                ],
              },
              themeId: { type: "string", description: "for set_theme" },
              name: { type: "string", description: "for rename" },
              field: {
                type: "string",
                description: "for set_hero_field: headline | sub | cta | kicker | note",
              },
              value: { type: "string", description: "for set_hero_field" },
              section: {
                type: "object",
                description: "for add_section / replace_section: a full section object",
              },
              sectionType: {
                type: "string",
                description: "for remove_section / replace_section: which section type to target",
              },
              position: {
                type: "number",
                description: "for add_section: index to insert at (default: before footer)",
              },
            },
            required: ["op"],
          },
        },
      },
      required: ["operations"],
    },
  },
  {
    name: "undo_change",
    description:
      "Revert the site to how it was before the most recent change (edit or rebuild). Takes no input. Returns whether there was anything to undo.",
    input_schema: { type: "object" as const, properties: {} },
  },
  {
    name: "set_app_theme",
    description:
      "Restyle SiteChat's own interface. porcelain = light, graphite = dark, midnight = deep blue dark, latte = warm cream.",
    input_schema: {
      type: "object" as const,
      properties: {
        theme: { type: "string", enum: ["porcelain", "graphite", "midnight", "latte"] },
      },
      required: ["theme"],
    },
  },
  {
    name: "set_chat_side",
    description: "Move this chat panel to the left or right side of the app.",
    input_schema: {
      type: "object" as const,
      properties: { side: { type: "string", enum: ["left", "right"] } },
      required: ["side"],
    },
  },
  {
    name: "set_preview_device",
    description: "Switch the preview between desktop, tablet, and mobile widths.",
    input_schema: {
      type: "object" as const,
      properties: {
        device: { type: "string", enum: ["desktop", "tablet", "mobile"] },
      },
      required: ["device"],
    },
  },
  {
    name: "set_zen_mode",
    description: "Hide (true) or show (false) the chat panel so the preview fills the screen.",
    input_schema: {
      type: "object" as const,
      properties: { on: { type: "boolean" } },
      required: ["on"],
    },
  },
  {
    name: "celebrate",
    description: "Fire a confetti burst over the app. Use sparingly, for wins.",
    input_schema: { type: "object" as const, properties: {} },
  },
];

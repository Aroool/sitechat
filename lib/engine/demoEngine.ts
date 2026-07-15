"use client";

import { RECIPES } from "@/lib/builder/recipes";
import { SITE_THEMES, THEME_SUGGESTIONS } from "@/lib/builder/themes";
import {
  sid,
  type Section,
  type SiteCategory,
  type SiteThemeId,
} from "@/lib/builder/types";
import { useChatStore } from "@/lib/store/chatStore";
import { useSiteStore } from "@/lib/store/siteStore";
import { useUIStore } from "@/lib/store/uiStore";
import { sleep } from "@/lib/utils";
import { applyUIIntent } from "./actions";
import {
  detectCategory,
  detectSiteEditIntent,
  detectUIIntent,
  extractName,
} from "./intents";

/**
 * Demo engine: a scripted conversation state machine that makes SiteChat
 * fully usable without an API key. Same flow the Claude loop drives with
 * tools — gather (name → domain → theme), build, then iterate.
 */

type Stage = "idle" | "awaiting-name" | "awaiting-domain" | "awaiting-theme" | "iterating";

interface Flow {
  stage: Stage;
  category: SiteCategory;
  subtype: string;
  name: string;
  answers: Record<string, string>;
}

let flow: Flow | null = null;

/** Reset the questionnaire state (used by the new-project button). */
export function resetFlow() {
  flow = null;
}

const chat = () => useChatStore.getState();
const site = () => useSiteStore.getState();

function say(text: string) {
  chat().addAssistantMessage([{ type: "text", text }]);
}

function ask(question: string, labels: string[]) {
  chat().addAssistantMessage([
    {
      type: "chips",
      question,
      options: labels.map((label, i) => ({ id: `opt-${i}`, label })),
    },
  ]);
}

function askForStage() {
  if (!flow) return;
  const recipe = RECIPES[flow.category];
  switch (flow.stage) {
    case "awaiting-name":
      ask("What should we call it? Pick one or type your own:", recipe.nameIdeas(flow.subtype));
      break;
    case "awaiting-domain":
      if (recipe.domainQuestion) {
        ask(recipe.domainQuestion.question, recipe.domainQuestion.options.map((o) => o.label));
      }
      break;
    case "awaiting-theme": {
      const ids = (THEME_SUGGESTIONS[flow.category] ?? ["minimal", "playful", "premium"]) as SiteThemeId[];
      chat().addAssistantMessage([
        {
          type: "chips",
          question: "Last one — which vibe?",
          options: ids.map((id) => ({
            id,
            label: SITE_THEMES[id].label,
            themeId: id,
          })),
        },
      ]);
      break;
    }
  }
}

function sectionLabel(s: Section): string {
  const labels: Record<Section["type"], string> = {
    navbar: "Navigation bar",
    hero: "Hero section",
    features: "Feature highlights",
    productGrid: "Product grid",
    testimonials: "Testimonials",
    pricing: "Pricing table",
    stats: "Stats bar",
    gallery: "Work gallery",
    menu: "Menu & services",
    about: "About section",
    contact: "Contact details",
    cta: "Call to action",
    emailCapture: "Email capture",
    footer: "Footer",
  };
  return labels[s.type];
}

async function build(themeId: SiteThemeId) {
  if (!flow) return;
  // Rebuilding over an existing site? Make that undoable too.
  site().snapshot();
  const recipe = RECIPES[flow.category];
  const spec = recipe.build({
    name: flow.name,
    subtype: flow.subtype,
    answers: flow.answers,
    themeId,
  });

  const items = spec.sections.map((s) => ({
    id: s.id,
    label: sectionLabel(s),
    status: "pending" as const,
  }));

  const msgId = chat().addAssistantMessage([
    { type: "text", text: `Love it. Building ${flow.name} now — watch the preview.` },
    { type: "progress", title: `Building ${flow.name}`, items },
  ]);

  for (let i = 0; i < spec.sections.length; i++) {
    chat().updateProgress(
      msgId,
      1,
      items.map((it, j) => ({
        ...it,
        status: j < i ? "done" : j === i ? "active" : "pending",
      })),
    );
    site().setSpec({ ...spec, sections: spec.sections.slice(0, i + 1) });
    await sleep(i === 0 ? 650 : 450);
  }

  chat().updateProgress(msgId, 1, items.map((it) => ({ ...it, status: "done" })));
  useUIStore.getState().celebrate();

  chat().appendText(
    msgId,
    `${flow.name} is live in the preview. Try me:\n` +
      `· “change the headline to …”\n` +
      `· “make the site premium” or any other vibe\n` +
      `· “add a pricing section” / “remove testimonials”\n` +
      `· “show it on mobile” — or “make yourself dark mode” 😉`,
  );

  flow.stage = "iterating";
}

function defaultSection(keyword: string): Section | null {
  if (keyword.startsWith("testimonial")) {
    return {
      id: sid("testimonials"),
      type: "testimonials",
      title: "What people say",
      items: [
        { quote: "Exactly what I didn't know I needed.", name: "Jordan P.", role: "Early customer" },
        { quote: "Five stars. Would recommend to anyone.", name: "Casey L.", role: "Regular" },
        { quote: "The quality speaks for itself.", name: "Morgan D.", role: "Customer" },
      ],
    };
  }
  if (keyword === "pricing") {
    return {
      id: sid("pricing"),
      type: "pricing",
      title: "Pricing",
      plans: [
        { name: "Starter", price: "$9", period: "mo", features: ["The essentials", "Email support"] },
        { name: "Growth", price: "$29", period: "mo", features: ["Everything in Starter", "Priority support", "Advanced options"], featured: true },
        { name: "Scale", price: "$79", period: "mo", features: ["Everything in Growth", "Dedicated manager"] },
      ],
    };
  }
  if (keyword === "stats") {
    return {
      id: sid("stats"),
      type: "stats",
      items: [
        { value: "4.9★", label: "Average rating" },
        { value: "10k+", label: "Happy customers" },
        { value: "24h", label: "Support response" },
      ],
    };
  }
  if (keyword === "gallery") {
    return {
      id: sid("gallery"),
      type: "gallery",
      title: "Gallery",
      items: [
        { label: "Behind the scenes", emoji: "🎬" },
        { label: "The space", emoji: "🏡" },
        { label: "Our people", emoji: "🤝" },
        { label: "The craft", emoji: "🛠️" },
        { label: "Community", emoji: "🌍" },
        { label: "What's next", emoji: "🚀" },
      ],
    };
  }
  if (keyword === "about") {
    return {
      id: sid("about"),
      type: "about",
      title: "About us",
      body: "We started small, stayed honest, and grew by doing right by our customers. This is the part of the site where your story goes — tell me more and I'll write it in.",
    };
  }
  if (keyword === "contact") {
    return {
      id: sid("contact"),
      type: "contact",
      title: "Get in touch",
      email: "hello@example.com",
      phone: "+1 (555) 010-0199",
    };
  }
  if (keyword.startsWith("newsletter") || keyword.startsWith("email")) {
    return {
      id: sid("emailCapture"),
      type: "emailCapture",
      headline: "Stay in the loop",
      sub: "Occasional news, no spam.",
      placeholder: "you@example.com",
      button: "Subscribe",
    };
  }
  if (keyword === "faq") {
    return {
      id: sid("features"),
      type: "features",
      title: "Frequently asked",
      items: [
        { emoji: "❓", title: "How does it work?", desc: "Simply — that's the whole point. Ask and we'll walk you through it." },
        { emoji: "💳", title: "Can I cancel anytime?", desc: "Yes, in one click, no guilt trip." },
        { emoji: "🚚", title: "How fast is delivery?", desc: "Most orders arrive the same day." },
      ],
    };
  }
  return null;
}

const REMOVE_MAP: Record<string, Section["type"]> = {
  testimonial: "testimonials",
  testimonials: "testimonials",
  pricing: "pricing",
  stats: "stats",
  gallery: "gallery",
  about: "about",
  contact: "contact",
  features: "features",
  newsletter: "emailCapture",
  "email capture": "emailCapture",
};

function badge(name: string, detail: string, reply: string) {
  chat().addAssistantMessage([
    { type: "text", text: reply },
    { type: "tool", name, detail },
  ]);
}

function handleSiteEdit(text: string): boolean {
  const intent = detectSiteEditIntent(text);
  const s = site();
  if (!intent || !s.spec) return false;

  switch (intent.kind) {
    case "undo": {
      const ok = s.undo();
      if (ok) {
        badge("undo_change", "()", "Rolled back to the previous version — check the preview.");
      } else {
        say("Nothing to undo yet — the site is still in its original state.");
      }
      return true;
    }
    case "site-theme": {
      const theme = SITE_THEMES[intent.themeId];
      s.updateSpec((spec) => ({ ...spec, themeId: intent.themeId }));
      badge("set_site_theme", `("${intent.themeId}")`, `Restyled the site — ${theme.label.toLowerCase()}: ${theme.vibe}.`);
      return true;
    }
    case "headline":
      s.updateSpec((spec) => ({
        ...spec,
        sections: spec.sections.map((sec) =>
          sec.type === "hero" ? { ...sec, headline: intent.text } : sec,
        ),
      }));
      badge("update_section", `(hero)`, `Headline updated to “${intent.text}”.`);
      return true;
    case "cta-text":
      s.updateSpec((spec) => ({
        ...spec,
        sections: spec.sections.map((sec) =>
          sec.type === "hero" ? { ...sec, cta: intent.text } : sec,
        ),
      }));
      badge("update_section", `(hero)`, `Main button now says “${intent.text}”.`);
      return true;
    case "rename":
      s.updateSpec((spec) => ({ ...spec, name: intent.name }));
      badge("rename_site", `("${intent.name}")`, `Renamed to ${intent.name}.`);
      return true;
    case "add-section": {
      const section = defaultSection(intent.section);
      if (!section) return false;
      s.updateSpec((spec) => {
        const sections = [...spec.sections];
        const at = Math.max(sections.findIndex((x) => x.type === "footer"), sections.length - 1);
        sections.splice(at, 0, section);
        return { ...spec, sections };
      });
      badge("add_section", `(${section.type})`, `Added ${sectionLabel(section).toLowerCase()} — placed just above the footer. Want it moved or reworded?`);
      return true;
    }
    case "remove-section": {
      const type = REMOVE_MAP[intent.section];
      if (!type) return false;
      const had = s.spec.sections.some((x) => x.type === type);
      if (!had) {
        say(`There's no ${intent.section} section on the site right now.`);
        return true;
      }
      s.updateSpec((spec) => ({
        ...spec,
        sections: spec.sections.filter((x) => x.type !== type),
      }));
      badge("remove_section", `(${type})`, `Removed the ${intent.section} section.`);
      return true;
    }
  }
}

export async function demoRespond(text: string): Promise<void> {
  await sleep(420);

  // Reset requests work from any stage.
  if (/\b(start over|start again|scrap (it|this)|new project|reset everything)\b/i.test(text)) {
    flow = null;
    site().clear();
    say("Clean slate. What should we build next?");
    return;
  }

  // UI control always wins — even mid-questionnaire.
  const ui = detectUIIntent(text, site().spec !== null);
  if (ui) {
    const done = applyUIIntent(ui);
    chat().addAssistantMessage([
      { type: "text", text: done.reply },
      { type: "tool", name: done.name, detail: done.detail },
    ]);
    if (flow && flow.stage !== "iterating" && flow.stage !== "idle") {
      await sleep(500);
      askForStage();
    }
    return;
  }

  // Mid-flow: the message answers the pending question.
  if (flow && flow.stage === "awaiting-name") {
    flow.name = extractName(text);
    const recipe = RECIPES[flow.category];
    flow.stage = recipe.domainQuestion ? "awaiting-domain" : "awaiting-theme";
    say(`${flow.name} — great name.`);
    await sleep(450);
    askForStage();
    return;
  }

  if (flow && flow.stage === "awaiting-domain") {
    const recipe = RECIPES[flow.category];
    const q = recipe.domainQuestion;
    if (q) {
      const hit =
        q.options.find((o) => o.label.toLowerCase() === text.trim().toLowerCase()) ??
        q.options.find((o) => text.toLowerCase().includes(o.id)) ??
        q.options[0];
      flow.answers[q.id] = hit.id;
    }
    flow.stage = "awaiting-theme";
    askForStage();
    return;
  }

  if (flow && flow.stage === "awaiting-theme") {
    const ids = (THEME_SUGGESTIONS[flow.category] ?? ["minimal"]) as SiteThemeId[];
    const picked =
      ids.find((id) => text.toLowerCase().includes(SITE_THEMES[id].label.toLowerCase())) ??
      ids.find((id) => text.toLowerCase().includes(id)) ??
      ids[0];
    await build(picked);
    return;
  }

  // Iterating on an existing site.
  if (site().spec && handleSiteEdit(text)) return;

  // A fresh site request?
  const cat = detectCategory(text);
  if (cat) {
    flow = {
      stage: "awaiting-name",
      category: cat.category,
      subtype: cat.subtype,
      name: "",
      answers: {},
    };
    const label = RECIPES[cat.category].label.toLowerCase();
    say(
      cat.subtype !== "generic"
        ? `A ${cat.subtype} ${label} — great choice. Two quick questions and I'll start building.`
        : `A ${label} — let's do it. Two quick questions first.`,
    );
    await sleep(450);
    askForStage();
    return;
  }

  // Fallback.
  say(
    site().spec
      ? `I can edit the site (“change the headline to …”, “add a pricing section”, “make it premium”) or the app itself (“make yourself dark mode”, “show it on mobile”). What would you like?`
      : `Tell me what to build — an online store, a portfolio, a landing page, a local business site, or a waitlist page. For example: “create a grocery store website”.`,
  );
}

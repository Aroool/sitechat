import type { SiteCategory, SiteThemeId } from "@/lib/builder/types";
import type { AppTheme, ChatSide, Device } from "@/lib/store/uiStore";

/**
 * Lightweight intent detection for demo mode (no API key). When Claude is
 * connected these decisions are made by the model with tools — this module
 * makes the same product fully usable offline.
 */

export interface CategoryIntent {
  category: SiteCategory;
  subtype: string;
}

export type UIIntent =
  | { kind: "app-theme"; theme: AppTheme }
  | { kind: "chat-side"; side: ChatSide }
  | { kind: "device"; device: Device }
  | { kind: "zen"; zen: boolean }
  | { kind: "confetti" };

export type SiteEditIntent =
  | { kind: "undo" }
  | { kind: "site-theme"; themeId: SiteThemeId }
  | { kind: "headline"; text: string }
  | { kind: "rename"; name: string }
  | { kind: "cta-text"; text: string }
  | { kind: "add-section"; section: string }
  | { kind: "remove-section"; section: string };

const APP_REF =
  /\b(yourself|your (?:theme|ui|interface|look)|the (?:app|ui|chat|interface|chatbot)|sitechat)\b/i;
const SITE_REF = /\b(the )?(site|website|page|store|shop)\b/i;

const APP_THEME_WORDS: [RegExp, AppTheme][] = [
  [/\bmidnight\b/i, "midnight"],
  [/\blatte\b/i, "latte"],
  [/\bgraphite\b/i, "graphite"],
  [/\bporcelain\b/i, "porcelain"],
  [/\bdark\b/i, "graphite"],
  [/\blight\b/i, "porcelain"],
];

const SITE_THEME_WORDS: [RegExp, SiteThemeId][] = [
  [/\bfresh\b/i, "fresh"],
  [/\bpremium\b|\bluxur|\bfancy\b|\belegant\b/i, "premium"],
  [/\bplayful\b|\bfun\b|\bcute\b/i, "playful"],
  [/\btech\b|\bfuturistic\b/i, "tech"],
  [/\bminimal\b|\bclean\b/i, "minimal"],
  [/\bwarm\b|\brustic\b|\bcozy\b/i, "warm"],
];

export function detectUIIntent(text: string, siteExists: boolean): UIIntent | null {
  if (/\bconfetti\b|\bcelebrate\b|\bparty\b/i.test(text)) return { kind: "confetti" };

  if (/\b(zen|focus) ?mode\b|\bhide (the )?chat\b/i.test(text)) {
    return { kind: "zen", zen: !/\b(exit|leave|off|show)\b/i.test(text) };
  }
  if (/\bshow (the )?chat\b|\bexit zen\b/i.test(text)) return { kind: "zen", zen: false };

  const sideMatch = text.match(/\b(?:chat|panel)\b.*\b(left|right)\b|\bmove\b.*\b(left|right)\b/i);
  if (sideMatch && /\b(chat|panel)\b/i.test(text)) {
    return { kind: "chat-side", side: (sideMatch[1] ?? sideMatch[2]).toLowerCase() as ChatSide };
  }

  const deviceMatch = text.match(/\b(mobile|phone|tablet|ipad|desktop)\b/i);
  if (deviceMatch && /\b(preview|view|show|switch|see|look)\b/i.test(text)) {
    const w = deviceMatch[1].toLowerCase();
    const device: Device = w === "phone" ? "mobile" : w === "ipad" ? "tablet" : (w as Device);
    return { kind: "device", device };
  }

  // Theme words: app-directed if the user references the app itself, or if
  // no site exists yet to restyle. "Make yourself dark mode" → app.
  const themeWord = APP_THEME_WORDS.find(([re]) => re.test(text));
  if (themeWord && /\b(theme|mode|dark|light|midnight|latte|graphite|porcelain)\b/i.test(text)) {
    const appDirected = APP_REF.test(text) || (!siteExists && !SITE_REF.test(text));
    if (appDirected) return { kind: "app-theme", theme: themeWord[1] };
  }

  return null;
}

export function detectSiteEditIntent(text: string): SiteEditIntent | null {
  if (/\b(undo|revert|roll ?back|put it back|go back to (?:the )?(?:previous|last|old))\b/i.test(text)) {
    return { kind: "undo" };
  }

  const headline = text.match(/\b(?:headline|title|heading)\b.*?\bto\b\s+["“']?(.+?)["”']?$/i);
  if (headline) return { kind: "headline", text: headline[1].trim() };

  const rename = text.match(/\brename\b.*?\bto\b\s+["“']?(.+?)["”']?$/i) ??
    text.match(/\bcall (?:it|the site)\s+["“']?(.+?)["”']?$/i);
  if (rename) return { kind: "rename", name: rename[1].trim() };

  const cta = text.match(/\bbutton(?: text)?\b.*?\bto\b\s+["“']?(.+?)["”']?$/i);
  if (cta) return { kind: "cta-text", text: cta[1].trim() };

  const add = text.match(
    /\badd\b.*?\b(testimonials?|pricing|stats|gallery|about|contact|newsletter|email capture|faq)\b/i,
  );
  if (add) return { kind: "add-section", section: add[1].toLowerCase() };

  const remove = text.match(
    /\b(?:remove|delete|drop)\b.*?\b(testimonials?|pricing|stats|gallery|about|contact|features|newsletter|email capture)\b/i,
  );
  if (remove) return { kind: "remove-section", section: remove[1].toLowerCase() };

  // Site restyle — a vibe/theme word aimed at the site: "make it premium",
  // "change the theme to warm", "make the site dark".
  const styleContext =
    /\b(theme|style|look|vibe|colou?rs?|feel|mode)\b/i.test(text) ||
    /\b(make|turn|switch|restyle|go|change)\b/i.test(text) ||
    SITE_REF.test(text);
  if (styleContext && !APP_REF.test(text)) {
    const named = SITE_THEME_WORDS.find(([re]) => re.test(text));
    if (named) return { kind: "site-theme", themeId: named[1] };
    if (/\bdark\b/i.test(text)) return { kind: "site-theme", themeId: "tech" };
    if (/\blight\b/i.test(text)) return { kind: "site-theme", themeId: "minimal" };
  }

  return null;
}

export function detectCategory(text: string): CategoryIntent | null {
  const t = text.toLowerCase();

  const wantsSite =
    /\b(site|website|page|store|shop|portfolio|landing|build|create|make|launch)\b/.test(t);
  if (!wantsSite) return null;

  if (/\bwaitlist\b|\bcoming soon\b|\bpre-?launch\b/.test(t)) {
    const subtype = /coffee|cafe/.test(t) ? "cafe" : "generic";
    return { category: "waitlist", subtype };
  }

  if (/\bportfolio\b|\bmy work\b|\bshowcase\b/.test(t)) {
    const subtype = /photo/.test(t)
      ? "photographer"
      : /design/.test(t)
        ? "designer"
        : /dev|engineer|code/.test(t)
          ? "developer"
          : "generic";
    return { category: "portfolio", subtype };
  }

  if (/\bgrocer|supermarket|produce\b/.test(t)) return { category: "ecommerce", subtype: "grocery" };
  if (/\bbaker|pastry|cake shop\b/.test(t)) return { category: "ecommerce", subtype: "bakery" };
  if (/\bfashion|clothing|apparel|boutique\b/.test(t))
    return { category: "ecommerce", subtype: "fashion" };

  if (/\brestaurant|bistro|diner|eatery\b/.test(t)) return { category: "local", subtype: "restaurant" };
  if (/\bcafe|coffee\b/.test(t)) return { category: "local", subtype: "cafe" };
  if (/\bsalon|barber|spa\b/.test(t)) return { category: "local", subtype: "salon" };
  if (/\bgym|fitness|crossfit\b/.test(t)) return { category: "local", subtype: "gym" };

  if (/\bsaas|startup|software|dev ?tool|app\b|\bproduct landing\b/.test(t))
    return { category: "saas", subtype: "generic" };

  if (/\becommerce|e-commerce|online (store|shop)|\bsell\b|\bshop\b|\bstore\b/.test(t))
    return { category: "ecommerce", subtype: "generic" };

  if (/\blanding page\b/.test(t)) return { category: "saas", subtype: "generic" };

  return null;
}

/** Strip "call it …" style prefixes when the user types a name free-form. */
export function extractName(text: string): string {
  const m = text.match(
    /(?:call it|name it|let'?s (?:go with|call it)|how about|maybe)\s+["“']?(.+?)["”']?$/i,
  );
  const raw = (m ? m[1] : text).trim().replace(/^["“']|["”'.!]$/g, "");
  return raw
    .split(/\s+/)
    .slice(0, 5)
    .map((w) => (w === w.toLowerCase() ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

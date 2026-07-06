/**
 * The generated website is never free-form code — it's a SiteSpec: a typed,
 * validated description of sections + theme + content. The LLM (or demo
 * engine) fills the spec; a deterministic renderer turns it into HTML.
 * That split is what keeps output quality reliable.
 */

export type SiteCategory =
  | "ecommerce"
  | "saas"
  | "portfolio"
  | "local"
  | "waitlist";

export type SiteThemeId =
  | "fresh"
  | "premium"
  | "playful"
  | "tech"
  | "minimal"
  | "warm";

export interface Product {
  name: string;
  price: string;
  emoji: string;
  tag?: string;
}

export interface Feature {
  emoji: string;
  title: string;
  desc: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
  featured?: boolean;
}

export interface MenuGroup {
  name: string;
  items: { name: string; price: string; desc?: string }[];
}

export interface GalleryItem {
  label: string;
  emoji: string;
}

export type Section =
  | { id: string; type: "navbar"; links: string[]; cta?: string }
  | {
      id: string;
      type: "hero";
      kicker?: string;
      headline: string;
      sub: string;
      cta: string;
      secondaryCta?: string;
      note?: string;
    }
  | { id: string; type: "features"; title: string; items: Feature[] }
  | { id: string; type: "productGrid"; title: string; products: Product[] }
  | { id: string; type: "testimonials"; title: string; items: Testimonial[] }
  | { id: string; type: "pricing"; title: string; plans: PricingPlan[] }
  | { id: string; type: "stats"; items: { value: string; label: string }[] }
  | { id: string; type: "gallery"; title: string; items: GalleryItem[] }
  | { id: string; type: "menu"; title: string; groups: MenuGroup[] }
  | { id: string; type: "about"; title: string; body: string }
  | {
      id: string;
      type: "contact";
      title: string;
      email?: string;
      phone?: string;
      address?: string;
      hours?: string;
    }
  | { id: string; type: "cta"; headline: string; sub?: string; button: string }
  | {
      id: string;
      type: "emailCapture";
      headline: string;
      sub?: string;
      placeholder: string;
      button: string;
    }
  | { id: string; type: "footer"; note?: string };

export type SectionType = Section["type"];

export interface SiteSpec {
  name: string;
  tagline?: string;
  category: SiteCategory;
  themeId: SiteThemeId;
  sections: Section[];
}

let counter = 0;
export function sid(type: string): string {
  counter += 1;
  return `${type}-${counter}-${Math.random().toString(36).slice(2, 6)}`;
}

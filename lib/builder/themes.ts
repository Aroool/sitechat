import type { SiteThemeId } from "./types";

/**
 * Visual identities for generated sites. Every color the renderer emits
 * comes from one of these — so restyling a whole site is a themeId swap.
 */
export interface SiteTheme {
  id: SiteThemeId;
  label: string;
  /** Short description the assistant can use when offering choices. */
  vibe: string;
  dark: boolean;
  font: { family: string; googleName: string; weights: string };
  colors: {
    bg: string;
    surface: string;
    line: string;
    text: string;
    muted: string;
    primary: string;
    primarySoft: string;
    onPrimary: string;
  };
  radius: string;
}

export const SITE_THEMES: Record<SiteThemeId, SiteTheme> = {
  fresh: {
    id: "fresh",
    label: "Fresh & friendly",
    vibe: "bright white, leafy green — farmers-market energy",
    dark: false,
    font: { family: "'Nunito', sans-serif", googleName: "Nunito", weights: "400;600;700;800" },
    colors: {
      bg: "#fbfdf9",
      surface: "#f0f7ee",
      line: "#dcebd8",
      text: "#1b2b1f",
      muted: "#5f7565",
      primary: "#1d9e75",
      primarySoft: "#e1f5ee",
      onPrimary: "#ffffff",
    },
    radius: "14px",
  },
  premium: {
    id: "premium",
    label: "Premium & bold",
    vibe: "near-black, champagne gold — high-end boutique",
    dark: true,
    font: { family: "'Cormorant Garamond', serif", googleName: "Cormorant Garamond", weights: "400;500;600;700" },
    colors: {
      bg: "#121110",
      surface: "#1c1a18",
      line: "#2e2b27",
      text: "#f4efe6",
      muted: "#9c9485",
      primary: "#d4af6a",
      primarySoft: "#2a251c",
      onPrimary: "#16130d",
    },
    radius: "4px",
  },
  playful: {
    id: "playful",
    label: "Playful & warm",
    vibe: "cream, coral, rounded corners — friendly neighborhood brand",
    dark: false,
    font: { family: "'Baloo 2', cursive", googleName: "Baloo 2", weights: "400;500;600;700" },
    colors: {
      bg: "#fff8f0",
      surface: "#ffefdd",
      line: "#f5ddc4",
      text: "#3d2a20",
      muted: "#8a6f5f",
      primary: "#e8582e",
      primarySoft: "#ffe3d4",
      onPrimary: "#ffffff",
    },
    radius: "20px",
  },
  tech: {
    id: "tech",
    label: "Dark tech",
    vibe: "deep navy, electric blue — developer-tool sharp",
    dark: true,
    font: { family: "'Space Grotesk', sans-serif", googleName: "Space Grotesk", weights: "400;500;600;700" },
    colors: {
      bg: "#0a0f1e",
      surface: "#111830",
      line: "#1f2947",
      text: "#e9edfb",
      muted: "#8b96bb",
      primary: "#5f7fff",
      primarySoft: "#16204a",
      onPrimary: "#ffffff",
    },
    radius: "10px",
  },
  minimal: {
    id: "minimal",
    label: "Minimal editorial",
    vibe: "white space, black type — gallery quiet",
    dark: false,
    font: { family: "'Inter', sans-serif", googleName: "Inter", weights: "400;500;600;700" },
    colors: {
      bg: "#ffffff",
      surface: "#f6f6f4",
      line: "#e8e8e4",
      text: "#161616",
      muted: "#6f6f6a",
      primary: "#161616",
      primarySoft: "#efefec",
      onPrimary: "#ffffff",
    },
    radius: "2px",
  },
  warm: {
    id: "warm",
    label: "Warm & rustic",
    vibe: "latte cream, espresso brown — cafe cozy",
    dark: false,
    font: { family: "'Lora', serif", googleName: "Lora", weights: "400;500;600;700" },
    colors: {
      bg: "#faf5ec",
      surface: "#f1e7d7",
      line: "#e2d3bc",
      text: "#372a1c",
      muted: "#7d6b54",
      primary: "#8c5a2b",
      primarySoft: "#efe0cb",
      onPrimary: "#fdf9f1",
    },
    radius: "12px",
  },
};

/** Sensible theme suggestions per category, used for follow-up chips. */
export const THEME_SUGGESTIONS: Record<string, SiteThemeId[]> = {
  ecommerce: ["fresh", "playful", "premium"],
  saas: ["tech", "minimal", "premium"],
  portfolio: ["minimal", "premium", "warm"],
  local: ["warm", "playful", "fresh"],
  waitlist: ["tech", "playful", "minimal"],
};

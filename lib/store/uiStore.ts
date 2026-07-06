"use client";

import { create } from "zustand";

export const APP_THEMES = ["porcelain", "graphite", "midnight", "latte"] as const;
export type AppTheme = (typeof APP_THEMES)[number];

export type Device = "desktop" | "tablet" | "mobile";
export type ChatSide = "left" | "right";

export interface UIState {
  theme: AppTheme;
  chatSide: ChatSide;
  device: Device;
  zen: boolean;
  projectName: string | null;
  confettiTick: number;
  setTheme: (theme: AppTheme) => void;
  cycleTheme: () => void;
  setChatSide: (side: ChatSide) => void;
  setDevice: (device: Device) => void;
  setZen: (zen: boolean) => void;
  setProjectName: (name: string | null) => void;
  celebrate: () => void;
}

function applyThemeToDOM(theme: AppTheme) {
  const el = document.documentElement;
  el.setAttribute("data-anim", "true");
  el.setAttribute("data-theme", theme);
  try {
    localStorage.setItem("sitechat.theme", theme);
  } catch {
    /* private mode */
  }
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: "porcelain",
  chatSide: "left",
  device: "desktop",
  zen: false,
  projectName: null,
  confettiTick: 0,

  setTheme: (theme) => {
    applyThemeToDOM(theme);
    set({ theme });
  },

  cycleTheme: () => {
    const order = APP_THEMES;
    const next = order[(order.indexOf(get().theme) + 1) % order.length];
    get().setTheme(next);
  },

  setChatSide: (chatSide) => set({ chatSide }),
  setDevice: (device) => set({ device }),
  setZen: (zen) => set({ zen }),
  setProjectName: (projectName) => set({ projectName }),
  celebrate: () => set((s) => ({ confettiTick: s.confettiTick + 1 })),
}));

/** Sync store with whatever the boot script put on <html> (runs client-side once). */
export function hydrateThemeFromDOM() {
  const t = document.documentElement.getAttribute("data-theme") as AppTheme | null;
  if (t && APP_THEMES.includes(t) && useUIStore.getState().theme !== t) {
    useUIStore.setState({ theme: t });
  }
}

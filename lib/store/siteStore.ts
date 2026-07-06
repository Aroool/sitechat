"use client";

import { create } from "zustand";
import type { SiteSpec } from "@/lib/builder/types";
import { renderSite } from "@/lib/builder/render";
import { useUIStore } from "./uiStore";

export interface SiteState {
  spec: SiteSpec | null;
  html: string;
  /** Bumped on every render so the iframe knows to refresh. */
  revision: number;
  setSpec: (spec: SiteSpec) => void;
  updateSpec: (fn: (spec: SiteSpec) => SiteSpec) => void;
  clear: () => void;
}

export const useSiteStore = create<SiteState>((set, get) => ({
  spec: null,
  html: "",
  revision: 0,

  setSpec: (spec) => {
    set((s) => ({ spec, html: renderSite(spec), revision: s.revision + 1 }));
    useUIStore.getState().setProjectName(spec.name);
  },

  updateSpec: (fn) => {
    const current = get().spec;
    if (!current) return;
    get().setSpec(fn(structuredClone(current)));
  },

  clear: () => {
    set({ spec: null, html: "", revision: 0 });
    useUIStore.getState().setProjectName(null);
  },
}));

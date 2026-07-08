"use client";

import { create } from "zustand";
import type { SiteSpec } from "@/lib/builder/types";
import { renderSite } from "@/lib/builder/render";
import { useUIStore } from "./uiStore";

const HISTORY_LIMIT = 30;

export interface SiteState {
  spec: SiteSpec | null;
  html: string;
  /** Bumped on every render so the iframe knows to refresh. */
  revision: number;
  /** Snapshots for undo — recorded on edits and rebuilds, not on partial reveals. */
  history: SiteSpec[];
  setSpec: (spec: SiteSpec) => void;
  /** Push the current spec onto the history stack (call before replacing it). */
  snapshot: () => void;
  updateSpec: (fn: (spec: SiteSpec) => SiteSpec) => void;
  /** Restore the previous snapshot. Returns false when there's nothing to undo. */
  undo: () => boolean;
  clear: () => void;
}

export const useSiteStore = create<SiteState>((set, get) => ({
  spec: null,
  html: "",
  revision: 0,
  history: [],

  setSpec: (spec) => {
    set((s) => ({ spec, html: renderSite(spec), revision: s.revision + 1 }));
    useUIStore.getState().setProjectName(spec.name);
  },

  snapshot: () => {
    const current = get().spec;
    if (!current) return;
    set((s) => ({
      history: [...s.history, structuredClone(current)].slice(-HISTORY_LIMIT),
    }));
  },

  updateSpec: (fn) => {
    const current = get().spec;
    if (!current) return;
    get().snapshot();
    get().setSpec(fn(structuredClone(current)));
  },

  undo: () => {
    const { history } = get();
    if (history.length === 0) return false;
    const previous = history[history.length - 1];
    set({ history: history.slice(0, -1) });
    get().setSpec(previous);
    return true;
  },

  clear: () => {
    set({ spec: null, html: "", revision: 0, history: [] });
    useUIStore.getState().setProjectName(null);
  },
}));

"use client";

import { create } from "zustand";
import type { SiteSpec } from "@/lib/builder/types";
import { renderSite } from "@/lib/builder/render";
import { useUIStore } from "./uiStore";

const HISTORY_LIMIT = 30;
const STORAGE_KEY = "sitechat.project";

function persist(spec: SiteSpec | null, history: SiteSpec[]) {
  try {
    if (!spec) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify({ spec, history }));
  } catch {
    /* storage full or unavailable — persistence is best-effort */
  }
}

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
    persist(spec, get().history);
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
    persist(null, []);
  },
}));

/** Restore the last project from localStorage. Returns true if one was loaded. */
export function restoreProject(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const { spec, history } = JSON.parse(raw) as {
      spec: SiteSpec;
      history?: SiteSpec[];
    };
    if (!spec?.name || !Array.isArray(spec.sections)) return false;
    useSiteStore.setState({ history: history ?? [] });
    useSiteStore.getState().setSpec(spec);
    return true;
  } catch {
    return false;
  }
}

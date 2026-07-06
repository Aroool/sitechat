"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  Monitor,
  Tablet,
  Smartphone,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Download,
} from "lucide-react";
import { useSiteStore } from "@/lib/store/siteStore";

function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.42 7.42 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}
import { useUIStore, type Device } from "@/lib/store/uiStore";

const DEVICES: { id: Device; icon: typeof Monitor; label: string }[] = [
  { id: "desktop", icon: Monitor, label: "Desktop preview" },
  { id: "tablet", icon: Tablet, label: "Tablet preview" },
  { id: "mobile", icon: Smartphone, label: "Mobile preview" },
];

export default function TopBar() {
  const { theme, device, zen, projectName, setDevice, cycleTheme, setZen } =
    useUIStore();
  const { spec, html } = useSiteStore();
  const [mode, setMode] = useState<"demo" | "claude" | null>(null);

  useEffect(() => {
    fetch("/api/chat")
      .then((r) => r.json())
      .then((d: { hasKey: boolean }) => setMode(d.hasKey ? "claude" : "demo"))
      .catch(() => setMode("demo"));
  }, []);

  const exportSite = () => {
    if (!spec) return;
    const slug = spec.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug || "site"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-line bg-panel px-4">
      <div className="flex items-center gap-2">
        <span className="grid size-6 place-items-center rounded-md bg-accent text-on-accent">
          <Sparkles className="size-3.5" />
        </span>
        <span className="text-sm font-semibold tracking-tight">SiteChat</span>
      </div>

      {projectName && (
        <div className="flex min-w-0 items-center gap-2 text-sm text-ink-2">
          <span className="text-ink-3">/</span>
          <span className="truncate">{projectName}</span>
        </div>
      )}

      {mode && (
        <span
          title={
            mode === "claude"
              ? "Claude is driving this conversation via tool use"
              : "Running the built-in demo engine — set ANTHROPIC_API_KEY for Claude mode"
          }
          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
            mode === "claude"
              ? "border-accent bg-accent-soft text-accent"
              : "border-line text-ink-3"
          }`}
        >
          {mode}
        </span>
      )}

      <div className="ml-auto flex items-center gap-1.5">
        <div
          role="group"
          aria-label="Preview device"
          className="flex items-center rounded-lg border border-line bg-panel-2 p-0.5"
        >
          {DEVICES.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              aria-label={label}
              aria-pressed={device === id}
              onClick={() => setDevice(id)}
              className={`grid size-7 place-items-center rounded-md transition-colors ${
                device === id
                  ? "bg-panel text-accent shadow-sm"
                  : "text-ink-3 hover:text-ink-2"
              }`}
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>

        <button
          type="button"
          aria-label={`Theme: ${theme} — click to cycle`}
          title={`Theme: ${theme}`}
          onClick={cycleTheme}
          className="grid size-8 place-items-center rounded-lg text-ink-2 transition-colors hover:bg-panel-2 hover:text-ink"
        >
          <Palette className="size-4" />
        </button>

        <button
          type="button"
          aria-label={zen ? "Show chat panel" : "Hide chat panel (zen mode)"}
          aria-pressed={zen}
          onClick={() => setZen(!zen)}
          className="grid size-8 place-items-center rounded-lg text-ink-2 transition-colors hover:bg-panel-2 hover:text-ink"
        >
          {zen ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </button>

        {spec && (
          <button
            type="button"
            onClick={exportSite}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-medium text-on-accent transition-colors hover:bg-accent-strong"
          >
            <Download className="size-3.5" />
            Export
          </button>
        )}

        <a
          href="https://github.com/Aroool/sitechat"
          target="_blank"
          rel="noreferrer"
          aria-label="View source on GitHub"
          className="grid size-8 place-items-center rounded-lg text-ink-2 transition-colors hover:bg-panel-2 hover:text-ink"
        >
          <GithubMark className="size-4" />
        </a>
      </div>
    </header>
  );
}

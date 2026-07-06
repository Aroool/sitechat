"use client";

import {
  Sparkles,
  Monitor,
  Tablet,
  Smartphone,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Github,
} from "lucide-react";
import { useUIStore, type Device } from "@/lib/store/uiStore";

const DEVICES: { id: Device; icon: typeof Monitor; label: string }[] = [
  { id: "desktop", icon: Monitor, label: "Desktop preview" },
  { id: "tablet", icon: Tablet, label: "Tablet preview" },
  { id: "mobile", icon: Smartphone, label: "Mobile preview" },
];

export default function TopBar() {
  const { theme, device, zen, projectName, setDevice, cycleTheme, setZen } =
    useUIStore();

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

        <a
          href="https://github.com/Aroool/sitechat"
          target="_blank"
          rel="noreferrer"
          aria-label="View source on GitHub"
          className="grid size-8 place-items-center rounded-lg text-ink-2 transition-colors hover:bg-panel-2 hover:text-ink"
        >
          <Github className="size-4" />
        </a>
      </div>
    </header>
  );
}

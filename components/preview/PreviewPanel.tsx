"use client";

import { useMemo } from "react";
import { MonitorSmartphone, RefreshCw, ExternalLink, Undo2 } from "lucide-react";
import { useSiteStore } from "@/lib/store/siteStore";
import { useUIStore } from "@/lib/store/uiStore";

const DEVICE_WIDTH: Record<string, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

function EmptyPreview() {
  return (
    <div className="grid h-full place-items-center p-8">
      <div className="flex max-w-[300px] flex-col items-center gap-4 rounded-2xl border border-dashed border-line-strong px-8 py-12 text-center">
        <MonitorSmartphone className="size-8 text-ink-3" />
        <div>
          <p className="text-sm font-medium text-ink-2">
            Your site appears here
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-3">
            Describe what you want in the chat and watch it build, section by
            section.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PreviewPanel() {
  const { html, spec, revision, history, undo } = useSiteStore();
  const device = useUIStore((s) => s.device);

  const slug = useMemo(
    () =>
      spec
        ? spec.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
        : "",
    [spec],
  );

  const openInTab = () => {
    const blob = new Blob([html], { type: "text/html" });
    window.open(URL.createObjectURL(blob), "_blank", "noopener");
  };

  const refresh = () => {
    // Re-set the same spec — bumps revision, remounts the iframe.
    const s = useSiteStore.getState().spec;
    if (s) useSiteStore.getState().setSpec(s);
  };

  if (!spec) return <EmptyPreview />;

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-full border border-line bg-panel px-3.5 py-1 font-mono text-xs text-ink-2">
          {slug}.sitechat.preview
        </span>
        <span className="text-xs text-ink-3">
          {spec.sections.length} sections
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => undo()}
            disabled={history.length === 0}
            aria-label="Undo last change"
            title={
              history.length === 0
                ? "Nothing to undo"
                : `Undo last change (${history.length} step${history.length === 1 ? "" : "s"} back available)`
            }
            className="grid size-7 place-items-center rounded-md text-ink-3 transition-colors enabled:hover:bg-panel-2 enabled:hover:text-ink disabled:opacity-35"
          >
            <Undo2 className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={refresh}
            aria-label="Refresh preview"
            className="grid size-7 place-items-center rounded-md text-ink-3 transition-colors hover:bg-panel-2 hover:text-ink"
          >
            <RefreshCw className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={openInTab}
            aria-label="Open in new tab"
            className="grid size-7 place-items-center rounded-md text-ink-3 transition-colors hover:bg-panel-2 hover:text-ink"
          >
            <ExternalLink className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 justify-center">
        <div
          className="h-full overflow-hidden rounded-xl border border-line bg-white transition-all duration-300"
          style={{
            width: DEVICE_WIDTH[device],
            maxWidth: "100%",
            boxShadow: "var(--shadow)",
          }}
        >
          <iframe
            key={revision}
            title={`Preview of ${spec.name}`}
            srcDoc={html}
            sandbox="allow-scripts"
            className="size-full border-0"
          />
        </div>
      </div>
    </div>
  );
}

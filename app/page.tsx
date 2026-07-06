"use client";

import { useEffect } from "react";
import TopBar from "@/components/TopBar";
import { useUIStore, hydrateThemeFromDOM } from "@/lib/store/uiStore";

export default function Home() {
  const { chatSide, zen } = useUIStore();

  useEffect(() => {
    hydrateThemeFromDOM();
  }, []);

  return (
    <div className="flex h-full flex-col">
      <TopBar />
      <main
        className={`flex min-h-0 flex-1 ${
          chatSide === "right" ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {!zen && (
          <section
            aria-label="Chat"
            className="flex w-[400px] shrink-0 flex-col border-line bg-panel data-[side=left]:border-r data-[side=right]:border-l"
            data-side={chatSide}
          >
            <div className="grid flex-1 place-items-center text-sm text-ink-3">
              Chat panel — coming in the next commits
            </div>
          </section>
        )}
        <section aria-label="Live preview" className="min-w-0 flex-1 bg-bg">
          <div className="grid h-full place-items-center text-sm text-ink-3">
            Preview panel — coming soon
          </div>
        </section>
      </main>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import TopBar from "@/components/TopBar";
import ChatPanel from "@/components/chat/ChatPanel";
import PreviewPanel from "@/components/preview/PreviewPanel";
import ConfettiLayer from "@/components/ConfettiLayer";
import { useUIStore, hydrateThemeFromDOM } from "@/lib/store/uiStore";
import { restoreProject } from "@/lib/store/siteStore";
import { useChatStore } from "@/lib/store/chatStore";

export default function Home() {
  const { chatSide, zen } = useUIStore();

  useEffect(() => {
    hydrateThemeFromDOM();
    if (restoreProject() && useChatStore.getState().messages.length === 0) {
      const name = useUIStore.getState().projectName ?? "your site";
      useChatStore.getState().addAssistantMessage([
        {
          type: "text",
          text: `Welcome back — ${name} is right where you left it. Keep editing, or hit “New” up top for a clean slate.`,
        },
      ]);
    }
  }, []);

  return (
    <div className="flex h-full flex-col">
      <ConfettiLayer />
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
            <ChatPanel />
          </section>
        )}
        <section aria-label="Live preview" className="min-w-0 flex-1 bg-bg">
          <PreviewPanel />
        </section>
      </main>
    </div>
  );
}

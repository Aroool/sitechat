"use client";

import { useUIStore } from "@/lib/store/uiStore";
import type { UIIntent } from "./intents";

/**
 * Execute a UI intent against the interface and return what happened, ready
 * to render as a tool badge. Shared by demo mode and the Claude tool loop —
 * the model and the regexes drive the exact same levers.
 */
export function applyUIIntent(intent: UIIntent): { name: string; detail: string; reply: string } {
  const ui = useUIStore.getState();
  switch (intent.kind) {
    case "app-theme":
      ui.setTheme(intent.theme);
      return {
        name: "set_app_theme",
        detail: `("${intent.theme}")`,
        reply: `Switched my theme to ${intent.theme}.`,
      };
    case "chat-side":
      ui.setChatSide(intent.side);
      return {
        name: "set_chat_side",
        detail: `("${intent.side}")`,
        reply: `Moved the chat to the ${intent.side}.`,
      };
    case "device":
      ui.setDevice(intent.device);
      return {
        name: "set_preview_device",
        detail: `("${intent.device}")`,
        reply: `Previewing on ${intent.device} now.`,
      };
    case "zen":
      ui.setZen(intent.zen);
      return {
        name: "set_zen_mode",
        detail: `(${intent.zen})`,
        reply: intent.zen
          ? "Zen mode on — the preview has the floor. Click the panel icon up top to bring me back."
          : "Welcome back — chat restored.",
      };
    case "confetti":
      ui.celebrate();
      return { name: "celebrate", detail: "()", reply: "🎉 As requested." };
  }
}

"use client";

import { useChatStore } from "@/lib/store/chatStore";
import { demoRespond } from "@/lib/engine/demoEngine";
import { claudeRespond } from "@/lib/ai/claudeLoop";

export type EngineMode = "demo" | "claude" | "ollama";

let mode: EngineMode | null = null;

async function resolveMode(): Promise<EngineMode> {
  if (mode) return mode;
  try {
    const res = await fetch("/api/chat");
    const data = (await res.json()) as {
      hasKey: boolean;
      ollama?: { available: boolean; model?: string };
    };
    mode = data.hasKey ? "claude" : data.ollama?.available ? "ollama" : "demo";
  } catch {
    mode = "demo";
  }
  return mode;
}

/**
 * Single entry point for user input — from the composer, a chip tap, or a
 * suggested prompt. Routes to whichever engine is active (the local demo
 * engine, or the Claude tool-use loop when an API key is configured).
 */
export async function sendUserMessage(text: string): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;

  const chat = useChatStore.getState();
  if (chat.busy) return;

  chat.addUserMessage(trimmed);
  chat.setBusy(true);
  try {
    const engine = await resolveMode();
    if (engine === "demo") await demoRespond(trimmed);
    else await claudeRespond(trimmed, engine);
  } catch {
    useChatStore
      .getState()
      .addAssistantMessage([
        { type: "text", text: "Something went sideways on my end — try that again?" },
      ]);
  } finally {
    useChatStore.getState().setBusy(false);
  }
}

/** Chip tap: mark it selected, then submit its label as the user's answer. */
export async function answerWithChip(
  messageId: string,
  partIndex: number,
  optionId: string,
  label: string,
): Promise<void> {
  useChatStore.getState().selectChip(messageId, partIndex, optionId);
  await sendUserMessage(label);
}

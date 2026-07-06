"use client";

import { useChatStore } from "@/lib/store/chatStore";

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
    await respond(trimmed);
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

// Temporary responder — replaced by the build engine in an upcoming commit.
async function respond(text: string): Promise<void> {
  const chat = useChatStore.getState();
  await sleep(500);
  chat.addAssistantMessage([
    {
      type: "text",
      text: `The build engine lands in the next few commits — soon I'll turn "${text}" into a real website.`,
    },
  ]);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

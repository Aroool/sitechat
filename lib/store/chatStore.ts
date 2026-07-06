"use client";

import { create } from "zustand";
import {
  uid,
  type ChatMessage,
  type MessagePart,
  type ProgressItem,
} from "@/lib/chat/types";

export interface ChatState {
  messages: ChatMessage[];
  /** Assistant is thinking — composer disabled, typing indicator visible. */
  busy: boolean;
  addUserMessage: (text: string) => string;
  addAssistantMessage: (parts?: MessagePart[]) => string;
  appendPart: (messageId: string, part: MessagePart) => void;
  appendText: (messageId: string, text: string) => void;
  selectChip: (messageId: string, partIndex: number, optionId: string) => void;
  updateProgress: (
    messageId: string,
    partIndex: number,
    items: ProgressItem[],
  ) => void;
  setBusy: (busy: boolean) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  busy: false,

  addUserMessage: (text) => {
    const id = uid();
    set((s) => ({
      messages: [...s.messages, { id, role: "user", parts: [{ type: "text", text }] }],
    }));
    return id;
  },

  addAssistantMessage: (parts = []) => {
    const id = uid();
    set((s) => ({
      messages: [...s.messages, { id, role: "assistant", parts }],
    }));
    return id;
  },

  appendPart: (messageId, part) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === messageId ? { ...m, parts: [...m.parts, part] } : m,
      ),
    })),

  appendText: (messageId, text) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === messageId
          ? { ...m, parts: [...m.parts, { type: "text", text }] }
          : m,
      ),
    })),

  selectChip: (messageId, partIndex, optionId) =>
    set((s) => ({
      messages: s.messages.map((m) => {
        if (m.id !== messageId) return m;
        const parts = m.parts.map((p, i) =>
          i === partIndex && p.type === "chips" ? { ...p, selectedId: optionId } : p,
        );
        return { ...m, parts };
      }),
    })),

  updateProgress: (messageId, partIndex, items) =>
    set((s) => ({
      messages: s.messages.map((m) => {
        if (m.id !== messageId) return m;
        const parts = m.parts.map((p, i) =>
          i === partIndex && p.type === "progress" ? { ...p, items } : p,
        );
        return { ...m, parts };
      }),
    })),

  setBusy: (busy) => set({ busy }),
  reset: () => set({ messages: [], busy: false }),
}));

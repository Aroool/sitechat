export interface ChipOption {
  id: string;
  label: string;
  /** When set, the chip renders as a visual theme swatch (colors + font). */
  themeId?: string;
}

export type ProgressStatus = "pending" | "active" | "done";

export interface ProgressItem {
  id: string;
  label: string;
  status: ProgressStatus;
}

/**
 * A chat message is a list of parts, not a single string — the assistant can
 * mix prose with interactive elements (answer chips, build progress, tool
 * badges) in one message.
 */
export type MessagePart =
  | { type: "text"; text: string }
  | {
      type: "chips";
      question: string;
      options: ChipOption[];
      selectedId?: string;
    }
  | { type: "progress"; title: string; items: ProgressItem[] }
  | { type: "tool"; name: string; detail?: string };

export type Role = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: Role;
  parts: MessagePart[];
}

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

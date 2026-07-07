import type Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, TOOLS } from "./tools";

/**
 * Ollama adapter — free, local, no API key. Translates between the
 * Anthropic-style message blocks our agent loop speaks and Ollama's
 * OpenAI-style chat format, so the same client loop drives both engines.
 */

const HOST = process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434";

/** Models known to handle tool calling well, best first. */
const PREFERRED = ["qwen3", "qwen2.5", "llama3.3", "llama3.1", "llama3.2", "mistral-nemo", "mistral"];

const OLLAMA_ADDENDUM = `

## Local model notes
You are running as a small local model. Keep it simple: specs of 5-7 sections, short copy, at most 6 products/items per section. Always answer with a tool call when one applies; never print JSON in prose.`;

export interface OllamaStatus {
  available: boolean;
  model?: string;
}

export async function detectOllama(): Promise<OllamaStatus> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 1200);
    const res = await fetch(`${HOST}/api/tags`, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return { available: false };
    const data = (await res.json()) as { models?: { name: string }[] };
    const names = (data.models ?? []).map((m) => m.name);
    if (names.length === 0) return { available: false };

    const envModel = process.env.OLLAMA_MODEL;
    if (envModel) return { available: true, model: envModel };
    for (const pref of PREFERRED) {
      const hit = names.find((n) => n.startsWith(pref));
      if (hit) return { available: true, model: hit };
    }
    return { available: true, model: names[0] };
  } catch {
    return { available: false };
  }
}

/* ------------------------- format conversion ------------------------- */

interface OllamaToolCall {
  function: { name: string; arguments: Record<string, unknown> | string };
}

interface OllamaMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_calls?: OllamaToolCall[];
}

function toOllamaMessages(messages: Anthropic.MessageParam[]): OllamaMessage[] {
  const out: OllamaMessage[] = [
    { role: "system", content: SYSTEM_PROMPT + OLLAMA_ADDENDUM },
  ];

  for (const m of messages) {
    if (typeof m.content === "string") {
      out.push({ role: m.role, content: m.content });
      continue;
    }
    if (m.role === "assistant") {
      const text = m.content
        .filter((b) => b.type === "text")
        .map((b) => (b as Anthropic.TextBlock).text)
        .join("\n");
      const toolCalls: OllamaToolCall[] = m.content
        .filter((b) => b.type === "tool_use")
        .map((b) => {
          const tu = b as Anthropic.ToolUseBlock;
          return { function: { name: tu.name, arguments: tu.input as Record<string, unknown> } };
        });
      out.push({
        role: "assistant",
        content: text,
        ...(toolCalls.length > 0 ? { tool_calls: toolCalls } : {}),
      });
    } else {
      for (const block of m.content) {
        if (block.type === "tool_result") {
          const content =
            typeof block.content === "string"
              ? block.content
              : JSON.stringify(block.content ?? "");
          out.push({ role: "tool", content });
        } else if (block.type === "text") {
          out.push({ role: "user", content: block.text });
        }
      }
    }
  }
  return out;
}

function fromOllamaMessage(msg: OllamaMessage): unknown[] {
  const blocks: unknown[] = [];
  if (msg.content && msg.content.trim()) {
    blocks.push({ type: "text", text: msg.content });
  }
  (msg.tool_calls ?? []).forEach((tc, i) => {
    let input: Record<string, unknown> = {};
    if (typeof tc.function.arguments === "string") {
      try {
        input = JSON.parse(tc.function.arguments);
      } catch {
        input = {};
      }
    } else {
      input = tc.function.arguments ?? {};
    }
    blocks.push({
      type: "tool_use",
      id: `ollama-${Date.now()}-${i}`,
      name: tc.function.name,
      input,
    });
  });
  return blocks;
}

/* ------------------------------ the call ------------------------------ */

export async function ollamaChat(
  messages: Anthropic.MessageParam[],
  model: string,
): Promise<{ content: unknown[]; stop_reason: string }> {
  const res = await fetch(`${HOST}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      messages: toOllamaMessages(messages),
      tools: TOOLS.map((t) => ({
        type: "function",
        function: {
          name: t.name,
          description: t.description,
          parameters: t.input_schema,
        },
      })),
      options: { num_predict: 4096 },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Ollama error ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as { message: OllamaMessage };
  const content = fromOllamaMessage(data.message);
  const hasTools = content.some((b) => (b as { type: string }).type === "tool_use");
  return { content, stop_reason: hasTools ? "tool_use" : "end_turn" };
}

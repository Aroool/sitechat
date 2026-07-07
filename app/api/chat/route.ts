import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, TOOLS } from "@/lib/ai/tools";
import { detectOllama, ollamaChat } from "@/lib/ai/ollama";

export const runtime = "nodejs";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";

/**
 * Mode probe. Priority: Claude (key set) → Ollama (local server up) → demo.
 * `hasKey` is kept for back-compat with earlier clients.
 */
export async function GET() {
  const hasKey = Boolean(process.env.ANTHROPIC_API_KEY);
  const ollama = hasKey ? { available: false } : await detectOllama();
  return Response.json({ hasKey, ollama });
}

export async function POST(req: Request) {
  let messages: Anthropic.MessageParam[];
  let engine: string;
  try {
    const body = await req.json();
    messages = body.messages;
    engine = body.engine ?? "claude";
    if (!Array.isArray(messages) || messages.length === 0) throw new Error("empty");
  } catch {
    return Response.json({ error: "Body must be { messages, engine? }" }, { status: 400 });
  }

  try {
    if (engine === "ollama") {
      const status = await detectOllama();
      if (!status.available || !status.model) {
        return Response.json({ error: "Ollama is not running or has no models" }, { status: 503 });
      }
      const result = await ollamaChat(messages, status.model);
      return Response.json(result);
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json({ error: "ANTHROPIC_API_KEY is not configured" }, { status: 503 });
    }
    const client = new Anthropic();
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      tools: TOOLS as Anthropic.Tool[],
      messages,
    });
    return Response.json({ content: res.content, stop_reason: res.stop_reason });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upstream error";
    return Response.json({ error: message }, { status: 502 });
  }
}

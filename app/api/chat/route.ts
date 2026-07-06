import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, TOOLS } from "@/lib/ai/tools";

export const runtime = "nodejs";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";

/** Mode probe — the client falls back to the local demo engine without a key. */
export async function GET() {
  return Response.json({ hasKey: Boolean(process.env.ANTHROPIC_API_KEY) });
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "ANTHROPIC_API_KEY is not configured" }, { status: 503 });
  }

  let messages: Anthropic.MessageParam[];
  try {
    const body = await req.json();
    messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) throw new Error("empty");
  } catch {
    return Response.json({ error: "Body must be { messages: MessageParam[] }" }, { status: 400 });
  }

  try {
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

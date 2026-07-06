"use client";

import { useEffect, useRef } from "react";
import { Sparkles, ShoppingBasket, Camera, Coffee } from "lucide-react";
import { useChatStore } from "@/lib/store/chatStore";
import { sendUserMessage } from "@/lib/chat/dispatch";
import Message from "./Message";
import Composer from "./Composer";

const SUGGESTIONS = [
  {
    icon: ShoppingBasket,
    label: "Grocery delivery store",
    prompt: "Create an ecommerce website for a grocery store",
  },
  {
    icon: Camera,
    label: "Photographer portfolio",
    prompt: "Build a portfolio site for a photographer",
  },
  {
    icon: Coffee,
    label: "Coffee shop waitlist",
    prompt: "Make a waitlist landing page for my new coffee shop",
  },
];

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="grid size-12 place-items-center rounded-2xl bg-accent-soft">
        <Sparkles className="size-6 text-accent" />
      </div>
      <div>
        <h1 className="text-lg font-semibold tracking-tight">
          What should we build?
        </h1>
        <p className="mt-1 max-w-[260px] text-sm leading-relaxed text-ink-2">
          Describe a website. I&apos;ll ask a couple of questions, then build it
          live in the preview.
        </p>
      </div>
      <div className="flex w-full max-w-[280px] flex-col gap-2">
        {SUGGESTIONS.map(({ icon: Icon, label, prompt }) => (
          <button
            key={label}
            type="button"
            onClick={() => sendUserMessage(prompt)}
            className="flex items-center gap-2.5 rounded-xl border border-line px-3.5 py-2.5 text-left text-sm text-ink-2 transition-all hover:border-line-strong hover:bg-panel-2 hover:text-ink"
          >
            <Icon className="size-4 shrink-0 text-accent" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="msg-in flex items-center gap-1 px-1 py-2" aria-label="Assistant is thinking">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 rounded-full bg-ink-3"
          style={{ animation: `pulse-dot 1.2s ease-in-out ${i * 0.18}s infinite` }}
        />
      ))}
    </div>
  );
}

export default function ChatPanel() {
  const messages = useChatStore((s) => s.messages);
  const busy = useChatStore((s) => s.busy);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-4 p-4">
            {messages.map((m) => (
              <Message key={m.id} message={m} />
            ))}
            {busy && <TypingDots />}
          </div>
        </div>
      )}
      <Composer />
    </div>
  );
}

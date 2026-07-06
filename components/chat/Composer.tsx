"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useChatStore } from "@/lib/store/chatStore";
import { sendUserMessage } from "@/lib/chat/dispatch";

export default function Composer() {
  const busy = useChatStore((s) => s.busy);
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  // "/" focuses the composer from anywhere (unless already typing somewhere).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.key === "/" && !["TEXTAREA", "INPUT"].includes(target.tagName)) {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const submit = () => {
    const text = value.trim();
    if (!text || busy) return;
    setValue("");
    if (ref.current) ref.current.style.height = "auto";
    void sendUserMessage(text);
  };

  return (
    <div className="border-t border-line p-3">
      <div className="flex items-end gap-2 rounded-2xl border border-line bg-panel-2/60 p-1.5 transition-colors focus-within:border-line-strong">
        <textarea
          ref={ref}
          rows={1}
          value={value}
          placeholder={busy ? "Building…" : "Describe your site, or ask for a change…"}
          disabled={busy}
          onChange={(e) => {
            setValue(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          className="max-h-[120px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm leading-relaxed text-ink outline-none placeholder:text-ink-3 disabled:opacity-60"
          aria-label="Message"
        />
        <button
          type="button"
          onClick={submit}
          disabled={busy || !value.trim()}
          aria-label="Send message"
          className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-on-accent transition-all enabled:hover:bg-accent-strong disabled:opacity-35"
        >
          <ArrowUp className="size-4" />
        </button>
      </div>
      <p className="mt-1.5 px-2 text-center text-[11px] text-ink-3">
        Try “make yourself dark mode” — the interface listens too
      </p>
    </div>
  );
}

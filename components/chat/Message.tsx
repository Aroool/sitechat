"use client";

import { Check, Loader2, Zap, Hammer } from "lucide-react";
import type { ChatMessage, ChipOption, MessagePart } from "@/lib/chat/types";
import { answerWithChip } from "@/lib/chat/dispatch";
import { SITE_THEMES } from "@/lib/builder/themes";
import type { SiteThemeId } from "@/lib/builder/types";

function ThemeSwatchChip({
  option,
  selected,
  answered,
  onSelect,
}: {
  option: ChipOption;
  selected: boolean;
  answered: boolean;
  onSelect: () => void;
}) {
  const theme = SITE_THEMES[option.themeId as SiteThemeId];
  const c = theme.colors;
  return (
    <button
      type="button"
      disabled={answered}
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${
        selected
          ? "border-accent bg-accent-soft"
          : answered
            ? "border-line opacity-50"
            : "border-line hover:border-line-strong hover:bg-panel-2"
      }`}
    >
      <span className="flex shrink-0 -space-x-1.5" aria-hidden>
        {[c.primary, c.text, c.surface, c.bg].map((color, i) => (
          <span
            key={i}
            className="inline-block size-4 rounded-full border border-line"
            style={{ background: color, zIndex: 4 - i, position: "relative" }}
          />
        ))}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className="block truncate text-sm font-semibold text-ink"
          style={{ fontFamily: theme.font.family }}
        >
          {theme.label}
        </span>
        <span className="block truncate text-xs text-ink-3">{theme.vibe}</span>
      </span>
      <span
        className="grid size-7 shrink-0 place-items-center rounded-lg text-sm font-bold"
        style={{
          background: c.primary,
          color: c.onPrimary,
          fontFamily: theme.font.family,
        }}
        aria-hidden
      >
        Aa
      </span>
    </button>
  );
}

function ChipsPart({
  messageId,
  partIndex,
  part,
}: {
  messageId: string;
  partIndex: number;
  part: Extract<MessagePart, { type: "chips" }>;
}) {
  const answered = part.selectedId !== undefined;
  const hasSwatches = part.options.some((o) => o.themeId && SITE_THEMES[o.themeId as SiteThemeId]);
  return (
    <div>
      <p className="mb-2 text-sm leading-relaxed text-ink">{part.question}</p>
      <div
        className={hasSwatches ? "flex flex-col gap-1.5" : "flex flex-wrap gap-1.5"}
        role="group"
        aria-label={part.question}
      >
        {part.options.map((o) => {
          const selected = part.selectedId === o.id;
          if (o.themeId && SITE_THEMES[o.themeId as SiteThemeId]) {
            return (
              <ThemeSwatchChip
                key={o.id}
                option={o}
                selected={selected}
                answered={answered}
                onSelect={() => answerWithChip(messageId, partIndex, o.id, o.label)}
              />
            );
          }
          return (
            <button
              key={o.id}
              type="button"
              disabled={answered}
              onClick={() => answerWithChip(messageId, partIndex, o.id, o.label)}
              className={`rounded-full border px-3 py-1 text-xs transition-all ${
                selected
                  ? "border-accent bg-accent-soft font-medium text-accent"
                  : answered
                    ? "border-line text-ink-3 opacity-50"
                    : "border-line text-ink-2 hover:border-line-strong hover:bg-panel-2 hover:text-ink"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ProgressPart({ part }: { part: Extract<MessagePart, { type: "progress" }> }) {
  return (
    <div className="rounded-xl border border-line bg-panel-2/60 px-3 py-2.5">
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-ink-2">
        <Hammer className="size-3.5" />
        {part.title}
      </p>
      <ul className="space-y-1">
        {part.items.map((item) => (
          <li key={item.id} className="flex items-center gap-2 text-sm">
            {item.status === "done" ? (
              <Check className="size-3.5 shrink-0 text-ok" />
            ) : item.status === "active" ? (
              <Loader2 className="size-3.5 shrink-0 text-accent spin" />
            ) : (
              <span className="grid size-3.5 shrink-0 place-items-center">
                <span className="size-1 rounded-full bg-ink-3" />
              </span>
            )}
            <span className={item.status === "pending" ? "text-ink-3" : "text-ink"}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ToolPart({ part }: { part: Extract<MessagePart, { type: "tool" }> }) {
  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-md border border-line bg-panel-2 px-2 py-1 font-mono text-xs text-ink-2">
      <Zap className="size-3 text-accent" />
      {part.name}
      {part.detail && <span className="text-ink-3">{part.detail}</span>}
    </span>
  );
}

export default function Message({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    const text = message.parts
      .map((p) => (p.type === "text" ? p.text : ""))
      .join(" ");
    return (
      <div className="msg-in flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-accent-soft px-3.5 py-2 text-sm leading-relaxed text-ink">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className="msg-in flex max-w-[92%] flex-col gap-2.5">
      {message.parts.map((part, i) => {
        switch (part.type) {
          case "text":
            return (
              <p key={i} className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
                {part.text}
              </p>
            );
          case "chips":
            return (
              <ChipsPart key={i} messageId={message.id} partIndex={i} part={part} />
            );
          case "progress":
            return <ProgressPart key={i} part={part} />;
          case "tool":
            return <ToolPart key={i} part={part} />;
        }
      })}
    </div>
  );
}

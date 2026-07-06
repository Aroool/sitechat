"use client";

import { useEffect, useState } from "react";
import { useUIStore } from "@/lib/store/uiStore";

interface Piece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  drift: number;
}

const COLORS = ["var(--accent)", "var(--ok)", "var(--warn)", "var(--danger)", "var(--accent-strong)"];

/** Fired by the celebrate() UI tool — a brief, GPU-cheap confetti burst. */
export default function ConfettiLayer() {
  const tick = useUIStore((s) => s.confettiTick);
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (tick === 0) return;
    const burst: Piece[] = Array.from({ length: 36 }, (_, i) => ({
      id: tick * 100 + i,
      left: Math.random() * 100,
      delay: Math.random() * 0.35,
      duration: 1.3 + Math.random() * 1.1,
      color: COLORS[i % COLORS.length],
      size: 6 + Math.random() * 6,
      drift: (Math.random() - 0.5) * 160,
    }));
    setPieces(burst);
    const t = setTimeout(() => setPieces([]), 3000);
    return () => clearTimeout(t);
  }, [tick]);

  if (pieces.length === 0) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece absolute"
          style={{
            left: `${p.left}%`,
            top: "-12px",
            width: p.size,
            height: p.size * 0.45,
            background: p.color,
            borderRadius: 1,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            ["--drift" as string]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

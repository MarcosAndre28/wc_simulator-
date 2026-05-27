"use client";

import { useMemo } from "react";

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
  rotation: number;
  drift: number;
}

const COLORS = ["#ffd700", "#ffec8b", "#ffffff", "#c0c0c0", "#ffc107", "#f5e6a8"];

function createPieces(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 8,
    size: 4 + Math.random() * 8,
    color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? "#ffd700",
    rotation: Math.random() * 360,
    drift: -30 + Math.random() * 60,
  }));
}

export function Confetti({ pieceCount = 55 }: { pieceCount?: number }) {
  const pieces = useMemo(() => createPieces(pieceCount), [pieceCount]);

  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden" aria-hidden>
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="confetti-piece absolute top-0 block rounded-sm opacity-90"
          style={{
            left: `${piece.left}%`,
            width: piece.size,
            height: piece.size * 0.6,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            ["--confetti-drift" as string]: `${piece.drift}px`,
            ["--confetti-rotate" as string]: `${piece.rotation}deg`,
          }}
        />
      ))}
    </div>
  );
}

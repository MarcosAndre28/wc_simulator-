"use client";

import type { ReactNode } from "react";
import { useBracketLayout } from "@/components/BracketLayoutContext";

const LINE = "rgba(255, 215, 0, 0.5)";

function slotCenterPercent(index: number, total: number): number {
  return ((index + 0.5) / total) * 100;
}

function LinePath({ d }: { d: string }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={LINE}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
    />
  );
}

/** Conector fixo entre duas colunas (ex.: 4 jogos → 2). Altura não muda com seleções. */
export function InterRoundConnector({
  fromCount,
  toCount,
  height,
  side,
}: {
  fromCount: number;
  toCount: number;
  height: number;
  side: "left" | "right";
}) {
  const { connectorW, headerOffset } = useBracketLayout();
  const w = connectorW;
  const pairCount = toCount;
  const feedersPerPair = fromCount / pairCount;
  const paths: string[] = [];

  for (let p = 0; p < pairCount; p += 1) {
    const mergeY = slotCenterPercent(p, pairCount);
    const joinX = w * 0.5;

    for (let f = 0; f < feedersPerPair; f += 1) {
      const feederIndex = p * feedersPerPair + f;
      const feederY = slotCenterPercent(feederIndex, fromCount);

      if (side === "left") {
        paths.push(`M 0 ${feederY} H ${joinX} V ${mergeY}`);
      } else {
        paths.push(`M ${w} ${feederY} H ${w - joinX} V ${mergeY}`);
      }
    }

    if (side === "left") {
      paths.push(`M ${joinX} ${mergeY} H ${w}`);
    } else {
      paths.push(`M ${w - joinX} ${mergeY} H 0`);
    }
  }

  return (
    <div
      className="bracket-inter-round shrink-0 self-start"
      style={{
        width: w,
        height,
        minHeight: height,
        marginTop: headerOffset,
      }}
      aria-hidden
    >
      <svg
        width={w}
        height={height}
        viewBox={`0 0 ${w} 100`}
        preserveAspectRatio="none"
        className="block h-full w-full overflow-visible"
      >
        {paths.map((d) => (
          <LinePath key={d} d={d} />
        ))}
      </svg>
    </div>
  );
}

/** Ponte horizontal até a final — linha no centro vertical dos cards. */
export function BracketFinalBridge({
  side,
  layoutHeight,
}: {
  side: "left" | "right";
  layoutHeight: number;
}) {
  const { finalBridgeW, headerOffset } = useBracketLayout();
  const w = finalBridgeW;
  const midY = 50;

  const d =
    side === "left" ? `M 0 ${midY} H ${w}` : `M ${w} ${midY} H 0`;

  return (
    <div
      className="bracket-final-bridge shrink-0 self-start"
      style={{
        width: w,
        minWidth: w,
        height: layoutHeight,
        minHeight: layoutHeight,
        marginTop: headerOffset,
        flexShrink: 0,
      }}
      aria-hidden
    >
      <svg
        width={w}
        height={layoutHeight}
        viewBox={`0 0 ${w} 100`}
        preserveAspectRatio="none"
        className="block h-full w-full overflow-visible"
      >
        <LinePath d={d} />
      </svg>
    </div>
  );
}

/** Slot com altura fixa para o card não redimensionar a chave. */
export function BracketSlot({ children }: { children: ReactNode }) {
  const { cardH } = useBracketLayout();
  return (
    <div
      className="bracket-slot flex w-full shrink-0 items-center justify-center"
      style={{ height: cardH, minHeight: cardH }}
    >
      {children}
    </div>
  );
}

/** Área da final: card maior centralizado na mesma altura dos confrontos. */
export function BracketFinalSlot({
  children,
  layoutHeight,
}: {
  children: ReactNode;
  layoutHeight: number;
}) {
  return (
    <div
      className="bracket-final-slot flex items-center justify-center"
      style={{ height: layoutHeight, minHeight: layoutHeight }}
    >
      {children}
    </div>
  );
}

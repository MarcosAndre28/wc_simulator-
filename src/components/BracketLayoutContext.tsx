"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { BracketLayoutMetrics } from "@/lib/bracket-layout";

const BracketLayoutContext = createContext<BracketLayoutMetrics | null>(null);

export function BracketLayoutProvider({
  metrics,
  children,
}: {
  metrics: BracketLayoutMetrics;
  children: ReactNode;
}) {
  return (
    <BracketLayoutContext.Provider value={metrics}>
      {children}
    </BracketLayoutContext.Provider>
  );
}

export function useBracketLayout(): BracketLayoutMetrics {
  const metrics = useContext(BracketLayoutContext);
  if (!metrics) {
    throw new Error("useBracketLayout must be used within BracketLayoutProvider");
  }
  return metrics;
}

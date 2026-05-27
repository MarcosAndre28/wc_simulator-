/** Valores base (otimizados para chave de 32 equipes). */
const BASE = {
  cardH: 76,
  columnW: 184,
  connectorW: 28,
  finalBridgeW: 72,
  slotGap: 24,
  headerOffset: 28,
  teamRowH: 38,
  matchCardW: 184,
  finalCardW: 216,
} as const;

export type BracketLayoutMetrics = {
  cardH: number;
  columnW: number;
  connectorW: number;
  finalBridgeW: number;
  slotGap: number;
  headerOffset: number;
  teamRowH: number;
  matchCardW: number;
  finalCardW: number;
};

function scaleForWingMatches(wingFirstRoundMatchCount: number): number {
  if (wingFirstRoundMatchCount <= 1) {
    return 1.55;
  }
  if (wingFirstRoundMatchCount <= 2) {
    return 1.3;
  }
  if (wingFirstRoundMatchCount <= 4) {
    return 1.12;
  }
  return 1;
}

export function getBracketLayoutMetrics(
  wingFirstRoundMatchCount: number,
): BracketLayoutMetrics {
  const s = scaleForWingMatches(wingFirstRoundMatchCount);
  return {
    cardH: Math.round(BASE.cardH * s),
    columnW: Math.round(BASE.columnW * s),
    connectorW: Math.round(BASE.connectorW * s),
    finalBridgeW: Math.round(BASE.finalBridgeW * s),
    slotGap: Math.round(BASE.slotGap * s),
    headerOffset: Math.round(BASE.headerOffset * s),
    teamRowH: Math.round(BASE.teamRowH * s),
    matchCardW: Math.round(BASE.matchCardW * s),
    finalCardW: Math.round(BASE.finalCardW * s),
  };
}

export function getWingLayoutHeight(
  firstRoundMatchCount: number,
  metrics: BracketLayoutMetrics,
): number {
  const n = Math.max(1, firstRoundMatchCount);
  return n * metrics.cardH + (n - 1) * metrics.slotGap;
}

export function getWingMinWidth(
  columnCount: number,
  metrics: BracketLayoutMetrics,
): number {
  const cols = Math.max(1, columnCount);
  if (cols <= 1) {
    return metrics.columnW;
  }
  return cols * metrics.columnW + (cols - 1) * metrics.connectorW;
}

/** Chaves pequenas (4–16) ocupam mais a altura útil da viewport. */
export function shouldExpandBracketViewport(wingFirstRoundMatchCount: number): boolean {
  return wingFirstRoundMatchCount <= 4;
}

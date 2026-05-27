/** Valores base (otimizados para chave de 32 equipes). */
const BASE = {
  cardH: 76,
  columnW: 184,
  connectorW: 28,
  finalBridgeW: 72,
  centerColumnW: 168,
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
  centerColumnW: number;
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
  if (wingFirstRoundMatchCount <= 5) {
    return 1.05;
  }
  return 1;
}

function viewportShrink(viewportWidth: number): number {
  if (viewportWidth < 640) {
    return 0.88;
  }
  if (viewportWidth < 1024) {
    return 0.94;
  }
  return 1;
}

/** Em telas largas, cards um pouco maiores para preencher a área útil. */
function viewportGrow(viewportWidth: number): number {
  if (viewportWidth >= 1680) {
    return 1.14;
  }
  if (viewportWidth >= 1440) {
    return 1.1;
  }
  if (viewportWidth >= 1280) {
    return 1.06;
  }
  return 1;
}

/** Largura útil da coluna do mata-mata (desconta barra de classificação no desktop). */
export function getBracketAreaWidth(
  viewportWidth: number,
  hasQualificationSidebar: boolean,
): number {
  const sidebar = hasQualificationSidebar && viewportWidth >= 1024 ? 380 : 0;
  return Math.max(640, viewportWidth - sidebar - 40);
}

export function getBracketLayoutMetrics(
  wingFirstRoundMatchCount: number,
  viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1280,
): BracketLayoutMetrics {
  const s =
    scaleForWingMatches(wingFirstRoundMatchCount) *
    viewportShrink(viewportWidth) *
    viewportGrow(viewportWidth);
  return {
    cardH: Math.round(BASE.cardH * s),
    columnW: Math.round(BASE.columnW * s),
    connectorW: Math.round(BASE.connectorW * s),
    finalBridgeW: Math.round(BASE.finalBridgeW * s),
    centerColumnW: Math.round(BASE.centerColumnW * s),
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
  const gap =
    firstRoundMatchCount >= 4 ? Math.round(metrics.slotGap * 0.88) : metrics.slotGap;
  return n * metrics.cardH + (n - 1) * gap;
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

export function getCenterWingMinWidth(
  columnCount: number,
  metrics: BracketLayoutMetrics,
): number {
  const cols = Math.max(1, columnCount);
  if (cols <= 1) {
    return metrics.centerColumnW;
  }
  return cols * metrics.centerColumnW + (cols - 1) * metrics.connectorW;
}

/** Chaves pequenas (4–16) ocupam mais a altura útil da viewport — só em desktop. */
export function shouldExpandBracketViewport(
  wingFirstRoundMatchCount: number,
  viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1280,
): boolean {
  if (viewportWidth < 1024) {
    return false;
  }
  return wingFirstRoundMatchCount <= 4;
}

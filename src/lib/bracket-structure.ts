import { BracketSize } from "@/types/tournament";

/** Número de confrontos em cada rodada (a última é sempre a final). */
const MATCHES_PER_ROUND: Record<BracketSize, number[]> = {
  2: [1, 1],
  4: [2, 1],
  8: [4, 2, 1],
  16: [8, 4, 2, 1],
  /** R0 classif. 1 (11) → R1 classif. 2 (6) → oitavas → quartas → semi → final */
  22: [11, 6, 8, 4, 2, 1],
  32: [16, 8, 4, 2, 1],
};

/** Vagas na classificação 1 (11 jogos × 2 = 22 participações). */
export const QUALIFICATION_SLOT_COUNT = 22;

/** Equipes inscritas no torneio 22 (uma joga 2× na classificação 1). */
export const QUALIFICATION_REGISTERED_COUNT = 21;

export function getRegisteredTeamCount(bracketSize: BracketSize): number {
  if (bracketSize === 22) {
    return QUALIFICATION_REGISTERED_COUNT;
  }
  return bracketSize;
}

export const QUALIFICATION_1_MATCH_COUNT = 11;

/** Jogos 1–10 no setup; jogo 11 montado ao iniciar o torneio. */
export const QUALIFICATION_1_REQUIRED_MATCHES = 10;

export const QUALIFICATION_1_LAST_MATCH_INDEX = 10;
export const QUALIFICATION_1_ROUND_INDEX = 0;
export const QUALIFICATION_2_ROUND_INDEX = 1;
export const BRACKET_ROUND_INDEX = 2;

/** Vencedores dos jogos 1–10 (classif. 1) → oitavas. */
const C1_DIRECT_BRACKET_PLACEMENTS: NextMatchSlot[] = [
  { roundIndex: BRACKET_ROUND_INDEX, matchIndex: 0, slot: "A" },
  { roundIndex: BRACKET_ROUND_INDEX, matchIndex: 0, slot: "B" },
  { roundIndex: BRACKET_ROUND_INDEX, matchIndex: 1, slot: "A" },
  { roundIndex: BRACKET_ROUND_INDEX, matchIndex: 1, slot: "B" },
  { roundIndex: BRACKET_ROUND_INDEX, matchIndex: 2, slot: "A" },
  { roundIndex: BRACKET_ROUND_INDEX, matchIndex: 2, slot: "B" },
  { roundIndex: BRACKET_ROUND_INDEX, matchIndex: 3, slot: "A" },
  { roundIndex: BRACKET_ROUND_INDEX, matchIndex: 3, slot: "B" },
  { roundIndex: BRACKET_ROUND_INDEX, matchIndex: 4, slot: "A" },
  { roundIndex: BRACKET_ROUND_INDEX, matchIndex: 4, slot: "B" },
];

/** Vencedores da classif. 2 → oitavas (6 vagas). */
const C2_BRACKET_PLACEMENTS: NextMatchSlot[] = [
  { roundIndex: BRACKET_ROUND_INDEX, matchIndex: 5, slot: "A" },
  { roundIndex: BRACKET_ROUND_INDEX, matchIndex: 5, slot: "B" },
  { roundIndex: BRACKET_ROUND_INDEX, matchIndex: 6, slot: "A" },
  { roundIndex: BRACKET_ROUND_INDEX, matchIndex: 6, slot: "B" },
  { roundIndex: BRACKET_ROUND_INDEX, matchIndex: 7, slot: "A" },
  { roundIndex: BRACKET_ROUND_INDEX, matchIndex: 7, slot: "B" },
];

export function getMatchesPerRound(bracketSize: BracketSize, roundIndex: number): number {
  const counts = MATCHES_PER_ROUND[bracketSize];
  return counts[roundIndex] ?? 1;
}

export function getTotalRoundsForSize(bracketSize: BracketSize): number {
  return MATCHES_PER_ROUND[bracketSize].length;
}

export function getFirstRoundMatchCount(bracketSize: BracketSize): number {
  return MATCHES_PER_ROUND[bracketSize][0] ?? 1;
}

export function getWingFirstRoundMatchCount(bracketSize: BracketSize): number {
  if (bracketSize === 22) {
    return 4;
  }
  return getFirstRoundMatchCount(bracketSize) / 2;
}

export function getStandardFirstRoundMatchCount(bracketSize: BracketSize): number {
  if (bracketSize === 22) {
    return QUALIFICATION_1_MATCH_COUNT;
  }
  return getFirstRoundMatchCount(bracketSize);
}

export type NextMatchSlot = {
  roundIndex: number;
  matchIndex: number;
  slot: "A" | "B";
};

function c1LoserSlot(matchIndex: number): NextMatchSlot {
  if (matchIndex <= 9) {
    return {
      roundIndex: QUALIFICATION_2_ROUND_INDEX,
      matchIndex: Math.floor(matchIndex / 2),
      slot: matchIndex % 2 === 0 ? "A" : "B",
    };
  }
  return {
    roundIndex: QUALIFICATION_2_ROUND_INDEX,
    matchIndex: 5,
    slot: "A",
  };
}

/** Perdedor da classif. 1 → classif. 2. */
export function getLoserAdvancement(
  bracketSize: BracketSize,
  roundIndex: number,
  matchIndex: number,
): NextMatchSlot | null {
  if (bracketSize !== 22 || roundIndex !== QUALIFICATION_1_ROUND_INDEX) {
    return null;
  }
  return c1LoserSlot(matchIndex);
}

/** Avanço do vencedor. */
export function getWinnerAdvancement(
  bracketSize: BracketSize,
  roundIndex: number,
  matchIndex: number,
): NextMatchSlot | null {
  if (bracketSize === 22) {
    if (roundIndex === QUALIFICATION_1_ROUND_INDEX) {
      if (matchIndex <= 9) {
        return C1_DIRECT_BRACKET_PLACEMENTS[matchIndex] ?? null;
      }
      if (matchIndex === 10) {
        return { roundIndex: QUALIFICATION_2_ROUND_INDEX, matchIndex: 5, slot: "B" };
      }
      return null;
    }

    if (roundIndex === QUALIFICATION_2_ROUND_INDEX) {
      return C2_BRACKET_PLACEMENTS[matchIndex] ?? null;
    }

    const totalRounds = getTotalRoundsForSize(22);
    if (roundIndex + 1 >= totalRounds) {
      return null;
    }

    return {
      roundIndex: roundIndex + 1,
      matchIndex: Math.floor(matchIndex / 2),
      slot: matchIndex % 2 === 0 ? "A" : "B",
    };
  }

  const totalRounds = getTotalRoundsForSize(bracketSize);
  if (roundIndex + 1 >= totalRounds) {
    return null;
  }

  return {
    roundIndex: roundIndex + 1,
    matchIndex: Math.floor(matchIndex / 2),
    slot: matchIndex % 2 === 0 ? "A" : "B",
  };
}

export function getDownstreamSlotsToClear(
  bracketSize: BracketSize,
  roundIndex: number,
  matchIndex: number,
): NextMatchSlot[] {
  const slots: NextMatchSlot[] = [];
  let r = roundIndex;
  let m = matchIndex;

  while (true) {
    const next = getWinnerAdvancement(bracketSize, r, m);
    if (!next) {
      break;
    }
    slots.push(next);
    r = next.roundIndex;
    m = next.matchIndex;
  }

  return slots;
}

export function getLoserDownstreamSlotsToClear(
  bracketSize: BracketSize,
  roundIndex: number,
  matchIndex: number,
): NextMatchSlot[] {
  const slots: NextMatchSlot[] = [];
  let r = roundIndex;
  let m = matchIndex;

  while (true) {
    const next = getLoserAdvancement(bracketSize, r, m);
    if (!next) {
      break;
    }
    slots.push(next);
    r = next.roundIndex;
    m = next.matchIndex;
  }

  return slots;
}

export function getRoundNameForBracket(
  bracketSize: BracketSize,
  roundIndex: number,
  totalRounds: number,
): string {
  const roundsFromFinal = totalRounds - 1 - roundIndex;

  if (bracketSize === 22) {
    switch (roundsFromFinal) {
      case 5:
        return "Classificação 1";
      case 4:
        return "Classificação 2";
      case 3:
        return "Oitavas de final";
      case 2:
        return "Quartas de final";
      case 1:
        return "Semifinal";
      case 0:
        return "Final";
      default:
        return `Rodada ${roundIndex + 1}`;
    }
  }

  switch (roundsFromFinal) {
    case 0:
      return "Final";
    case 1:
      return "Semifinal";
    case 2:
      return "Quartas de final";
    case 3:
      return "Oitavas de final";
    case 4:
      return "32 avos de final";
    default:
      return `Rodada ${roundIndex + 1}`;
  }
}

export function getQualification1RoundLabel(): string {
  return "Classificação 1";
}

export function getQualification2RoundLabel(): string {
  return "Classificação 2";
}

/** Rótulo TBD na classif. 2. */
export function getQualification2TbdLabel(
  matchIndex: number,
  slot: "A" | "B",
): string {
  if (matchIndex === 5 && slot === "B") {
    return "Venc. jogo 11 (C1)";
  }
  const gameA = matchIndex * 2 + 1;
  const gameB = matchIndex * 2 + 2;
  return slot === "A" ? `Perd. jogo ${gameA}` : `Perd. jogo ${gameB}`;
}

/** Rótulo TBD nas oitavas (torneio 22). */
export function getBracketTbdLabel(
  roundIndex: number,
  matchIndex: number,
  slot: "A" | "B",
): string | null {
  if (roundIndex !== BRACKET_ROUND_INDEX) {
    return null;
  }

  const c1 = C1_DIRECT_BRACKET_PLACEMENTS.find(
    (p) => p.matchIndex === matchIndex && p.slot === slot,
  );
  if (c1) {
    const idx = C1_DIRECT_BRACKET_PLACEMENTS.indexOf(c1);
    return `Venc. C1 jogo ${idx + 1}`;
  }

  const c2 = C2_BRACKET_PLACEMENTS.find(
    (p) => p.matchIndex === matchIndex && p.slot === slot,
  );
  if (c2) {
    const idx = C2_BRACKET_PLACEMENTS.indexOf(c2);
    return `Venc. C2 jogo ${idx + 1}`;
  }

  return null;
}

/** Ordem fixa dos rótulos de fase no topo do chaveamento. */
export function getPhaseLabelsForBracket(bracketSize: BracketSize): string[] {
  if (bracketSize === 22) {
    return [
      "Classificação 1",
      "Classificação 2",
      "Oitavas de final",
      "Quartas de final",
      "Semifinal",
      "Final",
    ];
  }
  const total = getTotalRoundsForSize(bracketSize);
  const labels: string[] = [];
  for (let i = 0; i < total; i += 1) {
    labels.push(getRoundNameForBracket(bracketSize, i, total));
  }
  return labels;
}

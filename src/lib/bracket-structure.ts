import { BracketSize } from "@/types/tournament";

/** Número de confrontos em cada rodada (a última é sempre a final). */
const MATCHES_PER_ROUND: Record<BracketSize, number[]> = {
  2: [1, 1],
  4: [2, 1],
  8: [4, 2, 1],
  16: [8, 4, 2, 1],
  20: [10, 5, 2, 1, 1],
  32: [16, 8, 4, 2, 1],
};

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
  return getFirstRoundMatchCount(bracketSize) / 2;
}

export type NextMatchSlot = {
  roundIndex: number;
  matchIndex: number;
  slot: "A" | "B";
};

/** Avanço do vencedor para a próxima rodada (inclui bye no torneio de 20). */
export function getWinnerAdvancement(
  bracketSize: BracketSize,
  roundIndex: number,
  matchIndex: number,
): NextMatchSlot | null {
  if (bracketSize === 20) {
    if (roundIndex === 0) {
      return {
        roundIndex: 1,
        matchIndex: Math.floor(matchIndex / 2),
        slot: matchIndex % 2 === 0 ? "A" : "B",
      };
    }
    if (roundIndex === 1) {
      if (matchIndex === 4) {
        return { roundIndex: 4, matchIndex: 0, slot: "B" };
      }
      return {
        roundIndex: 2,
        matchIndex: Math.floor(matchIndex / 2),
        slot: matchIndex % 2 === 0 ? "A" : "B",
      };
    }
    if (roundIndex === 2) {
      return {
        roundIndex: 3,
        matchIndex: 0,
        slot: matchIndex === 0 ? "A" : "B",
      };
    }
    if (roundIndex === 3) {
      return { roundIndex: 4, matchIndex: 0, slot: "A" };
    }
    return null;
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

/** Limpa rodadas abaixo ao trocar vencedor (inclui caminho de bye do torneio de 20). */
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

export function getRoundNameForBracket(
  bracketSize: BracketSize,
  roundIndex: number,
  totalRounds: number,
): string {
  const roundsFromFinal = totalRounds - 1 - roundIndex;

  if (bracketSize === 20) {
    switch (roundsFromFinal) {
      case 4:
        return "Primeira fase";
      case 3:
        return "Segunda fase";
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

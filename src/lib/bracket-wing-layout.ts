import { BracketSize, Match, Round } from "@/types/tournament";
import {
  BRACKET_ROUND_INDEX,
  QUALIFICATION_1_ROUND_INDEX,
} from "@/lib/bracket-structure";

export type BracketSide = "left" | "right" | "center";

/** Índices de jogos por asa no mata-mata (torneio 22: a partir das oitavas). */
const WING_MATCH_INDICES: Partial<
  Record<BracketSize, Record<number, { left: number[]; right: number[]; center: number[] }>>
> = {
  22: {
    [BRACKET_ROUND_INDEX]: { left: [0, 1, 2, 3], right: [4, 5, 6, 7], center: [] },
    3: { left: [0, 1], right: [2, 3], center: [] },
    4: { left: [0], right: [1], center: [] },
  },
};

function getIndices(
  bracketSize: BracketSize,
  roundIndex: number,
  side: BracketSide,
): number[] {
  const map = WING_MATCH_INDICES[bracketSize]?.[roundIndex];
  if (map) {
    return map[side];
  }
  const round = { matches: [] as Match[] };
  return defaultIndicesForRound(round as Round, side);
}

function defaultIndicesForRound(round: Round, side: BracketSide): number[] {
  const n = round.matches.length;
  if (n === 0) {
    return [];
  }
  const half = Math.floor(n / 2);
  if (side === "left") {
    return Array.from({ length: half }, (_, i) => i);
  }
  if (side === "right") {
    return Array.from({ length: n - half }, (_, i) => i + half);
  }
  return [];
}

export function getMatchesForSide(
  round: Round,
  bracketSize: BracketSize,
  side: BracketSide,
): Match[] {
  const indices = getIndices(bracketSize, round.index, side);
  if (indices.length > 0 || WING_MATCH_INDICES[bracketSize]?.[round.index]) {
    return indices
      .map((i) => round.matches[i])
      .filter((m): m is Match => m != null);
  }
  const fallback = defaultIndicesForRound(round, side);
  return fallback.map((i) => round.matches[i]).filter((m): m is Match => m != null);
}

export function hasMainCenterColumn(
  _bracketSize: BracketSize,
  _preFinalRounds: Round[],
): boolean {
  return false;
}

export function hasSupplementalBracket(_bracketSize: BracketSize): boolean {
  return false;
}

export type SupplementalColumn = {
  round: Round;
  matches: Match[];
  title: string;
};

export function getSupplementalColumns(
  _preFinalRounds: Round[],
  _bracketSize: BracketSize,
): SupplementalColumn[] {
  return [];
}

export function isQualificationRound(bracketSize: BracketSize, roundIndex: number): boolean {
  return (
    bracketSize === 22 &&
    (roundIndex === QUALIFICATION_1_ROUND_INDEX || roundIndex === QUALIFICATION_1_ROUND_INDEX + 1)
  );
}

export type WingColumn = { round: Round; matches: Match[] };

export function buildSymmetricWingColumns(
  preFinalRounds: Round[],
  bracketSize: BracketSize,
  side: "left" | "right",
): WingColumn[] {
  const rounds =
    bracketSize === 22
      ? preFinalRounds.filter((r) => r.index >= BRACKET_ROUND_INDEX)
      : preFinalRounds;

  if (bracketSize === 22) {
    return rounds
      .map((round) => ({
        round,
        matches: getMatchesForSide(round, bracketSize, side),
      }))
      .filter((col) => col.matches.length > 0);
  }

  return rounds
    .map((round) => {
      const half = Math.floor(round.matches.length / 2);
      const matches =
        side === "left"
          ? round.matches.slice(0, half)
          : round.matches.slice(half);
      return { round, matches };
    })
    .filter((col) => col.matches.length > 0);
}

export function getWingColumnCount(bracketSize: BracketSize, preFinalRounds: Round[]): number {
  if (bracketSize === 22) {
    return buildSymmetricWingColumns(preFinalRounds, bracketSize, "left").length;
  }
  return preFinalRounds.filter((r) => r.matches.length >= 2).length;
}

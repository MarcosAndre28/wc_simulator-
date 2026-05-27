export type BracketSize = 32 | 16 | 8 | 4 | 2;

export type TournamentPhase = "setup" | "bracket" | "champion";

export interface Country {
  code: string;
  iso: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  iso: string;
}

export interface Match {
  id: string;
  roundIndex: number;
  matchIndex: number;
  teamA: Team | null;
  teamB: Team | null;
  winnerId: string | null;
}

export interface Round {
  index: number;
  name: string;
  matches: Match[];
}

export interface TournamentState {
  bracketSize: BracketSize;
  phase: TournamentPhase;
  teams: Team[];
  rounds: Round[];
  champion: Team | null;
}

export const BRACKET_SIZE_OPTIONS: BracketSize[] = [32, 16, 8, 4, 2];

export const ROUND_NAMES: Record<number, string> = {
  0: "Primeira fase",
  1: "Oitavas de final",
  2: "Quartas de final",
  3: "Semifinal",
  4: "Final",
};

export function getRoundName(roundIndex: number, totalRounds: number): string {
  const roundsFromFinal = totalRounds - 1 - roundIndex;

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

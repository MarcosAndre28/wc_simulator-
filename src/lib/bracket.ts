import {
  getDownstreamSlotsToClear,
  getLoserAdvancement,
  getLoserDownstreamSlotsToClear,
  getMatchesPerRound,
  getRoundNameForBracket,
  getStandardFirstRoundMatchCount,
  getTotalRoundsForSize,
  getWinnerAdvancement,
  QUALIFICATION_1_LAST_MATCH_INDEX,
  QUALIFICATION_1_MATCH_COUNT,
  QUALIFICATION_1_REQUIRED_MATCHES,
  QUALIFICATION_REGISTERED_COUNT,
  getRegisteredTeamCount,
} from "@/lib/bracket-structure";
import {
  BracketSize,
  Match,
  Round,
  Team,
  TournamentState,
} from "@/types/tournament";

function createMatchId(roundIndex: number, matchIndex: number): string {
  return `r${roundIndex}-m${matchIndex}`;
}

function createEmptyMatch(roundIndex: number, matchIndex: number): Match {
  return {
    id: createMatchId(roundIndex, matchIndex),
    roundIndex,
    matchIndex,
    teamA: null,
    teamB: null,
    winnerId: null,
  };
}

export function getTotalRounds(bracketSize: BracketSize): number {
  return getTotalRoundsForSize(bracketSize);
}

export function createInitialRounds(bracketSize: BracketSize): Round[] {
  const totalRounds = getTotalRoundsForSize(bracketSize);
  const rounds: Round[] = [];

  for (let roundIndex = 0; roundIndex < totalRounds; roundIndex += 1) {
    const matchesInRound = getMatchesPerRound(bracketSize, roundIndex);

    rounds.push({
      index: roundIndex,
      name: getRoundNameForBracket(bracketSize, roundIndex, totalRounds),
      matches: Array.from({ length: matchesInRound }, (_, matchIndex) =>
        createEmptyMatch(roundIndex, matchIndex),
      ),
    });
  }

  return rounds;
}

export function seedTeamsIntoBracket(
  rounds: Round[],
  teams: Team[],
): Round[] {
  const nextRounds = structuredClone(rounds);
  const firstRound = nextRounds[0];

  if (!firstRound) {
    return nextRounds;
  }

  teams.forEach((team, index) => {
    const matchIndex = Math.floor(index / 2);
    const slot = index % 2;
    const match = firstRound.matches[matchIndex];

    if (!match) {
      return;
    }

    if (slot === 0) {
      match.teamA = team;
    } else {
      match.teamB = team;
    }
  });

  return nextRounds;
}

export function createTournament(bracketSize: BracketSize, teams: Team[]): TournamentState {
  const rounds = seedTeamsIntoBracket(createInitialRounds(bracketSize), teams);

  return {
    bracketSize,
    phase: "bracket",
    teams,
    rounds,
    champion: null,
  };
}

function countTeamAppearancesInFirstRound(firstRound: Round): Map<string, number> {
  const counts = new Map<string, number>();
  for (const match of firstRound.matches) {
    for (const team of [match.teamA, match.teamB]) {
      if (team) {
        counts.set(team.id, (counts.get(team.id) ?? 0) + 1);
      }
    }
  }
  return counts;
}

function getTeamsInQualificationRequiredMatches(firstRound: Round): Set<string> {
  const ids = new Set<string>();
  for (let i = 0; i < QUALIFICATION_1_REQUIRED_MATCHES; i += 1) {
    const match = firstRound.matches[i];
    if (match?.teamA) {
      ids.add(match.teamA.id);
    }
    if (match?.teamB) {
      ids.add(match.teamB.id);
    }
  }
  return ids;
}

/** Equipes que ainda não estão nos jogos 1–10. */
export function getTeamsNotInQualificationSetup(
  teams: Team[],
  firstRound: Round,
): Team[] {
  const inSetup = getTeamsInQualificationRequiredMatches(firstRound);
  return teams.filter((team) => !inSetup.has(team.id));
}

/** Monta o jogo 11 ao iniciar (2 equipes; uma pode repetir dos jogos 1–10). */
export function finalizeQualification1Pairings(
  tournament: TournamentState,
): TournamentState {
  if (tournament.bracketSize !== 22) {
    return tournament;
  }

  const next = structuredClone(tournament);
  const firstRound = next.rounds[0];
  const lastMatch = firstRound?.matches[QUALIFICATION_1_LAST_MATCH_INDEX];

  if (!firstRound || !lastMatch || next.teams.length !== QUALIFICATION_REGISTERED_COUNT) {
    return tournament;
  }

  const inSetup = getTeamsInQualificationRequiredMatches(firstRound);
  const unassigned = getTeamsNotInQualificationSetup(next.teams, firstRound);

  let teamA: Team | undefined;
  let teamB: Team | undefined;

  if (unassigned.length >= 2) {
    teamA = unassigned[0];
    teamB = unassigned[1];
  } else if (unassigned.length === 1) {
    teamA = unassigned[0];
    teamB = next.teams.find((t) => inSetup.has(t.id));
  }

  if (!teamA || !teamB) {
    return tournament;
  }

  lastMatch.teamA = teamA;
  lastMatch.teamB = teamB;

  return next;
}

/** Valida classificação 1: jogos 1–10 no setup (jogo 11 ao iniciar). */
export function isFirstRoundPairingComplete(
  rounds: Round[],
  teams: Team[],
  bracketSize?: BracketSize,
): boolean {
  const firstRound = rounds[0];
  if (!firstRound || teams.length === 0) {
    return false;
  }

  const size = bracketSize ?? teams.length;

  if (size === 22) {
    if (
      firstRound.matches.length !== QUALIFICATION_1_MATCH_COUNT ||
      teams.length !== QUALIFICATION_REGISTERED_COUNT
    ) {
      return false;
    }

    for (let i = 0; i < QUALIFICATION_1_REQUIRED_MATCHES; i += 1) {
      const match = firstRound.matches[i];
      if (!match?.teamA || !match?.teamB) {
        return false;
      }
      if (match.teamA.id === match.teamB.id) {
        return false;
      }
    }

    const requiredIds = getTeamsInQualificationRequiredMatches(firstRound);
    return requiredIds.size === 20;
  }

  const expectedMatches = teams.length / 2;
  if (firstRound.matches.length !== expectedMatches) {
    return false;
  }

  const assigned = new Set<string>();

  for (const match of firstRound.matches) {
    if (!match.teamA || !match.teamB) {
      return false;
    }
    if (match.teamA.id === match.teamB.id) {
      return false;
    }
    assigned.add(match.teamA.id);
    assigned.add(match.teamB.id);
  }

  return assigned.size === teams.length;
}

export function getFirstRoundPairingError(
  rounds: Round[],
  teams: Team[],
  bracketSize: BracketSize,
): string | null {
  if (bracketSize !== 22) {
    return null;
  }
  const firstRound = rounds[0];
  if (!firstRound || teams.length !== QUALIFICATION_REGISTERED_COUNT) {
    return null;
  }

  for (let i = 0; i < QUALIFICATION_1_REQUIRED_MATCHES; i += 1) {
    const match = firstRound.matches[i];
    if (!match?.teamA || !match?.teamB) {
      return "Preencha os jogos 1 a 10 da classificação 1.";
    }
  }

  const requiredIds = getTeamsInQualificationRequiredMatches(firstRound);
  if (requiredIds.size < 20) {
    return "Use 20 equipes diferentes nos jogos 1 a 10.";
  }
  if (requiredIds.size > 20) {
    return "Cada equipe só pode aparecer uma vez nos jogos 1 a 10.";
  }

  return null;
}

export function countAssignedFirstRoundTeams(firstRound: Round | undefined): number {
  if (!firstRound) {
    return 0;
  }

  const ids = new Set<string>();
  for (const match of firstRound.matches) {
    if (match.teamA) {
      ids.add(match.teamA.id);
    }
    if (match.teamB) {
      ids.add(match.teamB.id);
    }
  }
  return ids.size;
}

/** Preenche a classificação 1 na ordem da lista. */
export function autoSeedFirstRound(tournament: TournamentState): TournamentState {
  const next = structuredClone(tournament);
  const firstRound = next.rounds[0];
  if (!firstRound) {
    return tournament;
  }

  firstRound.matches.forEach((match) => {
    match.teamA = null;
    match.teamB = null;
    match.winnerId = null;
  });

  if (next.bracketSize === 22) {
    const teams = next.teams;
    for (let i = 0; i < 20; i += 1) {
      const team = teams[i];
      if (!team) {
        continue;
      }
      const matchIndex = Math.floor(i / 2);
      const slot = i % 2;
      const match = firstRound.matches[matchIndex];
      if (!match) {
        continue;
      }
      if (slot === 0) {
        match.teamA = team;
      } else {
        match.teamB = team;
      }
    }
    return next;
  }

  next.teams.forEach((team, index) => {
    const matchIndex = Math.floor(index / 2);
    const slot = index % 2;
    const match = firstRound.matches[matchIndex];
    if (!match) {
      return;
    }
    if (slot === 0) {
      match.teamA = team;
    } else {
      match.teamB = team;
    }
  });

  return next;
}

export function clearFirstRoundPairings(tournament: TournamentState): TournamentState {
  const next = structuredClone(tournament);
  const firstRound = next.rounds[0];
  if (!firstRound) {
    return tournament;
  }

  firstRound.matches.forEach((match) => {
    match.teamA = null;
    match.teamB = null;
    match.winnerId = null;
  });

  return next;
}

export function assignTeamToFirstRoundSlot(
  tournament: TournamentState,
  matchIndex: number,
  slot: "A" | "B",
  teamId: string | null,
): TournamentState {
  const next = structuredClone(tournament);
  const firstRound = next.rounds[0];
  const match = firstRound?.matches[matchIndex];

  if (!firstRound || !match) {
    return tournament;
  }

  const team = teamId ? getTeamById(next.teams, teamId) : null;

  if (teamId && !team) {
    return tournament;
  }

  if (teamId) {
    for (const item of firstRound.matches) {
      if (item.teamA?.id === teamId) {
        item.teamA = null;
      }
      if (item.teamB?.id === teamId) {
        item.teamB = null;
      }
    }
  }

  if (slot === "A") {
    match.teamA = team;
  } else {
    match.teamB = team;
  }

  return next;
}

export function removeTeamFromSetup(
  tournament: TournamentState,
  teamId: string,
): TournamentState {
  const next = structuredClone(tournament);
  next.teams = next.teams.filter((team) => team.id !== teamId);

  const firstRound = next.rounds[0];
  if (firstRound) {
    for (const match of firstRound.matches) {
      if (match.teamA?.id === teamId) {
        match.teamA = null;
      }
      if (match.teamB?.id === teamId) {
        match.teamB = null;
      }
    }
  }

  return next;
}

export function startTournament(tournament: TournamentState): TournamentState {
  let prepared = finalizeQualification1Pairings(tournament);

  if (
    !canStartTournament(
      prepared.bracketSize,
      prepared.teams.length,
      prepared.rounds,
      prepared.teams,
    )
  ) {
    return tournament;
  }

  const next = structuredClone(prepared);

  for (const match of next.rounds[0]?.matches ?? []) {
    match.winnerId = null;
  }

  for (let roundIndex = 1; roundIndex < next.rounds.length; roundIndex += 1) {
    for (const match of next.rounds[roundIndex]?.matches ?? []) {
      match.teamA = null;
      match.teamB = null;
      match.winnerId = null;
    }
  }

  next.phase = "bracket";
  next.champion = null;
  return next;
}

export function createEmptyTournament(bracketSize: BracketSize): TournamentState {
  return {
    bracketSize,
    phase: "setup",
    teams: [],
    rounds: createInitialRounds(bracketSize),
    champion: null,
  };
}

function getTeamById(teams: Team[], teamId: string): Team | null {
  return teams.find((team) => team.id === teamId) ?? null;
}

function clearSlotInRounds(
  rounds: Round[],
  slots: { roundIndex: number; matchIndex: number; slot: "A" | "B" }[],
): Round[] {
  const nextRounds = structuredClone(rounds);

  for (const { roundIndex, matchIndex, slot } of slots) {
    const nextMatch = nextRounds[roundIndex]?.matches[matchIndex];
    if (!nextMatch) {
      continue;
    }
    if (slot === "A") {
      nextMatch.teamA = null;
    } else {
      nextMatch.teamB = null;
    }
    nextMatch.winnerId = null;
  }

  return nextRounds;
}

function clearDownstreamMatches(
  rounds: Round[],
  bracketSize: BracketSize,
  fromRoundIndex: number,
  fromMatchIndex: number,
): Round[] {
  const winnerSlots = getDownstreamSlotsToClear(bracketSize, fromRoundIndex, fromMatchIndex);
  const loserSlots = getLoserDownstreamSlotsToClear(bracketSize, fromRoundIndex, fromMatchIndex);
  return clearSlotInRounds(rounds, [...winnerSlots, ...loserSlots]);
}

export function selectMatchWinner(
  tournament: TournamentState,
  matchId: string,
  winnerId: string,
): TournamentState {
  const nextTournament = structuredClone(tournament);
  let targetMatch: Match | null = null;

  for (const round of nextTournament.rounds) {
    const match = round.matches.find((item) => item.id === matchId);
    if (match) {
      targetMatch = match;
      break;
    }
  }

  if (!targetMatch) {
    return tournament;
  }

  const validWinner =
    targetMatch.teamA?.id === winnerId || targetMatch.teamB?.id === winnerId;

  if (!validWinner) {
    return tournament;
  }

  const previousWinnerId = targetMatch.winnerId;

  if (previousWinnerId && previousWinnerId !== winnerId) {
    nextTournament.rounds = clearDownstreamMatches(
      nextTournament.rounds,
      nextTournament.bracketSize,
      targetMatch.roundIndex,
      targetMatch.matchIndex,
    );
  }

  targetMatch.winnerId = winnerId;

  const winnerTeam = getTeamById(nextTournament.teams, winnerId);
  const placement = getWinnerAdvancement(
    nextTournament.bracketSize,
    targetMatch.roundIndex,
    targetMatch.matchIndex,
  );

  if (placement && winnerTeam) {
    const nextMatch = nextTournament.rounds[placement.roundIndex]?.matches[placement.matchIndex];
    if (nextMatch) {
      if (placement.slot === "A") {
        nextMatch.teamA = winnerTeam;
      } else {
        nextMatch.teamB = winnerTeam;
      }
    }
  }

  const loserId =
    winnerId === targetMatch.teamA?.id ? targetMatch.teamB?.id : targetMatch.teamA?.id;
  const loserPlacement = getLoserAdvancement(
    nextTournament.bracketSize,
    targetMatch.roundIndex,
    targetMatch.matchIndex,
  );

  if (loserPlacement && loserId) {
    const loserTeam = getTeamById(nextTournament.teams, loserId);
    const loserMatch =
      nextTournament.rounds[loserPlacement.roundIndex]?.matches[loserPlacement.matchIndex];
    if (loserTeam && loserMatch) {
      if (loserPlacement.slot === "A") {
        loserMatch.teamA = loserTeam;
      } else {
        loserMatch.teamB = loserTeam;
      }
    }
  }

  const finalRound = nextTournament.rounds[nextTournament.rounds.length - 1];
  const finalMatch = finalRound?.matches[0];

  if (finalMatch?.winnerId) {
    nextTournament.champion = getTeamById(nextTournament.teams, finalMatch.winnerId);
    nextTournament.phase = "champion";
  } else {
    nextTournament.champion = null;
    nextTournament.phase = "bracket";
  }

  return nextTournament;
}

export function canStartTournament(
  bracketSize: BracketSize,
  teamsCount: number,
  rounds: Round[],
  teams: Team[],
): boolean {
  return (
    teamsCount === getRegisteredTeamCount(bracketSize) &&
    isFirstRoundPairingComplete(rounds, teams, bracketSize)
  );
}

export { getRegisteredTeamCount };

export { getStandardFirstRoundMatchCount };

export function createTeamId(iso: string, name: string): string {
  return `${iso}-${name.toLowerCase().replace(/\s+/g, "-")}`;
}

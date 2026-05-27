import {
  BracketSize,
  Match,
  Round,
  Team,
  TournamentState,
  getRoundName,
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
  return Math.log2(bracketSize);
}

export function createInitialRounds(bracketSize: BracketSize): Round[] {
  const totalRounds = getTotalRounds(bracketSize);
  const rounds: Round[] = [];

  for (let roundIndex = 0; roundIndex < totalRounds; roundIndex += 1) {
    const matchesInRound = bracketSize / Math.pow(2, roundIndex + 1);

    rounds.push({
      index: roundIndex,
      name: getRoundName(roundIndex, totalRounds),
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

/** Todas as equipes estão em confrontos distintos na primeira rodada. */
export function isFirstRoundPairingComplete(
  rounds: Round[],
  teams: Team[],
): boolean {
  const firstRound = rounds[0];
  if (!firstRound || teams.length === 0) {
    return false;
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

/** Preenche a primeira rodada na ordem da lista de equipes. */
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

/** Define ou troca uma equipe em um slot da primeira rodada (remove duplicatas). */
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

/** Inicia a simulação usando os confrontos definidos na primeira rodada. */
export function startTournament(tournament: TournamentState): TournamentState {
  if (
    !canStartTournament(tournament.bracketSize, tournament.teams.length, tournament.rounds, tournament.teams)
  ) {
    return tournament;
  }

  const next = structuredClone(tournament);

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

function clearDownstreamMatches(
  rounds: Round[],
  fromRoundIndex: number,
  fromMatchIndex: number,
): Round[] {
  const nextRounds = structuredClone(rounds);
  let currentRoundIndex = fromRoundIndex;
  let currentMatchIndex = fromMatchIndex;

  while (currentRoundIndex + 1 < nextRounds.length) {
    const nextRoundIndex = currentRoundIndex + 1;
    const nextMatchIndex = Math.floor(currentMatchIndex / 2);
    const slot = currentMatchIndex % 2;
    const nextMatch = nextRounds[nextRoundIndex]?.matches[nextMatchIndex];

    if (!nextMatch) {
      break;
    }

    if (slot === 0) {
      nextMatch.teamA = null;
    } else {
      nextMatch.teamB = null;
    }

    nextMatch.winnerId = null;
    currentRoundIndex = nextRoundIndex;
    currentMatchIndex = nextMatchIndex;
  }

  return nextRounds;
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

  if (targetMatch.winnerId && targetMatch.winnerId !== winnerId) {
    nextTournament.rounds = clearDownstreamMatches(
      nextTournament.rounds,
      targetMatch.roundIndex,
      targetMatch.matchIndex,
    );
  }

  targetMatch.winnerId = winnerId;

  const winnerTeam = getTeamById(nextTournament.teams, winnerId);
  const nextRoundIndex = targetMatch.roundIndex + 1;
  const nextRound = nextTournament.rounds[nextRoundIndex];

  if (nextRound && winnerTeam) {
    const nextMatchIndex = Math.floor(targetMatch.matchIndex / 2);
    const nextMatch = nextRound.matches[nextMatchIndex];
    const slot = targetMatch.matchIndex % 2;

    if (nextMatch) {
      if (slot === 0) {
        nextMatch.teamA = winnerTeam;
      } else {
        nextMatch.teamB = winnerTeam;
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
    teamsCount === bracketSize &&
    isFirstRoundPairingComplete(rounds, teams)
  );
}

export function createTeamId(iso: string, name: string): string {
  return `${iso}-${name.toLowerCase().replace(/\s+/g, "-")}`;
}

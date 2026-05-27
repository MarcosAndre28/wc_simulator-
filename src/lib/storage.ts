import { TournamentState } from "@/types/tournament";

const STORAGE_KEY = "worldcup-tournament-v1";

export function saveTournament(state: TournamentState): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadTournament(): TournamentState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as TournamentState;
  } catch {
    return null;
  }
}

export function clearTournament(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

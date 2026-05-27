"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BracketSize,
  Team,
  TournamentState,
} from "@/types/tournament";
import {
  assignTeamToFirstRoundSlot,
  autoSeedFirstRound,
  canStartTournament,
  clearFirstRoundPairings,
  createEmptyTournament,
  removeTeamFromSetup,
  selectMatchWinner,
  startTournament,
} from "@/lib/bracket";
import {
  type AppScreen,
  hrefForScreen,
  screenFromSearchParam,
} from "@/lib/app-navigation";
import { clearTournament, loadTournament, saveTournament } from "@/lib/storage";
import { Bracket } from "@/components/Bracket";
import { ChampionScreen } from "@/components/ChampionScreen";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { TournamentSetup } from "@/components/TournamentSetup";
import { AppHeader } from "@/components/AppHeader";
import { SETUP_BRACKET_SIZES } from "@/components/BracketSizeSelector";

type AppView = "welcome" | "simulator";

export function TournamentApp() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [view, setView] = useState<AppView>("welcome");
  const [simulatorTab, setSimulatorTab] = useState<"setup" | "bracket">("setup");
  const [showBracketAfterWin, setShowBracketAfterWin] = useState(false);
  const [tournament, setTournament] = useState<TournamentState>(() => createEmptyTournament(16));
  const [isHydrated, setIsHydrated] = useState(false);

  const applyScreen = useCallback((screen: AppScreen) => {
    switch (screen) {
      case "home":
        setView("welcome");
        setShowBracketAfterWin(false);
        break;
      case "cadastro":
        setView("simulator");
        setSimulatorTab("setup");
        setShowBracketAfterWin(false);
        break;
      case "torneio":
        setView("simulator");
        setSimulatorTab("bracket");
        setShowBracketAfterWin(false);
        break;
      case "campeao":
        setView("simulator");
        setShowBracketAfterWin(false);
        break;
      case "chave":
        setView("simulator");
        setSimulatorTab("bracket");
        setShowBracketAfterWin(true);
        break;
      default:
        break;
    }
  }, []);

  const navigate = useCallback(
    (screen: AppScreen, options?: { replace?: boolean }) => {
      applyScreen(screen);
      const href = hrefForScreen(screen);
      if (options?.replace) {
        router.replace(href);
      } else {
        router.push(href);
      }
    },
    [applyScreen, router],
  );

  useEffect(() => {
    void Promise.resolve().then(() => {
      const saved = loadTournament();
      if (saved) {
        const rawSize = saved.bracketSize as number;
        const migratedSize =
          rawSize === 20 || rawSize === 21 ? (22 as BracketSize) : saved.bracketSize;
        let normalized =
          !SETUP_BRACKET_SIZES.includes(migratedSize) && saved.phase === "setup"
            ? {
                ...saved,
                bracketSize: 16 as BracketSize,
                teams: saved.teams.slice(0, 16),
              }
            : { ...saved, bracketSize: migratedSize };

        if (
          normalized.bracketSize === 22 &&
          (normalized.rounds[0]?.matches.length !== 11 ||
            normalized.rounds.length !== 6)
        ) {
          const fresh = createEmptyTournament(22);
          fresh.teams = normalized.teams.slice(0, 21);
          fresh.phase = normalized.phase === "setup" ? "setup" : "setup";
          normalized = fresh;
        }
        setTournament(normalized);
      }

      setIsHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const urlScreen = screenFromSearchParam(searchParams.get("tela"));
    applyScreen(urlScreen);
  }, [searchParams, isHydrated, applyScreen]);

  useEffect(() => {
    if (!isHydrated || view !== "simulator") {
      return;
    }

    saveTournament(tournament);
  }, [tournament, isHydrated, view]);

  function updateTournament(next: TournamentState) {
    setTournament(next);
  }

  function handleStartNewSimulation() {
    clearTournament();
    updateTournament(createEmptyTournament(16));
    navigate("cadastro");
  }

  function handleBracketSizeChange(size: BracketSize) {
    if (tournament.phase !== "setup") {
      return;
    }

    updateTournament({
      ...createEmptyTournament(size),
      teams: tournament.teams.slice(0, size),
    });
  }

  function handleAddTeam(team: Team) {
    if (tournament.phase !== "setup") {
      return;
    }

    updateTournament({
      ...tournament,
      teams: [...tournament.teams, team],
    });
  }

  function handleRemoveTeam(teamId: string) {
    if (tournament.phase !== "setup") {
      return;
    }

    updateTournament(removeTeamFromSetup(tournament, teamId));
  }

  function handleAssignSlot(
    matchIndex: number,
    slot: "A" | "B",
    teamId: string | null,
  ) {
    if (tournament.phase !== "setup") {
      return;
    }

    updateTournament(assignTeamToFirstRoundSlot(tournament, matchIndex, slot, teamId));
  }

  function handleAutoSeedPairings() {
    if (tournament.phase !== "setup") {
      return;
    }

    updateTournament(autoSeedFirstRound(tournament));
  }

  function handleClearPairings() {
    if (tournament.phase !== "setup") {
      return;
    }

    updateTournament(clearFirstRoundPairings(tournament));
  }

  function handleStartTournament() {
    if (
      !canStartTournament(
        tournament.bracketSize,
        tournament.teams.length,
        tournament.rounds,
        tournament.teams,
      )
    ) {
      return;
    }

    updateTournament(startTournament(tournament));
    navigate("torneio");
  }

  function handleSelectWinner(matchId: string, winnerId: string) {
    const next = selectMatchWinner(tournament, matchId, winnerId);
    updateTournament(next);

    if (next.phase === "champion" && next.champion) {
      navigate("campeao");
    }
  }

  function handleRestart() {
    clearTournament();
    updateTournament(createEmptyTournament(16));
    navigate("home", { replace: true });
  }

  function handleBackToSetup() {
    const empty = createEmptyTournament(tournament.bracketSize);
    empty.teams = [...tournament.teams];

    const previousFirst = tournament.rounds[0];
    const teamIds = new Set(empty.teams.map((team) => team.id));

    if (previousFirst) {
      empty.rounds[0] = structuredClone(previousFirst);
      for (const match of empty.rounds[0].matches) {
        match.winnerId = null;
        if (match.teamA && !teamIds.has(match.teamA.id)) {
          match.teamA = null;
        }
        if (match.teamB && !teamIds.has(match.teamB.id)) {
          match.teamB = null;
        }
      }
    }

    updateTournament(empty);
    navigate("cadastro");
  }

  const canStart = canStartTournament(
    tournament.bracketSize,
    tournament.teams.length,
    tournament.rounds,
    tournament.teams,
  );
  const firstRound = tournament.rounds[0];
  const isSetup = tournament.phase === "setup";
  const isChampion = tournament.phase === "champion" && tournament.champion != null;

  const displayBracketSize = SETUP_BRACKET_SIZES.includes(tournament.bracketSize)
    ? tournament.bracketSize
    : 16;

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121212] text-white/70">
        Carregando simulador...
      </div>
    );
  }

  if (view === "welcome") {
    return (
      <WelcomeScreen
        champion={tournament.champion}
        onStartNew={handleStartNewSimulation}
      />
    );
  }

  if (isChampion && tournament.champion && !showBracketAfterWin) {
    return (
      <ChampionScreen
        champion={tournament.champion}
        onStartNew={handleRestart}
        onViewBracket={() => navigate("chave")}
      />
    );
  }

  if (isSetup && simulatorTab === "setup" && firstRound) {
    return (
      <TournamentSetup
        bracketSize={displayBracketSize}
        teams={tournament.teams}
        firstRound={firstRound}
        canStart={canStart}
        onBracketSizeChange={handleBracketSizeChange}
        onAddTeam={handleAddTeam}
        onRemoveTeam={handleRemoveTeam}
        onAssignSlot={handleAssignSlot}
        onAutoSeedPairings={handleAutoSeedPairings}
        onClearPairings={handleClearPairings}
        onStart={handleStartTournament}
      />
    );
  }

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <AppHeader />

      <main className="mx-auto flex w-full max-w-[100%] flex-col gap-4 overflow-x-hidden px-2 py-4 sm:px-4 sm:py-6 lg:px-4 xl:px-6">
        {isChampion && tournament.champion && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-2">
            <p className="text-sm text-white/50">
              Campeão:{" "}
              <span className="font-semibold text-[#ffd700]">{tournament.champion.name}</span>
            </p>
            <button
              type="button"
              onClick={() => navigate("campeao")}
              className="rounded-xl border border-[#ffd700]/30 px-4 py-2 text-sm font-semibold text-[#ffd700] transition hover:bg-[#ffd700]/10"
            >
              Ver tela do campeão
            </button>
          </div>
        )}

        {!isSetup && (
          <div className="flex flex-wrap justify-end gap-3 px-2">
            <button
              type="button"
              onClick={handleBackToSetup}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/5"
            >
              Voltar ao cadastro
            </button>
          </div>
        )}

        <Bracket
          bracketSize={tournament.bracketSize}
          rounds={tournament.rounds}
          onSelectWinner={handleSelectWinner}
          champion={tournament.champion}
        />
      </main>
    </div>
  );
}

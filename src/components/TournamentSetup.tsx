"use client";

import { BracketSize, Round, Team } from "@/types/tournament";
import { AppHeader } from "@/components/AppHeader";
import { BracketSizeSelector } from "@/components/BracketSizeSelector";
import { FirstRoundPairingEditor } from "@/components/FirstRoundPairingEditor";
import { TeamForm } from "@/components/TeamForm";
import { TeamList } from "@/components/TeamList";
import { countAssignedFirstRoundTeams } from "@/lib/bracket";

interface TournamentSetupProps {
  bracketSize: BracketSize;
  teams: Team[];
  firstRound: Round;
  canStart: boolean;
  onBracketSizeChange: (size: BracketSize) => void;
  onAddTeam: (team: Team) => void;
  onRemoveTeam: (teamId: string) => void;
  onAssignSlot: (matchIndex: number, slot: "A" | "B", teamId: string | null) => void;
  onAutoSeedPairings: () => void;
  onClearPairings: () => void;
  onStart: () => void;
}

export function TournamentSetup({
  bracketSize,
  teams,
  firstRound,
  canStart,
  onBracketSizeChange,
  onAddTeam,
  onRemoveTeam,
  onAssignSlot,
  onAutoSeedPairings,
  onClearPairings,
  onStart,
}: TournamentSetupProps) {
  const teamsFull = teams.length === bracketSize;
  const assignedCount = countAssignedFirstRoundTeams(firstRound ?? undefined);
  const pairingsIncomplete = teamsFull && assignedCount < teams.length;

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <AppHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Configuração do torneio</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/50 sm:text-base">
            Registre as equipes e defina os confrontos da primeira fase antes de iniciar a
            simulação.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col gap-6">
            <BracketSizeSelector value={bracketSize} onChange={onBracketSizeChange} />
            <TeamForm teams={teams} maxTeams={bracketSize} onAddTeam={onAddTeam} />
          </div>

          <TeamList teams={teams} maxTeams={bracketSize} onRemoveTeam={onRemoveTeam} />
        </div>

        {teams.length > 0 && (
          <div className="mt-8">
            <FirstRoundPairingEditor
              teams={teams}
              firstRound={firstRound}
              roundLabel={firstRound.name}
              onAssign={onAssignSlot}
              onAutoSeed={onAutoSeedPairings}
              onClearPairings={onClearPairings}
            />
          </div>
        )}

        <footer className="mt-10 flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={onStart}
            disabled={!canStart}
            className="welcome-btn-primary flex items-center gap-3 rounded-2xl px-8 py-4 text-base font-bold uppercase tracking-wide text-[#1a1a1a] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:text-lg"
          >
            Iniciar simulação
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>

          {!teamsFull && teams.length > 0 && (
            <p className="text-right text-sm text-white/40">
              Registre mais {bracketSize - teams.length} equipe(s) para montar a chave completa.
            </p>
          )}

          {pairingsIncomplete && (
            <p className="text-right text-sm text-[#ffd700]/80">
              Defina todos os confrontos ({assignedCount}/{teams.length} equipes posicionadas).
            </p>
          )}
        </footer>
      </main>
    </div>
  );
}

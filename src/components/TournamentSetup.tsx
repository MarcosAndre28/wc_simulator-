"use client";

import { BracketSize, Team } from "@/types/tournament";
import { AppHeader } from "@/components/AppHeader";
import { BracketSizeSelector } from "@/components/BracketSizeSelector";
import { TeamForm } from "@/components/TeamForm";
import { TeamList } from "@/components/TeamList";

interface TournamentSetupProps {
  bracketSize: BracketSize;
  teams: Team[];
  canStart: boolean;
  onBracketSizeChange: (size: BracketSize) => void;
  onAddTeam: (team: Team) => void;
  onRemoveTeam: (teamId: string) => void;
  onStart: () => void;
}

export function TournamentSetup({
  bracketSize,
  teams,
  canStart,
  onBracketSizeChange,
  onAddTeam,
  onRemoveTeam,
  onStart,
}: TournamentSetupProps) {
  return (
    <div className="app-shell flex min-h-screen flex-col">
      <AppHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Configuração do torneio</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/50 sm:text-base">
            Configure a estrutura do seu torneio e registre as equipes participantes antes de
            iniciar a simulação.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col gap-6">
            <BracketSizeSelector value={bracketSize} onChange={onBracketSizeChange} />
            <TeamForm teams={teams} maxTeams={bracketSize} onAddTeam={onAddTeam} />
          </div>

          <TeamList teams={teams} maxTeams={bracketSize} onRemoveTeam={onRemoveTeam} />
        </div>

        <footer className="mt-10 flex justify-end">
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
        </footer>

        {!canStart && teams.length > 0 && (
          <p className="mt-3 text-right text-sm text-white/40">
            Registre mais {bracketSize - teams.length} equipe(s) para iniciar.
          </p>
        )}
      </main>
    </div>
  );
}

"use client";

import { Team } from "@/types/tournament";
import { FlagIcon } from "@/components/FlagIcon";

interface TeamListProps {
  teams: Team[];
  maxTeams: number;
  onRemoveTeam: (teamId: string) => void;
}

function CheckListIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#ffd700]" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  );
}

function gridColsClass(maxTeams: number): string {
  if (maxTeams <= 4) {
    return "grid-cols-2";
  }
  if (maxTeams <= 8) {
    return "grid-cols-1 sm:grid-cols-2";
  }
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
}

export function TeamList({ teams, maxTeams, onRemoveTeam }: TeamListProps) {
  const emptySlots = Math.max(0, maxTeams - teams.length);
  const isCompact = maxTeams <= 4;

  return (
    <section className="flex flex-col self-start rounded-2xl border border-white/10 bg-[#1a1a1a] p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CheckListIcon />
          <h2 className="text-lg font-semibold text-white">Equipes registradas</h2>
        </div>
        <span className="shrink-0 rounded-full border border-[#ffd700]/30 bg-[#ffd700]/10 px-3 py-1 text-xs font-semibold text-[#ffd700]">
          {teams.length} / {maxTeams} registradas
        </span>
      </div>

      <ul
        className={`grid auto-rows-min items-start gap-2 sm:gap-2.5 ${gridColsClass(maxTeams)}`}
      >
        {teams.map((team) => (
          <li
            key={team.id}
            className="flex min-h-0 min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-[#121212] px-2.5 py-2 sm:px-3 sm:py-2"
          >
            <FlagIcon
              iso={team.iso}
              name={team.name}
              size={isCompact ? 24 : 28}
              className="shrink-0 rounded"
            />
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-white" title={team.name}>
              {team.name}
            </span>
            <button
              type="button"
              onClick={() => onRemoveTeam(team.id)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white/40 transition hover:bg-red-500/15 hover:text-red-400"
              aria-label={`Remover ${team.name}`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </li>
        ))}

        {Array.from({ length: emptySlots }).map((_, index) => (
          <li
            key={`empty-${index}`}
            className="flex min-h-[2.5rem] items-center justify-center rounded-lg border border-dashed border-white/10 bg-[#121212]/50 px-2.5 py-2"
          >
            <span className="text-xs text-white/25 sm:text-sm">Vaga vazia</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

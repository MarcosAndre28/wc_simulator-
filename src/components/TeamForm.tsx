"use client";

import { useMemo, useState } from "react";
import { searchCountries } from "@/lib/countries";
import { createTeamId } from "@/lib/bracket";
import { Team } from "@/types/tournament";
import { FlagIcon } from "@/components/FlagIcon";

interface TeamFormProps {
  teams: Team[];
  maxTeams: number;
  onAddTeam: (team: Team) => void;
}

function UserPlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#ffd700]" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

export function TeamForm({ teams, maxTeams, onAddTeam }: TeamFormProps) {
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const filteredCountries = useMemo(() => searchCountries(search), [search]);
  const isFull = teams.length >= maxTeams;
  const registeredIsos = useMemo(() => new Set(teams.map((team) => team.iso)), [teams]);

  function handleSelectCountry(iso: string, countryName: string) {
    setError("");

    if (isFull) {
      setError(`Todas as ${maxTeams} vagas já foram preenchidas.`);
      return;
    }

    if (registeredIsos.has(iso)) {
      setError("Esta equipe já foi adicionada.");
      return;
    }

    onAddTeam({
      id: createTeamId(iso, countryName),
      name: countryName,
      iso,
    });

    setSearch("");
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <UserPlusIcon />
        <h2 className="text-lg font-semibold text-white">Selecionar equipe</h2>
      </div>

      <label className="grid gap-2">
        <span className="sr-only">Buscar equipe</span>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar país ou código FIFA..."
          className="rounded-xl border border-white/10 bg-[#121212] px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-[#ffd700]/50 focus:ring-1 focus:ring-[#ffd700]/30"
          disabled={isFull}
        />
      </label>

      <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-[#121212]">
        {filteredCountries.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-white/40">Nenhuma equipe encontrada.</p>
        ) : (
          filteredCountries.map((country) => {
            const isRegistered = registeredIsos.has(country.iso);

            return (
              <button
                key={country.code}
                type="button"
                onClick={() => handleSelectCountry(country.iso, country.name)}
                disabled={isFull || isRegistered}
                className={`flex w-full items-center gap-3 border-b border-white/5 px-4 py-3 text-left transition last:border-b-0 ${
                  isRegistered
                    ? "cursor-not-allowed opacity-50"
                    : isFull
                      ? "cursor-not-allowed opacity-40"
                      : "hover:bg-[#ffd700]/10"
                }`}
              >
                <FlagIcon iso={country.iso} name={country.name} size={28} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white">{country.name}</p>
                  <p className="text-xs text-white/40">{country.code}</p>
                </div>
                {isRegistered ? (
                  <span className="shrink-0 text-[10px] font-semibold uppercase text-[#ffd700]">
                    Na lista
                  </span>
                ) : (
                  <span className="shrink-0 text-xs text-white/30">+ adicionar</span>
                )}
              </button>
            );
          })
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {isFull && (
        <p className="mt-3 text-sm text-[#ffd700]/80">
          Lista completa. Defina os confrontos abaixo e inicie a simulação.
        </p>
      )}
    </section>
  );
}

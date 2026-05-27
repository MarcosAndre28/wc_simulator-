"use client";

import { Team } from "@/types/tournament";
import { Confetti } from "@/components/Confetti";
import { FlagIcon } from "@/components/FlagIcon";

interface ChampionScreenProps {
  champion: Team;
  onStartNew: () => void;
  onViewBracket: () => void;
}

export function ChampionScreen({ champion, onStartNew, onViewBracket }: ChampionScreenProps) {
  return (
    <div className="welcome-screen relative flex min-h-screen flex-col">
      <Confetti />

      <main className="relative z-30 flex min-h-screen flex-1 flex-col items-center justify-center px-6 pb-16 pt-4 text-center">
        <div className="relative mb-8">
          <div
            className="absolute inset-0 scale-150 rounded-full bg-[#ffd700]/25 blur-3xl"
            aria-hidden
          />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#1a1a1a] ring-2 ring-[#ffd700]/40 sm:h-28 sm:w-28">
            <FlagIcon
              iso={champion.iso}
              name={champion.name}
              size={56}
              className="rounded-md shadow-lg"
            />
          </div>
        </div>

        <h1 className="text-4xl font-extrabold uppercase tracking-[0.14em] text-[#ffd700] sm:text-5xl md:text-6xl">
          Campeão Mundial
        </h1>

        <p className="mt-4 text-2xl font-bold text-white sm:text-3xl">{champion.name}</p>

        <p className="mt-3 text-sm text-white/50 sm:text-base">Simulador de Torneio 2026</p>

        <div className="mt-12 flex w-full max-w-md flex-col gap-4">
          <button
            type="button"
            onClick={onStartNew}
            className="welcome-btn-primary w-full rounded-2xl px-6 py-4 text-base font-bold text-[#1a1a1a] transition hover:brightness-110 sm:text-lg"
          >
            Iniciar
          </button>

          <button
            type="button"
            onClick={onViewBracket}
            className="w-full rounded-2xl border border-white/15 bg-[#1e1e1e]/80 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-white/5 sm:text-lg"
          >
            Ver chaveamento do torneio
          </button>
        </div>
      </main>
    </div>
  );
}

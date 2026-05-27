"use client";

import { Team } from "@/types/tournament";
import { FlagIcon } from "@/components/FlagIcon";

interface ChampionBannerProps {
  champion: Team;
  onRestart: () => void;
  featured?: boolean;
}

export function ChampionBanner({ champion, onRestart, featured = true }: ChampionBannerProps) {
  if (!featured) {
    return (
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-yellow-400/30 bg-gradient-to-r from-yellow-500/20 via-amber-500/10 to-emerald-500/10 px-4 py-3 shadow-lg sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <FlagIcon iso={champion.iso} name={champion.name} size={48} className="rounded-md shadow" />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-200">
              Campeão da Copa
            </p>
            <h2 className="truncate text-xl font-bold text-white sm:text-2xl">{champion.name}</h2>
          </div>
        </div>
        <button
          type="button"
          onClick={onRestart}
          className="shrink-0 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
        >
          Nova simulação
        </button>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border-2 border-yellow-400/50 bg-gradient-to-br from-yellow-500/30 via-amber-400/15 to-emerald-500/20 px-6 py-8 text-center shadow-2xl shadow-yellow-500/20 sm:px-10 sm:py-10">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(250,204,21,0.35),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-20 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-yellow-400/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-amber-400/10 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10">
        <p className="text-sm font-bold uppercase tracking-[0.35em] text-yellow-100 sm:text-base">
          🏆 Campeão da Copa
        </p>

        <div className="mx-auto mt-6 flex max-w-lg flex-col items-center gap-5">
          <div className="rounded-2xl border-2 border-yellow-300/50 bg-slate-950/40 p-3 shadow-xl ring-4 ring-yellow-400/20">
            <FlagIcon
              iso={champion.iso}
              name={champion.name}
              size={112}
              className="rounded-lg shadow-2xl"
            />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white drop-shadow sm:text-5xl">
            {champion.name}
          </h2>
          <p className="max-w-md text-sm text-yellow-100/90 sm:text-base">
            Parabéns! Esta seleção conquistou o título na sua simulação.
          </p>
        </div>

        <button
          type="button"
          onClick={onRestart}
          className="relative z-10 mt-8 rounded-xl bg-white px-8 py-3 text-base font-bold text-slate-950 shadow-lg transition hover:scale-[1.02] hover:bg-yellow-50"
        >
          Nova simulação
        </button>
      </div>
    </section>
  );
}

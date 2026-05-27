"use client";

import Image from "next/image";
import { Team } from "@/types/tournament";
import { Confetti } from "@/components/Confetti";
import { FlagIcon } from "@/components/FlagIcon";

interface ChampionScreenProps {
  champion: Team;
  onStartNew: () => void;
  onViewBracket: () => void;
}

function TrophyBadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#ffd700]" fill="currentColor" aria-hidden>
      <path d="M12 2l2.4 5.2 5.6.8-4 3.9.9 5.5L12 15.2 7.1 17.4l.9-5.5-4-3.9 5.6-.8L12 2zm0 14.5l3.2 1.7-.6-3.6 2.7-2.6-3.7-.5L12 8.8l-1.6 3.2-3.7.5 2.7 2.6-.6 3.6L12 16.5z" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M21 12a9 9 0 11-2.64-6.36M21 3v6h-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChampionScreen({ champion, onStartNew, onViewBracket }: ChampionScreenProps) {
  return (
    <div className="champion-screen relative flex min-h-screen flex-col overflow-hidden bg-black">
      <Confetti pieceCount={72} />

      <div
        className="pointer-events-none absolute left-1/2 top-[28%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,215,0,0.22)_0%,transparent_68%)]"
        aria-hidden
      />

      <header className="relative z-30 flex items-center gap-2 px-5 pt-5 sm:px-8 sm:pt-6">
        <TrophyBadgeIcon />
        <span className="text-sm font-medium text-white/70 sm:text-base">
          Campeão · Copa Lisboa
        </span>
      </header>

      <main className="relative z-30 flex flex-1 flex-col items-center justify-center px-6 pb-12 pt-4 text-center">
        <div className="relative mb-8 sm:mb-10">
          <div
            className="absolute inset-0 scale-125 rounded-full bg-[#ffd700]/20 blur-2xl"
            aria-hidden
          />
          <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-black p-1 ring-2 ring-[#ffd700]/55 ring-offset-2 ring-offset-black sm:h-44 sm:w-44">
            <div className="relative h-full w-full overflow-hidden rounded-full bg-black">
              <Image
                src="/logo.png"
                alt="Copa Lisboa"
                width={176}
                height={176}
                priority
                className="h-full w-full object-contain p-2"
              />
            </div>
          </div>
        </div>

        <h1 className="champion-title-metallic max-w-4xl text-4xl font-extrabold uppercase leading-[1.05] tracking-[0.06em] sm:text-5xl md:text-6xl lg:text-7xl">
          Campeão Copa Lisboa
        </h1>

        <div className="mt-5 flex items-center justify-center gap-3 sm:mt-6">
          <FlagIcon
            iso={champion.iso}
            name={champion.name}
            size={40}
            className="rounded shadow-lg ring-1 ring-[#ffd700]/30"
          />
          <p className="champion-name-gold text-3xl font-extrabold uppercase tracking-wide sm:text-4xl md:text-5xl">
            {champion.name}
          </p>
        </div>

        <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:mt-10">
          <button
            type="button"
            onClick={onStartNew}
            className="champion-btn-primary flex w-full items-center justify-center gap-2.5 rounded-xl border border-[#ffd700]/70 bg-black px-6 py-3.5 text-base font-semibold text-[#ffd700] transition hover:border-[#ffd700] hover:bg-[#ffd700]/10 sm:text-lg"
          >
            <RefreshIcon />
            Iniciar nova simulação
          </button>

          <button
            type="button"
            onClick={onViewBracket}
            className="w-full rounded-xl border border-white/10 bg-[#141414] px-6 py-3.5 text-base font-semibold text-white/85 transition hover:bg-[#1c1c1c] hover:text-white sm:text-lg"
          >
            Ver chaveamento do torneio
          </button>
        </div>
      </main>
    </div>
  );
}

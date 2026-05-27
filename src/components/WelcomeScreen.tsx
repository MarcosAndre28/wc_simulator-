"use client";

import { Team } from "@/types/tournament";
import { Confetti } from "@/components/Confetti";
import { FlagIcon } from "@/components/FlagIcon";

interface WelcomeScreenProps {
  champion: Team | null;
  onStartNew: () => void;
}

function TrophyIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="h-10 w-10 text-[#ffd700] sm:h-12 sm:w-12"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 8h40v6c0 10-4 16-12 18v6h8v6H16v-6h8v-6c-8-2-12-8-12-18V8zm8 6v2c0 6 3 10 8 11.5V20H20zm24 0v2c0 6-3 10-8 11.5V20h8z" />
      <path d="M22 52h20v4H22z" opacity="0.85" />
    </svg>
  );
}

export function WelcomeScreen({ champion, onStartNew }: WelcomeScreenProps) {
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
            {champion ? (
              <FlagIcon
                iso={champion.iso}
                name={champion.name}
                size={56}
                className="rounded-md shadow-lg"
              />
            ) : (
              <TrophyIcon />
            )}
          </div>
        </div>

        <h1 className="text-4xl font-extrabold uppercase tracking-[0.12em] text-[#ffd700] sm:text-5xl md:text-6xl">
          Campeão Copa Lisboa
        </h1>

        {champion ? (
          <p className="mt-4 text-2xl font-bold text-white sm:text-3xl">{champion.name}</p>
        ) : (
          <p className="mt-4 max-w-md text-lg text-white/80 sm:text-xl">
            Monte sua chave, simule cada confronto e consagre o grande campeão.
          </p>
        )}

        <p className="mt-3 text-sm text-white/50 sm:text-base">Simulador de Torneio 2026</p>

        <div className="mt-12 w-full max-w-md">
          <button
            type="button"
            onClick={onStartNew}
            className="welcome-btn-primary w-full rounded-2xl px-6 py-4 text-base font-bold text-[#1a1a1a] transition hover:brightness-110 sm:text-lg"
          >
            Iniciar
          </button>
        </div>
      </main>
    </div>
  );
}

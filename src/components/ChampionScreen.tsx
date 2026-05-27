"use client";

import Image from "next/image";
import { Team } from "@/types/tournament";
import { AppHeader } from "@/components/AppHeader";
import { Confetti } from "@/components/Confetti";
interface ChampionScreenProps {
  champion: Team;
  onStartNew: () => void;
  onViewBracket: () => void;
}

function BracketIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M4 6h4v4H4V6zm12 0h4v4h-4V6zM4 14h4v4H4v-4zm12 0h4v4h-4v-4z" />
      <path d="M8 8h8M8 16h8M12 8v8" strokeLinecap="round" />
    </svg>
  );
}

export function ChampionScreen({ champion, onStartNew, onViewBracket }: ChampionScreenProps) {
  return (
    <div className="home-screen relative flex min-h-screen flex-col overflow-hidden bg-black">
      <AppHeader />
      <Confetti pieceCount={72} />

      <div className="home-hero-glow pointer-events-none absolute inset-0" aria-hidden />

      <main className="relative z-30 flex flex-1 flex-col items-center justify-center px-4 pb-16 pt-6 sm:px-6 sm:pb-20">
        <div className="home-hero-stack champion-hero-stack">
          <div className="home-hero-logo-wrap relative w-full">
            <div
              className="pointer-events-none absolute inset-0 -inset-x-8 scale-110 bg-[radial-gradient(ellipse,rgba(255,215,0,0.32)_0%,transparent_68%)] blur-3xl"
              aria-hidden
            />
            <Image
              src="/logo.png"
              alt="Copa Lisboa"
              width={512}
              height={512}
              priority
              unoptimized
              className="home-hero-logo relative block h-auto w-full object-contain drop-shadow-[0_0_48px_rgba(255,215,0,0.45)]"
            />
          </div>

          <h1 className="champion-main-title home-title-glow w-full text-center">Campeão</h1>

          <p className="champion-winner-name w-full text-center">{champion.name}</p>

          <div className="champion-actions-row">
            <button
              type="button"
              onClick={onStartNew}
              className="home-btn-start champion-action-btn rounded-xl py-3.5 text-sm font-bold text-[#1a1a1a] transition hover:brightness-110 sm:rounded-2xl sm:py-4 sm:text-base"
            >
              Nova simulação
            </button>
            <button
              type="button"
              onClick={onViewBracket}
              className="champion-btn-outline champion-action-btn inline-flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold sm:rounded-2xl sm:py-4 sm:text-base"
            >
              <BracketIcon />
              Ver chaveamento
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

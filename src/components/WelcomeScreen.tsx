"use client";

import Image from "next/image";
import { Team } from "@/types/tournament";
import { AppHeader } from "@/components/AppHeader";
import { Confetti } from "@/components/Confetti";
import { FlagIcon } from "@/components/FlagIcon";

interface WelcomeScreenProps {
  champion: Team | null;
  onStartNew: () => void;
}

export function WelcomeScreen({ champion, onStartNew }: WelcomeScreenProps) {
  return (
    <div className="home-screen relative flex min-h-screen flex-col overflow-hidden bg-black">
      <AppHeader />
      <Confetti pieceCount={72} />

      <div className="home-hero-glow pointer-events-none absolute inset-0" aria-hidden />

      <main className="relative z-30 flex flex-1 flex-col items-center justify-center px-4 pb-16 pt-6 sm:px-6 sm:pb-20">
        <div className="home-hero-stack">
          <div className="home-hero-logo-wrap relative">
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

          <h1 className="home-hero-title home-title-glow">Copa Lisboa</h1>

          {champion && (
            <div className="flex items-center justify-center gap-2.5 py-1">
              <FlagIcon
                iso={champion.iso}
                name={champion.name}
                size={28}
                className="shrink-0 rounded shadow-md ring-1 ring-[#ffd700]/25"
              />
              <p className="min-w-0 text-left text-xs leading-snug text-white/55 sm:text-sm">
                Último campeão:{" "}
                <span className="font-semibold text-[#ffd700]">{champion.name}</span>
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={onStartNew}
            className="home-btn-start home-hero-cta rounded-2xl py-4 text-base font-bold text-[#1a1a1a] transition hover:brightness-110 sm:py-[1.125rem] sm:text-lg"
          >
            Iniciar torneio
          </button>
        </div>
      </main>
    </div>
  );
}

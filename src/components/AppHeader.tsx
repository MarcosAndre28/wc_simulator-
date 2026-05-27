"use client";

import Image from "next/image";

export function AppHeader() {
  return (
    <header className="relative z-40 shrink-0 border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 px-4 py-3.5 sm:px-6 sm:py-4">
        <Image
          src="/logo.png"
          alt=""
          width={36}
          height={36}
          className="h-8 w-8 object-contain sm:h-9 sm:w-9"
          aria-hidden
        />
        <span className="text-base font-bold tracking-wide text-[#ffd700] sm:text-lg">
          Copa Lisboa
        </span>
      </div>
    </header>
  );
}

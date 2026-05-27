"use client";

function SoccerBallIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#ffd700]" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 2.07c1.55.38 2.94 1.12 4.05 2.13L12 8.35 8.95 6.2c1.11-1.01 2.5-1.75 4.05-2.13zM5.2 7.4l2.6 1.5-2.6 1.5c-.35-.95-.54-1.97-.54-3s.19-2.05.54-3zm1.34 9.1l2.6-1.5 2.6 1.5c-.95.35-1.97.54-3 .54s-2.05-.19-3-.54zm5.46 3.53c-1.55-.38-2.94-1.12-4.05-2.13L12 15.65l3.05 2.15c-1.11 1.01-2.5 1.75-4.05 2.13zm6.26-3.53l-2.6-1.5 2.6-1.5c.35.95.54 1.97.54 3s-.19 2.05-.54 3zm-1.34-9.1l-2.6 1.5 2.6-1.5c.95-.35 1.97-.54 3-.54s2.05.19 3 .54zM12 11.65l-2.47-1.43L12 8.79l2.47 1.43L12 11.65z" />
    </svg>
  );
}

export function AppHeader() {
  return (
    <header className="border-b border-white/10 bg-[#121212]/95 backdrop-blur">
      <div className="flex items-center justify-center px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <SoccerBallIcon />
          <span className="text-lg font-bold text-[#ffd700] sm:text-xl">Simulador WC</span>
        </div>
      </div>
    </header>
  );
}

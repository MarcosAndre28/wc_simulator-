import { Suspense } from "react";
import { TournamentApp } from "@/components/TournamentApp";

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white/70">
      Carregando simulador...
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TournamentApp />
    </Suspense>
  );
}

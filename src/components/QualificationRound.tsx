"use client";

import { Round } from "@/types/tournament";
import { MatchCard } from "@/components/MatchCard";
import {
  BracketLayoutProvider,
  useBracketLayout,
} from "@/components/BracketLayoutContext";
import { getBracketLayoutMetrics } from "@/lib/bracket-layout";
import {
  getQualification1RoundLabel,
  getQualification2RoundLabel,
  QUALIFICATION_1_ROUND_INDEX,
  QUALIFICATION_2_ROUND_INDEX,
} from "@/lib/bracket-structure";

type QualificationLayout = "sidebar" | "stacked";

function QualificationMatchGrid({
  round,
  rounds,
  onSelectWinner,
  compact,
}: {
  round: Round;
  rounds: Round[];
  onSelectWinner: (matchId: string, winnerId: string) => void;
  compact: boolean;
}) {
  const { columnW, matchCardW } = useBracketLayout();

  return (
    <div
      className={`grid w-full grid-cols-1 gap-3 ${compact ? "" : "sm:grid-cols-2 lg:grid-cols-1"}`}
      style={{ maxWidth: compact ? matchCardW + 8 : columnW * 2 + 24 }}
    >
      {round.matches.map((match, index) => (
        <div key={match.id} className="flex flex-col items-stretch">
          <span className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-white/35">
            Jogo {index + 1}
          </span>
          <MatchCard
            match={match}
            round={round}
            rounds={rounds}
            onSelectWinner={onSelectWinner}
          />
        </div>
      ))}
    </div>
  );
}

function QualificationPhaseBlock({
  title,
  description,
  round,
  rounds,
  onSelectWinner,
  compact,
}: {
  title: string;
  description: string;
  round: Round;
  rounds: Round[];
  onSelectWinner: (matchId: string, winnerId: string) => void;
  compact: boolean;
}) {
  return (
    <div className={compact ? "mb-6 last:mb-0" : "mb-8 last:mb-0"}>
      <div className={compact ? "mb-3 text-left" : "mb-4 text-center"}>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#ffd700]/90 sm:text-sm">
          {title}
        </h3>
        <p className="mt-1 text-[11px] leading-snug text-white/45 sm:text-xs">{description}</p>
      </div>
      <QualificationMatchGrid
        round={round}
        rounds={rounds}
        onSelectWinner={onSelectWinner}
        compact={compact}
      />
    </div>
  );
}

export function QualificationPhases({
  rounds,
  onSelectWinner,
  layout = "sidebar",
}: {
  rounds: Round[];
  onSelectWinner: (matchId: string, winnerId: string) => void;
  layout?: QualificationLayout;
}) {
  const c1 = rounds[QUALIFICATION_1_ROUND_INDEX];
  const c2 = rounds[QUALIFICATION_2_ROUND_INDEX];
  const compact = layout === "sidebar";
  const metrics = getBracketLayoutMetrics(1, compact ? 360 : undefined);

  if (!c1) {
    return null;
  }

  return (
    <BracketLayoutProvider metrics={metrics}>
      <div className={compact ? "qualification-sidebar w-full" : "mx-auto mb-10 w-full max-w-6xl border-b border-white/10 pb-10"}>
        <div className={compact ? "mb-4 text-left" : "mb-6 text-center"}>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#ffd700]">
            Classificação
          </h2>
          <p className="mt-1 text-[11px] leading-snug text-white/45 sm:text-xs">
            21 equipes · 11 jogos na 1ª fase (uma joga 2×). Vencedores dos jogos 1–10 vão às
            oitavas; os demais disputam a 2ª fase.
          </p>
        </div>

        <QualificationPhaseBlock
          title={getQualification1RoundLabel()}
          description="Vencedores dos jogos 1–10 → oitavas direto."
          round={c1}
          rounds={rounds}
          onSelectWinner={onSelectWinner}
          compact={compact}
        />

        {c2 && (
          <QualificationPhaseBlock
            title={getQualification2RoundLabel()}
            description="6 vagas restantes para as oitavas."
            round={c2}
            rounds={rounds}
            onSelectWinner={onSelectWinner}
            compact={compact}
          />
        )}
      </div>
    </BracketLayoutProvider>
  );
}

/** @deprecated Use QualificationPhases */
export function QualificationRound({
  round,
  rounds,
  onSelectWinner,
}: {
  round: Round;
  rounds: Round[];
  onSelectWinner: (matchId: string, winnerId: string) => void;
}) {
  return (
    <QualificationPhases
      rounds={rounds.map((r, i) => (i === QUALIFICATION_1_ROUND_INDEX ? round : r))}
      onSelectWinner={onSelectWinner}
    />
  );
}

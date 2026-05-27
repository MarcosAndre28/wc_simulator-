"use client";

import { Match, Round } from "@/types/tournament";
import { FlagIcon } from "@/components/FlagIcon";
import { useBracketLayout } from "@/components/BracketLayoutContext";
import {
  BRACKET_ROUND_INDEX,
  getBracketTbdLabel,
  getQualification2TbdLabel,
  QUALIFICATION_1_MATCH_COUNT,
  QUALIFICATION_2_ROUND_INDEX,
} from "@/lib/bracket-structure";

interface MatchCardProps {
  match: Match;
  round: Round;
  rounds: Round[];
  onSelectWinner: (matchId: string, winnerId: string) => void;
  isFinal?: boolean;
}

const ROUND_SHORT: Record<string, string> = {
  "32 avos de final": "32av",
  "Oitavas de final": "OIT",
  "Quartas de final": "QF",
  Semifinal: "SF",
  Final: "F",
  "Classificação 1": "C1",
  "Classificação 2": "C2",
};

function isQualificationFormatBracket(rounds: Round[]): boolean {
  const first = rounds[0];
  return (first?.matches.length ?? 0) === QUALIFICATION_1_MATCH_COUNT;
}

function getTbdLabel(
  roundIndex: number,
  matchIndex: number,
  slot: 0 | 1,
  rounds: Round[],
): string {
  const slotKey = slot === 0 ? "A" : "B";
  const isQualFormat = isQualificationFormatBracket(rounds);

  if (isQualFormat && roundIndex === QUALIFICATION_2_ROUND_INDEX) {
    return getQualification2TbdLabel(matchIndex, slotKey);
  }

  if (isQualFormat && roundIndex === BRACKET_ROUND_INDEX) {
    return getBracketTbdLabel(roundIndex, matchIndex, slotKey) ?? "A definir";
  }

  if (roundIndex === 0) {
    return "A definir";
  }

  const prevRound = rounds[roundIndex - 1];
  if (!prevRound) {
    return "A definir";
  }

  const feederIndex = matchIndex * 2 + slot;
  const short = ROUND_SHORT[prevRound.name] ?? `R${roundIndex}`;
  return `Vencedor ${short} ${feederIndex + 1}`;
}

function TeamRow({
  team,
  label,
  score,
  isWinner,
  isLoser,
  canPick,
  onSelect,
  rowHeight,
}: {
  team: Match["teamA"];
  label?: string;
  score: string;
  isWinner: boolean;
  isLoser: boolean;
  canPick: boolean;
  onSelect: () => void;
  rowHeight: number;
}) {
  if (!team) {
    return (
      <div
        className="flex items-center gap-2.5 border-b border-white/5 px-3 last:border-b-0"
        style={{ height: rowHeight, minHeight: rowHeight }}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white/40">
          ?
        </span>
        <span
          className="min-w-0 flex-1 truncate text-left text-xs text-white/40"
          title={label}
        >
          {label ?? "A definir"}
        </span>
        <span className="w-6 shrink-0 text-right text-sm font-semibold text-white/30">-</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={!canPick}
      onClick={onSelect}
      className={`flex w-full items-center gap-2.5 border-b border-white/5 px-3 text-left transition last:border-b-0 ${
        canPick ? "hover:bg-white/5" : "cursor-default"
      } ${isWinner ? "bg-[#ffd700]/10" : ""}`}
      style={{ height: rowHeight, minHeight: rowHeight }}
    >
      <FlagIcon iso={team.iso} name={team.name} size={28} className="shrink-0 rounded-sm" />
      <span
        className={`min-w-0 flex-1 truncate text-sm font-semibold uppercase tracking-wide ${
          isWinner ? "text-white" : isLoser ? "text-white/45" : "text-white/80"
        }`}
      >
        {team.iso}
      </span>
      <span
        className={`w-6 text-right text-sm font-bold tabular-nums ${
          isWinner ? "text-[#ffd700]" : isLoser ? "text-white/40" : "text-white/50"
        }`}
      >
        {score}
      </span>
    </button>
  );
}

export function MatchCard({
  match,
  round,
  rounds,
  onSelectWinner,
  isFinal = false,
}: MatchCardProps) {
  const { teamRowH, matchCardW, finalCardW } = useBracketLayout();
  const isReady = Boolean(match.teamA && match.teamB);
  const isCompleted = Boolean(match.winnerId);
  const canPick = isReady;

  const scoreFor = (teamId: string | undefined) => {
    if (!isCompleted || !teamId) {
      return "-";
    }
    return match.winnerId === teamId ? "1" : "0";
  };

  const tbdA = !match.teamA ? getTbdLabel(round.index, match.matchIndex, 0, rounds) : undefined;
  const tbdB = !match.teamB ? getTbdLabel(round.index, match.matchIndex, 1, rounds) : undefined;

  const cardWidth = isFinal ? finalCardW : matchCardW;

  return (
    <article
      className={`bracket-match-card w-full overflow-hidden shadow-lg ${
        isFinal
          ? "bracket-match-card--final rounded-2xl border-2 border-[#ffd700]/70 bg-gradient-to-b from-[#2a2410] via-[#1a1a1a] to-[#121212] ring-2 ring-[#ffd700]/25"
          : "rounded-xl border border-white/10 bg-[#1a1a1a]"
      }`}
      style={{ maxWidth: cardWidth }}
    >
      {isFinal && (
        <div className="border-b border-[#ffd700]/30 bg-[#ffd700]/15 px-3 py-1.5 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#ffd700] sm:text-xs">
          Grande final
        </div>
      )}
      <TeamRow
        team={match.teamA}
        label={tbdA}
        score={scoreFor(match.teamA?.id)}
        isWinner={match.winnerId === match.teamA?.id}
        isLoser={isCompleted && match.winnerId !== match.teamA?.id}
        canPick={canPick}
        onSelect={() => match.teamA && onSelectWinner(match.id, match.teamA.id)}
        rowHeight={teamRowH}
      />
      <TeamRow
        team={match.teamB}
        label={tbdB}
        score={scoreFor(match.teamB?.id)}
        isWinner={match.winnerId === match.teamB?.id}
        isLoser={isCompleted && match.winnerId !== match.teamB?.id}
        canPick={canPick}
        onSelect={() => match.teamB && onSelectWinner(match.id, match.teamB.id)}
        rowHeight={teamRowH}
      />
    </article>
  );
}

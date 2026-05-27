"use client";

import { Fragment, useMemo } from "react";
import { Match, Round, Team } from "@/types/tournament";
import { MatchCard } from "@/components/MatchCard";
import {
  BracketFinalBridge,
  BracketFinalSlot,
  BracketSlot,
  InterRoundConnector,
} from "@/components/BracketConnectors";
import {
  BracketLayoutProvider,
  useBracketLayout,
} from "@/components/BracketLayoutContext";
import {
  getBracketLayoutMetrics,
  getWingLayoutHeight,
  getWingMinWidth,
  shouldExpandBracketViewport,
} from "@/lib/bracket-layout";

interface BracketProps {
  rounds: Round[];
  onSelectWinner: (matchId: string, winnerId: string) => void;
  champion?: Team | null;
}

type WingColumn = { round: Round; matches: Match[] };

function splitRoundMatches(round: Round): { left: Match[]; right: Match[] } {
  const half = round.matches.length / 2;
  return {
    left: round.matches.slice(0, half),
    right: round.matches.slice(half),
  };
}

function BracketRoundColumn({
  round,
  matches,
  rounds,
  layoutHeight,
  onSelectWinner,
  isFinal = false,
}: {
  round: Round;
  matches: Match[];
  rounds: Round[];
  layoutHeight: number;
  onSelectWinner: (matchId: string, winnerId: string) => void;
  isFinal?: boolean;
}) {
  const { columnW } = useBracketLayout();

  return (
    <div
      className="flex shrink-0 flex-col"
      style={{ width: columnW, minWidth: columnW }}
    >
      <h3
        className={`mb-3 text-center text-xs font-semibold uppercase tracking-wider sm:text-sm ${
          isFinal ? "text-[#ffd700]" : "text-white/70"
        }`}
      >
        {round.name}
      </h3>
      <div
        className="flex flex-col justify-around"
        style={{ height: layoutHeight, minHeight: layoutHeight }}
      >
        {matches.map((match) =>
          isFinal ? (
            <BracketFinalSlot key={match.id} layoutHeight={layoutHeight}>
              <MatchCard
                match={match}
                round={round}
                rounds={rounds}
                onSelectWinner={onSelectWinner}
                isFinal
              />
            </BracketFinalSlot>
          ) : (
            <BracketSlot key={match.id}>
              <MatchCard
                match={match}
                round={round}
                rounds={rounds}
                onSelectWinner={onSelectWinner}
              />
            </BracketSlot>
          ),
        )}
      </div>
    </div>
  );
}

function BracketWing({
  columns,
  rounds,
  layoutHeight,
  onSelectWinner,
  side,
}: {
  columns: WingColumn[];
  rounds: Round[];
  layoutHeight: number;
  onSelectWinner: (matchId: string, winnerId: string) => void;
  side: "left" | "right";
}) {
  if (columns.length === 0) {
    return null;
  }

  return (
    <div
      className={`flex shrink-0 items-start ${side === "right" ? "flex-row-reverse" : ""}`}
    >
      {columns.map((col, index) => (
        <Fragment key={col.round.index}>
          <BracketRoundColumn
            round={col.round}
            matches={col.matches}
            rounds={rounds}
            layoutHeight={layoutHeight}
            onSelectWinner={onSelectWinner}
          />
          {index < columns.length - 1 && (
            <InterRoundConnector
              fromCount={col.matches.length}
              toCount={columns[index + 1].matches.length}
              height={layoutHeight}
              side={side}
            />
          )}
        </Fragment>
      ))}
    </div>
  );
}

function BracketTree({
  rounds,
  onSelectWinner,
  champion,
}: BracketProps) {
  const layout = useMemo(() => {
    const finalRound = rounds[rounds.length - 1];
    const preFinalRounds = rounds.slice(0, -1);
    const firstRoundTotal = rounds[0]?.matches.length ?? 1;
    const wingFirstRoundCount = Math.max(1, firstRoundTotal / 2);
    const metrics = getBracketLayoutMetrics(wingFirstRoundCount);
    const layoutHeight = getWingLayoutHeight(wingFirstRoundCount, metrics);

    const leftColumns: WingColumn[] = preFinalRounds.map((round) => ({
      round,
      matches: splitRoundMatches(round).left,
    }));

    const rightColumns: WingColumn[] = preFinalRounds.map((round) => ({
      round,
      matches: splitRoundMatches(round).right,
    }));

    const finalMatch = finalRound?.matches[0];
    const phaseLabels: string[] = [];

    if (finalMatch) {
      const names = new Set<string>();
      leftColumns.forEach((c) => names.add(c.round.name));
      names.add(finalRound.name);
      rightColumns.forEach((c) => names.add(c.round.name));
      phaseLabels.push(...names);
    }

    const columnCount = preFinalRounds.length;
    const wingMinWidth = getWingMinWidth(columnCount, metrics);
    const expandViewport = shouldExpandBracketViewport(wingFirstRoundCount);

    return {
      finalRound,
      finalMatch,
      layoutHeight,
      leftColumns,
      rightColumns,
      phaseLabels,
      wingMinWidth,
      metrics,
      expandViewport,
    };
  }, [rounds]);

  if (!layout.finalMatch) {
    return null;
  }

  const {
    finalRound,
    finalMatch,
    layoutHeight,
    leftColumns,
    rightColumns,
    phaseLabels,
    wingMinWidth,
    metrics,
    expandViewport,
  } = layout;

  return (
    <BracketLayoutProvider metrics={metrics}>
      <section
        className={`w-full overflow-x-auto pb-4 ${
          expandViewport ? "flex min-h-[calc(100dvh-11rem)] flex-col justify-center py-6" : ""
        }`}
      >
        {phaseLabels.length > 0 && (
          <div className="mx-auto mb-4 flex max-w-7xl flex-wrap justify-center gap-x-4 gap-y-1 px-2">
            {phaseLabels.map((name) => (
              <span
                key={name}
                className="text-[10px] font-semibold uppercase tracking-wider text-white/45 sm:text-xs"
              >
                {name}
              </span>
            ))}
          </div>
        )}

        <div className="bracket-tree mx-auto flex w-max max-w-full flex-col items-center gap-8 px-2 lg:flex-row lg:items-start lg:justify-center lg:gap-x-0 lg:gap-y-0">
          <div
            className="bracket-wing bracket-wing--left shrink-0"
            style={{ width: wingMinWidth, minWidth: wingMinWidth }}
          >
            <BracketWing
              columns={leftColumns}
              rounds={rounds}
              layoutHeight={layoutHeight}
              onSelectWinner={onSelectWinner}
              side="left"
            />
          </div>

          <BracketFinalBridge side="left" layoutHeight={layoutHeight} />

          <div className="bracket-center relative flex shrink-0 flex-col items-center">
            <div
              className="pointer-events-none absolute inset-0 scale-110 rounded-3xl bg-[#ffd700]/10 blur-2xl"
              aria-hidden
            />
            <BracketRoundColumn
              round={finalRound}
              matches={[finalMatch]}
              rounds={rounds}
              layoutHeight={layoutHeight}
              onSelectWinner={onSelectWinner}
              isFinal
            />
            {champion && (
              <p className="relative z-10 mt-3 text-center text-xs font-semibold uppercase tracking-wider text-[#ffd700]">
                Campeão definido
              </p>
            )}
          </div>

          <BracketFinalBridge side="right" layoutHeight={layoutHeight} />

          <div
            className="bracket-wing bracket-wing--right shrink-0"
            style={{ width: wingMinWidth, minWidth: wingMinWidth }}
          >
            <BracketWing
              columns={rightColumns}
              rounds={rounds}
              layoutHeight={layoutHeight}
              onSelectWinner={onSelectWinner}
              side="right"
            />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-white/40 sm:text-sm">
          Clique na seleção vencedora para avançar na chave.
        </p>
      </section>
    </BracketLayoutProvider>
  );
}

export function Bracket(props: BracketProps) {
  return <BracketTree {...props} />;
}

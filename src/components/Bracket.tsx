"use client";

import { Fragment, useMemo, useRef } from "react";
import { BracketSize, Match, Round, Team } from "@/types/tournament";
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
  getBracketAreaWidth,
  getBracketLayoutMetrics,
  getWingLayoutHeight,
  getWingMinWidth,
} from "@/lib/bracket-layout";
import { getPhaseLabelsForBracket } from "@/lib/bracket-structure";
import { buildSymmetricWingColumns, type WingColumn } from "@/lib/bracket-wing-layout";
import { useBracketScale } from "@/hooks/useBracketScale";
import { QualificationPhases } from "@/components/QualificationRound";

interface BracketProps {
  bracketSize: BracketSize;
  rounds: Round[];
  onSelectWinner: (matchId: string, winnerId: string) => void;
  champion?: Team | null;
}

function BracketRoundColumn({
  round,
  matches,
  rounds,
  layoutHeight,
  onSelectWinner,
  isFinal = false,
  titleOverride,
  columnWidth,
}: {
  round: Round;
  matches: Match[];
  rounds: Round[];
  layoutHeight: number;
  onSelectWinner: (matchId: string, winnerId: string) => void;
  isFinal?: boolean;
  titleOverride?: string;
  columnWidth?: number;
}) {
  const { columnW } = useBracketLayout();
  const w = columnWidth ?? columnW;

  return (
    <div
      className="flex shrink-0 flex-col"
      style={{ width: w, minWidth: w }}
    >
      <h3
        className={`mb-3 text-center text-xs font-semibold uppercase tracking-wider sm:text-sm ${
          isFinal ? "text-[#ffd700]" : "text-white/70"
        }`}
      >
        {titleOverride ?? round.name}
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
        <Fragment key={`${side}-${col.round.index}`}>
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
  bracketSize,
  rounds,
  onSelectWinner,
  champion,
}: BracketProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);

  const layout = useMemo(() => {
    const isQualificationFormat = bracketSize === 22;
    const bracketRounds = isQualificationFormat ? rounds.slice(2) : rounds;
    const finalRound = bracketRounds[bracketRounds.length - 1];
    const preFinalRounds = bracketRounds.slice(0, -1);
    const wingFirstRoundCount =
      bracketSize === 22 ? 4 : Math.max(1, (rounds[0]?.matches.length ?? 2) / 2);
    const viewportWidth =
      typeof window !== "undefined" ? window.innerWidth : 1280;
    const bracketAreaWidth = getBracketAreaWidth(
      viewportWidth,
      isQualificationFormat,
    );
    const metrics = getBracketLayoutMetrics(wingFirstRoundCount, bracketAreaWidth);
    const layoutHeight = getWingLayoutHeight(wingFirstRoundCount, metrics);

    const leftColumns = buildSymmetricWingColumns(preFinalRounds, bracketSize, "left");
    const rightColumns = buildSymmetricWingColumns(preFinalRounds, bracketSize, "right");
    const finalMatch = finalRound?.matches[0];
    const phaseLabels = getPhaseLabelsForBracket(bracketSize);

    const leftWingMinWidth = getWingMinWidth(leftColumns.length, metrics);
    const rightWingMinWidth = getWingMinWidth(rightColumns.length, metrics);

    return {
      isQualificationFormat,
      finalRound,
      finalMatch,
      layoutHeight,
      leftColumns,
      rightColumns,
      phaseLabels,
      leftWingMinWidth,
      rightWingMinWidth,
      metrics,
    };
  }, [rounds, bracketSize]);

  if (!layout.finalMatch) {
    return null;
  }

  const {
    isQualificationFormat,
    finalRound,
    finalMatch,
    layoutHeight,
    leftColumns,
    rightColumns,
    phaseLabels,
    leftWingMinWidth,
    rightWingMinWidth,
    metrics,
  } = layout;

  const { scale, naturalSize, layoutSize, atMinScale } = useBracketScale(containerRef, treeRef);

  const bracketPhaseLabels = isQualificationFormat ? phaseLabels.slice(2) : phaseLabels;
  const hasLayoutBox = layoutSize.width > 0 && layoutSize.height > 0;

  const bracketMain = (
    <>
      {bracketPhaseLabels.length > 0 && (
        <div className="mx-auto mb-2 flex shrink-0 flex-wrap justify-center gap-x-3 gap-y-1 px-2 sm:gap-x-4">
          {bracketPhaseLabels.map((name) => (
            <span
              key={name}
              className={`text-[10px] font-semibold uppercase tracking-wider sm:text-xs ${
                name === "Final" ? "text-[#ffd700]/80" : "text-white/45"
              }`}
            >
              {name}
            </span>
          ))}
        </div>
      )}

      <p className="mb-2 shrink-0 text-center text-xs text-white/40 sm:text-sm">
        {isQualificationFormat ? "Mata-mata — 16 equipes" : "Chave principal"}
      </p>

      <div
        ref={containerRef}
        className="bracket-scale-container relative flex min-h-0 w-full flex-1 items-center justify-center overflow-x-auto overflow-y-hidden px-1 sm:px-2"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div
          className="bracket-scale-wrapper relative shrink-0"
          style={
            hasLayoutBox
              ? { width: layoutSize.width, height: layoutSize.height }
              : undefined
          }
        >
          <div
            ref={treeRef}
            className="bracket-tree inline-flex w-max max-w-none flex-col items-center gap-6 px-1 lg:flex-row lg:items-start lg:justify-center lg:gap-x-0"
            style={
              scale < 1 && naturalSize.width > 0
                ? {
                    transform: `scale(${scale})`,
                    transformOrigin: "0 0",
                    width: naturalSize.width,
                    height: naturalSize.height,
                  }
                : undefined
            }
          >
              <div
                className="bracket-wing bracket-wing--left shrink-0"
                style={{ width: leftWingMinWidth, minWidth: leftWingMinWidth }}
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
                style={{ width: rightWingMinWidth, minWidth: rightWingMinWidth }}
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
        </div>
      </div>

      {atMinScale && (
        <p className="mt-1 shrink-0 text-center text-[10px] text-white/35 sm:text-xs">
          Arraste horizontalmente para ver toda a chave principal.
        </p>
      )}

      <p className="mt-2 shrink-0 text-center text-xs text-white/40 sm:text-sm">
        Clique na seleção vencedora para avançar na chave.
      </p>
    </>
  );

  return (
    <BracketLayoutProvider metrics={metrics}>
      <section className="w-full pb-4">
        {isQualificationFormat ? (
          <div className="bracket-page-layout flex flex-col gap-4 lg:h-[calc(100dvh-5.5rem)] lg:flex-row lg:items-stretch lg:gap-0 lg:overflow-hidden">
            <aside className="qualification-aside shrink-0 lg:max-h-full lg:w-[min(100%,22rem)] lg:overflow-y-auto lg:border-r lg:border-white/10 lg:pr-5 lg:pb-2">
              <details className="rounded-xl border border-white/10 bg-[#141414]/80 lg:hidden" open>
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold uppercase tracking-wider text-[#ffd700] [&::-webkit-details-marker]:hidden">
                  Fases de classificação
                </summary>
                <div className="max-h-[min(50vh,28rem)] overflow-y-auto border-t border-white/10 px-3 pb-4 pt-3">
                  <QualificationPhases
                    rounds={rounds}
                    onSelectWinner={onSelectWinner}
                    layout="sidebar"
                  />
                </div>
              </details>
              <div className="hidden lg:block">
                <QualificationPhases
                  rounds={rounds}
                  onSelectWinner={onSelectWinner}
                  layout="sidebar"
                />
              </div>
            </aside>

            <div className="bracket-main flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden py-1 lg:py-2">
              {bracketMain}
            </div>
          </div>
        ) : (
          <div className="flex max-h-[calc(100dvh-5.5rem)] min-h-0 flex-col overflow-hidden">
            {bracketMain}
          </div>
        )}
      </section>
    </BracketLayoutProvider>
  );
}

export function Bracket(props: BracketProps) {
  return <BracketTree {...props} />;
}

"use client";

import { Fragment } from "react";
import { Match, Round } from "@/types/tournament";
import { MatchCard } from "@/components/MatchCard";
import { BracketSlot, InterRoundConnector } from "@/components/BracketConnectors";
import {
  BracketLayoutProvider,
  useBracketLayout,
} from "@/components/BracketLayoutContext";
import { getBracketLayoutMetrics, getWingLayoutHeight } from "@/lib/bracket-layout";
import type { SupplementalColumn } from "@/lib/bracket-wing-layout";

function SupplementalColumnBlock({
  column,
  rounds,
  layoutHeight,
  onSelectWinner,
}: {
  column: SupplementalColumn;
  rounds: Round[];
  layoutHeight: number;
  onSelectWinner: (matchId: string, winnerId: string) => void;
}) {
  const { centerColumnW } = useBracketLayout();

  return (
    <div
      className="flex shrink-0 flex-col"
      style={{ width: centerColumnW, minWidth: centerColumnW }}
    >
      <h3 className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-[#ffd700]/90 sm:text-sm">
        {column.title}
      </h3>
      <div
        className="flex flex-col justify-center"
        style={{ height: layoutHeight, minHeight: layoutHeight }}
      >
        {column.matches.map((match) => (
          <BracketSlot key={match.id}>
            <MatchCard
              match={match}
              round={column.round}
              rounds={rounds}
              onSelectWinner={onSelectWinner}
            />
          </BracketSlot>
        ))}
      </div>
    </div>
  );
}

export function SupplementalBracket({
  columns,
  rounds,
  onSelectWinner,
}: {
  columns: SupplementalColumn[];
  rounds: Round[];
  onSelectWinner: (matchId: string, winnerId: string) => void;
}) {
  if (columns.length === 0) {
    return null;
  }

  const metrics = getBracketLayoutMetrics(1);
  const layoutHeight = getWingLayoutHeight(1, metrics);

  return (
    <BracketLayoutProvider metrics={metrics}>
      <div className="mx-auto mt-8 w-full max-w-4xl border-t border-white/10 pt-8">
        <div className="mb-4 text-center">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#ffd700]">
            Repescagem e play-in
          </h2>
          <p className="mt-1 text-xs text-white/45 sm:text-sm">
            Vencedor da repescagem enfrenta o vencedor do Jogo 5 (esquerda). O vencedor do
            play-in vai direto à semifinal; o Jogo 5 da direita segue na chave principal.
          </p>
        </div>

        <div className="flex w-full justify-center overflow-x-auto px-2 pb-2">
          <div className="flex shrink-0 items-start">
            {columns.map((col, index) => (
              <Fragment key={`supp-${col.round.index}`}>
                <SupplementalColumnBlock
                  column={col}
                  rounds={rounds}
                  layoutHeight={layoutHeight}
                  onSelectWinner={onSelectWinner}
                />
                {index < columns.length - 1 && (
                  <InterRoundConnector
                    fromCount={1}
                    toCount={1}
                    height={layoutHeight}
                    side="left"
                  />
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </BracketLayoutProvider>
  );
}

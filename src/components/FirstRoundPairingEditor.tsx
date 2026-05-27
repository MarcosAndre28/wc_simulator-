"use client";

import { useEffect, useId, useRef, useState } from "react";
import { BracketSize, Round, Team } from "@/types/tournament";
import {
  countAssignedFirstRoundTeams,
  getTeamsNotInQualificationSetup,
} from "@/lib/bracket";
import {
  QUALIFICATION_1_LAST_MATCH_INDEX,
  QUALIFICATION_REGISTERED_COUNT,
} from "@/lib/bracket-structure";
import { FlagIcon } from "@/components/FlagIcon";

interface FirstRoundPairingEditorProps {
  bracketSize: BracketSize;
  teams: Team[];
  firstRound: Round;
  roundLabel: string;
  pairingError?: string | null;
  onAssign: (matchIndex: number, slot: "A" | "B", teamId: string | null) => void;
  onAutoSeed: () => void;
  onClearPairings: () => void;
}

function SwordsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#ffd700]" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2M10.5 6.5L21 17v3h-3L6.5 8.5" />
    </svg>
  );
}

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 shrink-0 text-white/40 transition ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function teamsAvailableForSlot(
  teams: Team[],
  firstRound: Round,
  matchIndex: number,
  slot: "A" | "B",
  _bracketSize: BracketSize,
): Team[] {
  const match = firstRound.matches[matchIndex];
  const current = slot === "A" ? match?.teamA : match?.teamB;

  const placedIds = new Set<string>();
  for (const item of firstRound.matches) {
    if (item.teamA) {
      placedIds.add(item.teamA.id);
    }
    if (item.teamB) {
      placedIds.add(item.teamB.id);
    }
  }

  return teams.filter((team) => team.id === current?.id || !placedIds.has(team.id));
}

function TeamSlotPicker({
  selectedTeam,
  options,
  onSelect,
  disabled,
  label,
}: {
  selectedTeam: Team | null;
  options: Team[];
  onSelect: (teamId: string | null) => void;
  disabled?: boolean;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="pairing-picker relative w-full max-w-full min-w-0 sm:min-w-[17.5rem] lg:min-w-[18rem]">
      <span className="sr-only">{label}</span>
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full min-h-[2.75rem] items-center gap-2.5 rounded-xl border bg-[#121212] px-3.5 py-3 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
          open
            ? "border-[#ffd700]/50 ring-1 ring-[#ffd700]/25"
            : "border-white/10 hover:border-white/20"
        }`}
      >
        {selectedTeam ? (
          <>
            <FlagIcon
              iso={selectedTeam.iso}
              name={selectedTeam.name}
              size={24}
              className="shrink-0 rounded-sm"
            />
            <span className="flex-1 break-words font-medium leading-snug text-white">
              {selectedTeam.name}
            </span>
            <span className="shrink-0 text-xs font-semibold uppercase text-white/45">
              {selectedTeam.iso}
            </span>
          </>
        ) : (
          <span className="flex-1 text-white/40">Escolher equipe...</span>
        )}
        <ChevronDownIcon open={open} />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="pairing-picker-menu absolute left-0 z-50 mt-1.5 max-h-60 w-full min-w-full overflow-y-auto rounded-xl border border-white/10 bg-[#1a1a1a] py-1 shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
        >
          {selectedTeam && (
            <li role="option" aria-selected={false}>
              <button
                type="button"
                onClick={() => {
                  onSelect(null);
                  setOpen(false);
                }}
                className="flex w-full px-3 py-2 text-left text-sm text-white/50 transition hover:bg-white/5"
              >
                Limpar seleção
              </button>
            </li>
          )}
          {options.length === 0 ? (
            <li className="px-3 py-3 text-center text-sm text-white/40">
              Nenhuma equipe disponível
            </li>
          ) : (
            options.map((team) => {
              const isSelected = selectedTeam?.id === team.id;
              return (
                <li key={team.id} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(team.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-2.5 px-3.5 py-3 text-left transition ${
                      isSelected
                        ? "bg-[#ffd700]/15 text-white"
                        : "text-white/90 hover:bg-[#ffd700]/10"
                    }`}
                  >
                    <FlagIcon iso={team.iso} name={team.name} size={24} className="shrink-0 rounded-sm" />
                    <span className="flex-1 break-words text-sm font-medium leading-snug">
                      {team.name}
                    </span>
                    <span className="shrink-0 text-xs font-semibold uppercase text-white/45">
                      {team.iso}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}

function MatchPairingCard({
  match,
  matchIndex,
  label,
  teams,
  firstRound,
  bracketSize,
  onAssign,
  highlight,
}: {
  match: Round["matches"][0];
  matchIndex: number;
  label: string;
  teams: Team[];
  firstRound: Round;
  bracketSize: BracketSize;
  onAssign: (matchIndex: number, slot: "A" | "B", teamId: string | null) => void;
  highlight?: boolean;
}) {
  const slotAOptions = teamsAvailableForSlot(teams, firstRound, matchIndex, "A", bracketSize);
  const slotBOptions = teamsAvailableForSlot(teams, firstRound, matchIndex, "B", bracketSize);

  return (
    <li
      className={`relative flex flex-col gap-3 overflow-visible rounded-xl border p-4 ${
        highlight
          ? "border-[#ffd700]/40 bg-[#ffd700]/5"
          : "border-white/10 bg-[#121212]"
      }`}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider text-white/35">
        {label}
      </span>
      <div className="flex flex-col gap-2.5">
        <TeamSlotPicker
          selectedTeam={match.teamA}
          options={slotAOptions}
          onSelect={(teamId) => onAssign(matchIndex, "A", teamId)}
          disabled={teams.length === 0}
          label={`Equipe A — ${label}`}
        />
        <span className="py-0.5 text-center text-xs font-bold uppercase text-white/30">vs</span>
        <TeamSlotPicker
          selectedTeam={match.teamB}
          options={slotBOptions}
          onSelect={(teamId) => onAssign(matchIndex, "B", teamId)}
          disabled={teams.length === 0}
          label={`Equipe B — ${label}`}
        />
      </div>
    </li>
  );
}

export function FirstRoundPairingEditor({
  bracketSize,
  teams,
  firstRound,
  roundLabel,
  pairingError,
  onAssign,
  onAutoSeed,
  onClearPairings,
}: FirstRoundPairingEditorProps) {
  const assignedCount = countAssignedFirstRoundTeams(firstRound);
  const canAutoFill = teams.length >= 2;
  const isQualificationFormat = bracketSize === 22;
  const pendingForGame11 = isQualificationFormat
    ? getTeamsNotInQualificationSetup(teams, firstRound)
    : [];

  return (
    <section className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-4 sm:p-5 md:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <SwordsIcon />
          <div>
            <h2 className="text-lg font-semibold text-white">Confrontos da {roundLabel}</h2>
            <p className="mt-0.5 text-sm text-white/45">
              {isQualificationFormat
                ? "21 equipes inscritas: monte os jogos 1–10 (20 vagas). Ao iniciar, o jogo 11 junta a equipe que faltou com outra que já jogou (2ª partida na classificação)."
                : "Escolha quem enfrenta quem em cada jogo da primeira fase."}
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-white/15 bg-[#121212] px-3 py-1 text-xs font-semibold text-white/60">
          {isQualificationFormat
            ? `${Math.min(assignedCount, 20)} / 20 nos jogos · ${teams.length}/${QUALIFICATION_REGISTERED_COUNT} inscritos`
            : `${assignedCount} / ${teams.length} nas chaves`}
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onAutoSeed}
          disabled={!canAutoFill}
          className="rounded-xl border border-[#ffd700]/35 bg-[#ffd700]/10 px-4 py-2 text-xs font-semibold text-[#ffd700] transition hover:bg-[#ffd700]/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Preencher na ordem da lista
        </button>
        <button
          type="button"
          onClick={onClearPairings}
          disabled={assignedCount === 0}
          className="rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Limpar confrontos
        </button>
      </div>

      {pairingError && (
        <p className="mb-4 rounded-xl border border-[#ffd700]/30 bg-[#ffd700]/10 px-4 py-3 text-sm text-[#ffd700]">
          {pairingError}
        </p>
      )}

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {firstRound.matches
          .filter((_, matchIndex) => !isQualificationFormat || matchIndex < QUALIFICATION_1_LAST_MATCH_INDEX)
          .map((match, matchIndex) => (
          <MatchPairingCard
            key={match.id}
            match={match}
            matchIndex={matchIndex}
            label={`Jogo ${matchIndex + 1}`}
            teams={teams}
            firstRound={firstRound}
            bracketSize={bracketSize}
            onAssign={onAssign}
          />
        ))}
      </ul>

      {isQualificationFormat && pendingForGame11.length > 0 && (
        <p className="mt-4 text-xs text-white/40">
          Jogo 11 ao iniciar incluirá:{" "}
          {pendingForGame11.map((t) => t.name).join(", ")}
          {pendingForGame11.length === 1
            ? " e mais uma equipe dos jogos 1–10 (segunda partida na classificação)."
            : "."}
        </p>
      )}
    </section>
  );
}

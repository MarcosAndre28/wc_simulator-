import { BracketSize } from "@/types/tournament";

export const SETUP_BRACKET_SIZES: BracketSize[] = [4, 8, 16, 32];

interface BracketSizeSelectorProps {
  value: BracketSize;
  onChange: (size: BracketSize) => void;
  disabled?: boolean;
}

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#ffd700]" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

export function BracketSizeSelector({ value, onChange, disabled = false }: BracketSizeSelectorProps) {
  const displayValue = SETUP_BRACKET_SIZES.includes(value) ? value : 16;

  return (
    <section className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <ListIcon />
        <h2 className="text-lg font-semibold text-white">Tamanho do torneio</h2>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {SETUP_BRACKET_SIZES.map((size) => {
          const isActive = displayValue === size;

          return (
            <button
              key={size}
              type="button"
              disabled={disabled}
              onClick={() => onChange(size)}
              className={`flex flex-col items-center justify-center rounded-xl border py-5 transition ${
                isActive
                  ? "border-[#ffd700] bg-[#ffd700]/10 text-white shadow-[0_0_20px_rgba(255,215,0,0.15)]"
                  : "border-white/10 bg-[#121212] text-white/70 hover:border-white/20 hover:text-white"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <span className="text-3xl font-bold">{size}</span>
              {isActive && (
                <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#ffd700]">
                  Equipes
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

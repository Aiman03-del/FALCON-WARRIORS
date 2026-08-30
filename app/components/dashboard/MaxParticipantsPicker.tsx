"use client";

import { useState } from "react";

const PRESETS = [4, 8, 10, 12, 15, 16, 20, 24, 32];

export default function MaxParticipantsPicker({
  value,
  onChange,
  label = "Max Participants",
}: {
  value: string;
  onChange: (next: string) => void;
  label?: string;
}) {
  const numericValue = value ? Number(value) : null;
  const isPreset = numericValue !== null && PRESETS.includes(numericValue);
  const [customOpen, setCustomOpen] = useState(!!value && !isPreset);

  return (
    <div className="md:col-span-2">
      <label className="mb-1 block text-xs font-medium text-muted">{label} (optional)</label>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => {
          const active = numericValue === preset && !customOpen;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setCustomOpen(false);
                onChange(String(preset));
              }}
              className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition ${
                active
                  ? "border-gold/60 bg-gold/10 text-gold"
                  : "border-border bg-surface-2 text-white/80 hover:border-white/30"
              }`}
            >
              {preset}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => {
            setCustomOpen(true);
            if (isPreset || !value) onChange("");
          }}
          className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition ${
            customOpen
              ? "border-gold/60 bg-gold/10 text-gold"
              : "border-border bg-surface-2 text-white/80 hover:border-white/30"
          }`}
        >
          Custom
        </button>

        <button
          type="button"
          onClick={() => {
            setCustomOpen(false);
            onChange("");
          }}
          className="rounded-lg border border-transparent px-3 py-2 text-xs text-muted hover:text-white/80"
        >
          No limit
        </button>
      </div>

      {customOpen && (
        <input
          type="number"
          min="2"
          step="1"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
          placeholder="e.g. 18"
          autoFocus
          className="mt-2 w-full max-w-[160px] rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-white/30"
        />
      )}
    </div>
  );
}
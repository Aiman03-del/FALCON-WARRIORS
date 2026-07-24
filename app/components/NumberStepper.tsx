"use client";

import { Minus, Plus } from "lucide-react";

export default function NumberStepper({
  value,
  onChange,
  min = 0,
}: {
  value: string;
  onChange: (value: string) => void;
  min?: number;
}) {
  const numValue = value === "" ? 0 : Number(value);

  function handleDecrement() {
    const next = Math.max(min, numValue - 1);
    onChange(next.toString());
  }

  function handleIncrement() {
    onChange((numValue + 1).toString());
  }

  return (
    <div className="flex items-center overflow-hidden rounded-lg border border-border bg-surface">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={numValue <= min}
        className="flex h-9 w-8 shrink-0 items-center justify-center text-muted transition-colors hover:bg-surface-2 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <Minus size={13} />
      </button>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => {
          const v = e.target.value.replace(/[^0-9]/g, "");
          onChange(v);
        }}
        className="h-9 w-10 shrink-0 bg-transparent text-center font-display text-base font-bold outline-none"
        placeholder="0"
      />
      <button
        type="button"
        onClick={handleIncrement}
        className="flex h-9 w-8 shrink-0 items-center justify-center text-muted transition-colors hover:bg-surface-2 hover:text-white"
      >
        <Plus size={13} />
      </button>
    </div>
  );
}
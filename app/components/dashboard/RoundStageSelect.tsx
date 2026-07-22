"use client";

import SelectField from "../SelectField";


const presetStages = [
  "Group Stage",
  "Round of 32",
  "Round of 16",
  "Quarter-final",
  "Semi-final",
  "Final",
];

export default function RoundStageSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const isCustom = value !== "" && !presetStages.includes(value);

  return (
    <div>
      <SelectField
        label="Round / Stage"
        value={isCustom ? "custom" : value}
        onChange={(v) => onChange(v === "custom" ? "" : v)}
        placeholder="— Select stage —"
        options={[
          ...presetStages.map((s) => ({ value: s, label: s })),
          { value: "custom", label: "Custom..." },
        ]}
      />
      {(isCustom || value === "") && (
        <input
          value={isCustom ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Match Day 3"
          className="mt-2 w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-gold"
        />
      )}
    </div>
  );
}
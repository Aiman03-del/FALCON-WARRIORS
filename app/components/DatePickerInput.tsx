"use client";

import { type ChangeEvent, type ReactNode } from "react";

type DatePickerInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "date" | "datetime-local";
  placeholder?: string;
  id?: string;
  className?: string;
  description?: ReactNode;
};

export default function DatePickerInput({
  label,
  value,
  onChange,
  type = "date",
  placeholder = "",
  id,
  className = "",
  description,
}: DatePickerInputProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-muted">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-gold"
      />
      {description ? <p className="mt-1 text-[10px] text-muted">{description}</p> : null}
    </div>
  );
}

"use client";

import DatePicker from "./DatePicker";


type DateTimePickerProps = {
  label?: string;
  value: string; // "YYYY-MM-DDTHH:mm" ফরম্যাটে
  onChange: (value: string) => void;
  minDate?: string;
};

export default function DateTimePicker({ label, value, onChange, minDate }: DateTimePickerProps) {
  const [datePart, timePart] = value ? value.split("T") : ["", "00:00"];

  function handleDateChange(newDate: string) {
    if (!newDate) {
      onChange("");
      return;
    }
    onChange(`${newDate}T${timePart || "00:00"}`);
  }

  function handleTimeChange(newTime: string) {
    if (!datePart) return;
    onChange(`${datePart}T${newTime}`);
  }

  return (
    <div>
      {label && <label className="mb-1 block text-xs font-medium text-muted">{label}</label>}
      <div className="flex gap-2">
        <div className="flex-1">
          <DatePicker value={datePart} onChange={handleDateChange} minDate={minDate} />
        </div>
        <input
          type="time"
          value={timePart}
          onChange={(e) => handleTimeChange(e.target.value)}
          disabled={!datePart}
          className="w-28 rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-gold disabled:opacity-50"
        />
      </div>
    </div>
  );
}
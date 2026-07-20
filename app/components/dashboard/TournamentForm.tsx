"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import BackLink from "@/app/components/BackLink";
import DatePicker from "../DatePicker";
import FillButton from "../FillButton";
import SelectField from "@/app/components/SelectField";
import { createClient } from "../../lib/supabase/client";

type TournamentFormProps = {
  mode: "create" | "edit";
  tournamentId?: string;
  initial?: {
    name: string;
    type: string;
    format: string;
    start_date: string | null;
    end_date: string | null;
    max_participants: number | null;
    registration_deadline: string | null;
  };
};

function toDateInputValue(value: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function toDateTimeInputValue(value: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 16);
}

export default function TournamentForm({ mode, tournamentId, initial }: TournamentFormProps) {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState(initial?.type ?? "internal");
  const [format, setFormat] = useState(initial?.format ?? "league");
  const [startDate, setStartDate] = useState(toDateInputValue(initial?.start_date ?? null));
  const [endDate, setEndDate] = useState(toDateInputValue(initial?.end_date ?? null));
  const [maxParticipants, setMaxParticipants] = useState(
    initial?.max_participants?.toString() ?? ""
  );
  const [registrationDeadline, setRegistrationDeadline] = useState(
    toDateTimeInputValue(initial?.registration_deadline ?? null)
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      name,
      type,
      format,
      start_date: startDate || null,
      end_date: endDate || null,
      max_participants: maxParticipants ? Number(maxParticipants) : null,
      registration_deadline: registrationDeadline || null,
    };

    const { error: dbError } =
      mode === "create"
        ? await supabase.from("tournaments").insert({ ...payload, status: "upcoming" })
        : await supabase.from("tournaments").update(payload).eq("id", tournamentId);

    setLoading(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    router.push(
      mode === "create" ? "/dashboard/tournaments" : `/dashboard/tournaments/${tournamentId}`
    );
    router.refresh();
  }

  return (
    <>
      <BackLink
        href={mode === "create" ? "/dashboard/tournaments" : undefined}
        label={mode === "create" ? "Back to Tournaments" : "Back"}
      />

      <form onSubmit={handleSubmit} className="card mt-6 flex flex-col gap-4 p-6">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Tournament Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-white/30"
          placeholder="Falcon Winter League 2025"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          label="Type"
          value={type}
          onChange={setType}
          options={[
            { value: "internal", label: "Internal (Club-only)" },
            { value: "official", label: "Official (External)" },
          ]}
          className="flex-1"
        />
        <SelectField
          label="Format"
          value={format}
          onChange={setFormat}
          options={[
            { value: "league", label: "League" },
            { value: "knockout", label: "Knockout" },
          ]}
          className="flex-1"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={setStartDate}
          type="date"
          className="flex-1"
        />
        <DatePicker
          label="End Date"
          value={endDate}
          onChange={setEndDate}
          type="date"
          className="flex-1"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-muted">
            Max Participants (optional)
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-white/30"
            placeholder="16"
          />
        </div>
        <DatePicker
          label="Registration Deadline (optional)"
          value={registrationDeadline}
          onChange={setRegistrationDeadline}
          type="datetime-local"
          className="flex-1"
          description="Double check that the year is correct — for example, not 2006 instead of 2026."
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
      )}

      <FillButton type="submit" disabled={loading} className="mt-2 disabled:opacity-50">
        {loading
          ? "Saving..."
          : mode === "create"
          ? "Create Tournament"
          : "Update Tournament"}
      </FillButton>
    </form>
    </>
  );
}
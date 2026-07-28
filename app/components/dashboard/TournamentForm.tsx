"use client";



import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { useToast } from "@/app/providers/ToastProvider";



import BackLink from "@/app/components/BackLink";

import DatePicker from "../DatePicker";

import FillButton from "../FillButton";

import SelectField from "@/app/components/SelectField";

import SquadSelector from "@/app/components/dashboard/SquadSelector";

import { createClient } from "../../lib/supabase/client";



type TournamentFormProps = {

  mode: "create" | "edit";

  tournamentId?: string;

  embedded?: boolean;

  initial?: {

    name: string;

    type: string;

    format: string;

    double_round: boolean;

    start_date: string | null;

    end_date: string | null;

    max_participants: number | null;

    registration_deadline: string | null;

    group_count: number | null;

    qualifiers_per_group: number | null;

    playoff_size: number | null;

    bye_method: string | null;

    third_place_match: boolean | null;

  };

};



type PlayerOption = { id: string; efootball_username: string };



function toDateInputValue(value: string | null) {

  if (!value) return "";

  return value.slice(0, 10);

}



function toDateTimeInputValue(value: string | null) {

  if (!value) return "";

  return new Date(value).toISOString().slice(0, 16);

}



export default function TournamentForm({

  mode,

  tournamentId,

  initial,

  embedded = false,

}: TournamentFormProps) {

  const supabase = createClient();

  const router = useRouter();



  const [name, setName] = useState(initial?.name ?? "");

  const [type, setType] = useState(initial?.type ?? "internal");

  const [format, setFormat] = useState(initial?.format ?? "league");

  const [doubleRound, setDoubleRound] = useState(initial?.double_round ?? false);

  const [groupCount, setGroupCount] = useState(initial?.group_count?.toString() ?? "4");

  const [qualifiersPerGroup, setQualifiersPerGroup] = useState(

    initial?.qualifiers_per_group?.toString() ?? "2"

  );

  const [playoffSize, setPlayoffSize] = useState(initial?.playoff_size?.toString() ?? "4");

  const [byeMethod, setByeMethod] = useState(initial?.bye_method ?? "seed");

  const [thirdPlaceMatch, setThirdPlaceMatch] = useState(initial?.third_place_match ?? false);

  const [startDate, setStartDate] = useState(toDateInputValue(initial?.start_date ?? null));

  const [endDate, setEndDate] = useState(toDateInputValue(initial?.end_date ?? null));

  const [maxParticipants, setMaxParticipants] = useState(

    initial?.max_participants?.toString() ?? ""

  );

  const [registrationDeadline, setRegistrationDeadline] = useState(

    toDateTimeInputValue(initial?.registration_deadline ?? null)

  );

  const [players, setPlayers] = useState<PlayerOption[]>([]);

  const [squadIds, setSquadIds] = useState<string[]>([]);

  const { addToast } = useToast();

  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);



  const isOfficial = type === "official";



  useEffect(() => {

    supabase

      .from("player_details")

      .select("id, efootball_username")

      .order("efootball_username")

      .then(({ data }) => setPlayers(data ?? []));



    if (mode === "edit" && tournamentId) {

      supabase

        .from("tournament_squad")

        .select("player_id")

        .eq("tournament_id", tournamentId)

        .then(({ data }) => setSquadIds((data ?? []).map((row) => row.player_id)));

    }

    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, []);



  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault();

    setError(null);

    setLoading(true);



    const payload = isOfficial

      ? {

          name,

          type,

          format: mode === "edit" ? format : "knockout",

          double_round: false,

          start_date: startDate || null,

          end_date: endDate || null,

          max_participants: null,

          registration_deadline: null,

          group_count: null,

          qualifiers_per_group: null,

          playoff_size: null,

          bye_method: "seed",

          third_place_match: false,

        }

      : {

          name,

          type,

          format,

          double_round: doubleRound,

          start_date: startDate || null,

          end_date: endDate || null,

          max_participants: maxParticipants ? Number(maxParticipants) : null,

          registration_deadline: registrationDeadline || null,

          group_count: format === "group_knockout" ? Number(groupCount) : null,

          qualifiers_per_group: format === "group_knockout" ? Number(qualifiersPerGroup) : null,

          playoff_size: format === "league_playoff" ? Number(playoffSize) : null,

          bye_method: byeMethod,

          third_place_match:

            format === "group_knockout" || format === "league_playoff" ? thirdPlaceMatch : false,

        };



    let savedId = tournamentId;



    if (mode === "create") {

      const { data, error: dbError } = await supabase

        .from("tournaments")

        .insert({ ...payload, status: "upcoming" })

        .select("id")

        .single();



      if (dbError || !data) {

        setLoading(false);

        setError(dbError?.message ?? "Failed to create");

        addToast(dbError?.message ?? "Failed to create", "error");

        return;

      }

      savedId = data.id;

    } else {

      if (!tournamentId) {

        setLoading(false);

        setError("Tournament ID is missing");

        return;

      }



      const { error: dbError } = await supabase.from("tournaments").update(payload).eq("id", tournamentId);

      if (dbError) {

        setLoading(false);

        setError(dbError.message);

        addToast(dbError.message, "error");

        return;

      }

    }



    if (isOfficial && savedId) {

      await supabase.from("tournament_squad").delete().eq("tournament_id", savedId);

      if (squadIds.length > 0) {

        await supabase.from("tournament_squad").insert(

          squadIds.map((playerId) => ({ tournament_id: savedId, player_id: playerId }))

        );

      }

    }



    setLoading(false);



    addToast(

      mode === "create"

        ? "Tournament created successfully."

        : "Tournament updated successfully.",

      "success"

    );



    router.push(mode === "create" ? `/dashboard/tournaments/${savedId}` : `/dashboard/tournaments/${tournamentId}`);

    router.refresh();

  }



  return (

    <>

      {!embedded && (

        <BackLink

          href={mode === "create" ? "/dashboard/tournaments" : undefined}

          label={mode === "create" ? "Back to Tournaments" : "Back"}

        />

      )}



      <form onSubmit={handleSubmit} className={`card flex flex-col gap-4 p-6 ${embedded ? "" : "mt-6"}`}>

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



        <SelectField

          label="Type"

          value={type}

          onChange={setType}

          options={[

            { value: "internal", label: "Internal (Club-only)" },

            { value: "official", label: "Official (External)" },

          ]}

        />



        {!isOfficial && (

          <SelectField

            label="Format"

            value={format}

            onChange={setFormat}

            options={[

              { value: "league", label: "League" },

              { value: "knockout", label: "Knockout" },

              { value: "group_knockout", label: "Group Stage + Knockout" },

              { value: "league_playoff", label: "League + Knockout (Playoff)" },

            ]}

          />

        )}



        {!isOfficial && (format === "league" || format === "group_knockout" || format === "league_playoff") && (

          <label className="flex items-center gap-2.5 rounded-lg border border-border bg-surface-2 px-4 py-3 text-sm">

            <input

              type="checkbox"

              checked={doubleRound}

              onChange={(e) => setDoubleRound(e.target.checked)}

              className="h-4 w-4 rounded border-border accent-gold"

            />

            <span>

              Double Round (each opponent is played twice in a 2-leg system

              {format === "group_knockout" ? " — within each group" : ""}

              {format === "league_playoff" ? " — in the league stage" : ""})

            </span>

          </label>

        )}



        {!isOfficial && (format === "knockout" || format === "group_knockout" || format === "league_playoff") && (

          <SelectField

            label="Bye Method"

            value={byeMethod}

            onChange={setByeMethod}

            options={[

              { value: "seed", label: "Seed-based (top seeds get byes first)" },

              { value: "random", label: "Random (fairness-checked, no repeat byes)" },

            ]}

          />

        )}



        {!isOfficial && format === "group_knockout" && (

          <p className="rounded-lg border border-gold/30 bg-gold/10 px-4 py-2.5 text-xs text-gold">

            To generate fixtures for this format, you need at least{" "}

            <strong>

              {(Number(groupCount) || 1) * Math.max(2, Number(qualifiersPerGroup) || 2)} participants

            </strong>{" "}

            approved ({groupCount || "?"} groups × minimum{" "}

            {Math.max(2, Number(qualifiersPerGroup) || 2)} per group). Fixtures cannot be generated if fewer

            participants are approved.

          </p>

        )}



        {!isOfficial && format === "group_knockout" && (

          <div className="grid gap-4 md:grid-cols-2">

            <div className="flex-1">

              <label className="mb-1 block text-xs font-medium text-muted">Number of Groups</label>

              <input

                type="number"

                min="2"

                step="1"

                inputMode="numeric"

                value={groupCount}

                onChange={(e) => setGroupCount(e.target.value.replace(/\D/g, ""))}

                className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-white/30"

                placeholder="4"

              />

            </div>

            <div className="flex-1">

              <label className="mb-1 block text-xs font-medium text-muted">Qualifiers per Group</label>

              <input

                type="number"

                min="1"

                step="1"

                inputMode="numeric"

                value={qualifiersPerGroup}

                onChange={(e) => setQualifiersPerGroup(e.target.value.replace(/\D/g, ""))}

                className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-white/30"

                placeholder="2"

              />

            </div>

          </div>

        )}



        {!isOfficial && format === "league_playoff" && (

          <div className="flex-1">

            <label className="mb-1 block text-xs font-medium text-muted">Playoff Size (Top N advance)</label>

            <input

              type="number"

              min="2"

              step="1"

              inputMode="numeric"

              value={playoffSize}

              onChange={(e) => setPlayoffSize(e.target.value.replace(/\D/g, ""))}

              className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-white/30"

              placeholder="4"

            />

          </div>

        )}



        {!isOfficial && (format === "group_knockout" || format === "league_playoff") && (

          <label className="flex items-center gap-2.5 rounded-lg border border-border bg-surface-2 px-4 py-3 text-sm">

            <input

              type="checkbox"

              checked={thirdPlaceMatch}

              onChange={(e) => setThirdPlaceMatch(e.target.checked)}

              className="h-4 w-4 rounded border-border accent-gold"

            />

            <span>Include a 3rd Place Match (losing semi-finalists play it off)</span>

          </label>

        )}



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



        {isOfficial ? (

          <SquadSelector

            players={players}

            selected={squadIds}

            onChange={setSquadIds}

            label="Participants"

          />

        ) : (

          <div className="grid gap-4 md:grid-cols-2">

            <div className="flex-1">

              <label className="mb-1 block text-xs font-medium text-muted">

                Max Participants (optional)

              </label>

              <input

                type="number"

                min="1"

                step="1"

                inputMode="numeric"

                value={maxParticipants}

                onChange={(e) => {

                  const next = e.target.value.replace(/\D/g, "");

                  setMaxParticipants(next);

                }}

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

        )}



        {error && (

          <p className="rounded-lg bg-gold/15 px-3 py-2 text-sm text-gold">{error}</p>

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



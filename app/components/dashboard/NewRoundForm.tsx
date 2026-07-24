"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/app/lib/supabase/client";
import { recalcAllPlayerStats } from "@/app/lib/matches/recalcPlayerStats";
import ImageUploadInput from "../ImageUploadInput";
import RoundStageSelect from "./RoundStageSelect";

type SquadPlayer = { id: string; efootball_username: string };

export default function NewRoundForm({
  tournamentId,
  falconSquad = [],
}: {
  tournamentId: string;
  falconSquad?: SquadPlayer[];
}) {
  const supabase = createClient();
  const router = useRouter();

  const [opponentName, setOpponentName] = useState("");
  const [opponentLogoUrl, setOpponentLogoUrl] = useState("");
  const [roundStage, setRoundStage] = useState("");

  const [rows, setRows] = useState(
    falconSquad.map((p, idx) => ({
      falcon_player_id: p.id,
      falcon_username: p.efootball_username,
      fs: "",
      os: "",
      opponent_label: `OP${idx + 1}`,
      opponent_logo_url: "",
      editingSlot: false,
      slotLabelDraft: `OP${idx + 1}`,
      slotLogoDraft: "",
    }))
  );

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const totalFalcon = rows.reduce((s, r) => s + (r.fs === "" ? 0 : Number(r.fs)), 0);
  const totalOpponent = rows.reduce((s, r) => s + (r.os === "" ? 0 : Number(r.os)), 0);

  function updateRow(idx: number, patch: Partial<(typeof rows)[number]>) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  function saveSlot(idx: number) {
    const row = rows[idx];
    updateRow(idx, {
      opponent_label: row.slotLabelDraft,
      opponent_logo_url: row.slotLogoDraft,
      editingSlot: false,
    });
  }

  async function handleSubmit() {
    setError(null);

    if (!opponentName.trim()) {
      setError("প্রতিপক্ষ ক্লাবের নাম দিন।");
      return;
    }
    if (falconSquad.length === 0) {
      setError("আগে টুর্নামেন্টের স্কোয়াড সিলেক্ট করুন।");
      return;
    }
    const incomplete = rows.some((r) => r.fs === "" || r.os === "");
    if (incomplete) {
      setError("সব রো-তে স্কোর বসান — যেটাতে খেলা হয়নি সেটাতেও ০ দিন।");
      return;
    }

    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();

    const { data: newMatch, error: insertError } = await supabase
      .from("matches")
      .insert({
        match_type: "external",
        tournament_id: tournamentId,
        opponent_name: opponentName,
        opponent_logo_url: opponentLogoUrl || null,
        round_stage: roundStage || null,
        match_date: new Date().toISOString(),
        status: "completed",
        score_home: totalFalcon,
        score_away: totalOpponent,
        moderator_id: userData.user?.id ?? null,
      })
      .select("id")
      .single();

    if (insertError || !newMatch) {
      setLoading(false);
      setError(insertError?.message ?? "Failed to submit round");
      return;
    }

    const battleRows = rows.map((r, idx) => ({
      match_id: newMatch.id,
      falcon_player_id: r.falcon_player_id,
      opponent_label: r.opponent_label,
      opponent_logo_url: r.opponent_logo_url || null,
      falcon_score: Number(r.fs),
      opponent_score: Number(r.os),
      battle_order: idx + 1,
    }));

    const { error: battlesError } = await supabase.from("match_squad_battles").insert(battleRows);

    if (battlesError) {
      setLoading(false);
      setError(battlesError.message);
      return;
    }

    await recalcAllPlayerStats(supabase);

    setLoading(false);
    router.refresh();
  }

  return (
    <div className="card p-6">
      {/* Match header */}
      <div className="mb-6 rounded-3xl border border-border bg-surface-2 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-3 text-xs font-bold uppercase text-muted">
              FW
            </div>
            <div>
              <p className="text-lg font-semibold text-white">{opponentName || "Opponent Club"}</p>
              <p className="text-sm text-muted">{roundStage || "Round / Stage"}</p>
            </div>
          </div>
          {opponentLogoUrl ? (
            <div className="relative h-14 w-14 overflow-hidden rounded-full bg-surface-3">
              <Image src={opponentLogoUrl} alt={opponentName || "Opponent logo"} fill className="object-cover" />
            </div>
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-3 text-sm text-muted">
              Logo
            </div>
          )}
        </div>
      </div>

      {/* Opponent + Stage inputs */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Opponent Club Name</label>
          <input
            value={opponentName}
            onChange={(e) => setOpponentName(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-gold"
            placeholder="Mastannagar Club"
          />
        </div>
        <RoundStageSelect value={roundStage} onChange={setRoundStage} />
      </div>

      <ImageUploadInput
        label="Opponent Club Logo (optional)"
        folder="/falcon-warriors/opponent-logos"
        value={opponentLogoUrl}
        onUploaded={setOpponentLogoUrl}
      />

      {/* Team total preview */}
      <div className="flex flex-col gap-2">
        {rows.map((r, idx) => (
          <div
            key={r.falcon_player_id}
            className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg border border-border bg-surface-2 p-3 sm:grid-cols-[1fr_auto_auto_auto_1fr]"
          >
            <span className="truncate text-sm font-medium">{r.falcon_username}</span>

            <input
              type="number"
              min={0}
              value={r.fs}
              onChange={(e) => updateRow(idx, { fs: e.target.value })}
              className="w-14 rounded-lg border border-border bg-surface px-2 py-1.5 text-center text-sm outline-none focus:border-gold"
              placeholder="0"
            />

            <span className="hidden text-muted sm:block">-</span>

            <input
              type="number"
              min={0}
              value={r.os}
              onChange={(e) => updateRow(idx, { os: e.target.value })}
              className="w-14 rounded-lg border border-border bg-surface px-2 py-1.5 text-center text-sm outline-none focus:border-gold"
              placeholder="0"
            />

            <div className="col-span-2 sm:col-span-1">
              {r.editingSlot ? (
                <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-2">
                  <input
                    value={r.slotLabelDraft}
                    onChange={(e) => updateRow(idx, { slotLabelDraft: e.target.value })}
                    className="w-full rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-gold"
                    placeholder="Opponent player name"
                  />
                  <ImageUploadInput
                    label="Photo (optional)"
                    folder="/falcon-warriors/opponent-players"
                    value={r.slotLogoDraft}
                    onUploaded={(url) => updateRow(idx, { slotLogoDraft: url })}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => saveSlot(idx)}
                      className="flex items-center gap-1 rounded-lg bg-indigo/20 px-2 py-1 text-xs font-semibold text-indigo-light"
                    >
                      <Check size={12} />
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => updateRow(idx, { editingSlot: false })}
                      className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-xs font-semibold text-muted"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => updateRow(idx, { editingSlot: true })}
                  className="flex w-full items-center gap-2 truncate text-sm text-white/80 hover:text-gold"
                >
                  <span className="truncate">{r.opponent_label}</span>
                  <Pencil size={11} className="shrink-0 text-muted" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="btn-primary mt-5 w-full disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Result"}
      </button>
    </div>
  );
}
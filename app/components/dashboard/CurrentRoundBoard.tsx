"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Pencil, Shield, Upload } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import { recalcAllPlayerStats } from "@/app/lib/matches/recalcPlayerStats";
import RoundStageSelect from "./RoundStageSelect";
import SelectField from "../SelectField";
import NumberStepper from "../NumberStepper";

type Battle = {
  id: string;
  falcon_player_id: string | null;
  falcon_username: string;
  opponent_label: string;
  opponent_logo_url: string | null;
  falcon_score: number | null;
  opponent_score: number | null;
};

type Props = {
  matchId: string;
  opponentName: string;
  opponentLogoUrl: string | null;
  roundStage: string | null;
  battles: Battle[];
};

function Avatar({
  url,
  fallback,
  size = 40,
  ring,
}: {
  url?: string | null;
  fallback: string | null | undefined;
  size?: number;
  ring?: boolean;
}) {
  const safeFallback = fallback && fallback.trim() ? fallback : "??";

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 overflow-hidden rounded-full bg-surface-2 ${
        ring ? "ring-2 ring-gold/40" : ""
      }`}
    >
      {url ? (
        <Image src={url} alt={safeFallback} fill className="object-cover" />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center font-display font-bold text-gold"
          style={{ fontSize: size * 0.32 }}
        >
          {safeFallback.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );
}

function UploadableAvatar({
  url,
  size = 32,
  onUploaded,
}: {
  url?: string | null;
  size?: number;
  onUploaded: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  if (url) {
    return (
      <div
        style={{ width: size, height: size }}
        className="relative shrink-0 overflow-hidden rounded-full bg-surface-2"
      >
        <Image src={url} alt="Opponent" fill className="object-cover" />
      </div>
    );
  }

  return (
    <label
      style={{ width: size, height: size }}
      className="relative flex shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-border bg-surface-2 text-muted transition-colors hover:border-gold hover:text-gold"
    >
      {uploading ? (
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <Upload size={13} />
      )}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        disabled={uploading}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setUploading(true);
          try {
            const { uploadToImageKit } = await import("@/app/lib/imagekit/upload");
            const result = await uploadToImageKit(file, "/falcon-warriors/opponent-players");
            onUploaded(result.url);
          } catch {
            // silent fail
          } finally {
            setUploading(false);
          }
        }}
      />
    </label>
  );
}

// Inline-editable টেক্সট — ক্লিক করলেই input হয়ে যায়
function InlineEditableText({
  value,
  placeholder,
  onSave,
  align = "center",
  className = "",
}: {
  value: string;
  placeholder: string;
  onSave: (value: string) => void;
  align?: "center" | "right";
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function commit() {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    else setDraft(value);
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className={`rounded-lg border border-gold bg-surface px-2 py-1 text-sm outline-none ${
          align === "center" ? "text-center" : "text-right"
        } ${className}`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className="group flex items-center gap-1"
    >
      <span className={`line-clamp-1 text-sm font-semibold text-white ${className}`}>
        {value || placeholder}
      </span>
      <Pencil size={10} className="shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}

export default function CurrentRoundBoard({
  matchId,
  opponentName: initialOpponentName,
  opponentLogoUrl: initialOpponentLogoUrl,
  roundStage: initialRoundStage,
  battles,
}: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [opponentName, setOpponentName] = useState(initialOpponentName);
  const [opponentLogoUrl, setOpponentLogoUrl] = useState(initialOpponentLogoUrl);
  const [roundStage, setRoundStage] = useState(initialRoundStage ?? "");

  const [rows, setRows] = useState(
    battles.map((b) => ({
      ...b,
      fs: b.falcon_score?.toString() ?? "",
      os: b.opponent_score?.toString() ?? "",
    }))
  );

  const [motmId, setMotmId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalFalcon = rows.reduce((s, r) => s + (r.fs === "" ? 0 : Number(r.fs)), 0);
  const totalOpponent = rows.reduce((s, r) => s + (r.os === "" ? 0 : Number(r.os)), 0);

  function updateRow(id: string, patch: Partial<(typeof rows)[number]>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  async function handleOpponentNameSave(name: string) {
    setOpponentName(name);
    await supabase.from("matches").update({ opponent_name: name }).eq("id", matchId);
    router.refresh();
  }

  async function handleRoundStageChange(stage: string) {
    setRoundStage(stage);
    await supabase.from("matches").update({ round_stage: stage || null }).eq("id", matchId);
    router.refresh();
  }

  async function handleOpponentLogoUpload(url: string) {
    setOpponentLogoUrl(url);
    await supabase.from("matches").update({ opponent_logo_url: url }).eq("id", matchId);
    router.refresh();
  }

  async function handleSlotLabelSave(id: string, label: string) {
    updateRow(id, { opponent_label: label });
    await supabase.from("match_squad_battles").update({ opponent_label: label }).eq("id", id);
  }

  async function handleSlotLogoUpload(id: string, url: string) {
    updateRow(id, { opponent_logo_url: url });
    await supabase.from("match_squad_battles").update({ opponent_logo_url: url }).eq("id", id);
  }

  async function handleSubmit() {
    setError(null);
    const incomplete = rows.some((r) => r.fs === "" || r.os === "");
    if (incomplete) {
      setError("সব রো-তে স্কোর বসান — যেটাতে খেলা হয়নি সেটাতেও ০ দিন।");
      return;
    }

    setLoading(true);

    await Promise.all(
      rows.map((r) =>
        supabase
          .from("match_squad_battles")
          .update({ falcon_score: Number(r.fs), opponent_score: Number(r.os) })
          .eq("id", r.id)
      )
    );

    await supabase
      .from("matches")
      .update({ status: "completed", score_home: totalFalcon, score_away: totalOpponent })
      .eq("id", matchId);

    if (motmId) {
      await supabase
        .from("match_events")
        .delete()
        .eq("match_id", matchId)
        .eq("event_type", "motm");

      await supabase.from("match_events").insert({
        match_id: matchId,
        scorer_id: motmId,
        event_type: "motm",
      });
    }

    await recalcAllPlayerStats(supabase);

    setLoading(false);
    router.refresh();
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      {/* ===== Header ===== */}
      <div className="relative bg-gradient-to-b from-gold/10 via-surface to-surface px-3 sm:px-4 md:px-6 pb-6 pt-6">
        <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3">
          {/* Falcon Warriors — ফিক্সড লোগো */}
          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-full ring-2 ring-gold/40">
              <Image src="/logo.jpg" alt="Falcon Warriors" fill className="object-cover" />
            </div>
            <span className="text-sm font-semibold text-white">Falcon Warriors</span>
          </div>

          {/* Score */}
          <div className="flex shrink-0 flex-col items-center gap-1 px-2">
            <span className="font-display text-4xl font-bold tabular-nums">
              {totalFalcon}
              <span className="mx-1.5 text-muted">-</span>
              {totalOpponent}
            </span>
          </div>

          {/* Opponent — inline editable নাম + আপলোডযোগ্য লোগো */}
          <div className="flex flex-1 flex-col items-center gap-2">
            <UploadableAvatar url={opponentLogoUrl} size={52} onUploaded={handleOpponentLogoUpload} />
            <InlineEditableText
              value={opponentName}
              placeholder="Set Opponent Name"
              onSave={handleOpponentNameSave}
            />
          </div>
        </div>

        {/* Round Stage — সবসময় visible dropdown */}
        <div className="mx-auto mt-5 max-w-[220px]">
          <RoundStageSelect value={roundStage} onChange={handleRoundStageChange} />
        </div>
      </div>

      {/* ===== Squad battle rows ===== */}
      <div className="flex flex-col gap-2 p-4 sm:p-6">
        <div className="mb-1 flex items-center gap-2 px-1">
          <Shield size={13} className="text-gold" />
          <p className="text-xs font-bold uppercase tracking-wide text-muted">Squad Battles</p>
        </div>

        {rows.map((r) => {
          const fsNum = r.fs === "" ? null : Number(r.fs);
          const osNum = r.os === "" ? null : Number(r.os);
          const falconLeading = fsNum !== null && osNum !== null && fsNum > osNum;
          const oppLeading = fsNum !== null && osNum !== null && osNum > fsNum;

          return (
            <div
              key={r.id}
              className="rounded-xl border border-border bg-surface-2/60 p-3 transition-colors hover:bg-surface-2"
            >
              <div className="flex items-center gap-3">
                {/* Falcon player */}
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <Avatar url={null} fallback={r.falcon_username} size={32} />
                  <span
                    className={`truncate text-sm font-medium ${
                      falconLeading ? "text-white" : "text-white/80"
                    }`}
                  >
                    {r.falcon_username}
                  </span>
                </div>

                {/* Score steppers */}
                <div className="flex shrink-0 items-center gap-2">
                  <NumberStepper value={r.fs} onChange={(v) => updateRow(r.id, { fs: v })} />
                  <span className="text-xs font-bold text-muted">:</span>
                  <NumberStepper value={r.os} onChange={(v) => updateRow(r.id, { os: v })} />
                </div>

                {/* Opponent slot — inline editable নাম + আপলোডযোগ্য ছবি */}
                <div className="flex min-w-0 flex-1 items-center justify-end gap-2.5">
                  <InlineEditableText
                    value={r.opponent_label}
                    placeholder="Opponent"
                    onSave={(v) => handleSlotLabelSave(r.id, v)}
                    align="right"
                    className={oppLeading ? "text-white" : "text-white/80"}
                  />
                  <UploadableAvatar
                    url={r.opponent_logo_url}
                    size={32}
                    onUploaded={(url) => handleSlotLogoUpload(r.id, url)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 px-1">
        <SelectField
          label="Man of the Match"
          value={motmId}
          onChange={setMotmId}
          placeholder="— Select MOTM (optional) —"
          options={rows.map((r) => ({
            value: r.falcon_player_id ?? "",
            label: r.falcon_username,
          }))}
        />
      </div>

      {/* ===== Footer ===== */}
      <div className="border-t border-border p-4 sm:p-6">
        {error && (
          <p className="mb-3 rounded-lg bg-gold/15 px-3 py-2 text-sm text-gold">{error}</p>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary w-full py-3 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Result"}
        </button>
      </div>
    </div>
  );
}
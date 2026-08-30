"use client";

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Download, Share2, X } from "lucide-react";
import { toPng } from "html-to-image";
import { knockoutRoundName, countTeamsInRound } from "@/app/lib/utils/roundNames";
import { createClient } from "@/app/lib/supabase/client";
import { saveMatchResult } from "@/app/lib/matches/saveMatchResult";
import { getSiteSettings } from "@/app/lib/queries/siteSettings";
import FillButton from "@/app/components/FillButton";
import { FaFacebook } from "react-icons/fa6";

type PlayerRef = {
  efootball_username: string;
  real_name?: string | null;
  avatar_url?: string | null;
} | {
  efootball_username: string;
  real_name?: string | null;
  avatar_url?: string | null;
}[] | null;

type BracketMatch = {
  id: string;
  round: number;
  match_order: number;
  player1_id: string | null;
  player2_id: string | null;
  player1_score: number | null;
  player2_score: number | null;
  status: string;
  player1?: PlayerRef;
  player2?: PlayerRef;
};

type PlayerInfo = { name: string; avatarUrl: string | null } | null;

function infoOf(p: PlayerRef | undefined): PlayerInfo {
  if (!p) return null;
  const player = Array.isArray(p) ? p[0] : p;
  if (!player) return null;
  return { name: player.real_name?.trim() || player.efootball_username, avatarUrl: player.avatar_url ?? null };
}

const BOX_W = 190;
const BOX_H = 72;
const COL_GAP = 70;
const ROUND1_SLOT = 118;
const LABEL_H = 28;
const AVATAR_SIZE = 22;

function sanitizeFilename(name: string): string {
  return name.trim().replace(/[^a-zA-Z0-9\-_ ]/g, "").replace(/\s+/g, "-") || "bracket";
}

async function waitForImages(node: HTMLElement) {
  const imgs = Array.from(node.querySelectorAll("img"));
  await Promise.all(
    imgs.map(
      (img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.addEventListener("load", () => resolve());
              img.addEventListener("error", () => resolve());
            })
    )
  );
}

/** প্রক্সি/অপ্টিমাইজেশন লেয়ার এড়াতে সরাসরি <img> — এতে ব্র্যাকেট এক্সপোর্টে ভুল ছবি আসার সমস্যা হয় না */
function PlayerAvatar({ info, isBye }: { info: PlayerInfo; isBye?: boolean }) {
  if (isBye) {
    return <div style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }} className="shrink-0 rounded-full bg-surface-2" />;
  }
  const name = info?.name ?? "?";
  return (
    <div style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }} className="relative shrink-0 overflow-hidden rounded-full bg-surface-2 ring-1 ring-white/10">
      {info?.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={info.avatarUrl}
          alt={name}
          crossOrigin="anonymous"
          loading="eager"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[8px] font-bold text-gold">
          {name.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );
}

function PlayerRow({
  info, score, isWinner, isBye, borderBottom,
}: { info: PlayerInfo; score: number | null; isWinner: boolean; isBye?: boolean; borderBottom?: boolean }) {
  const label = isBye ? "BYE" : info?.name ?? "TBD";
  return (
    <div className={`group/player relative flex items-center gap-1.5 px-2 py-1.5 text-xs ${borderBottom ? "border-b border-border" : ""} ${isWinner ? "font-semibold text-white" : isBye ? "text-muted" : "text-white/70"}`}>
      <PlayerAvatar info={info} isBye={isBye} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {score !== null && <span className={`shrink-0 tabular-nums ${isWinner ? "text-gold" : ""}`}>{score}</span>}
      {!isBye && info?.name && (
        <span className="pointer-events-none absolute -top-7 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-bg px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/player:opacity-100">
          {info.name}
        </span>
      )}
    </div>
  );
}

function MatchBox({
  m, editable, tournamentId, format, style, className,
}: {
  m: BracketMatch; editable: boolean; tournamentId?: string; format?: string;
  style?: React.CSSProperties; className: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [s1, setS1] = useState(m.player1_score?.toString() ?? "");
  const [s2, setS2] = useState(m.player2_score?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const p1 = infoOf(m.player1);
  const p2 = infoOf(m.player2);
  const isBye = m.status === "bye";
  const isPlaceholder = m.id.startsWith("preview-") || m.id.startsWith("projected-");
  const canEdit = editable && !isBye && !isPlaceholder && m.player1_id && m.player2_id && tournamentId && format;
  const s1Val = m.player1_score;
  const s2Val = m.player2_score;
  const p1Winner = s1Val !== null && s2Val !== null && s1Val > s2Val;
  const p2Winner = s1Val !== null && s2Val !== null && s2Val > s1Val;

  function resetToStored() {
    setS1(m.player1_score?.toString() ?? "");
    setS2(m.player2_score?.toString() ?? "");
  }

  async function commitSave(score1: string, score2: string) {
    if (score1 === "" || score2 === "" || !tournamentId || !format) return;
    setSaving(true);
    try {
      await saveMatchResult(supabase, {
        matchId: m.id, tournamentId, player1Id: m.player1_id, player2Id: m.player2_id,
        score1: Number(score1), score2: Number(score2), format,
      });
      setEditing(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  // বক্সের বাইরে ফোকাস গেলে (অন্য বক্সে ক্লিক করলে বা বাইরে ক্লিক করলে) — দুইটা স্কোরই থাকলে অটো-সেভ, নাহলে আগের মান ফিরিয়ে দেওয়া হয়
  function handleContainerBlur(e: React.FocusEvent<HTMLDivElement>) {
    const next = e.relatedTarget as Node | null;
    if (boxRef.current && next && boxRef.current.contains(next)) return; // s1 থেকে s2 তে ট্যাব — এখনো একই বক্সে
    if (s1 !== "" && s2 !== "") {
      commitSave(s1, s2);
    } else {
      resetToStored();
      setEditing(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    } else if (e.key === "Escape") {
      resetToStored();
      setEditing(false);
    }
  }

  if (editing) {
    return (
      <div ref={boxRef} onBlur={handleContainerBlur} className={`${className} z-30 border-gold/50 bg-surface p-2`} style={style}>
        <p className="mb-1 truncate text-[11px] font-medium text-white/80">{p1?.name ?? "TBD"}</p>
        <input
          autoFocus
          type="number"
          value={s1}
          onChange={(e) => setS1(e.target.value)}
          onKeyDown={handleKeyDown}
          className="mb-1 w-full rounded border border-border bg-surface-2 px-1.5 py-1 text-center text-xs outline-none focus:border-gold"
          placeholder="0"
        />
        <p className="mb-1 truncate text-[11px] font-medium text-white/80">{p2?.name ?? "TBD"}</p>
        <input
          type="number"
          value={s2}
          onChange={(e) => setS2(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full rounded border border-border bg-surface-2 px-1.5 py-1 text-center text-xs outline-none focus:border-gold"
          placeholder="0"
        />
        {saving && <p className="mt-1 text-center text-[10px] font-medium text-gold animate-pulse">Saving…</p>}
      </div>
    );
  }

  return (
    <div
      className={`${className} ${canEdit ? "cursor-pointer hover:border-gold/50" : ""}`}
      style={style}
      onClick={() => canEdit && setEditing(true)}
    >
      <PlayerRow info={p1} score={s1Val} isWinner={p1Winner} borderBottom />
      <PlayerRow info={p2} score={s2Val} isWinner={p2Winner} isBye={isBye} />
    </div>
  );
}

/** চ্যাম্পিয়ন কনগ্র্যাচুলেশন কার্ড — ডাউনলোড / শেয়ার / ফেসবুক */
function ChampionModal({
  champion,
  tournamentName,
  onClose,
}: {
  champion: NonNullable<PlayerInfo>;
  tournamentName?: string;
  onClose: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [logoUrl, setLogoUrl] = useState("/logo.jpg");
  const [busy, setBusy] = useState<"download" | "share" | null>(null);

  useEffect(() => {
    getSiteSettings().then((s) => setLogoUrl(s.logoUrl));
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  async function generateImage() {
    if (!cardRef.current) return null;
    await waitForImages(cardRef.current);
    return toPng(cardRef.current, { backgroundColor: "#0a0a0f", pixelRatio: 3, cacheBust: true });
  }

  async function handleDownload() {
    setBusy("download");
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) return;
      const link = document.createElement("a");
      link.download = `${sanitizeFilename(champion.name)}-champion.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setBusy(null);
    }
  }

  async function handleShare() {
    setBusy("share");
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) return;
      const shareText = `🏆 ${champion.name} is the Champion of ${tournamentName || "the tournament"}! #FalconWarriors`;

      try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], `${sanitizeFilename(champion.name)}-champion.png`, { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: "FALCON WARRIORS Champion", text: shareText });
          return;
        }
      } catch {
        // ফাইল-শেয়ার সাপোর্ট না থাকলে নিচের ফলব্যাকে যাবে
      }

      if (navigator.share) {
        await navigator.share({ title: "FALCON WARRIORS Champion", text: shareText, url: window.location.href });
        return;
      }

      // কোনো শেয়ার API সাপোর্ট না থাকলে ছবি ডাউনলোড করে দেওয়া হবে, ম্যানুয়ালি শেয়ার করার জন্য
      const link = document.createElement("a");
      link.download = `${sanitizeFilename(champion.name)}-champion.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      // ইউজার শেয়ার শীট ক্যান্সেল করলে কিছু করার নেই
    } finally {
      setBusy(null);
    }
  }

  function handleFacebookShare() {
    // ব্রাউজার থেকে সরাসরি ছবি Facebook-এ আপলোড করা যায় না (এর জন্য পাবলিক হোস্টিং লাগে) —
    // তাই এখানে Facebook-এর শেয়ার ডায়ালগ ওপেন হয় পেজ লিংক + ক্যাপশন সহ। মোবাইলে "Share" বাটন থেকে
    // native শেয়ার-শীট ব্যবহার করলে সরাসরি ছবিসহ Facebook অ্যাপে শেয়ার করা যায়।
    const shareText = `🏆 ${champion.name} is the Champion of ${tournamentName || "the tournament"}! #FalconWarriors`;
    const url = encodeURIComponent(typeof window !== "undefined" ? window.location.href : "https://falcon-warriors.vercel.app");
    const quote = encodeURIComponent(shareText);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`, "_blank", "noopener,noreferrer,width=600,height=600");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="relative w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-10 right-0 text-white/70 transition hover:text-white" aria-label="Close">
          <X size={22} />
        </button>

        <div ref={cardRef} className="relative overflow-hidden rounded-2xl border border-gold/40 bg-gradient-to-b from-[#15151d] to-[#0a0a0f] p-6 text-center shadow-2xl">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{ backgroundImage: "radial-gradient(circle at 50% 0%, #d4af37, transparent 60%)" }}
          />

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoUrl} alt="Falcon Warriors" crossOrigin="anonymous" className="relative mx-auto mb-3 h-14 w-14 rounded-full object-cover ring-2 ring-gold/50" />

          <p className="relative text-[10px] font-bold uppercase tracking-[0.25em] text-gold/80">Falcon Warriors</p>

          <Trophy className="relative mx-auto my-3 text-gold" size={40} strokeWidth={1.5} />

          <p className="relative text-xs font-semibold uppercase tracking-[0.3em] text-gold">Champion</p>

          <div className="relative mx-auto my-4 flex flex-col items-center gap-2">
            <div className="h-20 w-20 overflow-hidden rounded-full ring-4 ring-gold/40">
              {champion.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={champion.avatarUrl} alt={champion.name} crossOrigin="anonymous" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-surface-2 text-xl font-bold text-gold">
                  {champion.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold text-white">{champion.name}</h2>
          </div>

          {tournamentName && <p className="relative text-xs text-white/60">{tournamentName}</p>}

          <p className="relative mt-3 text-[11px] text-white/40">Congratulations! 🎉</p>
        </div>

        <div className="mt-4 flex gap-2">
          <FillButton onClick={handleDownload} disabled={busy !== null} className="flex-1">
            <Download size={15} /> {busy === "download" ? "..." : "Download"}
          </FillButton>
          <FillButton onClick={handleShare} disabled={busy !== null} className="flex-1">
            <Share2 size={15} /> {busy === "share" ? "..." : "Share"}
          </FillButton>
          <button
            onClick={handleFacebookShare}
            className="flex flex-1 items-center justify-center gap-1.5 rounded bg-[#1877F2] px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-[#1877F2]/90 sm:text-sm"
          >
            <FaFacebook size={15} /> Facebook
          </button>
        </div>
      </div>
    </div>
  );
}

export type BracketViewHandle = {
  downloadImage: (tournamentName: string) => Promise<void>;
};

type Props = {
  matches: BracketMatch[];
  mode: "knockout" | "league";
  editable?: boolean;
  tournamentId?: string;
  format?: string;
  tournamentName?: string;
};

const BracketView = forwardRef<BracketViewHandle, Props>(function BracketView(
  { matches, mode, editable = false, tournamentId, format, tournamentName },
  ref
) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [showChampionModal, setShowChampionModal] = useState(false);

  async function exportBracketImage(filename: string) {
    if (!captureRef.current) return;
    await waitForImages(captureRef.current);
    const dataUrl = await toPng(captureRef.current, {
      backgroundColor: "#0a0a0f",
      pixelRatio: 2,
      cacheBust: true,
      style: { padding: "5px" },
    });
    const link = document.createElement("a");
    link.download = `${sanitizeFilename(filename)}.png`;
    link.href = dataUrl;
    link.click();
  }

  useImperativeHandle(ref, () => ({
    downloadImage: (name: string) => exportBracketImage(name),
  }));

  if (matches.length === 0) {
    return <div className="card p-8 text-center text-sm text-muted">No bracket generated yet.</div>;
  }

  const TitleHeading = tournamentName ? (
    <h1 className="mb-4 text-center font-display text-base font-bold uppercase tracking-wide text-white">
      {tournamentName}
    </h1>
  ) : null;

  if (mode === "league") {
    const rounds = Array.from(new Set(matches.map((m) => m.round))).sort((a, b) => a - b);
    const byRound = rounds.map((r) => matches.filter((m) => m.round === r).sort((a, b) => a.match_order - b.match_order));

    return (
      <div className="card overflow-x-auto p-4 sm:p-6">
        <div ref={captureRef} className="min-w-max">
          {TitleHeading}
          <div className="flex gap-6">
            {rounds.map((round, ri) => (
              <div key={round} className="shrink-0" style={{ width: BOX_W }}>
                <p className="mb-3 text-center text-xs font-bold uppercase tracking-wide text-gold">Round {round}</p>
                <div className="flex flex-col gap-3">
                  {byRound[ri].map((m) => (
                    <MatchBox
                      key={m.id} m={m} editable={editable} tournamentId={tournamentId} format={format}
                      className="relative overflow-visible rounded-lg border border-border bg-surface shadow-sm"
                      style={{ minHeight: BOX_H }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const rounds = Array.from(new Set(matches.map((m) => m.round))).sort((a, b) => a - b);
  const totalRounds = rounds.length;
  const byRound: BracketMatch[][] = rounds.map((r) => matches.filter((m) => m.round === r).sort((a, b) => a.match_order - b.match_order));

  const centers: number[][] = [];
  centers[0] = byRound[0].map((_, i) => i * ROUND1_SLOT + ROUND1_SLOT / 2);
  for (let r = 1; r < byRound.length; r++) {
    const prev = centers[r - 1];
    centers[r] = byRound[r].map((_, i) => {
      const a = prev[2 * i];
      const b = prev[2 * i + 1];
      return b !== undefined ? (a + b) / 2 : a;
    });
  }

  const chartHeight = byRound[0].length * ROUND1_SLOT;
  const chartWidth = totalRounds * BOX_W + (totalRounds - 1) * COL_GAP + (BOX_W + COL_GAP);

  const finalRoundMatches = byRound[totalRounds - 1];
  const finalMatch = finalRoundMatches?.[0];
  let champion: PlayerInfo = null;
  if (finalMatch) {
    if (finalMatch.status === "bye") {
      champion = infoOf(finalMatch.player1);
    } else {
      // status স্ট্রিং-এর বদলে স্কোরের উপর ভিত্তি করে champion নির্ণয় — এতে status ভিন্ন কিছু (যেমন "finished") হলেও কাজ করবে
      const s1 = finalMatch.player1_score, s2 = finalMatch.player2_score;
      if (s1 !== null && s2 !== null && s1 !== s2) {
        champion = s1 > s2 ? infoOf(finalMatch.player1) : infoOf(finalMatch.player2);
      }
    }
  }
  const championY = finalMatch ? centers[totalRounds - 1][0] : 0;

  return (
    <div className="card overflow-x-auto p-4 sm:p-6">
      {champion && (
        <div className="mb-3 flex items-center justify-end">
          <button
            onClick={() => setShowChampionModal(true)}
            className="flex items-center gap-1.5 rounded bg-gold px-3 py-1.5 text-xs font-semibold text-bg transition hover:bg-gold/90"
            title="Declare champion"
          >
            <Trophy size={14} /> Submit
          </button>
        </div>
      )}

      <div ref={captureRef} className="min-w-max" style={{ width: chartWidth }}>
        {TitleHeading}
        <div style={{ width: chartWidth, position: "relative" }}>
          <div className="flex" style={{ height: LABEL_H }}>
            {rounds.map((round, ri) => (
              <p key={round} className="text-center text-xs font-bold uppercase tracking-wide text-gold" style={{ width: BOX_W, marginRight: COL_GAP }}>
                {knockoutRoundName(countTeamsInRound(byRound[ri]))}
              </p>
            ))}
            <p className="text-center text-xs font-bold uppercase tracking-wide text-gold" style={{ width: BOX_W }}>
              {champion ? "Champion" : ""}
            </p>
          </div>

          <div style={{ position: "relative", height: chartHeight }}>
            <svg width={chartWidth} height={chartHeight} style={{ position: "absolute", top: 0, left: 0 }} className="text-white/20">
              {byRound.map((roundMatches, ri) => {
                if (ri === totalRounds - 1) return null;
                const rightX = ri * (BOX_W + COL_GAP) + BOX_W;
                const elbowX = rightX + COL_GAP / 2;
                const nextLeftX = rightX + COL_GAP;
                return roundMatches.map((m, i) => {
                  const y = centers[ri][i];
                  const isPairStart = i % 2 === 0;
                  const hasPartner = i + 1 < roundMatches.length;
                  if (!isPairStart) return null;
                  const nextY = centers[ri + 1][i / 2];
                  if (hasPartner) {
                    const yPartner = centers[ri][i + 1];
                    return (
                      <g key={m.id} stroke="currentColor" strokeWidth={1.5} fill="none">
                        <line x1={rightX} y1={y} x2={elbowX} y2={y} />
                        <line x1={rightX} y1={yPartner} x2={elbowX} y2={yPartner} />
                        <line x1={elbowX} y1={y} x2={elbowX} y2={yPartner} />
                        <line x1={elbowX} y1={nextY} x2={nextLeftX} y2={nextY} />
                      </g>
                    );
                  }
                  return (
                    <g key={m.id} stroke="currentColor" strokeWidth={1.5} fill="none">
                      <line x1={rightX} y1={y} x2={nextLeftX} y2={nextY} />
                    </g>
                  );
                });
              })}
              {champion && finalMatch && (
                <line
                  x1={(totalRounds - 1) * (BOX_W + COL_GAP) + BOX_W} y1={championY}
                  x2={(totalRounds - 1) * (BOX_W + COL_GAP) + BOX_W + COL_GAP} y2={championY}
                  stroke="currentColor" strokeWidth={1.5}
                />
              )}
            </svg>

            {byRound.map((roundMatches, ri) => {
              const colX = ri * (BOX_W + COL_GAP);
              return roundMatches.map((m, i) => {
                const y = centers[ri][i];
                return (
                  <MatchBox
                    key={m.id} m={m} editable={editable} tournamentId={tournamentId} format={format}
                    className="absolute overflow-visible rounded-lg border border-border bg-surface shadow-sm transition-shadow hover:shadow-md hover:border-white/20"
                    style={{ left: colX, top: y - BOX_H / 2, width: BOX_W, height: BOX_H }}
                  />
                );
              });
            })}

            {champion && (
              <div className="absolute flex items-center gap-2 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2.5" style={{ left: totalRounds * (BOX_W + COL_GAP), top: championY - BOX_H / 2 + BOX_H / 2 - 20, width: BOX_W }}>
                <Trophy className="text-gold shrink-0" size={18} />
                <div className="flex min-w-0 items-center gap-2">
                  <PlayerAvatar info={champion} />
                  <span className="truncate text-sm font-bold text-gold">{champion.name}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {champion && showChampionModal && (
        <ChampionModal champion={champion} tournamentName={tournamentName} onClose={() => setShowChampionModal(false)} />
      )}
    </div>
  );
});

export default BracketView;
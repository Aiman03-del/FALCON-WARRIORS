"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Share2, Trophy, X } from "lucide-react";
import { FaFacebook } from "react-icons/fa6";
import { toPng } from "html-to-image";
import { getSiteSettings } from "@/app/lib/queries/siteSettings";
import FillButton from "@/app/components/FillButton";

type Champion = {
  name: string;
  avatarUrl: string | null;
};

function sanitizeFilename(name: string): string {
  return name.trim().replace(/[^a-zA-Z0-9\-_ ]/g, "").replace(/\s+/g, "-") || "champion";
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

export default function ChampionModal({
  champion,
  tournamentName,
  onClose,
}: {
  champion: Champion;
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
        // Fall back to the text share flow when file sharing is unavailable.
      }

      if (navigator.share) {
        await navigator.share({ title: "FALCON WARRIORS Champion", text: shareText, url: window.location.href });
        return;
      }

      const link = document.createElement("a");
      link.download = `${sanitizeFilename(champion.name)}-champion.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      // Ignore cancellation from the native share sheet.
    } finally {
      setBusy(null);
    }
  }

  function handleFacebookShare() {
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

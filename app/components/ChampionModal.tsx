"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Share2, X } from "lucide-react";
import { FaFacebook } from "react-icons/fa6";
import { toPng } from "html-to-image";
import { getSiteSettings } from "@/app/lib/queries/siteSettings";
import FillButton from "@/app/components/FillButton";

type Champion = {
  name: string;
  avatarUrl: string | null;
};

function sanitizeFilename(name: string): string {
  return (
    name
      .trim()
      .replace(/[^a-zA-Z0-9\-_ ]/g, "")
      .replace(/\s+/g, "-") || "champion"
  );
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

/* =========================================================
   DECORATIVE PARTICLES
========================================================= */

function Particles() {
  const particles = [
    [7, 10, 3],
    [14, 19, 2],
    [22, 8, 3],
    [31, 16, 2],
    [68, 11, 2],
    [77, 19, 3],
    [88, 9, 2],
    [94, 22, 3],
    [5, 38, 2],
    [12, 48, 3],
    [90, 42, 2],
    [96, 54, 3],
    [7, 69, 2],
    [93, 72, 2],
    [15, 82, 3],
    [84, 84, 3],
    [28, 91, 2],
    [72, 92, 2],
  ];

  return (
    <div className="pointer-events-none absolute inset-0">
      {particles.map(([left, top, size], index) => (
        <span
          key={index}
          className="absolute rotate-45 bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.8)]"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: `${size}px`,
            height: `${size}px`,
          }}
        />
      ))}
    </div>
  );
}

/* =========================================================
   GOLD CORNER DESIGN
========================================================= */

function Corner({
  position,
}: {
  position: "tl" | "tr" | "bl" | "br";
}) {
  const positions = {
    tl: "left-4 top-4",
    tr: "right-4 top-4",
    bl: "bottom-4 left-4",
    br: "bottom-4 right-4",
  };

  const rotation = {
    tl: "",
    tr: "scale-x-[-1]",
    bl: "scale-y-[-1]",
    br: "scale-[-1]",
  };

  return (
    <div
      className={`absolute ${positions[position]} ${rotation[position]} z-20 h-12 w-12`}
    >
      <div className="absolute left-0 top-0 h-[3px] w-10 bg-[#D4AF37]" />
      <div className="absolute left-0 top-0 h-10 w-[3px] bg-[#D4AF37]" />

      <div className="absolute left-[6px] top-[7px] h-[2px] w-7 bg-[#D4AF37]/60" />
      <div className="absolute left-[7px] top-[6px] h-7 w-[2px] bg-[#D4AF37]/60" />
    </div>
  );
}

/* =========================================================
   BOTTOM WING / CURVE DECORATION
========================================================= */

function BottomWings() {
  return (
    <svg
      viewBox="0 0 800 220"
      className="pointer-events-none absolute bottom-[-5px] left-1/2 z-10 w-[125%] -translate-x-1/2 opacity-[0.18]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M400 215C330 175 260 135 160 112C100 98 52 100 10 118C88 127 142 150 195 181C120 156 67 158 20 180C132 185 223 207 300 220"
        fill="#D4AF37"
      />

      <path
        d="M400 215C470 175 540 135 640 112C700 98 748 100 790 118C712 127 658 150 605 181C680 156 733 158 780 180C668 185 577 207 500 220"
        fill="#D4AF37"
      />

      <path
        d="M35 127C112 139 173 165 226 195"
        stroke="#08080C"
        strokeWidth="8"
        strokeLinecap="round"
      />

      <path
        d="M765 127C688 139 627 165 574 195"
        stroke="#08080C"
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

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

  /* =========================================================
     LOAD LOGO
  ========================================================= */

  useEffect(() => {
    getSiteSettings().then((s) => {
      if (s.logoUrl) {
        setLogoUrl(s.logoUrl);
      }
    });
  }, []);

  /* =========================================================
     LOCK BODY SCROLL
  ========================================================= */

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  /* =========================================================
     GENERATE IMAGE
  ========================================================= */

  async function generateImage() {
    if (!cardRef.current) return null;

    await waitForImages(cardRef.current);

    return toPng(cardRef.current, {
      backgroundColor: "#08080C",
      pixelRatio: 3,
      cacheBust: true,
      skipFonts: false,
    });
  }

  /* =========================================================
     DOWNLOAD
  ========================================================= */

  async function handleDownload() {
    setBusy("download");

    try {
      const dataUrl = await generateImage();

      if (!dataUrl) return;

      const link = document.createElement("a");

      link.download = `${sanitizeFilename(
        champion.name
      )}-champion.png`;

      link.href = dataUrl;
      link.click();
    } finally {
      setBusy(null);
    }
  }

  /* =========================================================
     SHARE
  ========================================================= */

  async function handleShare() {
    setBusy("share");

    try {
      const dataUrl = await generateImage();

      if (!dataUrl) return;

      const shareText = `🏆 ${champion.name} is the Champion of ${
        tournamentName || "the tournament"
      }! #FalconWarriors`;

      try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();

        const file = new File(
          [blob],
          `${sanitizeFilename(champion.name)}-champion.png`,
          {
            type: "image/png",
          }
        );

        if (
          navigator.canShare &&
          navigator.canShare({
            files: [file],
          })
        ) {
          await navigator.share({
            files: [file],
            title: "FALCON WARRIORS Champion",
            text: shareText,
          });

          return;
        }
      } catch {
        // Continue to normal share.
      }

      if (navigator.share) {
        await navigator.share({
          title: "FALCON WARRIORS Champion",
          text: shareText,
          url: window.location.href,
        });

        return;
      }

      const link = document.createElement("a");

      link.download = `${sanitizeFilename(
        champion.name
      )}-champion.png`;

      link.href = dataUrl;
      link.click();
    } catch {
      // Share cancelled.
    } finally {
      setBusy(null);
    }
  }

  /* =========================================================
     FACEBOOK SHARE
  ========================================================= */

  function handleFacebookShare() {
    const shareText = `🏆 ${champion.name} is the Champion of ${
      tournamentName || "the tournament"
    }! #FalconWarriors`;

    const url = encodeURIComponent(
      typeof window !== "undefined"
        ? window.location.href
        : "https://falcon-warriors.vercel.app"
    );

    const quote = encodeURIComponent(shareText);

    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`,
      "_blank",
      "noopener,noreferrer,width=600,height=600"
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/90 p-3 backdrop-blur-md sm:p-5"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[430px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* =================================================
            CLOSE
        ================================================= */}

        <button
          onClick={onClose}
          className="absolute -right-1 -top-10 z-50 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/70 text-white/60 transition hover:border-[#D4AF37]/50 hover:text-white sm:-right-10 sm:top-0"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* =================================================
            CARD
        ================================================= */}

        <div
          ref={cardRef}
          className="relative mx-auto aspect-[5/6] w-full overflow-hidden rounded-[28px] border border-[#B8942E] bg-[#08080C] text-center shadow-[0_0_80px_rgba(212,175,55,0.18)]"
        >
          {/* =================================================
              BACKGROUND
          ================================================= */}

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.22),transparent_27%),radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.07),transparent_42%),linear-gradient(145deg,#17171C_0%,#0A0A0E_48%,#050507_100%)]" />

          {/* =================================================
              GRID
          ================================================= */}

          <div
            className="pointer-events-none absolute inset-0 opacity-[0.055]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.45) 1px, transparent 1px)",
              backgroundSize: "38px 38px",
            }}
          />

          {/* =================================================
              GOLD LIGHT
          ================================================= */}

          <div className="absolute left-1/2 top-[-100px] h-[260px] w-[260px] -translate-x-1/2 rounded-full bg-[#D4AF37]/15 blur-[65px]" />

          {/* =================================================
              PARTICLES
          ================================================= */}

          <Particles />

          {/* =================================================
              CORNERS
          ================================================= */}

          <Corner position="tl" />
          <Corner position="tr" />
          <Corner position="bl" />
          <Corner position="br" />

          {/* =================================================
              GIANT BACKGROUND CHAMPION
              শুধু এই CHAMPION থাকবে
          ================================================= */}

          <div className="pointer-events-none absolute left-1/2 top-[205px] z-[1] -translate-x-1/2 whitespace-nowrap text-[68px] font-black uppercase tracking-[-0.055em] text-transparent opacity-[0.13] [-webkit-text-stroke:1px_#D4AF37]">
            CHAMPION
          </div>

          {/* =================================================
              BOTTOM WINGS
          ================================================= */}

          <BottomWings />

          {/* =================================================
              CONTENT
          ================================================= */}

          <div className="relative z-20 flex h-full flex-col items-center px-5 pt-6">
            {/* =================================================
                LOGO
            ================================================= */}

            <div className="relative">
              <div className="absolute inset-[-15px] rounded-full bg-[#D4AF37]/20 blur-2xl" />

              <div className="relative rounded-full bg-gradient-to-br from-[#F8DD79] via-[#C19A32] to-[#72531A] p-[4px] shadow-[0_0_35px_rgba(212,175,55,0.4)]">
                <div className="rounded-full bg-[#07070A] p-[3px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoUrl}
                    alt="Falcon Warriors"
                    crossOrigin="anonymous"
                    className="h-[78px] w-[78px] rounded-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* =================================================
                CLUB NAME
            ================================================= */}

            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.42em] text-[#D4AF37]">
              FALCON WARRIORS
            </p>

            {/* =================================================
                EST
            ================================================= */}

            <div className="mt-1.5 flex items-center gap-2">
              <span className="h-px w-7 bg-[#D4AF37]/50" />

              <span className="text-[7px] font-medium uppercase tracking-[0.28em] text-white/40">
                EST. 2024
              </span>

              <span className="h-px w-7 bg-[#D4AF37]/50" />
            </div>

            {/* =================================================
                AVATAR
            ================================================= */}

            <div className="relative mt-[58px]">
              {/* glow */}

              <div className="absolute inset-[-18px] rounded-full bg-[#D4AF37]/20 blur-2xl" />

              {/* outer gold ring */}

              <div className="relative rounded-full bg-gradient-to-br from-[#F8DA70] via-[#C0922B] to-[#71531A] p-[5px] shadow-[0_0_40px_rgba(212,175,55,0.4)]">
                <div className="rounded-full bg-[#050507] p-[5px]">
                  <div className="h-[122px] w-[122px] overflow-hidden rounded-full bg-[#111116]">
                    {champion.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={champion.avatarUrl}
                        alt={champion.name}
                        crossOrigin="anonymous"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#19191F] to-[#07070A] text-3xl font-black text-[#D4AF37]">
                        {champion.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* small stars */}

              <span className="absolute -left-6 top-8 text-xs text-[#D4AF37]">
                ✦
              </span>

              <span className="absolute -right-6 bottom-8 text-[9px] text-[#D4AF37]">
                ✦
              </span>
            </div>

            {/* =================================================
                NAME PLATE
            ================================================= */}

            <div className="relative mt-4 w-full max-w-[330px]">
              <div className="absolute inset-x-10 bottom-[-4px] h-5 bg-[#D4AF37]/20 blur-xl" />

              <div
                className="relative border border-[#D4AF37] bg-gradient-to-b from-[#19191E] to-[#08080B] px-5 py-2.5 shadow-[0_10px_35px_rgba(0,0,0,0.6)]"
                style={{
                  clipPath:
                    "polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)",
                }}
              >
                <h2 className="truncate text-[24px] font-black tracking-tight text-white">
                  {champion.name}
                </h2>
              </div>
            </div>

            {/* =================================================
                TOURNAMENT
            ================================================= */}

            {tournamentName && (
              <div className="mt-3 flex max-w-[290px] items-center gap-3">
                <span className="h-px w-10 bg-[#D4AF37]/50" />

                <p className="truncate text-[10px] font-medium uppercase tracking-[0.15em] text-white/55">
                  {tournamentName}
                </p>

                <span className="h-px w-10 bg-[#D4AF37]/50" />
              </div>
            )}

            {/* =================================================
                CONGRATULATIONS
            ================================================= */}

            <div className="mt-auto w-full pb-5">
              <div className="mb-2 flex items-center justify-center gap-3">
                <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#D4AF37]/60" />

                <span className="text-[7px] text-[#D4AF37]">
                  ★
                </span>

                <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#D4AF37]/60" />
              </div>

              <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-white/65">
                CONGRATULATIONS!
              </p>

              <p className="mt-1 text-[7px] uppercase tracking-[0.28em] text-white/25">
                FALCON WARRIORS • CHAMPIONS
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            ACTION BUTTONS
        ================================================= */}

        <div className="mt-3 grid grid-cols-3 gap-2">
          <FillButton
            onClick={handleDownload}
            disabled={busy !== null}
            className="flex items-center justify-center gap-1.5 !rounded-xl"
          >
            <Download size={15} />
            {busy === "download" ? "..." : "Download"}
          </FillButton>

          <FillButton
            onClick={handleShare}
            disabled={busy !== null}
            className="flex items-center justify-center gap-1.5 !rounded-xl"
          >
            <Share2 size={15} />
            {busy === "share" ? "..." : "Share"}
          </FillButton>

          <button
            onClick={handleFacebookShare}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#1877F2] px-2 py-2.5 text-xs font-semibold text-white transition hover:bg-[#1877F2]/90 disabled:opacity-50 sm:text-sm"
          >
            <FaFacebook size={15} />
            Facebook
          </button>
        </div>
      </div>
    </div>
  );
}
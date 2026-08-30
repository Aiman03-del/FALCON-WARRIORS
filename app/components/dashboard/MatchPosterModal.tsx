"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Download, Share2, X } from "lucide-react";
import { FaFacebook } from "react-icons/fa6";
import { toPng } from "html-to-image";
import FillButton from "@/app/components/FillButton";

type MatchPosterModalProps = {
  homeName?: string;
  homeLogoUrl?: string | null;
  opponentName?: string | null;
  opponentLogoUrl?: string | null;
  competition?: string | null;
  matchDate: string;
  status: string;
  scoreHome: number | null;
  scoreAway: number | null;
  logoUrl: string;
  shareUrl: string;
  onClose: () => void;
};

function sanitizeFilename(name: string): string {
  return (
    name
      .trim()
      .replace(/[^a-zA-Z0-9\-_ ]/g, "")
      .replace(/\s+/g, "-") || "match"
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

export default function MatchPosterModal({
  homeName,
  homeLogoUrl,
  opponentName,
  opponentLogoUrl,
  competition,
  matchDate,
  status,
  scoreHome,
  scoreAway,
  logoUrl,
  shareUrl,
  onClose,
}: MatchPosterModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const [busy, setBusy] = useState<
    "download" | "copy" | "share" | null
  >(null);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

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

  async function handleDownload() {
    setBusy("download");

    try {
      const dataUrl = await generateImage();

      if (!dataUrl) return;

      const link = document.createElement("a");

      const baseName = `${homeName ?? "match"}-vs-${
        opponentName ?? "opponent"
      }`;

      link.download = `${sanitizeFilename(baseName)}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setBusy(null);
    }
  }

  async function handleCopyLink() {
    setBusy("copy");

    try {
      await navigator.clipboard.writeText(shareUrl);

      setCopied(true);

      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      const textArea = document.createElement("textarea");

      textArea.value = shareUrl;

      document.body.appendChild(textArea);

      textArea.select();

      document.execCommand("copy");

      document.body.removeChild(textArea);

      setCopied(true);

      window.setTimeout(() => setCopied(false), 1500);
    } finally {
      setBusy(null);
    }
  }

  async function handleShare() {
    setBusy("share");

    try {
      const dataUrl = await generateImage();

      if (!dataUrl) return;

      const shareText = `🔥 ${
        homeName ?? "Falcon Warriors"
      } vs ${opponentName ?? "Opponent"} • ${
        competition || "Matchday"
      }`;

      try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();

        const file = new File(
          [blob],
          `${sanitizeFilename(
            `${homeName ?? "match"}-vs-${
              opponentName ?? "opponent"
            }`
          )}.png`,
          {
            type: "image/png",
          }
        );

        if (
          navigator.canShare &&
          navigator.canShare({ files: [file] })
        ) {
          await navigator.share({
            files: [file],
            title: "Falcon Warriors Match Poster",
            text: shareText,
            url: shareUrl,
          });

          return;
        }
      } catch {
        // Continue to fallback
      }

      if (navigator.share) {
        await navigator.share({
          title: "Falcon Warriors Match Poster",
          text: shareText,
          url: shareUrl,
        });

        return;
      }

      const link = document.createElement("a");

      link.download = `${sanitizeFilename(
        `${homeName ?? "match"}-vs-${
          opponentName ?? "opponent"
        }`
      )}.png`;

      link.href = dataUrl;
      link.click();
    } finally {
      setBusy(null);
    }
  }

  function handleFacebookShare() {
    const shareText = `🔥 ${
      homeName ?? "Falcon Warriors"
    } vs ${opponentName ?? "Opponent"} • ${
      competition || "Matchday"
    }`;

    const url = encodeURIComponent(shareUrl);
    const quote = encodeURIComponent(shareText);

    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`,
      "_blank",
      "noopener,noreferrer,width=600,height=600"
    );
  }

  const formattedDate = new Date(
    matchDate
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  const tournamentName =
    competition?.trim() || "FALCON WARRIORS MATCH";

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        overflow-y-auto
        bg-black/90
        p-3
        backdrop-blur-md
        sm:p-5
      "
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[390px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="
            absolute -right-1 -top-10 z-50
            flex h-8 w-8 items-center justify-center
            rounded-full
            border border-white/10
            bg-black/70
            text-white/60
            transition
            hover:border-[#D4AF37]/50
            hover:text-white
            sm:-right-10 sm:top-0
          "
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* =================================================
            POSTER
        ================================================== */}
        <div
          ref={cardRef}
          className="
            relative mx-auto
            aspect-[5/6]
            w-full
            max-h-[72vh]
            overflow-hidden
            rounded-[24px]
            border
            border-[#B8942E]
            bg-[#08080C]
            text-center
            shadow-[0_0_80px_rgba(212,175,55,0.18)]
          "
        >
          {/* Main background */}
          <div
            className="
              absolute inset-0
              bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.24),transparent_27%),radial-gradient(circle_at_50%_45%,rgba(212,175,55,0.06),transparent_45%),linear-gradient(145deg,#18181D_0%,#0A0A0E_48%,#050507_100%)]
            "
          />

          {/* Grid */}
          <div
            className="
              pointer-events-none
              absolute inset-0
              opacity-[0.055]
            "
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.45) 1px, transparent 1px)",
              backgroundSize: "38px 38px",
            }}
          />

          {/* Gold ambient glow */}
          <div
            className="
              absolute
              left-1/2
              top-[-100px]
              h-[270px]
              w-[270px]
              -translate-x-1/2
              rounded-full
              bg-[#D4AF37]/15
              blur-[65px]
            "
          />

          <Particles />

          <Corner position="tl" />
          <Corner position="tr" />
          <Corner position="bl" />
          <Corner position="br" />

          {/* Background typography */}
          <div
            className="
              pointer-events-none
              absolute
              left-1/2
              top-[250px]
              z-[1]
              -translate-x-1/2
              whitespace-nowrap
              text-[62px]
              font-black
              uppercase
              tracking-[-0.055em]
              text-transparent
              opacity-[0.12]
              [-webkit-text-stroke:1px_#D4AF37]
            "
          >
            MATCHDAY
          </div>

          <BottomWings />

          {/* =================================================
              CONTENT
          ================================================== */}
          <div
            className="
              relative z-20
              flex h-full
              flex-col
              items-center
              px-4
              pt-4
            "
          >
            {/* LOGO */}
            <div className="relative">
              <div
                className="
                  absolute inset-[-16px]
                  rounded-full
                  bg-[#D4AF37]/20
                  blur-2xl
                "
              />

              <div
                className="
                  relative
                  rounded-full
                  bg-gradient-to-br
                  from-[#F8DD79]
                  via-[#C19A32]
                  to-[#72531A]
                  p-[4px]
                  shadow-[0_0_35px_rgba(212,175,55,0.4)]
                "
              >
                <div className="rounded-full bg-[#07070A] p-[3px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoUrl}
                    alt="Falcon Warriors"
                    crossOrigin="anonymous"
                    className="
                      h-[78px]
                      w-[78px]
                      rounded-full
                      object-cover
                    "
                  />
                </div>
              </div>
            </div>

            {/* CLUB NAME */}
            <p
              className="
                mt-1.5
                text-[9px]
                font-bold
                uppercase
                tracking-[0.42em]
                text-[#D4AF37]
              "
            >
              FALCON WARRIORS
            </p>

            {/* STATUS */}
            <div className="mt-1 flex items-center gap-2">
              <span className="h-px w-7 bg-[#D4AF37]/50" />

              <span
                className="
                  rounded-full
                  border border-[#D4AF37]/20
                  bg-[#D4AF37]/5
                  px-3 py-1
                  text-[7px]
                  font-bold
                  uppercase
                  tracking-[0.3em]
                  text-white/55
                "
              >
                {status.toUpperCase()}
              </span>

              <span className="h-px w-7 bg-[#D4AF37]/50" />
            </div>

            {/* =================================================
                MATCH AREA
            ================================================== */}
            <div
              className="
                mt-3
                flex w-full
                items-start
                justify-between
                gap-1
                px-1
              "
            >
              {/* HOME PLAYER */}
              <div className="flex w-[32%] flex-col items-center">
                <div
                  className="
                    h-[60px]
                    w-[60px]
                    overflow-hidden
                    rounded-full
                    border
                    border-[#D4AF37]/55
                    bg-[#111116]
                    p-[4px]
                    shadow-[0_0_18px_rgba(212,175,55,0.12)]
                  "
                >
                  {homeLogoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={homeLogoUrl}
                      alt={homeName || "Home team"}
                      crossOrigin="anonymous"
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="
                        flex h-full w-full
                        items-center justify-center
                        rounded-full
                        bg-gradient-to-br
                        from-[#19191F]
                        to-[#07070A]
                        text-[10px]
                        font-black
                        text-[#D4AF37]
                      "
                    >
                      {(homeName || "FW")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                  )}
                </div>

                <p
                  className="
                    mt-2
                    w-full
                    truncate
                    px-1
                    text-[11px]
                    font-bold
                    text-white
                  "
                >
                  {homeName || "Falcon Warriors"}
                </p>
              </div>

              {/* SCORE */}
              <div
                className="
                  flex flex-1
                  flex-col
                  items-center
                  justify-center
                  pt-2
                "
              >
                <div className="flex items-center gap-2 font-display leading-none">
                  <span className="text-3xl font-bold text-white">
                    {scoreHome ?? 0}
                  </span>

                  <span className="text-xl font-medium text-white/35">
                    —
                  </span>

                  <span className="text-3xl font-bold text-white">
                    {scoreAway ?? 0}
                  </span>
                </div>

                {/* VS label */}
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="h-px w-5 bg-[#D4AF37]/50" />

                  <span
                    className="
                      text-[7px]
                      font-bold
                      uppercase
                      tracking-[0.3em]
                      text-[#D4AF37]
                    "
                  >
                    VS
                  </span>

                  <span className="h-px w-5 bg-[#D4AF37]/50" />
                </div>
              </div>

              {/* OPPONENT */}
              <div className="flex w-[32%] flex-col items-center">
                <div
                  className="
                    h-[76px]
                    w-[76px]
                    overflow-hidden
                    rounded-full
                    border
                    border-white/15
                    bg-[#111116]
                    p-[4px]
                  "
                >
                  {opponentLogoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={opponentLogoUrl}
                      alt={opponentName || "Opponent"}
                      crossOrigin="anonymous"
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="
                        flex h-full w-full
                        items-center justify-center
                        rounded-full
                        bg-gradient-to-br
                        from-[#19191F]
                        to-[#07070A]
                        text-[11px]
                        font-black
                        text-white/70
                      "
                    >
                      {(opponentName || "OP")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                  )}
                </div>

                <p
                  className="
                    mt-2
                    w-full
                    truncate
                    px-1
                    text-[11px]
                    font-bold
                    text-white
                  "
                >
                  {opponentName || "Opponent"}
                </p>
              </div>
            </div>

            {/* =================================================
                TOURNAMENT NAME
            ================================================== */}
            <div
              className="
                mt-3
                w-full
                max-w-[330px]
                px-2
              "
            >
              {/* decorative divider */}
              <div className="mb-1.5 flex items-center justify-center gap-2">
                <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#D4AF37]/60" />

                <span className="text-[8px] text-[#D4AF37]">
                  ◆
                </span>

                <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#D4AF37]/60" />
              </div>

              {/* tournament label */}
              <p
                className="
                  mb-1
                  text-[7px]
                  font-semibold
                  uppercase
                  tracking-[0.32em]
                  text-white/35
                "
              >
                TOURNAMENT
              </p>

              {/* tournament name */}
              <div
                className="
                  rounded-xl
                  border
                  border-[#D4AF37]/30
                  bg-[#111116]/75
                  px-3
                  py-2.5
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]
                "
              >
                <p
                  className="
                    break-words
                    text-center
                    text-[13px]
                    font-black
                    uppercase
                    leading-tight
                    tracking-[0.12em]
                    text-[#D4AF37]
                    drop-shadow-[0_0_12px_rgba(212,175,55,0.15)]
                  "
                >
                  {tournamentName}
                </p>
              </div>
            </div>

            {/* =================================================
                DATE
            ================================================== */}
            <div
              className="
                mt-3
                w-full
                max-w-[280px]
                rounded-xl
                border
                border-[#D4AF37]/35
                bg-[#121218]/85
                px-3
                py-2
                shadow-[0_10px_30px_rgba(0,0,0,0.15)]
              "
            >
              <p
                className="
                  text-[8px]
                  font-medium
                  uppercase
                  tracking-[0.28em]
                  text-white/40
                "
              >
                WHEN
              </p>

              <p
                className="
                  mt-1
                  text-[12px]
                  font-bold
                  text-white
                "
              >
                {formattedDate}
              </p>
            </div>

            {/* =================================================
                FOOTER
            ================================================== */}
            <div className="mt-auto w-full pb-3">
              <div className="mb-2 flex items-center justify-center gap-3">
                <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#D4AF37]/60" />

                <span className="text-[7px] text-[#D4AF37]">
                  ★
                </span>

                <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#D4AF37]/60" />
              </div>

              <p
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.35em]
                  text-white/65
                "
              >
                Match Poster
              </p>

              <p
                className="
                  mt-1
                  text-[7px]
                  uppercase
                  tracking-[0.28em]
                  text-white/25
                "
              >
                FALCON WARRIORS • {status.toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            ACTION BUTTONS
        ================================================== */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <FillButton
            onClick={handleCopyLink}
            disabled={busy !== null}
            className="
              flex items-center
              justify-center gap-1.5
              !rounded-xl
            "
          >
            {copied ? (
              <Check size={15} />
            ) : (
              <Copy size={15} />
            )}

            {busy === "copy"
              ? "..."
              : copied
                ? "Copied"
                : "Copy link"}
          </FillButton>

          <FillButton
            onClick={handleShare}
            disabled={busy !== null}
            className="
              flex items-center
              justify-center gap-1.5
              !rounded-xl
            "
          >
            <Share2 size={15} />

            {busy === "share" ? "..." : "Share"}
          </FillButton>

          <FillButton
            onClick={handleDownload}
            disabled={busy !== null}
            className="
              flex items-center
              justify-center gap-1.5
              !rounded-xl
            "
          >
            <Download size={15} />

            {busy === "download"
              ? "..."
              : "Save"}
          </FillButton>

          <button
            type="button"
            onClick={handleFacebookShare}
            className="
              col-span-3
              flex items-center
              justify-center gap-1.5
              rounded-xl
              bg-[#1877F2]
              px-2 py-2.5
              text-xs
              font-semibold
              text-white
              transition
              hover:bg-[#1877F2]/90
              disabled:opacity-50
              sm:text-sm
            "
          >
            <FaFacebook size={15} />
            Share on Facebook
          </button>
        </div>
      </div>
    </div>
  );
}
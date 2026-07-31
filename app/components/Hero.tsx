import FillButton from "./FillButton";
import OutlineButton from "./OutlineButton";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* background grid + glow */}
      <div className="absolute inset-0 bg-hero-grid bg-[size:40px_40px] opacity-40" />
      <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-gold/10 blur-[120px] sm:h-[500px] sm:w-[800px]" />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-24 md:py-28">
        <span className="mb-4 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[10px] font-semibold tracking-[0.15em] text-gold sm:px-4 sm:tracking-[0.2em] sm:text-xs">
          EST. 2024 · ELITE ESPORTS DIVISION
        </span>

        <h1 className="font-display text-4xl font-bold uppercase tracking-wide text-white sm:text-5xl md:text-7xl">
          Falcon <span className="text-gold">Warriors</span>
        </h1>

        <p className="mt-4 max-w-xl px-2 text-sm text-muted sm:mt-5 sm:text-base md:text-lg">
          Rise. Compete. Conquer. The new era of eFootball dominance begins
          here.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:mt-8 sm:gap-4">
          <FillButton href="/register">Join the Club</FillButton>
          <OutlineButton href="https://www.facebook.com/groups/1312106901028571/user/61579023831850">
            Facebook Page
          </OutlineButton></div>
      </div>
    </section>
  );
}




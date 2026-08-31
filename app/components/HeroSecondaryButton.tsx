import Link from "next/link";
import { type ReactNode } from "react";

type HeroSecondaryButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

export default function HeroSecondaryButton({
  href,
  children,
  className = "",
}: HeroSecondaryButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--fw-border)] bg-[var(--fw-button-secondary)] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--fw-text-primary)] transition duration-200 hover:border-[var(--fw-border-hover)] hover:bg-[var(--fw-button-secondary-hover)] ${className}`}
    >
      {children}
    </Link>
  );
}

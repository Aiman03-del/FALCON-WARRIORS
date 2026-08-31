import Link from "next/link";
import { type ReactNode } from "react";

type HeroPrimaryButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

export default function HeroPrimaryButton({
  href,
  children,
  className = "",
}: HeroPrimaryButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--fw-brand)] bg-[var(--fw-button-primary)] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--fw-text-primary)] shadow-[0_12px_28px_var(--fw-glow)] transition duration-200 hover:border-[var(--fw-button-primary-hover)] hover:bg-[var(--fw-button-primary-hover)] ${className}`}
    >
      {children}
    </Link>
  );
}

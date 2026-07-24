import Link from "next/link";
import { type MouseEventHandler, type ReactNode } from "react";

type FillButtonProps = {
  href?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
};

export default function FillButton({
  href,
  type = "button",
  disabled = false,
  children,
  className = "",
  onClick,
}: FillButtonProps) {
  const baseClasses = `inline-flex items-center justify-center gap-2 whitespace-nowrap bg-gold px-2 py-2 text-xs sm:px-3 sm:py-2.5 sm:text-sm md:px-4 md:py-3 font-semibold text-bg transition hover:bg-gold/90 rounded disabled:opacity-50 disabled:cursor-not-allowed ${className}`;

  if (href) {
    return (
      <Link href={href} className={baseClasses} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} className={baseClasses} onClick={onClick}>
      {children}
    </button>
  );
}

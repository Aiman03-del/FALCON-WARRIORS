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
  const baseClasses = `inline-flex items-center justify-center bg-gold px-6 py-3 text-sm font-semibold text-bg transition hover:bg-gold/90 ${className}`;

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

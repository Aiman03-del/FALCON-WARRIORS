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
      className={`inline-flex items-center justify-center border border-gold bg-transparent px-6 py-3 text-sm font-semibold text-gold transition hover:bg-gold/10 ${className}`}
    >
      {children}
    </Link>
  );
}

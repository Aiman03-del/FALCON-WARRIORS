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
      className={`inline-flex items-center justify-center bg-gold px-3 sm:px-4 md:px-6 py-3 text-sm font-semibold text-bg transition hover:bg-gold/90 ${className}`}
    >
      {children}
    </Link>
  );
}

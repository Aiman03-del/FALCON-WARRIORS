import Link from "next/link";
import { type ReactNode } from "react";

type OutlineButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

export default function OutlineButton({ href, children, className = "" }: OutlineButtonProps) {
  const isExternal = href.startsWith("http");

  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={`inline-flex items-center justify-center border border-gold bg-transparent px-3 sm:px-4 md:px-6 py-3 text-sm font-semibold text-gold transition hover:bg-gold/10 ${className}`}
    >
      {children}
    </Link>
  );
}
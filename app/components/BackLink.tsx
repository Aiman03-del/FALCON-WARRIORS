"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

type BackLinkProps = {
  href?: string; // direct route if provided, otherwise use browser back
  label?: string;
};

export default function BackLink({ href, label = "Back" }: BackLinkProps) {
  const router = useRouter();

  if (href) {
    return (
      <Link
        href={href}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-white"
      >
        <ArrowLeft size={15} />
        {label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-white"
    >
      <ArrowLeft size={15} />
      {label}
    </button>
  );
}
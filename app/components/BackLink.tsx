"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

type BackLinkProps = {
  href?: string; // দিলে সরাসরি সেই রুটে যাবে, না দিলে browser back ব্যবহার হবে
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
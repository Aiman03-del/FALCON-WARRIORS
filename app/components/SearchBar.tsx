"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchBar({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15} />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search players, matches, news..."
        className="w-full rounded-lg border border-border bg-surface-2 py-2 pl-9 pr-3 text-sm outline-none focus:border-gold"
      />
    </form>
  );
}
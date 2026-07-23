export default function FormBadges({ form }: { form: ("W" | "D" | "L")[] }) {
  if (form.length === 0) {
    return <span className="text-xs text-muted">—</span>;
  }

  const styles: Record<"W" | "D" | "L", string> = {
    W: "bg-indigo/25 text-indigo-light",
    D: "bg-white/10 text-muted",
    L: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="flex gap-1">
      {form.map((r, i) => (
        <span
          key={i}
          className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${styles[r]}`}
        >
          {r}
        </span>
      ))}
            </div>
  );
}
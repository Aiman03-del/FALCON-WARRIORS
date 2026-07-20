const styles: Record<string, string> = {
  upcoming: "bg-white/10 text-muted",
  live: "bg-red-500/15 text-red-400",
  completed: "bg-indigo/20 text-indigo-light",
};

export default function MatchStatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${styles[status]}`}>
      {status}
    </span>
  );
}
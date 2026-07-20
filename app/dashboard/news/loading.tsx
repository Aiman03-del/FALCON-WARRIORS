import NewsSkeleton from "@/app/components/skeleton/dashboard/NewsSkeleton";

export default function NewsLoading() {
  return (
    <div className="min-h-[70vh]">
      <NewsSkeleton />
    </div>
  );
}

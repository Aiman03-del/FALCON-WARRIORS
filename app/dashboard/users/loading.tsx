import UsersSkeleton from "@/app/components/skeleton/dashboard/UsersSkeleton";

export default function UsersLoading() {
  return (
    <div className="min-h-[70vh]">
      <UsersSkeleton />
    </div>
  );
}

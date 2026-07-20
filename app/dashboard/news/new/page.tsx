import NewsForm from "@/app/components/dashboard/NewsForm";
import { requireStaff } from "@/app/lib/queries/dashboard";


export default async function NewNewsPage() {
  await requireStaff();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
        New News Post
      </h1>
      <p className="mt-1 text-sm text-muted">Publish an update to the club feed.</p>
      <NewsForm mode="create" />
    </div>
  );
}
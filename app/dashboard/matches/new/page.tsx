import MatchForm from "@/app/components/dashboard/MatchForm";
import { requireStaff } from "@/app/lib/queries/dashboard";


export default async function NewMatchPage() {
  await requireStaff();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
        New Fixture
      </h1>
      <p className="mt-1 text-sm text-muted">Schedule an upcoming match.</p>
      <MatchForm />
    </div>
  );
}
import TournamentForm from "@/app/components/dashboard/TournamentForm";
import { requireStaff } from "@/app/lib/queries/dashboard";


export default async function NewTournamentPage() {
  await requireStaff();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
        New Tournament
      </h1>
      <p className="mt-1 text-sm text-muted">Set up an internal or official tournament.</p>
      <TournamentForm mode="create" />
    </div>
  );
}
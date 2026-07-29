import CommunityForm from "@/app/components/dashboard/CommunityForm";

export default function NewCommunityPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
        New Associated Community
      </h1>
      <p className="mt-1 text-sm text-muted">e.g. COBEG, ECOB, EAOB, PESBD.</p>
      <CommunityForm mode="create" />
    </div>
  );
}
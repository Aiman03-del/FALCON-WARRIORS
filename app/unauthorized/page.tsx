import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <ShieldAlert size={48} className="text-gold" />
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-gold">
        Access Denied
      </h1>
      <p className="max-w-md text-sm text-muted">
        You don&apos;t have permission to view this page. This area is
        restricted to club staff.
      </p>
      <Link href="/" className="btn-primary">
        Back to Home
      </Link>
    </div>
  );
}
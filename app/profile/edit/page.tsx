import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/Navbar";
import ProfileEditForm from "@/app/components/ProfileEditForm";
import { getMyProfile } from "@/app/lib/queries/profile";
import { redirect } from "next/navigation";


export default async function EditProfilePage() {
  const player = await getMyProfile();

  if (player.membership_status === "suspended") {
    redirect("/?suspended=1");
  }

  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="section-divider" />
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide sm:text-2xl">
          Edit Profile
        </h1>
        <p className="mt-1 text-sm text-muted">
          Update your real-life and gaming information.
        </p>

        <ProfileEditForm player={player} />
      </section>
      <Footer />
    </main>
  );
}
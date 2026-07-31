"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Gamepad, Laptop, Smartphone } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import FillButton from "@/app/components/FillButton";
import ImageUploadInput from "@/app/components/ImageUploadInput";
import SelectField from "@/app/components/SelectField";
import { COUNTRIES, getCitiesForCountry } from "@/app/lib/data/countries";
import { FOOTBALL_CLUBS, NATIONAL_TEAMS } from "@/app/lib/data/clubs";
import { useAccountStatus } from "@/app/providers/AccountStatusProvider";
import { useToast } from "@/app/providers/ToastProvider";

const PLATFORMS = [
  { value: "mobile", label: "Mobile" },
  { value: "pc", label: "PC" },
  { value: "console", label: "Console" },
];

type PlayerDetails = {
  id: string;
  profile_id?: string | null;
  efootball_username: string;
  real_name: string | null;
  age: number | null;
  country: string | null;
  city: string | null;
  supported_club: string | null;
  national_team: string | null;
  favorite_player: string | null;
  education: string | null;
  profession: string | null;
  platform: string | null;
  avatar_url: string | null;
};

export default function ProfileEditForm({ player }: { player: PlayerDetails }) {
  const supabase = createClient();
  const router = useRouter();
  const { isSuspended } = useAccountStatus();
  const { addToast } = useToast();

  const [form, setForm] = useState({
    username: player.efootball_username ?? "",
    real_name: player.real_name ?? "",
    age: player.age?.toString() ?? "",
    country: player.country ?? "",
    city: player.city ?? "",
    supported_club: player.supported_club ?? "",
    national_team: player.national_team ?? "",
    favorite_player: player.favorite_player ?? "",
    education: player.education ?? "",
    profession: player.profession ?? "",
    platform: player.platform ?? "",
  });
  const [avatarUrl, setAvatarUrl] = useState(player.avatar_url ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleCountryChange(val: string) {
    update("country", val);
    update("city", ""); // reset city when country changes
  }

  const cityOptions = getCitiesForCountry(form.country);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSuspended) {
      addToast("Your account has been suspended. You cannot update your profile.", "error");
      return;
    }
    setError(null);

    if (!form.username.trim() || !form.age.trim() || !form.country.trim() || !form.city.trim()) {
      setError("Username, Age, Country, and City are required.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setLoading(false);
      setError("Please log in again to update your profile.");
      return;
    }

    const payload = {
      efootball_username: form.username.trim(),
      real_name: form.real_name || null,
      age: form.age ? Number(form.age) : null,
      country: form.country || null,
      city: form.city || null,
      supported_club: form.supported_club || null,
      national_team: form.national_team || null,
      favorite_player: form.favorite_player || null,
      education: form.education || null,
      profession: form.profession || null,
      platform: form.platform || null,
      avatar_url: avatarUrl || null,
    };

    // Update auth user_metadata (keeps metadata in sync)
    const { error: updateUserError } = await supabase.auth.updateUser({
      data: payload,
    });

    if (updateUserError) {
      setLoading(false);
      setError(updateUserError.message);
      return;
    }

    // Upsert into player_details so the profile page always reads fresh data
    const { error: upsertError } = await supabase
      .from("player_details")
      .upsert(
        { ...payload, profile_id: user.id },
        { onConflict: "profile_id" }
      );

    setLoading(false);

    if (upsertError) {
      setError(upsertError.message);
      return;
    }

    router.push("/profile");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
      {/* Profile Picture */}
      <div>
        <p className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-gold">
          Profile Picture
        </p>
        <div className="flex justify-center">
          <ImageUploadInput
            label="Profile Picture (optional)"
            folder="/falcon-warriors/avatars"
            value={avatarUrl}
            onUploaded={setAvatarUrl}
          />
        </div>
      </div>

      {/* Real-Life Info */}
      <div>
        <p className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-gold">
          Personal Info
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Username"
            value={form.username}
            onChange={(v) => update("username", v)}
            placeholder="StrikerPro99"
            hint="Your eFootball username."
            required
          />
          <Field
            label="Real Name"
            value={form.real_name}
            onChange={(v) => update("real_name", v)}
            placeholder="John Doe"
            hint="Please enter the name shown on your Facebook profile."
          />
          <Field
            label="Age"
            value={form.age}
            onChange={(v) => update("age", v)}
            type="number"
            placeholder="22"
            required
          />
          <Field
            label="Favorite Player"
            value={form.favorite_player}
            onChange={(v) => update("favorite_player", v)}
            placeholder="Messi, Ronaldo..."
          />
          <Field
            label="Profession"
            value={form.profession}
            onChange={(v) => update("profession", v)}
            placeholder="Student, Engineer..."
          />
          <Field
            label="Education"
            value={form.education}
            onChange={(v) => update("education", v)}
            placeholder="BSc Computer Science..."
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <p className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-gold">
          Location
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Country *"
            value={form.country}
            onChange={handleCountryChange}
            options={COUNTRIES}
            placeholder="Select your country"
            searchable
            className="w-full"
          />
          <SelectField
            label="City *"
            value={form.city}
            onChange={(v) => update("city", v)}
            options={
              cityOptions.length > 0
                ? cityOptions
                : form.country
                  ? [{ value: form.city || "Other", label: form.city || "Other" }]
                  : []
            }
            placeholder={form.country ? "Select your city" : "Select country first"}
            className="w-full"
          />
        </div>
      </div>

      {/* Football Info */}
      <div>
        <p className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-gold">
          Football
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Supported Club"
            value={form.supported_club}
            onChange={(v) => update("supported_club", v)}
            options={FOOTBALL_CLUBS}
            placeholder="Select your club"
            searchable
            className="w-full"
          />
          <SelectField
            label="National Team"
            value={form.national_team}
            onChange={(v) => update("national_team", v)}
            options={NATIONAL_TEAMS}
            placeholder="Select national team"
            searchable
            className="w-full"
          />
        </div>
      </div>

      {/* Gaming Info */}
      <div>
        <p className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-gold">
          Gaming
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Platform"
            value={form.platform}
            onChange={(v) => update("platform", v)}
            options={PLATFORMS}
            placeholder="Select platform"
            className="w-full sm:col-span-2"
          />
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <FillButton
        type="submit"
        disabled={loading}
        className="w-full disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Changes"}
      </FillButton>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  hint,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-white/30 hover:border-border/80"
      />
      {hint && <p className="mt-1 text-[11px] text-amber-300/80">{hint}</p>}
    </div>
  );
}
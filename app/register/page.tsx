"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FillButton from "@/app/components/FillButton";
import Link from "next/link";
import { createClient } from "../lib/supabase/client";
import ImageUploadInput from "../components/ImageUploadInput";
import SearchableSelect from "../components/SearchableSelect";
import { COUNTRIES, getCitiesForCountry } from "../lib/data/countries";
import { FOOTBALL_CLUBS, NATIONAL_TEAMS } from "../lib/data/clubs";

const POSITIONS = [
  { value: "GK", label: "🧤 GK — Goalkeeper" },
  { value: "CB", label: "🛡️ CB — Centre Back" },
  { value: "LB", label: "LB — Left Back" },
  { value: "RB", label: "RB — Right Back" },
  { value: "DMF", label: "🔒 DMF — Defensive Midfielder" },
  { value: "CMF", label: "⚙️ CMF — Centre Midfielder" },
  { value: "LMF", label: "LMF — Left Midfielder" },
  { value: "RMF", label: "RMF — Right Midfielder" },
  { value: "AMF", label: "🎯 AMF — Attacking Midfielder" },
  { value: "LW", label: "LW — Left Winger" },
  { value: "RW", label: "RW — Right Winger" },
  { value: "SS", label: "SS — Second Striker" },
  { value: "CF", label: "CF — Centre Forward" },
  { value: "ST", label: "⚡ ST — Striker" },
];

const PLATFORMS = [
  { value: "mobile", label: "📱 Mobile" },
  { value: "pc", label: "💻 PC" },
  { value: "console", label: "🎮 Console" },
];

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [realName, setRealName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [club, setClub] = useState("");
  const [team, setTeam] = useState("");
  const [platform, setPlatform] = useState("");
  const [position, setPosition] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  // When country changes, reset city
  function handleCountryChange(val: string) {
    setCountry(val);
    setCity("");
  }

  const cityOptions = getCitiesForCountry(country);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          efootball_username: username,
          real_name: realName,
          country,
          city,
          supported_club: club,
          national_team: team,
          platform,
          preferred_position: position,
          avatar_url: avatarUrl,
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      const message = signUpError.status === 429
        ? "Too many signup attempts. Please wait a few minutes and try again with a different email if needed."
        : signUpError.message;
      setError(message);
      return;
    }

    if (!data.user) {
      setError("Registration was created but no user was returned. Please try again.");
      return;
    }

    setSubmittedEmail(email);
    setNeedsConfirmation(true);
  }

  return (
    <main>
      <section className="mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-gold sm:text-3xl">
          Join the Club
        </h1>
        <p className="mt-2 text-sm text-muted">
          Create your account and set up your player profile in one step.
        </p>

        {needsConfirmation ? (
          <div className="mt-8 rounded-xl border border-gold/30 bg-surface px-6 py-8 text-center">
            <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-gold">
              Check your email
            </h2>
            <p className="mt-3 text-sm text-muted">
              We sent a confirmation link to <span className="font-semibold text-white">{submittedEmail}</span>.
            </p>
            <p className="mt-2 text-sm text-muted">
              Please open your inbox and confirm your email before signing in.
            </p>
            <FillButton href="/login" className="mt-6 inline-flex">
              Go to Login
            </FillButton>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">

            {/* ── Account Credentials ── */}
            <div>
              <p className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-gold">
                Account
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">
                    eFootball Username <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-gold"
                    placeholder="StrikerPro99"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">
                    Real Name
                  </label>
                  <input
                    type="text"
                    value={realName}
                    onChange={(e) => setRealName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-gold"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-gold"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-gold"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* ── Location ── */}
            <div>
              <p className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-gold">
                Location
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <SearchableSelect
                  label="Country"
                  value={country}
                  onChange={handleCountryChange}
                  options={COUNTRIES}
                  placeholder="Select your country"
                />

                <SearchableSelect
                  label="City"
                  value={city}
                  onChange={setCity}
                  options={
                    cityOptions.length > 0
                      ? cityOptions
                      : country
                        ? [{ value: city || "Other", label: city || "Other" }]
                        : []
                  }
                  placeholder={country ? "Select your city" : "Select country first"}
                />
              </div>
            </div>

            {/* ── Football Info ── */}
            <div>
              <p className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-gold">
                Football
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <SearchableSelect
                  label="Supported Club"
                  value={club}
                  onChange={setClub}
                  options={FOOTBALL_CLUBS}
                  placeholder="Select your club"
                />

                <SearchableSelect
                  label="National Team"
                  value={team}
                  onChange={setTeam}
                  options={NATIONAL_TEAMS}
                  placeholder="Select national team"
                />
              </div>
            </div>

            {/* ── Gaming Info ── */}
            <div>
              <p className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-gold">
                Gaming
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <SearchableSelect
                  label="Platform"
                  value={platform}
                  onChange={setPlatform}
                  options={PLATFORMS}
                  placeholder="Select platform"
                />

                <SearchableSelect
                  label="Preferred Position"
                  value={position}
                  onChange={setPosition}
                  options={POSITIONS}
                  placeholder="Select position"
                />
              </div>
            </div>

            {/* ── Profile Picture ── */}
            <div className="rounded-xl border border-border bg-surface-2 p-4">
              <ImageUploadInput
                label="Profile Picture (optional)"
                folder="/falcon-warriors/avatars"
                value={avatarUrl}
                onUploaded={setAvatarUrl}
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-2 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        )}

        {!needsConfirmation && (
          <p className="mt-6 text-center text-sm text-muted">
            Already a member?{" "}
            <Link href="/login" className="text-gold hover:text-gold-light">
              Login
            </Link>
          </p>
        )}
      </section>
    </main>
  );
}
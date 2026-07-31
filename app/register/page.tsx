"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import FillButton from "@/app/components/FillButton";
import Link from "next/link";
import { createClient } from "../lib/supabase/client";
import ImageUploadInput from "../components/ImageUploadInput";
import SelectField from "@/app/components/SelectField";
import { COUNTRIES, getCitiesForCountry } from "../lib/data/countries";
import { FOOTBALL_CLUBS, NATIONAL_TEAMS } from "../lib/data/clubs";

const PLATFORMS = [
  { value: "mobile", label: "Mobile" },
  { value: "pc", label: "PC" },
  { value: "console", label: "Console" },
];

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.2 5.1 29.4 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.9z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.8 1.1 8 3l6-6C34.2 5.1 29.4 3 24 3c-7.5 0-14 4.2-17.7 10.7z" />
      <path fill="#4CAF50" d="M24 45c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.3 36 26.8 37 24 37c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.9 40.6 16.4 45 24 45z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.7l6.3 5.3C39.9 37.4 43 31.3 43 24c0-1.4-.1-2.7-.4-3.9z" />
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [mode, setMode] = useState<"form" | "completeProfile">("form");
  const [googleUserId, setGoogleUserId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (!session) {
        setCheckingAuth(false);
        return;
      }

      // Already signed in (e.g. came back from Google) — check if profile is complete
      const { data: existing } = await supabase
        .from("player_details")
        .select("id")
        .eq("profile_id", session.user.id)
        .maybeSingle();

      if (existing) {
        router.replace("/");
        return;
      }

      // Signed in via Google but hasn't finished the profile form yet
      const user = session.user;
      const meta = (user.user_metadata ?? {}) as Record<string, any>;
      setGoogleUserId(user.id);
      setEmail(user.email ?? "");
      setRealName(meta.full_name || meta.name || "");
      setUsername(meta.full_name?.split(" ")[0] || meta.name?.split(" ")[0] || "");
      setAvatarUrl(meta.avatar_url || meta.picture || "");
      setMode("completeProfile");
      setCheckingAuth(false);
    }
    init();
  }, [router, supabase]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [realName, setRealName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [club, setClub] = useState("");
  const [team, setTeam] = useState("");
  const [platform, setPlatform] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  function handleCountryChange(val: string) {
    setCountry(val);
    setCity("");
  }

  const cityOptions = getCitiesForCountry(country);

  async function handleGoogleSignIn() {
    setError(null);
    setGoogleLoading(true);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/register`,
      },
    });
    if (oauthError) {
      setError(oauthError.message);
      setGoogleLoading(false);
    }
    // On success the browser redirects away, so no further state change needed here.
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // ── Path 1: finishing registration after Google sign-in ──
    if (mode === "completeProfile" && googleUserId) {
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          efootball_username: username,
          real_name: realName,
          country,
          city,
          supported_club: club,
          national_team: team,
          platform,
          avatar_url: avatarUrl,
        },
      });

      if (updateError) {
        setLoading(false);
        setError(updateError.message);
        return;
      }

      const { error: insertError } = await supabase.from("player_details").insert({
        profile_id: googleUserId,
        efootball_username: username,
        real_name: realName || null,
        country: country || null,
        city: city || null,
        supported_club: club || null,
        national_team: team || null,
        platform: platform || null,
        avatar_url: avatarUrl || null,
      });

      setLoading(false);

      if (insertError) {
        setError(insertError.message);
        return;
      }

      router.replace("/");
      router.refresh();
      return;
    }

    // ── Path 2: normal email/password registration ──
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "https://falcon-warriors.vercel.app/",
        data: {
          efootball_username: username,
          real_name: realName,
          country,
          city,
          supported_club: club,
          national_team: team,
          platform,
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

    // Email confirmation is disabled in this project, so signUp already
    // returns an active session — log the user straight in.
    if (data.session) {
      router.replace("/");
      router.refresh();
      return;
    }

    // Fallback: only reached if confirmations get re-enabled later.
    setSubmittedEmail(email);
    setNeedsConfirmation(true);
  }

  if (checkingAuth) {
    return null;
  }

  const isCompletingGoogleProfile = mode === "completeProfile";

  return (
    <main>
      <section className="mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-3 text-sm font-semibold text-white transition hover:text-gold">
            <img src="/logo.jpg" alt="Falcon Warriors" className="h-8 w-8 rounded-full object-cover" />
            Falcon Warriors
          </Link>
        </div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-gold sm:text-3xl">
          Join the Club
        </h1>
        <p className="mt-2 text-sm text-muted">
          {isCompletingGoogleProfile
            ? "You're signed in with Google — just finish setting up your player profile."
            : "Create your account and set up your player profile in one step."}
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
          <>
            {!isCompletingGoogleProfile && (
              <div className="mt-8">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-white transition hover:border-white/30 disabled:opacity-50"
                >
                  <GoogleIcon />
                  {googleLoading ? "Redirecting to Google..." : "Continue with Google"}
                </button>

                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs uppercase tracking-widest text-muted">or</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
              </div>
            )}

            <div className={`flex justify-center ${isCompletingGoogleProfile ? "mt-8" : ""}`}>
              <ImageUploadInput
                key={avatarUrl || "empty"}
                label="Profile Picture (optional)"
                folder="/falcon-warriors/avatars"
                value={avatarUrl}
                onUploaded={setAvatarUrl}
              />
            </div>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">

            {/* ── Account Credentials ── */}
            <div>
              <p className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-gold">
                Account
              </p>
              <div className="grid gap-4 md:grid-cols-2">
               <div>
                  <label className="mb-1 block text-xs font-medium text-muted">
                    Username <span className="normal-case text-gold/70">(eFootball username)</span>{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-white/30 hover:border-border/80"
                    placeholder="StrikerPro99"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">
                    Real Name <span className="normal-case text-gold/70">(Facebook profile name)</span>
                  </label>
                  <input
                    type="text"
                    value={realName}
                    onChange={(e) => setRealName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-white/30 hover:border-border/80"
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
                    readOnly={isCompletingGoogleProfile}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-white/30 hover:border-border/80 read-only:opacity-60"
                    placeholder="you@example.com"
                  />
                  {isCompletingGoogleProfile && (
                    <p className="mt-1 text-xs text-muted">Verified via Google</p>
                  )}
                </div>

                {!isCompletingGoogleProfile && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted">
                      Password <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 pr-10 text-sm outline-none transition-colors focus:border-white/30 hover:border-border/80"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-white"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Location ── */}
            <div>
              <p className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-gold">
                Location
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="Country"
                  value={country}
                  onChange={handleCountryChange}
                  options={COUNTRIES}
                  placeholder="Select your country"
                  searchable
                  className="w-full"
                />

                <SelectField
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
                  className="w-full"
                />
              </div>
            </div>

            {/* ── Football Info ── */}
            <div>
              <p className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-gold">
                Football
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="Supported Club"
                  value={club}
                  onChange={setClub}
                  options={FOOTBALL_CLUBS}
                  placeholder="Select your club"
                  searchable
                  className="w-full"
                />

                <SelectField
                  label="National Team"
                  value={team}
                  onChange={setTeam}
                  options={NATIONAL_TEAMS}
                  placeholder="Select national team"
                  searchable
                  className="w-full"
                />
              </div>
            </div>

            {/* ── Gaming Info ── */}
            <div>
              <p className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-gold">
                Gaming
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="Platform"
                  value={platform}
                  onChange={setPlatform}
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
              className="mt-2 w-full disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
            </FillButton>
          </form>
        </>
        )}

        {!needsConfirmation && !isCompletingGoogleProfile && (
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
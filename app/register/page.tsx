"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import FillButton from "@/app/components/FillButton";
import { getSiteSettings } from "@/app/lib/queries/siteSettings";
import { createClient } from "../lib/supabase/client";
import ImageUploadInput from "../components/ImageUploadInput";
import SelectField from "@/app/components/SelectField";
import {
  COUNTRIES,
  getCitiesForCountry,
} from "../lib/data/countries";

const PLATFORMS = [
  { value: "mobile", label: "Mobile" },
  { value: "pc", label: "PC" },
  { value: "console", label: "Console" },
];

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.1H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.2 5.1 29.4 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.9z"
      />

      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.8 1.1 8 3l6-6C34.2 5.1 29.4 3 24 3c-7.5 0-14 4.2-17.7 10.7z"
      />

      <path
        fill="#4CAF50"
        d="M24 45c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.3 36 26.8 37 24 37c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.9 40.6 16.4 45 24 45z"
      />

      <path
        fill="#1976D2"
        d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.7l6.3 5.3C39.9 37 43 31.3 43 24c0-1.4-.1-2.7-.4-3.9z"
      />
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const supabase = createClient();

  const [logoUrl, setLogoUrl] = useState("/logo.jpg");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [username, setUsername] = useState("");
  const [realName, setRealName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [platform, setPlatform] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [checkingAuth, setCheckingAuth] = useState(true);

  const [mode, setMode] = useState<
    "form" | "completeProfile"
  >("form");

  const [googleUserId, setGoogleUserId] = useState<string | null>(
    null
  );

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [needsConfirmation, setNeedsConfirmation] =
    useState(false);

  const [submittedEmail, setSubmittedEmail] = useState("");

  useEffect(() => {
    getSiteSettings().then((s) => setLogoUrl(s.logoUrl));
  }, []);

  /*
   * Detect an existing Supabase session.
   *
   * This is especially important after Google OAuth.
   */
  useEffect(() => {
    async function init() {
      setCheckingAuth(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      /*
       * No authenticated user.
       *
       * Show normal registration form.
       */
      if (!session) {
        setCheckingAuth(false);
        return;
      }

      const user = session.user;

      /*
       * Check whether this user already has a Falcon Warriors
       * player profile.
       */
      const { data: existing, error: existingError } =
        await supabase
          .from("player_details")
          .select("id, membership_status")
          .eq("profile_id", user.id)
          .maybeSingle();

      if (existingError) {
        console.error(
          "Profile lookup failed:",
          existingError
        );

        setError(
          "We could not check your player profile. Please try again."
        );

        setCheckingAuth(false);
        return;
      }

      /*
       * Existing player.
       *
       * They do NOT need to register again.
       */
      if (existing) {
        router.replace("/");
        return;
      }

      /*
       * Authenticated user without player_details.
       *
       * This is the Google "Finish Setup" flow.
       */
      const meta =
        (user.user_metadata ?? {}) as Record<
          string,
          string | undefined
        >;

      const fullName =
        meta.full_name ||
        meta.name ||
        "";

      const firstName =
        fullName.trim().split(/\s+/)[0] || "";

      setGoogleUserId(user.id);

      setEmail(user.email ?? "");

      setRealName(fullName);

      /*
       * We only use Google's name as a suggestion.
       *
       * The user can edit it.
       */
      setUsername(
        meta.efootball_username ||
          firstName
      );

      setAvatarUrl(
        meta.avatar_url ||
          meta.picture ||
          ""
      );

      setMode("completeProfile");

      setCheckingAuth(false);
    }

    init();
  }, [router, supabase]);

  function handleCountryChange(val: string) {
    setCountry(val);
    setCity("");
  }

  const cityOptions = getCitiesForCountry(country);

  /*
   * Normal Register page Google login.
   */
  async function handleGoogleSignIn() {
    setError(null);
    setGoogleLoading(true);

    const { error: oauthError } =
      await supabase.auth.signInWithOAuth({
        provider: "google",

        options: {
          /*
           * Both login and register Google buttons now
           * go through the same callback.
           */
          redirectTo: `${window.location.origin}/auth/callback?next=/`,
        },
      });

    if (oauthError) {
      setGoogleLoading(false);
      setError(oauthError.message);
    }
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError(null);
    setLoading(true);

    /*
     * ============================================
     * PATH 1
     *
     * Google user finishing their profile.
     * ============================================
     */
    if (
      mode === "completeProfile" &&
      googleUserId
    ) {
      /*
       * Validate required profile fields.
       */
      if (!username.trim()) {
        setLoading(false);
        setError(
          "Please enter your eFootball username."
        );
        return;
      }

      if (!country) {
        setLoading(false);
        setError(
          "Please select your country."
        );
        return;
      }

      if (!city) {
        setLoading(false);
        setError(
          "Please select your city."
        );
        return;
      }

      if (!platform) {
        setLoading(false);
        setError(
          "Please select your primary platform."
        );
        return;
      }

      /*
       * Update Supabase Auth metadata.
       */
      const { error: updateError } =
        await supabase.auth.updateUser({
          data: {
            efootball_username:
              username.trim(),

            real_name:
              realName.trim(),

            country,

            city,

            platform,

            avatar_url:
              avatarUrl || null,
          },
        });

      if (updateError) {
        setLoading(false);
        setError(updateError.message);
        return;
      }

      /*
       * Create player_details record.
       *
       * profile_id = Supabase Auth user ID.
       */
      const { error: insertError } =
        await supabase
          .from("player_details")
          .insert({
            profile_id: googleUserId,

            efootball_username:
              username.trim(),

            real_name:
              realName.trim() || null,

            country:
              country || null,

            city:
              city || null,

            platform:
              platform || null,

            avatar_url:
              avatarUrl || null,
          });

      setLoading(false);

      if (insertError) {
        console.error(
          "Profile creation error:",
          insertError
        );

        setError(
          insertError.message
        );

        return;
      }

      /*
       * Profile completed successfully.
       */
      router.replace("/");
      router.refresh();

      return;
    }

    /*
     * ============================================
     * PATH 2
     *
     * Normal email/password registration.
     * ============================================
     */

    if (!username.trim()) {
      setLoading(false);
      setError(
        "Please enter your eFootball username."
      );
      return;
    }

    if (!country) {
      setLoading(false);
      setError(
        "Please select your country."
      );
      return;
    }

    if (!city) {
      setLoading(false);
      setError(
        "Please select your city."
      );
      return;
    }

    if (!platform) {
      setLoading(false);
      setError(
        "Please select your primary platform."
      );
      return;
    }

    const {
      data,
      error: signUpError,
    } =
      await supabase.auth.signUp({
        email,
        password,

        options: {
          emailRedirectTo:
            "https://falcon-warriors.vercel.app/",

          data: {
            efootball_username:
              username.trim(),

            real_name:
              realName.trim(),

            country,

            city,

            platform,

            avatar_url:
              avatarUrl || null,
          },
        },
      });

    setLoading(false);

    if (signUpError) {
      const message =
        signUpError.status === 429
          ? "Too many signup attempts. Please wait a few minutes and try again with a different email if needed."
          : signUpError.message;

      setError(message);

      return;
    }

    if (!data.user) {
      setError(
        "Registration was created but no user was returned. Please try again."
      );

      return;
    }

    /*
     * Email confirmation disabled.
     */
    if (data.session) {
      router.replace("/");
      router.refresh();

      return;
    }

    /*
     * Fallback if email confirmation is enabled later.
     */
    setSubmittedEmail(email);
    setNeedsConfirmation(true);
  }

  if (checkingAuth) {
    return null;
  }

  const isCompletingGoogleProfile =
    mode === "completeProfile";

  return (
    <main className="min-h-screen bg-background">
      <section className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">

        {/* ── Left: Stadium visual panel ── */}
        <div className="relative hidden overflow-hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-between lg:p-10">

          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('/stadium-bg.png')",
            }}
            aria-hidden="true"
          />

          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,12,0.85)_0%,rgba(10,10,12,0.55)_45%,rgba(10,10,12,0.92)_100%)]"
            aria-hidden="true"
          />

          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.14),_transparent_45%)]"
            aria-hidden="true"
          />

          <Link
            href="/"
            className="relative z-10 inline-flex w-fit items-center gap-3 text-sm font-semibold text-white transition hover:text-gold"
          >
            <img
              src={logoUrl}
              alt="Falcon Warriors"
              className="h-9 w-9 rounded-full object-cover ring-2 ring-gold/30"
            />

            <span className="font-display uppercase tracking-[0.14em]">
              Falcon Warriors
            </span>
          </Link>

          <div className="relative z-10 max-w-md">
            <h1 className="font-display text-4xl font-bold uppercase leading-tight tracking-[0.06em] text-white sm:text-5xl">
              Join the{" "}
              <span className="text-gold">
                squad.
              </span>
            </h1>

            <p className="mt-4 max-w-sm text-sm leading-6 text-muted">
              Register to access the tactical command center. Manage your roster, analyze stats, and dominate the league.
            </p>
          </div>

          <p className="relative z-10 text-xs text-muted">
            © {new Date().getFullYear()} Falcon Warriors. All rights reserved.
          </p>
        </div>

        {/* ── Right: Registration form ── */}
        <div className="flex justify-center bg-background px-5 py-10 sm:px-8">
          <div className="w-full max-w-sm">

            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <img
                src={logoUrl}
                alt="Falcon Warriors"
                className="h-10 w-10 rounded-full object-cover ring-2 ring-gold/30"
              />

              <span className="font-display text-sm font-bold uppercase tracking-[0.14em] text-white">
                Falcon Warriors
              </span>
            </div>

            <h2 className="font-display text-2xl font-bold uppercase tracking-[0.1em] text-white sm:text-3xl">
              {isCompletingGoogleProfile
                ? "Finish Setup"
                : "Create Account"}
            </h2>

            <p className="mt-2 text-sm text-muted">
              {isCompletingGoogleProfile
                ? "You're signed in with Google — just finish setting up your player profile."
                : "Create your account and set up your player profile in one step."}
            </p>

            {needsConfirmation ? (
              <div className="mt-8 rounded-xl border border-gold/30 bg-surface px-6 py-8 text-center">

                <h3 className="font-display text-xl font-bold uppercase tracking-wide text-gold">
                  Check your email
                </h3>

                <p className="mt-3 text-sm text-muted">
                  We sent a confirmation link to{" "}
                  <span className="font-semibold text-white">
                    {submittedEmail}
                  </span>
                  .
                </p>

                <p className="mt-2 text-sm text-muted">
                  Please open your inbox and confirm your email before signing in.
                </p>

                <FillButton
                  href="/login"
                  className="mt-6 inline-flex"
                >
                  Go to Login
                </FillButton>
              </div>
            ) : (
              <>
                {!isCompletingGoogleProfile && (
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading}
                    className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium text-white transition hover:border-gold/40 hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-gold/20 disabled:opacity-50"
                  >
                    <GoogleIcon />

                    {googleLoading
                      ? "Redirecting to Google..."
                      : "Continue with Google"}
                  </button>
                )}

                {!isCompletingGoogleProfile && (
                  <div className="my-7 flex items-center gap-4">
                    <div className="h-px flex-1 bg-border" />

                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
                      or fill in manually
                    </span>

                    <div className="h-px flex-1 bg-border" />
                  </div>
                )}

                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-5"
                >

                  {/* Avatar */}
                  <div
                    className={`flex justify-center ${
                      isCompletingGoogleProfile
                        ? "mt-2"
                        : ""
                    }`}
                  >
                    <ImageUploadInput
                      key={
                        avatarUrl ||
                        "empty"
                      }
                      folder="/falcon-warriors/avatars"
                      value={avatarUrl}
                      onUploaded={setAvatarUrl}
                      circular
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                      Username{" "}
                      <span className="normal-case text-gold/70">
                        (eFootball username)
                      </span>{" "}
                      <span className="text-red-400">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <User
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                      />

                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) =>
                          setUsername(
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-muted/70 hover:border-border/80 focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
                        placeholder="Enter GamerTag"
                      />
                    </div>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                      Full Name
                    </label>

                    <div className="relative">
                      <User
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                      />

                      <input
                        type="text"
                        value={realName}
                        onChange={(e) =>
                          setRealName(
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-muted/70 hover:border-border/80 focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
                        placeholder="Legal Name"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                      Email Address{" "}
                      <span className="text-red-400">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <Mail
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                      />

                      <input
                        type="email"
                        required
                        readOnly={
                          isCompletingGoogleProfile
                        }
                        value={email}
                        onChange={(e) =>
                          setEmail(
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-muted/70 hover:border-border/80 focus:border-gold/60 focus:ring-2 focus:ring-gold/20 read-only:opacity-60"
                        placeholder="agent@falcon.com"
                      />
                    </div>

                    {isCompletingGoogleProfile && (
                      <p className="mt-1 text-xs text-muted">
                        Verified via Google
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  {!isCompletingGoogleProfile && (
                    <div>
                      <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                        Password{" "}
                        <span className="text-red-400">
                          *
                        </span>
                      </label>

                      <div className="relative">
                        <Lock
                          size={16}
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                        />

                        <input
                          type={
                            showPassword
                              ? "text"
                              : "password"
                          }
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) =>
                            setPassword(
                              e.target.value
                            )
                          }
                          className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-11 text-sm text-white outline-none transition-all duration-200 placeholder:text-muted/70 hover:border-border/80 focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
                          placeholder="••••••••"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(
                              (prev) =>
                                !prev
                            )
                          }
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted transition hover:text-white"
                          aria-label={
                            showPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Country + City */}
                  <div className="grid grid-cols-2 gap-3">

                    <SelectField
                      label="Country"
                      value={country}
                      onChange={
                        handleCountryChange
                      }
                      options={COUNTRIES}
                      placeholder="Select"
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
                            ? [
                                {
                                  value:
                                    city ||
                                    "Other",
                                  label:
                                    city ||
                                    "Other",
                                },
                              ]
                            : []
                      }
                      placeholder={
                        country
                          ? "Select"
                          : "Country first"
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Platform */}
                  <SelectField
                    label="Primary Platform"
                    value={platform}
                    onChange={setPlatform}
                    options={PLATFORMS}
                    placeholder="Select Platform"
                    className="w-full"
                  />

                  {error && (
                    <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3.5 text-sm font-bold uppercase tracking-[0.1em] text-black transition hover:bg-gold-light disabled:opacity-50"
                  >
                    {loading
                      ? "Saving..."
                      : isCompletingGoogleProfile
                        ? "Complete Setup"
                        : "Join the Squad"}

                    {!loading && (
                      <ArrowRight size={16} />
                    )}
                  </button>
                </form>
              </>
            )}

            {!needsConfirmation &&
              !isCompletingGoogleProfile && (
                <p className="mt-6 text-center text-sm text-muted">
                  Already a member?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-gold transition hover:text-gold-light"
                  >
                    Login
                  </Link>
                </p>
              )}

          </div>
        </div>
      </section>
    </main>
  );
}
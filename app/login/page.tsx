"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSiteSettings } from "@/app/lib/queries/siteSettings";
import { createClient } from "../lib/supabase/client";
import { useToast } from "@/app/providers/ToastProvider";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [logoUrl, setLogoUrl] = useState("/logo.jpg");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const { addToast } = useToast();

  useEffect(() => {
    if (searchParams.get("error") === "pending_approval") {
      addToast(
        "Your account is pending admin approval. You'll be able to log in once it's approved.",
        "error",
        9000
      );
    }
  }, [searchParams, addToast]);

  useEffect(() => {
    getSiteSettings().then((s) => setLogoUrl(s.logoUrl));
  }, []);

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        router.replace("/");
      } else {
        setCheckingAuth(false);
      }
    }

    checkSession();
  }, [router, supabase]);

  async function handleGoogleSignIn() {
    setError(null);
    setGoogleLoading(true);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        /*
         * IMPORTANT:
         * Do NOT send Google login directly to /register.
         *
         * The callback route will check whether the user already
         * has a player_details record.
         */
        redirectTo: `${window.location.origin}/auth/callback?next=/`,
      },
    });

    if (oauthError) {
      setGoogleLoading(false);
      setError(oauthError.message);
      addToast(oauthError.message, "error");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      addToast(signInError.message, "error");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: player } = await supabase
        .from("player_details")
        .select("membership_status")
        .eq("profile_id", user.id)
        .maybeSingle();

      if (player?.membership_status === "pending") {
        await supabase.auth.signOut();

        setError("Your account is still pending admin approval.");
        addToast(
          "Your account is pending admin approval. You'll be able to log in once it's approved.",
          "error",
          9000
        );

        return;
      }

      if (player?.membership_status === "suspended") {
        addToast(
          "Your account has been suspended. You can log in to view the notice, but actions are disabled.",
          "error",
          9000
        );

        router.push("/");
        router.refresh();
        return;
      }
    }

    addToast("Logged in successfully.", "success");

    router.push("/");
    router.refresh();
  }

  if (checkingAuth) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background">
      <section className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">

        {/* ── Left: Stadium visual panel ── */}
        <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-10">

          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/stadium-bg.png')" }}
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
              Command the <span className="text-gold">pitch.</span>
            </h1>

            <p className="mt-4 max-w-sm text-sm leading-6 text-muted">
              Elite eFootball club management for the next generation of champions.
            </p>
          </div>

          <p className="relative z-10 text-xs text-muted">
            © {new Date().getFullYear()} Falcon Warriors. All rights reserved.
          </p>
        </div>

        {/* ── Right: Login form ── */}
        <div className="flex items-center justify-center bg-background px-5 py-10 sm:px-8">
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
              Login to FW
            </h2>

            <p className="mt-2 text-sm text-muted">
              Enter your credentials to access the command center.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">

              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                  />

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-muted/70 hover:border-border/80 focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
                    placeholder="manager@falconwarriors.gg"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                  Password
                </label>

                <div className="relative">
                  <Lock
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-11 text-sm text-white outline-none transition-all duration-200 placeholder:text-muted/70 hover:border-border/80 focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
                    placeholder="••••••••"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted transition hover:text-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

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
                {loading ? "Logging in..." : "Enter the Arena"}

                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />

              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
                or connect via
              </span>

              <div className="h-px flex-1 bg-border" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium text-white transition hover:border-gold/40 hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-gold/20 disabled:opacity-50"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
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
                  d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.7l6.3 5.3C39.9 37.4 43 31.3 43 24c0-1.4-.1-2.7-.4-3.9z"
                />
              </svg>

              {googleLoading
                ? "Redirecting to Google..."
                : "Continue with Google"}
            </button>

            <p className="mt-6 text-center text-sm text-muted">
              Not a member yet?{" "}
              <Link
                href="/register"
                className="font-medium text-gold transition hover:text-gold-light"
              >
                Register
              </Link>
            </p>

          </div>
        </div>
      </section>
    </main>
  );
}
"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSiteSettings } from "@/app/lib/queries/siteSettings";
import { createClient } from "../lib/supabase/client";
import { useToast } from "@/app/providers/ToastProvider";
import FillButton from "@/app/components/FillButton";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [logoUrl, setLogoUrl] = useState("/logo.jpg");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    getSiteSettings().then((s) => setLogoUrl(s.logoUrl));
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/");
      } else {
        setCheckingAuth(false);
      }
    });
  }, [router, supabase]);

  const { addToast } = useToast();

async function handleGoogleSignIn() {
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/register`,
      },
    });
    if (oauthError) {
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
    <main>
      <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-3 text-sm font-semibold text-white transition hover:text-gold">
            <img src={logoUrl} alt="Falcon Warriors" className="h-8 w-8 rounded-full object-cover" />
            Falcon Warriors
          </Link>
        </div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-gold sm:text-3xl">
          Welcome Back
        </h1>
        <p className="mt-2 text-sm text-muted">
          Login to your Falcon Warriors account.
        </p>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-white transition hover:border-white/30"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.2 5.1 29.4 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.9z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.8 1.1 8 3l6-6C34.2 5.1 29.4 3 24 3c-7.5 0-14 4.2-17.7 10.7z" />
            <path fill="#4CAF50" d="M24 45c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.3 36 26.8 37 24 37c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.9 40.6 16.4 45 24 45z" />
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.7l6.3 5.3C39.9 37.4 43 31.3 43 24c0-1.4-.1-2.7-.4-3.9z" />
          </svg>
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-widest text-muted">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-white/30 hover:border-border/80"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
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
            {loading ? "Logging in..." : "Login"}
          </FillButton>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Not a member yet?{" "}
          <Link href="/register" className="text-gold hover:text-gold-light">
            Register
          </Link>
        </p>
      </section>
    </main>
  );
}
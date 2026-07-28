"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../lib/supabase/client";
import { useToast } from "@/app/providers/ToastProvider";
import FillButton from "@/app/components/FillButton";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

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
            <img src="/logo.jpg" alt="Falcon Warriors" className="h-8 w-8 rounded-full object-cover" />
            Falcon Warriors
          </Link>
        </div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-gold sm:text-3xl">
          Welcome Back
        </h1>
        <p className="mt-2 text-sm text-muted">
          Login to your Falcon Warriors account.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
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
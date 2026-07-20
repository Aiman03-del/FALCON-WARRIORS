"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, Menu, X, UserCircle2 } from "lucide-react";
import FillButton from "./FillButton";
import SearchBar from "@/app/components/SearchBar";
import { createClient } from "../lib/supabase/client";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Players", href: "/players" },
  { label: "Matches", href: "/matches" },
  { label: "Tournaments", href: "/tournaments" },
  { label: "Achievements", href: "/achievements" },
  { label: "News", href: "/news" },
];

function isActiveNavLink(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

type ProfileInfo = {
  username: string;
  role: string;
};

export default function Navbar() {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-user-menu]")) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (isMounted) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      const [{ data: profileRow }, { data: playerRow }] = await Promise.all([
        supabase.from("profiles").select("role").eq("id", user.id).single(),
        supabase
          .from("player_details")
          .select("efootball_username")
          .eq("profile_id", user.id)
          .single(),
      ]);

      if (isMounted) {
        setProfile({
          username: playerRow?.efootball_username ?? "Player",
          role: profileRow?.role ?? "player",
        });
        setLoading(false);
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      isMounted = false;
      document.removeEventListener("mousedown", handleClickOutside);
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.jpg"
              alt="Falcon Warriors logo"
              width={36}
              height={36}
              className="rounded-full"
            />
            <span className="font-display text-lg font-bold tracking-wide text-gold">
              FALCON WARRIORS
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => {
              const active = isActiveNavLink(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition ${
                    active
                      ? "text-gold"
                      : "text-white/80 hover:text-gold"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:block lg:w-56">
            <SearchBar />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {loading ? (
              <div className="h-8 w-20 animate-pulse rounded-lg bg-surface" />
            ) : profile ? (
              <div className="relative hidden sm:block" data-user-menu>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((open) => !open)}
                  aria-label="Open user menu"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-white transition-colors hover:border-gold hover:text-gold"
                >
                  <UserCircle2 size={22} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-surface/95 p-2 shadow-lg">
                    <div className="mb-2 rounded-lg border border-border bg-bg/70 px-3 py-2">
                      <p className="text-sm font-semibold text-white">{profile.username}</p>
                    </div>

                    {(profile.role === "admin" || profile.role === "moderator") && (
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-surface-2 hover:text-gold"
                      >
                        <LayoutDashboard size={16} />
                        Dashboard
                      </Link>
                    )}

                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-surface-2 hover:text-gold"
                    >
                      <UserCircle2 size={16} />
                      Player Profile
                    </Link>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-white/80 hover:bg-surface-2 hover:text-gold"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden text-sm font-medium text-white/80 hover:text-gold sm:block"
                >
                  Login
                </Link>
                <FillButton href="/register" className="hidden px-4 py-2 text-sm sm:block">
                  Register
                </FillButton>
              </>
            )}

            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-white md:hidden"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="mt-3 rounded-xl border border-border bg-surface/95 p-3 md:hidden">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const active = isActiveNavLink(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-surface-2 text-gold"
                        : "text-white/80 hover:bg-surface-2 hover:text-gold"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-3 border-t border-border pt-3">
              {loading ? (
                <div className="h-8 w-full animate-pulse rounded-lg bg-surface-2" />
              ) : profile ? (
                <div className="flex flex-col gap-2">
                  {(profile.role === "admin" || profile.role === "moderator") && (
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-surface-2 hover:text-gold"
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>
                  )}

                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg border border-border bg-bg px-3 py-2 text-sm font-medium text-white"
                  >
                    <span>{profile.username}</span>
                  </Link>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-left text-sm font-medium text-white/80 hover:bg-surface-2"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-surface-2 hover:text-gold"
                  >
                    Login
                  </Link>
                  <FillButton
                    href="/register"
                    className="block px-3 py-2 text-center text-sm"
                  >
                    Register
                  </FillButton>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, Menu, X, UserCircle2, Search } from "lucide-react";
import FillButton from "./FillButton";
import SearchBar from "@/app/components/SearchBar";
import Skeleton from "./Skeleton";
import { createClient } from "../lib/supabase/client";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Players", href: "/players" },
  { label: "Matches", href: "/matches" },
  { label: "Tournaments", href: "/tournaments" },
  { label: "Achievements", href: "/achievements" },
  { label: "Ballon d'Or", href: "/ballon-dor" },
  { label: "Leaderboards", href: "/leaderboards" },
  { label: "News", href: "/news" },
];

function isActiveNavLink(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({
  pathname,
  onClick,
  isMobile = false,
}: {
  pathname: string;
  onClick?: () => void;
  isMobile?: boolean;
}) {
  return (
    <>
      {navLinks.map((link) => {
        const active = isActiveNavLink(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClick}
            className={`relative whitespace-nowrap ${
              isMobile
                ? "rounded-lg px-3 py-2 text-sm font-medium"
                : "py-1.5 text-[13px] font-medium"
            } ${
              active
                ? isMobile
                  ? "bg-surface-2 text-gold"
                  : "text-gold"
                : isMobile
                  ? "text-white/70 hover:bg-surface-2 hover:text-gold"
                  : "text-white/60 hover:text-gold"
            } transition-colors duration-150`}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
            {!isMobile && (
              <span
                className={`absolute -bottom-1 left-1/2 h-px w-4 -translate-x-1/2 bg-gold transition-opacity duration-150 ${
                  active ? "opacity-100" : "opacity-0"
                }`}
              />
            )}
          </Link>
        );
      })}
    </>
  );
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
  const [searchOpen, setSearchOpen] = useState(false);

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
    <header className="sticky top-0 z-50 w-full overflow-x-clip border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/logo.jpg"
            alt="Falcon Warriors logo"
            width={34}
            height={34}
            className="shrink-0 rounded-full"
          />
          <span className="hidden whitespace-nowrap font-display text-base font-bold tracking-wide text-gold sm:inline">
            FALCON WARRIORS
          </span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-5 overflow-hidden xl:flex 2xl:gap-7">
          <NavLinks pathname={pathname} />
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1 rounded-full border border-border bg-surface px-1.5 py-1">
          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen((open) => !open)}
            className="hidden xl:flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:bg-surface-2 hover:text-gold"
          >
            <Search size={15} />
          </button>

          {loading ? (
            <Skeleton width="4.5rem" height="2rem" className="hidden rounded-full sm:block" />
          ) : profile ? (
            <div className="relative hidden sm:block" data-user-menu>
              <button
                type="button"
                onClick={() => setUserMenuOpen((open) => !open)}
                aria-label="Open user menu"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-surface-2 hover:text-gold"
              >
                <UserCircle2 size={17} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-border bg-surface p-1.5 shadow-lg">
                  <div className="mb-1.5 rounded-lg border border-border bg-bg/70 px-3 py-2">
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
            <div className="hidden shrink-0 items-center gap-1 sm:flex">
              <Link
                href="/login"
                className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-white/70 hover:bg-surface-2 hover:text-gold"
              >
                Login
              </Link>
              <FillButton href="/register" className="whitespace-nowrap !rounded-full px-4 py-1.5 text-sm">
                Register
              </FillButton>
            </div>
          )}

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white xl:hidden"
          >
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="hidden border-t border-border px-3 sm:px-4 md:px-6 py-3 xl:block">
          <div className="mx-auto max-w-7xl">
            <SearchBar />
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="border-t border-border px-4 py-3 sm:px-6 xl:hidden">
          <div className="mb-3">
            <SearchBar />
          </div>
          <nav className="flex flex-col gap-1">
            <NavLinks pathname={pathname} onClick={() => setMenuOpen(false)} isMobile />
          </nav>

          <div className="mt-3 border-t border-border pt-3">
            {loading ? (
              <div className="h-9 w-full animate-pulse rounded-lg bg-surface-2" />
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
                <FillButton href="/register" className="block px-3 py-2 text-center text-sm">
                  Register
                </FillButton>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, Menu, X, UserCircle2, Search } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import FillButton from "./FillButton";
import SearchBar from "@/app/components/SearchBar";
import Skeleton from "./Skeleton";
import { getSiteSettings } from "@/app/lib/queries/siteSettings";
import { createClient } from "../lib/supabase/client";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Players", href: "/players" },
  { label: "Matches", href: "/matches" },
  { label: "Tournaments", href: "/tournaments" },
  { label: "Leaderboards", href: "/leaderboards" },
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
            className={`relative whitespace-nowrap transition-all duration-200 ${
              isMobile
                ? "rounded-lg px-3 py-2.5 text-sm font-medium"
                : "py-1.5 text-xs font-bold uppercase tracking-wide"
            } ${
              active
                ? isMobile
                  ? "text-[var(--fw-brand)]"
                  : "text-[var(--fw-text-primary)]"
                : isMobile
                  ? "text-[var(--fw-text-secondary)] hover:text-[var(--fw-brand)]"
                  : "text-[var(--fw-text-secondary)] hover:text-[var(--fw-text-primary)]"
            }`}
            aria-current={active ? "page" : undefined}
            style={{
              ...(isMobile && active && {
                backgroundColor: 'var(--fw-brand-soft)',
              }),
            }}
          >
            {link.label}
            {!isMobile && (
              <span
                className={`absolute -bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 transition-opacity duration-200 ${
                  active ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  backgroundColor: 'var(--fw-brand)',
                }}
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
  slug?: string | null;
};

export default function Navbar() {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const [logoUrl, setLogoUrl] = useState("/logo.jpg");
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileOverlayRef = useRef<HTMLDivElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getSiteSettings().then((s) => setLogoUrl(s.logoUrl));
  }, []);

  // Scroll detection for header state
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Body scroll lock for mobile menu
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [menuOpen]);

  useEffect(() => {
    let isMounted = true;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node | null;
      if (!(target instanceof Element)) return;

      const clickedInsideMenu =
        target.closest("[data-user-menu-trigger]") ||
        target.closest("[data-user-menu-panel]");

      if (!clickedInsideMenu) {
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
          .select("slug, efootball_username")
          .eq("profile_id", user.id)
          .single(),
      ]);

      if (isMounted) {
        setProfile({
          username: playerRow?.efootball_username ?? "Player",
          role: profileRow?.role ?? "player",
          slug: playerRow?.slug ?? null,
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

  const profileHref = profile?.slug ? `/players/${profile.slug}` : "/profile";

  // Header entrance — runs once on mount
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.from(headerRef.current, {
        y: -24,
        opacity: 0,
        duration: 0.6, // fw-animation-reveal
        ease: "power3.out",
      });
    },
    { scope: headerRef }
  );

  // Mobile menu open/close animation
  useGSAP(
    () => {
      if (!menuOpen || !mobileMenuRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.fromTo(
        mobileMenuRef.current,
        { opacity: 0, y: -12 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" } // fw-animation-normal
      );
    },
    { dependencies: [menuOpen], revertOnUpdate: true }
  );

  // Search panel open animation
  useGSAP(
    () => {
      if (!searchOpen || !searchPanelRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.fromTo(
        searchPanelRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" } // fw-animation-normal
      );
    },
    { dependencies: [searchOpen], revertOnUpdate: true }
  );

  // User dropdown open animation
  useGSAP(
    () => {
      if (!userMenuOpen || !userMenuRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.fromTo(
        userMenuRef.current,
        { opacity: 0, y: -8, scale: 0.96, transformOrigin: "top right" },
        { opacity: 1, y: 0, scale: 1, duration: 0.24, ease: "power2.out" } // slightly faster than normal
      );
    },
    { dependencies: [userMenuOpen], revertOnUpdate: true }
  );

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-50 w-full overflow-visible transition-all duration-300 ease-out"
        style={{
          backgroundColor: isScrolled ? 'var(--fw-bg-surface)' : 'transparent',
          backdropFilter: isScrolled ? 'blur(14px)' : 'none',
          borderBottomColor: isScrolled ? 'var(--fw-border)' : 'transparent',
          borderBottomWidth: '1px',
        }}
      >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 transition-all duration-200 hover:opacity-90"
        >
          <Image
            src={logoUrl}
            alt="Falcon Warriors logo"
            width={36}
            height={36}
            className="shrink-0 rounded-lg"
          />
          <span
            className="hidden whitespace-nowrap text-base font-black tracking-tight uppercase sm:inline"
            style={{
              color: 'var(--fw-text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            FALCON WARRIORS
          </span>
        </Link>

        <nav
          className="hidden min-w-0 flex-1 items-center justify-center gap-5 overflow-hidden lg:flex 2xl:gap-7"
        >
          <NavLinks pathname={pathname} />
        </nav>

        <div
          className="ml-auto flex shrink-0 items-center gap-1.5 rounded-lg border px-1.5 py-1"
          style={{
            borderColor: 'var(--fw-border)',
            backgroundColor: 'var(--fw-bg-surface)',
          }}
        >
          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen((open) => !open)}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200"
            style={{
              color: 'var(--fw-text-secondary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--fw-bg-secondary)';
              e.currentTarget.style.color = 'var(--fw-text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--fw-text-secondary)';
            }}
          >
            <Search size={15} />
          </button>

          {loading ? (
            <Skeleton width="4.5rem" height="2rem" className="hidden rounded-lg sm:block" />
          ) : profile ? (
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setUserMenuOpen((open) => !open)}
                aria-label="Open user menu"
                data-user-menu-trigger
                data-suspension-allowed
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200"
                style={{
                  color: 'var(--fw-text-secondary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--fw-bg-secondary)';
                  e.currentTarget.style.color = 'var(--fw-text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--fw-text-secondary)';
                }}
              >
                <UserCircle2 size={17} />
              </button>

              {userMenuOpen && (
                <div
                  ref={userMenuRef}
                  data-user-menu-panel
                  className="absolute right-0 z-50 mt-2 w-52 rounded-xl border shadow-lg"
                  style={{
                    borderColor: 'var(--fw-border)',
                    backgroundColor: 'var(--fw-bg-surface)',
                  }}
                >
                  <div
                    className="m-1.5 rounded-lg border px-3 py-2"
                    style={{
                      borderColor: 'var(--fw-border)',
                      backgroundColor: 'var(--fw-bg-primary)',
                    }}
                  >
                    <p
                      className="text-sm font-semibold"
                      style={{
                        color: 'var(--fw-text-primary)',
                      }}
                    >
                      {profile.username}
                    </p>
                  </div>

                  {(profile.role === "admin" || profile.role === "moderator") && (
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg mx-1 px-3 py-2 text-sm transition-colors duration-200"
                      style={{
                        color: 'var(--fw-text-secondary)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--fw-bg-secondary)';
                        e.currentTarget.style.color = 'var(--fw-text-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--fw-text-secondary)';
                      }}
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>
                  )}

                  <Link
                    href={profileHref}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg mx-1 px-3 py-2 text-sm transition-colors duration-200"
                    style={{
                      color: 'var(--fw-text-secondary)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--fw-bg-secondary)';
                      e.currentTarget.style.color = 'var(--fw-text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--fw-text-secondary)';
                    }}
                  >
                    <UserCircle2 size={16} />
                    My Profile
                  </Link>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleLogout();
                    }}
                    data-suspension-allowed="logout"
                    className="flex w-full items-center gap-2 rounded-lg mx-1 px-3 py-2 text-left text-sm transition-colors duration-200"
                    style={{
                      color: 'var(--fw-text-secondary)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--fw-bg-secondary)';
                      e.currentTarget.style.color = 'var(--fw-text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--fw-text-secondary)';
                    }}
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
                className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200"
                style={{
                  color: 'var(--fw-text-secondary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--fw-bg-secondary)';
                  e.currentTarget.style.color = 'var(--fw-text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--fw-text-secondary)';
                }}
              >
                Login
              </Link>
              <FillButton href="/register" className="whitespace-nowrap rounded-lg px-4 py-1.5 text-sm">
                Register
              </FillButton>
            </div>
          )}

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 lg:hidden"
            style={{
              color: 'var(--fw-text-primary)',
            }}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div
          ref={searchPanelRef}
          className="hidden border-t px-3 sm:px-4 md:px-6 py-3 lg:block"
          style={{
            borderTopColor: 'var(--fw-border)',
          }}
        >
          <div className="mx-auto max-w-7xl">
            <SearchBar />
          </div>
        </div>
      )}

      {menuOpen && (
        <>
          {/* Mobile overlay */}
          <div
            ref={mobileOverlayRef}
            className="fixed inset-0 z-40 lg:hidden"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
            }}
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Mobile menu drawer */}
          <div
            ref={mobileMenuRef}
            className="fixed right-0 top-16 bottom-0 z-40 w-full max-w-xs overflow-y-auto border-l lg:hidden"
            style={{
              borderLeftColor: 'var(--fw-border)',
              backgroundColor: 'var(--fw-bg-surface)',
            }}
          >
            <div className="flex flex-col gap-1 p-4">
              <SearchBar />

              <nav className="mt-4 flex flex-col gap-1">
                <NavLinks pathname={pathname} onClick={() => setMenuOpen(false)} isMobile />
              </nav>

              <div
                className="mt-4 border-t pt-4"
                style={{
                  borderTopColor: 'var(--fw-border)',
                }}
              >
                {loading ? (
                  <div className="h-10 w-full animate-pulse rounded-lg" style={{ backgroundColor: 'var(--fw-bg-secondary)' }} />
                ) : profile ? (
                  <div className="flex flex-col gap-2">
                    {(profile.role === "admin" || profile.role === "moderator") && (
                      <Link
                        href="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200"
                        style={{
                          color: 'var(--fw-text-secondary)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--fw-bg-secondary)';
                          e.currentTarget.style.color = 'var(--fw-text-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--fw-text-secondary)';
                        }}
                      >
                        <LayoutDashboard size={16} />
                        Dashboard
                      </Link>
                    )}

                    <Link
                      href={profileHref}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium border"
                      style={{
                        color: 'var(--fw-text-primary)',
                        borderColor: 'var(--fw-border)',
                        backgroundColor: 'var(--fw-bg-primary)',
                      }}
                    >
                      <span>{profile.username}</span>
                    </Link>

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        handleLogout();
                      }}
                      data-suspension-allowed="logout"
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors duration-200"
                      style={{
                        color: 'var(--fw-text-secondary)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--fw-bg-secondary)';
                        e.currentTarget.style.color = 'var(--fw-text-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--fw-text-secondary)';
                      }}
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
                      className="rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200"
                      style={{
                        color: 'var(--fw-text-secondary)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--fw-bg-secondary)';
                        e.currentTarget.style.color = 'var(--fw-text-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--fw-text-secondary)';
                      }}
                    >
                      Login
                    </Link>
                    <FillButton href="/register" className="block px-3 py-2.5 text-center text-sm">
                      Register
                    </FillButton>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      </header>
    </>
  );
}
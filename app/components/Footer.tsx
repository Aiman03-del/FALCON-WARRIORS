import { MessageCircle, Share2, PlayCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getSiteSettings } from "@/app/lib/queries/siteSettings";

const footerLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Contact Us", href: "/contact" },
  { label: "Sponsors", href: "/sponsors" },
];

export default async function Footer() {
  const { logoUrl } = await getSiteSettings();

  return (
    <footer className="bg-bg">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 py-10">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <Image
              src={logoUrl}
              alt="Falcon Warriors logo"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="font-display text-base font-bold text-gold">
              FALCON WARRIORS
            </span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-5">
            {footerLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs text-muted hover:text-gold"
              >
                {l.label}
              </Link>
            ))}
          </nav>

       <div className="flex items-center gap-4 text-muted">
  <Link href="#" aria-label="Discord" className="hover:text-gold">
    <MessageCircle size={18} />
  </Link>
  <Link href="#" aria-label="YouTube" className="hover:text-gold">
    <PlayCircle size={18} />
  </Link>
  <Link href="#" aria-label="Share" className="hover:text-gold">
    <Share2 size={18} />
  </Link>
</div>
        </div>

        <div className="mt-6 border-t border-border pt-6 text-center text-xs text-muted">
          © {new Date().getFullYear()} Falcon Warriors. All rights reserved.
          Built for Elite eFootball.
        </div>
      </div>
    </footer>
  );
}
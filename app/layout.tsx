import type { Metadata, Viewport } from "next";
import { Rajdhani, Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "./providers/ToastProvider";
import AccountStatusShell from "./components/AccountStatusShell";
import { getSiteSettings } from "@/app/lib/queries/siteSettings";

const display = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export async function generateMetadata(): Promise<Metadata> {
  const { faviconUrl } = await getSiteSettings();

  return {
    metadataBase: new URL("https://falcon-warriors.vercel.app"),
    title: "Falcon Warriors | Elite eFootball Club",
    description:
      "Falcon Warriors — Rise. Compete. Conquer. Official eFootball club community website with tournaments, matches, and player profiles.",
    keywords: ["eFootball", "gaming", "esports", "tournaments", "matches", "players", "FIFA", "competitive"],
    authors: [{ name: "Falcon Warriors" }],
    creator: "Falcon Warriors",
    publisher: "Falcon Warriors",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    icons: {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: faviconUrl,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: "https://falcon-warriors.vercel.app",
      siteName: "Falcon Warriors",
      title: "Falcon Warriors | Elite eFootball Club",
      description: "Join Falcon Warriors - The ultimate eFootball club with professional tournaments and elite players",
      images: [
        {
          url: faviconUrl,
          width: 512,
          height: 512,
          alt: "Falcon Warriors Logo",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Falcon Warriors | Elite eFootball Club",
      description: "Join Falcon Warriors - The ultimate eFootball club with tournaments and elite players",
      creator: "@falconwarriors",
      images: [faviconUrl],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { faviconUrl } = await getSiteSettings();

  return (
    <html className="bg-background" lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href={faviconUrl} type="image/png" />
      </head>
      <body className={`${display.variable} ${body.variable} ${body.className} bg-background text-foreground antialiased`}>
        <ToastProvider>
          <AccountStatusShell>{children}</AccountStatusShell>
        </ToastProvider>
      </body>
    </html>
  );
}

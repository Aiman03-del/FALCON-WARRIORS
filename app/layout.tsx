import type { Metadata } from "next";
import { Rajdhani, Inter } from "next/font/google";
import "./globals.css";

const display = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
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
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://falcon-warriors.com",
    siteName: "Falcon Warriors",
    title: "Falcon Warriors | Elite eFootball Club",
    description: "Join Falcon Warriors - The ultimate eFootball club with professional tournaments and elite players",
    images: [
      {
        url: "/favicon.png",
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
    images: ["/favicon.png"],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="bg-background" lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body className={`${body.className} bg-background text-foreground antialiased`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

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
    "Falcon Warriors — Rise. Compete. Conquer. Official eFootball club community website.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable}`}>
        {children}
      </body>
    </html>
  );
}
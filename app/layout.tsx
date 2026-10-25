import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const display = Inter_Tight({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--font-display",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Faircri — One forest report. One carbon credit. Never two.",
  description:
    "Faircri gives every carbon monitoring report a unique fingerprint before a credit is issued. If anyone tries to issue a second credit from the same report, it is refused automatically.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf7f0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body className={sans.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

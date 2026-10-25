import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "DoubleCountGate — each ton, sold once",
  description:
    "A lock for carbon registries. One evidence fingerprint can mint one credit. The second mint is refused. A model may read the paperwork. It never holds the key.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className={sans.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

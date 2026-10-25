import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Newsreader } from "next/font/google";
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

const display = Newsreader({
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "DoubleCountGate — Stop the same evidence pack from minting two credits",
  description:
    "If two desks issue a credit from the same monitoring pack, buyers cannot trust the market. DoubleCountGate hashes the pack into one evidence fingerprint before mint. A second mint reverts. The model never signs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${display.variable}`}>
      <body className={sans.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

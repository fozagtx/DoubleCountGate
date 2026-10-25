import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "DoubleCountGate — each ton, sold once",
  description:
    "A lock for carbon registries. One evidence fingerprint can mint one credit. The second mint is refused. A model may read the paperwork. It never holds the key.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

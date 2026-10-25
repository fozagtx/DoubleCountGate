"use client";

import { ConnectKitButton } from "connectkit";

export function Header() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
        <a href="#top" className="text-sm font-medium tracking-tight">
          DoubleCountGate
        </a>
        <div data-testid="connectkit">
          <ConnectKitButton />
        </div>
      </div>
    </header>
  );
}

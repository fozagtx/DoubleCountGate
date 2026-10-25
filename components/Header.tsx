"use client";

import { ConnectKitButton } from "connectkit";

export function Header() {
  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex h-[68px] max-w-marketing items-center justify-between px-6">
        <a href="#top" className="text-sm font-medium tracking-tight">
          DoubleCountGate
        </a>
        <div className="flex items-center gap-6">
          <a href="#desk" className="text-sm text-mute">
            Desk
          </a>
          <div data-testid="connectkit">
            <ConnectKitButton />
          </div>
        </div>
      </div>
    </header>
  );
}

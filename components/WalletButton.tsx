"use client";

import { ConnectKitButton } from "connectkit";
import { WalletIcon } from "@/components/Icons";

export function WalletButton({ size = "md" }: { size?: "sm" | "md" }) {
  const height = size === "sm" ? "min-h-10 px-4 text-sm" : "min-h-12 px-5 text-[0.95rem]";

  return (
    <ConnectKitButton.Custom>
      {({ isConnected, isConnecting, show, truncatedAddress, address }) => (
        <button
          type="button"
          onClick={show}
          data-testid="wallet-button"
          className={`inline-flex items-center gap-2 rounded-[10px] font-semibold transition-colors ${height} ${
            isConnected
              ? "border border-line bg-sheet text-ink hover:border-[#c9bea8]"
              : "bg-ink text-sheet hover:bg-[#3a342b]"
          }`}
        >
          {isConnected ? (
            <>
              <span className="h-2 w-2 rounded-full bg-[#3c9a62]" aria-hidden />
              {truncatedAddress ?? (address ? shorten(address) : "Connected")}
            </>
          ) : (
            <>
              <WalletIcon className="h-4 w-4" />
              {isConnecting ? "Connecting…" : "Connect wallet"}
            </>
          )}
        </button>
      )}
    </ConnectKitButton.Custom>
  );
}

export function shorten(value: string): string {
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

"use client";

import { useSignerMode } from "@/components/Providers";
import { localIssuerAccount } from "@/lib/local-issuer";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export function Header() {
  const { mode, setMode } = useSignerMode();
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const injected = connectors.find((connector) => connector.id === "injected");

  function useLocal() {
    setMode("local");
  }

  function useBrowser() {
    setMode("injected");
    if (!injected) return;
    if (isConnected) return;
    connect({ connector: injected });
  }

  const signingAs =
    mode === "local"
      ? `Local issuer ${shorten(localIssuerAccount.address)}`
      : isConnected && address
        ? `Browser wallet ${shorten(address)}`
        : "Browser wallet";

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-page flex-wrap items-end justify-between gap-6 px-6 py-6 md:px-10">
        <a href="#top" className="no-underline">
          <span className="serif block text-2xl tracking-tight">DoubleCountGate</span>
          <span className="eyebrow mt-1 block">A lock before the credit exists</span>
        </a>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={mode === "local" ? "btn btn-forest" : "btn"}
              aria-pressed={mode === "local"}
              onClick={useLocal}
              data-testid="use-local-issuer"
            >
              Use local issuer
            </button>
            <button
              type="button"
              className={mode === "injected" ? "btn btn-forest" : "btn"}
              aria-pressed={mode === "injected"}
              onClick={useBrowser}
              disabled={isPending}
              data-testid="use-browser-wallet"
            >
              {isPending ? "Connecting…" : "Browser wallet"}
            </button>
            {mode === "injected" && isConnected ? (
              <button type="button" className="btn" onClick={() => disconnect()}>
                Disconnect
              </button>
            ) : null}
          </div>
          <p className="text-xs text-mute" data-testid="signer-mode">
            Signing as {signingAs}. Hardhat chain only.
          </p>
        </div>
      </div>
    </header>
  );
}

function shorten(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

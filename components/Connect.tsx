"use client";

import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import { useSignerMode } from "@/components/Providers";
import { localIssuerAccount } from "@/lib/local-issuer";
import { walletConnectConfigured } from "@/lib/public-env";

export function Connect() {
  const { mode, setMode } = useSignerMode();
  const { isConnected, address } = useAccount();

  return (
    <section id="connect" className="border-t border-line">
      <div className="mx-auto max-w-desk px-6 py-24">
        <h2 className="text-2xl font-medium tracking-tight">Connect wallet</h2>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-lead">
          The wallet you connect here is the only thing that can sign a mint. The model cannot.
        </p>
        <div className="mt-8 rounded-[14px] border border-line bg-white p-6" data-testid="connect-section">
          <ConnectKitButton />
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-mute" data-testid="walletconnect-note">
          {walletConnectConfigured
            ? "WalletConnect QR is available from this button, along with a browser wallet on this machine."
            : "WalletConnect QR needs NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID. It is unset, so QR is off. A browser wallet on this machine still connects from the button above."}
        </p>
        <p className="mt-5 text-sm text-mute" data-testid="signer-mode">
          {mode === "local" ? (
            <>
              Signing with the local Hardhat account {shorten(localIssuerAccount.address)}.{" "}
              <button type="button" className="link" onClick={() => setMode("wallet")}>
                Use the connected wallet instead
              </button>
            </>
          ) : isConnected && address ? (
            <>Connected {shorten(address)}.</>
          ) : (
            <>
              No browser wallet?{" "}
              <button type="button" className="link" onClick={() => setMode("local")} data-testid="use-local-issuer">
                Use the local Hardhat account
              </button>
            </>
          )}
        </p>
        </div>
      </div>
    </section>
  );
}

function shorten(value: string): string {
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

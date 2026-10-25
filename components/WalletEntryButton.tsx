"use client";

import { ConnectKitButton } from "connectkit";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

export function WalletEntryButton({
  label,
  connectedLabel,
  className,
}: {
  label: string;
  connectedLabel: string;
  className: string;
}) {
  const router = useRouter();
  const { isConnected } = useAccount();

  return (
    <ConnectKitButton.Custom>
      {({ show, isConnecting }) => (
        <button
          type="button"
          className={className}
          onClick={() => (isConnected ? router.push("/dashboard") : show?.())}
        >
          {isConnected ? connectedLabel : isConnecting ? "Connecting…" : label}
        </button>
      )}
    </ConnectKitButton.Custom>
  );
}

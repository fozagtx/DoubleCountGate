"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { createContext, useContext, useState, type ReactNode } from "react";
import { WagmiProvider, createConfig, http, injected } from "wagmi";
import { hardhat } from "wagmi/chains";
import { rpcUrl, walletConnectConfigured, walletConnectProjectId } from "@/lib/public-env";

const queryClient = new QueryClient();

const config = walletConnectConfigured
  ? createConfig(
      getDefaultConfig({
        appName: "DoubleCountGate",
        appDescription: "One evidence fingerprint. One carbon credit.",
        walletConnectProjectId,
        chains: [hardhat],
        transports: {
          [hardhat.id]: http(rpcUrl),
        },
        ssr: true,
      }),
    )
  : createConfig({
      chains: [hardhat],
      connectors: [injected()],
      transports: {
        [hardhat.id]: http(rpcUrl),
      },
      ssr: true,
    });

export type SignerMode = "wallet" | "local";

const SignerModeContext = createContext<{
  mode: SignerMode;
  setMode: (mode: SignerMode) => void;
} | null>(null);

export function useSignerMode() {
  const value = useContext(SignerModeContext);
  if (!value) throw new Error("Signer mode is only available inside Providers.");
  return value;
}

const connectTheme = {
  "--ck-font-family": "var(--font-sans), Inter, sans-serif",
  "--ck-accent-color": "#1f4d3a",
  "--ck-accent-text-color": "#f6f5f2",
  "--ck-border-radius": "12px",
  "--ck-body-background": "#f9f9f8",
  "--ck-body-background-secondary": "#fdfdfc",
  "--ck-body-color": "#21201c",
  "--ck-body-color-muted": "#63635e",
  "--ck-primary-button-background": "#1f4d3a",
  "--ck-primary-button-hover-background": "#17392b",
  "--ck-primary-button-color": "#fdfdfc",
  "--ck-connectbutton-background": "#1f4d3a",
  "--ck-connectbutton-color": "#fdfdfc",
  "--ck-connectbutton-hover-background": "#17392b",
  "--ck-connectbutton-border-radius": "12px",
};

export function Providers({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<SignerMode>("wallet");

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          theme="minimal"
          mode="light"
          customTheme={connectTheme}
          options={{
            initialChainId: hardhat.id,
            embedGoogleFonts: false,
            enforceSupportedChains: true,
          }}
        >
          <SignerModeContext.Provider value={{ mode, setMode }}>{children}</SignerModeContext.Provider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

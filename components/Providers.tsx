"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { useState, type ReactNode } from "react";
import { WagmiProvider, createConfig, http, injected } from "wagmi";
import { appChain, browserRpcUrl } from "@/lib/chain";
import { walletConnectConfigured, walletConnectProjectId } from "@/lib/public-env";

const config = walletConnectConfigured
  ? createConfig(
      getDefaultConfig({
        appName: "Faircri",
        appDescription: "One forest report. One carbon credit.",
        walletConnectProjectId,
        chains: [appChain],
        transports: {
          [appChain.id]: http(browserRpcUrl),
        },
        ssr: true,
      }),
    )
  : createConfig({
      chains: [appChain],
      connectors: [injected()],
      transports: {
        [appChain.id]: http(browserRpcUrl),
      },
      ssr: true,
    });

const connectTheme = {
  "--ck-font-family": "var(--font-sans), Inter, sans-serif",
  "--ck-accent-color": "#e2a65a",
  "--ck-accent-text-color": "#1e1b16",
  "--ck-border-radius": "14px",
  "--ck-body-background": "#fffdf8",
  "--ck-body-background-secondary": "#faf7f0",
  "--ck-body-color": "#1e1b16",
  "--ck-body-color-muted": "#7a7266",
  "--ck-primary-button-background": "#faf7f0",
  "--ck-primary-button-hover-background": "#f2ecdf",
  "--ck-primary-button-color": "#1e1b16",
  "--ck-connectbutton-background": "#1e1b16",
  "--ck-connectbutton-color": "#fffdf8",
  "--ck-connectbutton-hover-background": "#3a342b",
  "--ck-connectbutton-border-radius": "10px",
};

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <ConnectKitProvider
          theme="minimal"
          mode="light"
          customTheme={connectTheme}
          options={{
            initialChainId: appChain.id,
            embedGoogleFonts: false,
            enforceSupportedChains: true,
          }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

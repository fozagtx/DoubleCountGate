"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useState, type ReactNode } from "react";
import { WagmiProvider, createConfig, http, injected } from "wagmi";
import { hardhat } from "wagmi/chains";
import { rpcUrl } from "@/lib/public-env";

const queryClient = new QueryClient();

export const wagmiConfig = createConfig({
  chains: [hardhat],
  connectors: [injected()],
  transports: {
    [hardhat.id]: http(rpcUrl),
  },
  ssr: true,
});

export type SignerMode = "local" | "injected";

const SignerModeContext = createContext<{
  mode: SignerMode;
  setMode: (mode: SignerMode) => void;
} | null>(null);

export function useSignerMode() {
  const value = useContext(SignerModeContext);
  if (!value) throw new Error("Signer mode is only available inside Providers.");
  return value;
}

export function Providers({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<SignerMode>("local");

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SignerModeContext.Provider value={{ mode, setMode }}>{children}</SignerModeContext.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

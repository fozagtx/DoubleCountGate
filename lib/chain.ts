import type { Address, Hash } from "viem";
import { defineChain } from "viem";
import { hoodi } from "viem/chains";
import hoodiDeployment from "@/deployments/hoodi.json";

export const appChain =
  hoodi ??
  defineChain({
    id: 560048,
    name: "Hoodi",
    nativeCurrency: { name: "Hoodi Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: ["https://rpc.hoodi.ethpandaops.io"] } },
    blockExplorers: { default: { name: "Hoodi Etherscan", url: "https://hoodi.etherscan.io" } },
    testnet: true,
  });

export const rpcUrl =
  process.env.NEXT_PUBLIC_RPC_URL?.trim() ||
  appChain.rpcUrls.default.http[0] ||
  "https://rpc.hoodi.ethpandaops.io";

const deployment = hoodiDeployment as {
  address: string | null;
  chainId: number;
  network: string;
  contract: string;
  blockNumber: number | null;
};

export const registryAddress = deployment.address as Address | null;
export const registryDeployBlock = deployment.blockNumber;
export const faucetUrl = "https://hoodi-faucet.pk910.de";

export function explorerTx(hash: Hash): string {
  return `${appChain.blockExplorers.default.url}/tx/${hash}`;
}

export function explorerAddress(address: Address | string): string {
  return `${appChain.blockExplorers.default.url}/address/${address}`;
}

import type { Address, Hash } from "viem";
import { arcTestnet } from "viem/chains";
import arcTestnetDeployment from "@/deployments/arcTestnet.json";

export const appChain = arcTestnet;

export const rpcUrl =
  process.env.NEXT_PUBLIC_RPC_URL?.trim() ||
  appChain.rpcUrls.default.http[0] ||
  "https://rpc.testnet.arc.io";

export const browserRpcUrl =
  typeof window === "undefined" ? rpcUrl : `${window.location.origin}/api/rpc`;

const deployment = arcTestnetDeployment as {
  address: string | null;
  chainId: number;
  network: string;
  contract: string;
  blockNumber: number | null;
};

export const registryAddress = deployment.address as Address | null;
export const registryDeployBlock = deployment.blockNumber;
export const faucetUrl = "https://faucet.circle.com";

export function explorerTx(hash: Hash): string {
  return `${appChain.blockExplorers.default.url}/tx/${hash}`;
}

export function explorerAddress(address: Address | string): string {
  return `${appChain.blockExplorers.default.url}/address/${address}`;
}

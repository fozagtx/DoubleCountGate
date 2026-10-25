import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hardhat } from "viem/chains";
import { assertLoopbackRpc } from "./loopback";

/**
 * Hardhat's published account #0. This key is test material shipped with Hardhat.
 * It is not a production key. `localIssuerClients` refuses any RPC that is not loopback.
 * The model never imports this file.
 */
export const LOCAL_ISSUER_PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" as const;

export const localIssuerAccount = privateKeyToAccount(LOCAL_ISSUER_PRIVATE_KEY);

export function localIssuerClients(rpcUrl: string) {
  assertLoopbackRpc(rpcUrl);
  const transport = http(rpcUrl);
  const wallet = createWalletClient({
    account: localIssuerAccount,
    chain: hardhat,
    transport,
  });
  const publicClient = createPublicClient({ chain: hardhat, transport });
  return { account: localIssuerAccount, wallet, publicClient };
}

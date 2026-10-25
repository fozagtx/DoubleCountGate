import { createPublicClient, http, type Address, type Hash, type Hex } from "viem";
import { appChain, registryAddress, registryDeployBlock, rpcUrl } from "@/lib/chain";
import { creditRegistryAbi } from "@/lib/abi";

export type WalletCredit = {
  id: bigint;
  evidenceHash: Hex;
  uri: string;
  issuer: Address;
  status: number;
  issuedAt: bigint;
  txHash: Hash;
};

const publicClient = createPublicClient({
  chain: appChain,
  transport: http(rpcUrl),
});

export async function readWalletCredits(issuer: Address): Promise<WalletCredit[]> {
  const address = registryAddress;
  if (!address || registryDeployBlock === null) return [];

  const logs = await publicClient.getContractEvents({
    address,
    abi: creditRegistryAbi,
    eventName: "CreditMinted",
    args: { issuer },
    fromBlock: BigInt(registryDeployBlock),
    toBlock: "latest",
  });

  const credits = await Promise.all(
    logs.map(async (log) => {
      const id = log.args.creditId;
      const evidenceHash = log.args.evidenceHash;
      const eventIssuer = log.args.issuer;
      const txHash = log.transactionHash;
      if (id === undefined || !evidenceHash || !eventIssuer || !txHash) return null;

      const value = await publicClient.readContract({
        address,
        abi: creditRegistryAbi,
        functionName: "getCredit",
        args: [id],
      });
      const credit = value as unknown as {
        evidenceHash: Hex;
        uri: string;
        issuer: Address;
        status: number | bigint;
        issuedAt: number | bigint;
      };

      return {
        id,
        evidenceHash,
        uri: credit.uri,
        issuer: eventIssuer,
        status: Number(credit.status),
        issuedAt: BigInt(credit.issuedAt),
        txHash,
      } satisfies WalletCredit;
    }),
  );

  return credits
    .filter((credit): credit is WalletCredit => credit !== null)
    .sort((left, right) => (left.id < right.id ? 1 : left.id > right.id ? -1 : 0));
}

export function creditProject(uri: string, fingerprint: Hex): string {
  try {
    const data = JSON.parse(uri) as { projectName?: unknown };
    if (typeof data.projectName === "string" && data.projectName.trim()) return data.projectName;
  } catch {
    if (uri.trim()) return uri;
  }
  return `${fingerprint.slice(0, 10)}…${fingerprint.slice(-8)}`;
}

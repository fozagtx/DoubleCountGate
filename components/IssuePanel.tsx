"use client";

import { useState } from "react";
import { BaseError, zeroAddress, type Hash } from "viem";
import { useAccount, usePublicClient, useReadContract, useSwitchChain, useWriteContract } from "wagmi";
import { Banner, Spinner } from "@/components/ui";
import { WalletButton } from "@/components/WalletButton";
import type { GatePass } from "@/lib/gate";
import { appChain, explorerTx, registryAddress } from "@/lib/chain";
import { creditRegistryAbi } from "@/lib/abi";

export function IssuePanel({ ready }: { ready: GatePass | null }) {
  const { chainId, isConnected } = useAccount();
  const { switchChain, isPending: switching } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient({ chainId: appChain.id });
  const [busy, setBusy] = useState(false);
  const [txHash, setTxHash] = useState<Hash | null>(null);
  const [creditId, setCreditId] = useState<bigint | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const wrongNetwork = isConnected && chainId !== appChain.id;

  const evidenceQuery = useReadContract({
    address: registryAddress ?? zeroAddress,
    abi: creditRegistryAbi,
    functionName: "creditIdForEvidence",
    args: ready ? [ready.hash] : undefined,
    chainId: appChain.id,
    query: { enabled: Boolean(registryAddress && ready) },
  });
  const existingId = typeof evidenceQuery.data === "bigint" ? evidenceQuery.data : 0n;
  const knownCreditId = existingId > 0n ? existingId : creditId;

  async function issueCredit() {
    if (!registryAddress || !ready || !isConnected || wrongNetwork || !publicClient) return;
    setBusy(true);
    setFailure(null);
    setErrorDetails(null);
    setTxHash(null);
    try {
      const hash = await writeContractAsync({
        address: registryAddress,
        abi: creditRegistryAbi,
        functionName: "mint",
        args: [ready.hash, ready.canonical],
        chainId: appChain.id,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      setTxHash(hash);
      const updated = await evidenceQuery.refetch();
      if (typeof updated.data === "bigint") setCreditId(updated.data);
    } catch (cause) {
      setFailure("Your wallet couldn't complete this step. Check your wallet and try again.");
      setErrorDetails(cause instanceof BaseError ? cause.shortMessage || cause.message : cause instanceof Error ? cause.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return <p className="text-[14px] text-mute">Once a report passes step 2, you can issue its credit here.</p>;
  }

  if (!registryAddress) {
    return (
      <div data-testid="registry-missing">
        <Banner tone="bad" title="The registry isn&apos;t deployed yet">
          The report is ready, but credits cannot be issued until the Arc Testnet registry is deployed.
        </Banner>
      </div>
    );
  }

  return (
    <div>
      {wrongNetwork ? (
        <div className="rounded-[12px] border border-line bg-paper p-5">
          <p className="text-[15px] font-semibold text-ink">Your wallet is on a different network</p>
          <p className="mt-1 text-[14px] text-lead">Switch to Arc Testnet to issue this credit.</p>
          <button
            type="button"
            className="btn mt-4 min-h-10 px-4 text-sm"
            disabled={switching}
            onClick={() => switchChain({ chainId: appChain.id })}
          >
            {switching ? "Switching…" : "Switch to Arc Testnet"}
          </button>
        </div>
      ) : !isConnected ? (
        <div className="rounded-[12px] border border-line bg-paper p-5">
          <p className="text-[15px] font-semibold text-ink">Connect a wallet to approve the credit</p>
          <p className="mt-1 text-[14px] leading-relaxed text-lead">Nothing happens until you approve the transaction.</p>
          <div className="mt-4"><WalletButton /></div>
        </div>
      ) : knownCreditId ? (
        <div className="space-y-4">
          <Banner tone="good" title={`This report already has Credit #${knownCreditId.toString()}`}>
            The registry only allows one credit for a report fingerprint.
          </Banner>
          <a className="btn-ghost inline-flex min-h-10 text-sm" href="/dashboard/credits">View in My credits</a>
        </div>
      ) : (
        <div>
          <button type="button" className="btn w-full sm:w-auto" disabled={busy} onClick={issueCredit} data-testid="mint">
            {busy ? <><Spinner /> Issuing…</> : "Issue 1 credit from this report"}
          </button>
          <p className="mt-3 text-[13px] text-mute">Your wallet will ask you to approve. Test USDC pays the network fee and has no real-world value.</p>
        </div>
      )}

      {txHash ? (
        <div className="mt-5">
          <Banner tone="good" title="Credit issued">
            The report is now recorded on the Arc Testnet registry.
          </Banner>
          <div className="mt-4 flex flex-wrap gap-3">
            <a className="btn-ghost min-h-10 text-sm" href={explorerTx(txHash)} target="_blank" rel="noreferrer">
              View transaction
            </a>
            <a className="btn-ghost min-h-10 text-sm" href="/dashboard/credits">View in My credits</a>
          </div>
        </div>
      ) : null}
      {failure ? (
        <div className="mt-5">
          <Banner tone="bad" title="That didn&apos;t go through">{failure}</Banner>
        </div>
      ) : null}
      {errorDetails ? (
        <details className="mt-5 text-[12px] text-mute">
          <summary className="cursor-pointer font-medium">Technical details</summary>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap">{errorDetails}</pre>
        </details>
      ) : null}
    </div>
  );
}

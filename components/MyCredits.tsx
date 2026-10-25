"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount, usePublicClient, useSwitchChain, useWriteContract } from "wagmi";
import { BaseError } from "viem";
import { CreditStatus } from "@/components/CreditStatus";
import { Banner, Spinner } from "@/components/ui";
import { creditProject, type WalletCredit } from "@/lib/credits";
import { appChain, explorerTx, registryAddress } from "@/lib/chain";
import { creditRegistryAbi } from "@/lib/abi";
import { useWalletCredits } from "@/lib/use-wallet-credits";

export function MyCredits() {
  const { address, chainId } = useAccount();
  const { credits, loading, error, reload } = useWalletCredits(address);
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient({ chainId: appChain.id });
  const { switchChain, isPending: switching } = useSwitchChain();
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [lastTransaction, setLastTransaction] = useState<{ id: bigint; hash: `0x${string}` } | null>(null);
  const wrongNetwork = chainId !== appChain.id;

  async function updateCredit(credit: WalletCredit, action: "retire" | "contest") {
    if (!registryAddress || !publicClient || wrongNetwork) return;
    setBusy(`${credit.id}-${action}`);
    setActionError(null);
    setErrorDetails(null);
    try {
      const hash = await writeContractAsync({
        address: registryAddress,
        abi: creditRegistryAbi,
        functionName: action,
        args: action === "retire" ? [credit.id] : [credit.id, "Flagged by the issuer."],
        chainId: appChain.id,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      setLastTransaction({ id: credit.id, hash });
      await reload();
    } catch (cause) {
      setActionError(action === "retire" ? "That credit could not be retired. Nothing changed." : "That credit could not be flagged. Nothing changed.");
      setErrorDetails(cause instanceof BaseError ? cause.shortMessage || cause.message : cause instanceof Error ? cause.message : "Unknown error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-[13px] font-medium text-mute">Credit history</p>
        <h2 className="mt-2 font-display text-[32px] font-bold tracking-[-0.04em]">My credits</h2>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-lead">
          Credits issued from this wallet, with their current status and original transaction.
        </p>
      </section>

      {actionError ? (
        <Banner tone="bad" title="That action didn&apos;t go through">
          {actionError}
        </Banner>
      ) : null}
      {lastTransaction ? (
        <Banner tone="good" title="Your credit has been updated">
          <a href={explorerTx(lastTransaction.hash)} target="_blank" rel="noreferrer" className="link">
            View the transaction for Credit #{lastTransaction.id.toString()}
          </a>
        </Banner>
      ) : null}
      {loading ? <p className="text-[14px] text-mute">Loading your credits…</p> : null}
      {error ? <p className="rounded-[12px] bg-blush px-4 py-3 text-[14px] text-lead">{error}</p> : null}
      {!registryAddress ? (
        <div className="rounded-[14px] border border-line bg-sheet p-5 text-[14px] leading-relaxed text-lead">
          The Hoodi registry hasn&apos;t been deployed yet. Your credits will appear here after it is available.
        </div>
      ) : null}
      {!loading && !error && registryAddress && credits.length === 0 ? (
        <div className="rounded-[16px] border border-dashed border-line bg-sheet px-5 py-10 text-center">
          <p className="font-display text-[21px] font-semibold">You haven&apos;t issued any credits yet.</p>
          <p className="mt-2 text-[14px] text-lead">A credit will appear here after you approve it from a report.</p>
          <Link href="/dashboard/check" className="btn mt-5">Check a report</Link>
        </div>
      ) : null}
      {credits.length > 0 ? (
        <div className="grid gap-4">
          {credits.map((credit) => (
            <CreditCard
              key={credit.id.toString()}
              credit={credit}
              busy={busy}
              wrongNetwork={wrongNetwork}
              switching={switching}
              onSwitch={() => switchChain({ chainId: appChain.id })}
              onAction={updateCredit}
              lastTransaction={lastTransaction?.id === credit.id ? lastTransaction.hash : null}
            />
          ))}
        </div>
      ) : null}
      {errorDetails ? (
        <details className="text-[12px] text-mute">
          <summary className="cursor-pointer font-medium">Technical details</summary>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap">{errorDetails}</pre>
        </details>
      ) : null}
    </div>
  );
}

function CreditCard({
  credit,
  busy,
  wrongNetwork,
  switching,
  onSwitch,
  onAction,
  lastTransaction,
}: {
  credit: WalletCredit;
  busy: string | null;
  wrongNetwork: boolean;
  switching: boolean;
  onSwitch: () => void;
  onAction: (credit: WalletCredit, action: "retire" | "contest") => void;
  lastTransaction: `0x${string}` | null;
}) {
  return (
    <article className="rounded-[16px] border border-line bg-sheet p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-[20px] font-semibold tracking-[-0.025em]">
            {creditProject(credit.uri, credit.evidenceHash)}
          </p>
          <p className="mt-1 text-[13px] text-mute">Credit #{credit.id.toString()}</p>
        </div>
        <CreditStatus status={credit.status} />
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-lead">
        <span>Fingerprint: <span className="font-mono">{credit.evidenceHash.slice(0, 10)}…{credit.evidenceHash.slice(-8)}</span></span>
        <a href={explorerTx(credit.txHash)} target="_blank" rel="noreferrer" className="link">Issued transaction</a>
      </div>
      {credit.status === 1 ? (
        <div className="mt-5 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center">
          {wrongNetwork ? (
            <button type="button" className="btn-ghost min-h-10 text-sm" disabled={switching} onClick={onSwitch}>
              {switching ? "Switching…" : "Switch to Hoodi"}
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn-ghost min-h-10 text-sm"
                disabled={Boolean(busy)}
                onClick={() => onAction(credit, "retire")}
              >
                {busy === `${credit.id}-retire` ? <><Spinner /> Retiring…</> : "Retire"}
              </button>
              <button
                type="button"
                className="btn-ghost min-h-10 text-sm"
                disabled={Boolean(busy)}
                onClick={() => onAction(credit, "contest")}
              >
                {busy === `${credit.id}-contest` ? <><Spinner /> Sending…</> : "Flag a problem"}
              </button>
            </>
          )}
        </div>
      ) : null}
      {lastTransaction ? (
        <p className="mt-4 text-[13px] text-lead">
          <a href={explorerTx(lastTransaction)} target="_blank" rel="noreferrer" className="link">View latest transaction</a>
        </p>
      ) : null}
    </article>
  );
}

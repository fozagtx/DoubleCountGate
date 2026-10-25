"use client";

import { useCallback, useEffect, useState } from "react";
import { BaseError, ContractFunctionRevertedError, type Hex } from "viem";
import { hardhat } from "wagmi/chains";
import { useAccount, useReadContract, useSwitchChain, useWriteContract } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { useSignerMode } from "@/components/Providers";
import { creditRegistryAbi, STATUS_LABEL } from "@/lib/abi";
import type { GatePass } from "@/lib/gate";
import { localIssuerAccount, localIssuerClients } from "@/lib/local-issuer";
import { rpcUrl } from "@/lib/public-env";

type RegistryInfo = {
  address: Hex;
  chainId: number;
};

export function IssuePanel({ ready }: { ready: GatePass | null }) {
  const { mode } = useSignerMode();
  const { address, isConnected, chainId } = useAccount();
  const { switchChain, isPending: switching } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const [registry, setRegistry] = useState<RegistryInfo | null>(null);
  const [registryError, setRegistryError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<Hex | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [refusal, setRefusal] = useState<{ creditId: bigint } | null>(null);
  const [blocked, setBlocked] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [contestReason, setContestReason] = useState("The same pack was offered to another desk.");

  const loadRegistry = useCallback(async () => {
    const res = await fetch("/api/registry");
    const body = (await res.json()) as { address?: Hex; chainId?: number; error?: string };
    if (!res.ok || !body.address) {
      setRegistry(null);
      setRegistryError(body.error ?? "The local registry is not deployed.");
      return;
    }
    setRegistryError(null);
    setRegistry({ address: body.address, chainId: body.chainId ?? hardhat.id });
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadRegistry().catch(() => {
      if (!cancelled) setRegistryError("Could not read deployments/localhost.json.");
    });
    return () => {
      cancelled = true;
    };
  }, [loadRegistry]);

  const evidenceQuery = useReadContract({
    address: registry?.address,
    abi: creditRegistryAbi,
    functionName: "creditIdForEvidence",
    args: ready ? [ready.hash] : undefined,
    chainId: hardhat.id,
    query: { enabled: Boolean(registry && ready) },
  });
  const existingId = typeof evidenceQuery.data === "bigint" ? evidenceQuery.data : 0n;
  const alreadyIssued = existingId > 0n;

  const creditQuery = useReadContract({
    address: registry?.address,
    abi: creditRegistryAbi,
    functionName: "getCredit",
    args: alreadyIssued ? [existingId] : undefined,
    chainId: hardhat.id,
    query: { enabled: Boolean(registry && alreadyIssued) },
  });

  const status = readStatus(creditQuery.data);
  const issuer = readIssuer(creditQuery.data);
  const signerAddress = mode === "local" ? localIssuerAccount.address : address;
  const wrongChain = mode === "wallet" && isConnected && chainId !== hardhat.id;
  const isIssuer = Boolean(signerAddress && issuer && signerAddress.toLowerCase() === issuer.toLowerCase());
  const canSign = mode === "local" || (isConnected && !wrongChain);

  async function refresh() {
    await Promise.all([evidenceQuery.refetch(), creditQuery.refetch()]);
  }

  async function wait(hash: Hex) {
    const { publicClient } = localIssuerClients(rpcUrl);
    await publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  async function mintWith(evidenceHash: Hex, uri: string) {
    if (!registry) throw new Error("The local registry is not deployed.");
    if (mode === "local") {
      const { wallet } = localIssuerClients(rpcUrl);
      return wait(
        await wallet.writeContract({
          address: registry.address,
          abi: creditRegistryAbi,
          functionName: "mint",
          args: [evidenceHash, uri],
          chain: hardhat,
        }),
      );
    }
    return wait(
      await writeContractAsync({
        address: registry.address,
        abi: creditRegistryAbi,
        functionName: "mint",
        args: [evidenceHash, uri],
        chainId: hardhat.id,
      }),
    );
  }

  async function retireWith(creditId: bigint) {
    if (!registry) throw new Error("The local registry is not deployed.");
    if (mode === "local") {
      const { wallet } = localIssuerClients(rpcUrl);
      return wait(
        await wallet.writeContract({
          address: registry.address,
          abi: creditRegistryAbi,
          functionName: "retire",
          args: [creditId],
          chain: hardhat,
        }),
      );
    }
    return wait(
      await writeContractAsync({
        address: registry.address,
        abi: creditRegistryAbi,
        functionName: "retire",
        args: [creditId],
        chainId: hardhat.id,
      }),
    );
  }

  async function contestWith(creditId: bigint, reason: string) {
    if (!registry) throw new Error("The local registry is not deployed.");
    if (mode === "local") {
      const { wallet } = localIssuerClients(rpcUrl);
      return wait(
        await wallet.writeContract({
          address: registry.address,
          abi: creditRegistryAbi,
          functionName: "contest",
          args: [creditId, reason],
          chain: hardhat,
        }),
      );
    }
    return wait(
      await writeContractAsync({
        address: registry.address,
        abi: creditRegistryAbi,
        functionName: "contest",
        args: [creditId, reason],
        chainId: hardhat.id,
      }),
    );
  }

  async function onMint() {
    if (!registry || !ready || !canSign) return;
    setBusy(alreadyIssued ? "second" : "mint");
    setFailure(null);
    setRefusal(null);
    const counting = alreadyIssued;
    if (counting) setAttempts((value) => value + 1);
    try {
      const hash = await mintWith(ready.hash, ready.canonical);
      setTxHash(hash);
      if (counting) {
        setAttempts((value) => value - 1);
        setFailure("The second mint was accepted. The registry did not block it.");
      }
    } catch (error) {
      const explained = explainRevert(error);
      if (explained.kind === "already-used") {
        if (!counting) setAttempts((value) => value + 1);
        setBlocked((value) => value + 1);
        setRefusal({ creditId: explained.creditId > 0n ? explained.creditId : existingId });
      } else if (counting) {
        setAttempts((value) => value - 1);
        setFailure(explained.message);
      } else {
        setFailure(explained.message);
      }
    } finally {
      setBusy(null);
      await refresh();
    }
  }

  async function onRetire() {
    if (!registry || !alreadyIssued || !canSign) return;
    setBusy("retire");
    setFailure(null);
    try {
      setTxHash(await retireWith(existingId));
    } catch (error) {
      const explained = explainRevert(error);
      setFailure(explained.kind === "message" ? explained.message : "Retire failed.");
    } finally {
      setBusy(null);
      await refresh();
    }
  }

  async function onContest() {
    if (!registry || !alreadyIssued || !canSign) return;
    setBusy("contest");
    setFailure(null);
    try {
      setTxHash(await contestWith(existingId, contestReason.trim() || "contested"));
    } catch (error) {
      const explained = explainRevert(error);
      setFailure(explained.kind === "message" ? explained.message : "Contest failed.");
    } finally {
      setBusy(null);
      await refresh();
    }
  }

  return (
    <div>
      {!ready ? (
        <p className="max-w-xl leading-relaxed text-mute">
          Create a fingerprint in Evidence first. Then mint it once here. The same fingerprint cannot mint again.
        </p>
      ) : (
        <div>
          <p className="break-all font-mono text-xs leading-relaxed text-mute">{ready.hash}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            {mode === "wallet" && !isConnected ? (
              <div>
                <p className="mb-4 text-sm text-mute">Connect a wallet to mint.</p>
                <ConnectKitButton />
              </div>
            ) : wrongChain ? (
              <button
                type="button"
                className="btn"
                disabled={switching}
                onClick={() => switchChain({ chainId: hardhat.id })}
              >
                {switching ? "Switching…" : "Switch to Hardhat"}
              </button>
            ) : (
              <button
                type="button"
                className="btn"
                disabled={!registry || Boolean(busy)}
                onClick={onMint}
                data-testid={alreadyIssued ? "second-mint" : "mint"}
              >
                {busy === "mint" || busy === "second"
                  ? "Sending…"
                  : alreadyIssued
                    ? "Attempt a second mint"
                    : "Mint this credit"}
              </button>
            )}
            <button type="button" className="link text-sm" onClick={() => loadRegistry().then(() => refresh())}>
              Refresh the registry
            </button>
          </div>
          <p className="mt-4 text-sm text-mute">
            {mode === "local"
              ? `The local Hardhat account ${shorten(localIssuerAccount.address)} will sign. The model does not.`
              : "The connected wallet will sign. The model does not."}
          </p>
          {failure ? <p className="mt-4 max-w-xl text-sm text-ink">{failure}</p> : null}
        </div>
      )}

      {refusal ? (
        <div className="mt-10 rounded-[14px] border border-line bg-sand px-5 py-5" data-testid="chain-refuse">
          <p className="font-mono text-xs text-mute">EVIDENCE_ALREADY_USED</p>
          <h3 className="mt-2 text-2xl font-medium tracking-tight">Second mint blocked</h3>
          <p className="mt-4 max-w-xl text-lg leading-relaxed">
            {formatCredit(refusal.creditId)} already holds this fingerprint. The registry will not mint it again.
          </p>
          <p className="mt-6 font-mono text-sm" data-testid="judge-count">
            {blocked}/{attempts} double-mints blocked this session.
          </p>
        </div>
      ) : attempts > 0 ? (
        <p className="mt-6 font-mono text-sm" data-testid="judge-count">
          {blocked}/{attempts} double-mints blocked this session.
        </p>
      ) : null}

      <div className="mt-16 border-t border-line pt-8 text-sm">
        <p className="text-mute">Registry</p>
        {registry ? (
          <p className="mt-2 break-all font-mono text-xs" data-testid="registry-address">
            {registry.address}
          </p>
        ) : (
          <p className="mt-2 text-mute" data-testid="registry-missing">
            {registryError ?? "No local registry yet."} Start `npx hardhat node`, then `npm run deploy`.
          </p>
        )}
        <p className="mt-2 text-mute">Hardhat chain 31337 · {rpcUrl}</p>

        {alreadyIssued ? (
          <div className="mt-8">
            <p className="text-3xl font-medium tracking-tight" data-testid="credit-id">
              {formatCredit(existingId)}
            </p>
            <p className="mt-2">
              Status <span className="font-medium">{STATUS_LABEL[status ?? 0] ?? "Unknown"}</span>
            </p>
            {issuer ? <p className="mt-2 break-all font-mono text-xs text-mute">Issuer {issuer}</p> : null}
            {txHash ? <p className="mt-2 break-all font-mono text-xs text-mute">Last tx {txHash}</p> : null}

            {(mode === "local" || isConnected) && isIssuer && status === 1 ? (
              <div className="mt-8 space-y-4">
                <button type="button" className="btn btn-quiet" disabled={Boolean(busy)} onClick={onRetire} data-testid="retire">
                  {busy === "retire" ? "Retiring…" : "Retire this credit"}
                </button>
                <label className="block text-sm text-mute" htmlFor="contest-reason">
                  Contest note
                </label>
                <input
                  id="contest-reason"
                  value={contestReason}
                  onChange={(event) => setContestReason(event.target.value)}
                  className="field px-3 py-2"
                />
                <button type="button" className="btn btn-quiet" disabled={Boolean(busy)} onClick={onContest}>
                  {busy === "contest" ? "Sending…" : "Mark contested"}
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="mt-6 text-mute">{ready ? "This fingerprint is not a credit yet." : "No fingerprint to look up."}</p>
        )}
      </div>
    </div>
  );
}

function shorten(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function formatCredit(id: bigint): string {
  return `Credit ${id.toString().padStart(2, "0")}`;
}

function readStatus(credit: unknown): number | null {
  if (!credit || typeof credit !== "object") return null;
  const status = (credit as { status?: number | bigint }).status;
  if (typeof status === "bigint") return Number(status);
  if (typeof status === "number") return status;
  return null;
}

function readIssuer(credit: unknown): string | null {
  if (!credit || typeof credit !== "object") return null;
  const issuer = (credit as { issuer?: string }).issuer;
  return typeof issuer === "string" ? issuer : null;
}

function explainRevert(
  error: unknown,
): { kind: "already-used"; creditId: bigint } | { kind: "message"; message: string } {
  if (error instanceof BaseError) {
    const revert = error.walk((item) => item instanceof ContractFunctionRevertedError);
    if (revert instanceof ContractFunctionRevertedError && revert.data?.errorName === "EVIDENCE_ALREADY_USED") {
      const creditId = revert.data.args?.[1];
      if (typeof creditId === "bigint") return { kind: "already-used", creditId };
    }
    const message = error.shortMessage || error.message;
    if (/EVIDENCE_ALREADY_USED/.test(message)) {
      return { kind: "already-used", creditId: 0n };
    }
    return { kind: "message", message };
  }
  if (error instanceof Error) return { kind: "message", message: error.message };
  return { kind: "message", message: "The signature did not complete." };
}

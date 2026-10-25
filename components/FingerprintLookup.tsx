"use client";

import { useState } from "react";
import { type Address, type Hex } from "viem";
import { usePublicClient } from "wagmi";
import { CreditStatus } from "@/components/CreditStatus";
import { Banner, Spinner } from "@/components/ui";
import { appChain, explorerAddress, registryAddress } from "@/lib/chain";
import { creditProject } from "@/lib/credits";
import { creditRegistryAbi } from "@/lib/abi";
import { shorten } from "@/components/WalletButton";

type LookupResult = {
  id: bigint;
  evidenceHash: Hex;
  uri: string;
  issuer: Address;
  status: number;
};

export function FingerprintLookup() {
  const [fingerprint, setFingerprint] = useState("");
  const [result, setResult] = useState<LookupResult | null>(null);
  const [searched, setSearched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const publicClient = usePublicClient({ chainId: appChain.id });
  const validFingerprint = /^0x[0-9a-fA-F]{64}$/.test(fingerprint.trim());

  async function lookup() {
    if (!validFingerprint || !registryAddress || !publicClient) return;
    setBusy(true);
    setSearched(false);
    setResult(null);
    setError(null);
    setErrorDetails(null);
    try {
      const hash = fingerprint.trim() as Hex;
      const id = await publicClient.readContract({
        address: registryAddress,
        abi: creditRegistryAbi,
        functionName: "creditIdForEvidence",
        args: [hash],
      });
      if (id === 0n) {
        setSearched(true);
        return;
      }
      const value = await publicClient.readContract({
        address: registryAddress,
        abi: creditRegistryAbi,
        functionName: "getCredit",
        args: [id],
      });
      const credit = value as unknown as {
        evidenceHash: Hex;
        uri: string;
        issuer: Address;
        status: number | bigint;
      };
      setResult({
        id,
        evidenceHash: credit.evidenceHash,
        uri: credit.uri,
        issuer: credit.issuer,
        status: Number(credit.status),
      });
      setSearched(true);
    } catch (cause) {
      setError("We couldn't check this fingerprint right now. Please try again.");
      setErrorDetails(cause instanceof Error ? cause.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section>
        <p className="text-[13px] font-medium text-mute">Public registry</p>
        <h2 className="mt-2 font-display text-[32px] font-bold tracking-[-0.04em]">Check a fingerprint</h2>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-lead">
          Paste the report fingerprint to see whether a credit has been issued from it.
        </p>
      </section>

      {!registryAddress ? (
        <Banner tone="bad" title="The registry isn&apos;t deployed yet">
          You can check fingerprints after the Arc Testnet registry is deployed.
        </Banner>
      ) : (
        <section className="rounded-[16px] border border-line bg-sheet p-5 shadow-card sm:p-7">
          <label htmlFor="fingerprint" className="mb-2 block text-[14px] font-semibold text-ink">
            Report fingerprint
          </label>
          <input
            id="fingerprint"
            value={fingerprint}
            onChange={(event) => {
              setFingerprint(event.target.value);
              setResult(null);
              setSearched(false);
              setError(null);
            }}
            placeholder="0x…"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="field min-h-12 px-4 font-mono text-[14px]"
          />
          {fingerprint.trim() && !validFingerprint ? (
            <p className="mt-2 text-[13px] text-clay">Enter a 0x fingerprint with 64 letters or numbers after it.</p>
          ) : null}
          <button type="button" className="btn mt-4 w-full sm:w-auto" disabled={!validFingerprint || busy} onClick={lookup}>
            {busy ? <><Spinner /> Checking…</> : "Check fingerprint"}
          </button>
        </section>
      )}

      {error ? <Banner tone="bad" title="We couldn&apos;t check this fingerprint">{error}</Banner> : null}
      {searched && !result && !error ? (
        <div className="rounded-[14px] bg-sand px-5 py-4 text-[14px] leading-relaxed text-lead">
          No credit uses this report yet.
        </div>
      ) : null}
      {result ? (
        <section className="rounded-[16px] border border-line bg-sheet p-5 shadow-card sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-mute">Credit #{result.id.toString()}</p>
              <h3 className="mt-2 font-display text-[23px] font-semibold tracking-[-0.03em]">
                {creditProject(result.uri, result.evidenceHash)}
              </h3>
            </div>
            <CreditStatus status={result.status} />
          </div>
          <dl className="mt-5 grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
            <div>
              <dt className="text-[12px] font-medium text-mute">Report fingerprint</dt>
              <dd className="mt-1 break-all font-mono text-[12px] text-lead">{result.evidenceHash}</dd>
            </div>
            <div>
              <dt className="text-[12px] font-medium text-mute">Issued by</dt>
              <dd className="mt-1 text-[14px] text-lead">
                <a href={explorerAddress(result.issuer)} target="_blank" rel="noreferrer" className="link">
                  {shorten(result.issuer)}
                </a>
              </dd>
            </div>
          </dl>
        </section>
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

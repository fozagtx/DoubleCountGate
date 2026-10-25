"use client";

import Link from "next/link";
import { formatEther } from "viem";
import { useAccount, useBalance } from "wagmi";
import { CreditStatus } from "@/components/CreditStatus";
import { ArrowRightIcon, LeafIcon } from "@/components/Icons";
import { creditProject, type WalletCredit } from "@/lib/credits";
import { appChain, registryAddress } from "@/lib/chain";
import { shorten } from "@/components/WalletButton";
import { useWalletCredits } from "@/lib/use-wallet-credits";

export function Overview() {
  const { address, chainId } = useAccount();
  const balance = useBalance({
    address,
    chainId: appChain.id,
    query: { enabled: Boolean(address) },
  });
  const { credits, loading, error } = useWalletCredits(address);
  const retiredCount = credits.filter((credit) => credit.status === 2).length;

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-[13px] font-medium text-mute">Your account</p>
          <h2 className="mt-2 font-display text-[32px] font-bold tracking-[-0.04em] sm:text-[40px]">
            Welcome back, {address ? shorten(address) : "there"}.
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-lead">
            Keep track of the reports behind your credits.
          </p>
        </div>
        <Link href="/dashboard/check" className="btn w-full sm:w-auto">
          Check a new report <ArrowRightIcon />
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Wallet overview">
        <StatCard label="Hoodi ETH balance">
          {balance.data ? `${Number(formatEther(balance.data.value)).toFixed(4)} ETH` : balance.isLoading ? "Loading…" : "Unavailable"}
        </StatCard>
        <StatCard label="Network">
          <span className="inline-flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${chainId === appChain.id ? "bg-forest" : "bg-clay"}`} aria-hidden />
            {chainId === appChain.id ? "Hoodi" : "Switch to Hoodi"}
          </span>
        </StatCard>
        <StatCard label="Credits issued">{loading ? "…" : credits.length}</StatCard>
        <StatCard label="Credits retired">{loading ? "…" : retiredCount}</StatCard>
      </section>

      {balance.isError ? (
        <p className="rounded-[14px] bg-blush px-5 py-4 text-[14px] text-lead">
          We couldn&apos;t read this wallet&apos;s Hoodi balance right now.
        </p>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[18px] border border-line bg-sheet p-5 shadow-card sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-mute">Your credits</p>
              <h3 className="mt-2 font-display text-[24px] font-semibold tracking-[-0.03em]">Recent activity</h3>
            </div>
            <Link href="/dashboard/credits" className="link text-[14px]">View all</Link>
          </div>
          {error ? <p className="mt-5 rounded-[10px] bg-blush px-4 py-3 text-sm text-lead">{error}</p> : null}
          {loading ? <p className="mt-5 text-[14px] text-mute">Loading your credits…</p> : null}
          {!loading && !error && credits.length === 0 ? (
            <p className="mt-5 rounded-[12px] bg-paper px-4 py-4 text-[14px] leading-relaxed text-lead">
              You haven&apos;t issued any credits yet.
            </p>
          ) : null}
          {!loading && !error && credits.length > 0 ? (
            <ul className="mt-4 divide-y divide-line">
              {credits.slice(0, 4).map((credit) => <RecentCredit key={credit.id.toString()} credit={credit} />)}
            </ul>
          ) : null}
        </div>

        <Link
          href="/dashboard/check"
          className="group flex min-h-[220px] flex-col justify-between rounded-[18px] bg-forest p-6 text-sheet shadow-card transition-colors hover:bg-[#183d2e] sm:p-7"
        >
          <span className="grid h-11 w-11 place-items-center rounded-[12px] bg-white/10">
            <LeafIcon className="h-6 w-6" />
          </span>
          <span>
            <span className="block font-display text-[24px] font-semibold tracking-[-0.03em]">Check a new report</span>
            <span className="mt-2 block max-w-xs text-[14px] leading-relaxed text-white/75">
              Read a report, review its facts, and decide whether to issue a credit.
            </span>
          </span>
          <span className="mt-5 inline-flex items-center gap-2 text-[14px] font-semibold">
            Start checking <ArrowRightIcon className="transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </section>

      {!registryAddress ? (
        <p className="text-[12px] text-mute">Credit activity will appear here after the Hoodi registry is deployed.</p>
      ) : null}
    </div>
  );
}

function StatCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[14px] border border-line bg-sheet px-4 py-4 shadow-card sm:px-5">
      <p className="text-[12px] font-medium text-mute">{label}</p>
      <p className="mt-2 font-display text-[23px] font-semibold tracking-[-0.03em] text-ink">{children}</p>
    </div>
  );
}

function RecentCredit({ credit }: { credit: WalletCredit }) {
  return (
    <li className="flex items-center justify-between gap-3 py-4">
      <div className="min-w-0">
        <p className="truncate text-[14px] font-semibold text-ink">{creditProject(credit.uri, credit.evidenceHash)}</p>
        <p className="mt-1 text-[12px] text-mute">Credit #{credit.id.toString()}</p>
      </div>
      <CreditStatus status={credit.status} />
    </li>
  );
}

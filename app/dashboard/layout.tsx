"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAccount, useBalance, useDisconnect, useSwitchChain } from "wagmi";
import { WalletButton, shorten } from "@/components/WalletButton";
import { ChevronLeftIcon, ChevronRightIcon, DocIcon, FingerprintIcon, HomeIcon, LeafIcon } from "@/components/Icons";
import { appChain, faucetUrl, registryAddress, registryDeployBlock, rpcUrl } from "@/lib/chain";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: HomeIcon },
  { href: "/dashboard/check", label: "Check a report", icon: DocIcon },
  { href: "/dashboard/credits", label: "My credits", icon: LeafIcon },
  { href: "/dashboard/lookup", label: "Check a fingerprint", icon: FingerprintIcon },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { address, chainId, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: switching } = useSwitchChain();
  const [wasConnected, setWasConnected] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarLoaded, setSidebarLoaded] = useState(false);
  const balance = useBalance({
    address,
    chainId: appChain.id,
    query: { enabled: Boolean(address) },
  });

  useEffect(() => {
    if (isConnected) {
      setWasConnected(true);
    } else if (wasConnected) {
      router.push("/");
    }
  }, [isConnected, router, wasConnected]);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem("faircri.sidebar") === "collapsed");
    setSidebarLoaded(true);
  }, []);

  function toggleSidebar() {
    const next = !collapsed;
    setCollapsed(next);
    window.localStorage.setItem("faircri.sidebar", next ? "collapsed" : "expanded");
  }

  if (!isConnected || !address) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 py-12">
        <section className="w-full min-w-0 max-w-lg rounded-[20px] border border-line bg-sheet p-7 text-center shadow-card sm:p-10">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-[14px] bg-moss text-forest">
            <LeafIcon className="h-6 w-6" />
          </span>
          <h1 className="mt-6 break-words font-display text-[28px] font-bold tracking-[-0.035em] sm:text-[30px]">
            Your Faircri dashboard
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-lead">
            Connect your wallet to see your credits, check a report, or look up a fingerprint.
          </p>
          <div className="mt-6 flex justify-center">
            <WalletButton />
          </div>
        </section>
      </main>
    );
  }

  const title = navigation.find((item) => item.href === pathname)?.label ?? "Faircri";
  const wrongNetwork = chainId !== appChain.id;

  return (
    <div className="min-h-screen bg-paper text-ink">
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-line bg-sheet transition-[width] duration-200 md:flex ${
          collapsed ? "w-[76px]" : "w-64"
        }`}
        data-sidebar-loaded={sidebarLoaded}
      >
        <Link href="/dashboard" className="flex h-[76px] items-center gap-3 border-b border-line px-5 text-ink">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-forest text-sheet">
            <LeafIcon className="h-5 w-5" />
          </span>
          {!collapsed ? <span className="font-display text-[23px] font-bold tracking-[-0.04em]">faircri</span> : null}
        </Link>

        <nav className="flex-1 space-y-1 px-3 py-5" aria-label="Dashboard">
          {navigation.map((item) => (
            <DashboardLink key={item.href} {...item} collapsed={collapsed} active={pathname === item.href} />
          ))}
        </nav>

        <div className={`border-t border-line p-3 ${collapsed ? "items-center" : ""}`}>
          {collapsed ? (
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-sand text-sm font-semibold text-lead" title={shorten(address)}>
              {address.slice(2, 4).toUpperCase()}
            </div>
          ) : (
            <div className="mb-3 rounded-[12px] bg-paper px-3 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-mute">Connected wallet</p>
              <p className="mt-1 font-mono text-[13px] text-ink">{shorten(address)}</p>
            </div>
          )}
          <button
            type="button"
            className={`flex min-h-10 w-full items-center justify-center rounded-[9px] border border-line text-[13px] font-medium text-lead hover:bg-paper ${
              collapsed ? "px-2" : "px-3"
            }`}
            onClick={() => {
              disconnect();
              router.push("/");
            }}
            title="Disconnect wallet"
          >
            {collapsed ? "↗" : "Disconnect"}
          </button>
          <button
            type="button"
            className="mt-2 flex min-h-9 w-full items-center justify-center rounded-[9px] text-mute hover:bg-paper"
            onClick={toggleSidebar}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </button>
        </div>
      </aside>

      <div className={`min-h-screen transition-[padding] duration-200 ${collapsed ? "md:pl-[76px]" : "md:pl-64"}`}>
        <header className="sticky top-0 z-20 flex min-h-[76px] items-center justify-between gap-4 border-b border-line bg-paper/95 px-5 backdrop-blur md:px-8">
          <div>
            <p className="text-[12px] font-medium text-mute">Hoodi</p>
            <h1 className="font-display text-[21px] font-semibold tracking-[-0.025em]">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={`hidden items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium sm:inline-flex ${
              wrongNetwork ? "bg-blush text-clay" : "bg-moss text-forest"
            }`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
              {wrongNetwork ? "Switch network" : "Connected"}
            </span>
            <span className="rounded-full border border-line bg-sheet px-3 py-2 font-mono text-[12px] text-lead">
              {shorten(address)}
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-[1180px] px-5 pb-28 pt-7 md:px-8 md:pb-10 md:pt-9">
          {!registryAddress ? (
            <div className="mb-6 rounded-[12px] border border-line bg-sheet px-4 py-3 text-[14px] leading-relaxed text-lead">
              The Hoodi registry hasn&apos;t been deployed yet. You can explore the dashboard, but issuing and looking up
              credits will be available after deployment.
            </div>
          ) : null}
          {balance.data?.value === 0n ? (
            <div className="mb-6 rounded-[12px] bg-sand px-4 py-3 text-[14px] leading-relaxed text-lead">
              This wallet has no Hoodi ETH yet. Add free test ETH from the{" "}
              <a className="link" href={faucetUrl} target="_blank" rel="noreferrer">Hoodi faucet</a>.
            </div>
          ) : null}
          {wrongNetwork ? (
            <div className="mb-6 flex flex-col items-start justify-between gap-3 rounded-[12px] bg-blush px-4 py-4 sm:flex-row sm:items-center">
              <div>
                <p className="font-semibold text-ink">Your wallet is on a different network</p>
                <p className="mt-1 text-[14px] text-lead">Switch to Hoodi to use your credits.</p>
              </div>
              <button
                type="button"
                className="btn min-h-10 px-4 text-sm"
                disabled={switching}
                onClick={() => switchChain({ chainId: appChain.id })}
              >
                {switching ? "Switching…" : "Switch to Hoodi"}
              </button>
            </div>
          ) : null}
          {children}

          <details className="mt-10 border-t border-line pt-4 text-[12px] text-mute">
            <summary className="cursor-pointer font-medium">Technical details</summary>
            <dl className="mt-3 space-y-1 break-all font-mono">
              <div>Registry: {registryAddress ?? "Not deployed yet"}</div>
              <div>Chain ID: {appChain.id}</div>
              <div>Registry deploy block: {registryDeployBlock ?? "Not deployed yet"}</div>
              <div>RPC: {rpcUrl}</div>
            </dl>
          </details>
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-sheet/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur md:hidden" aria-label="Dashboard">
          {navigation.map((item) => (
            <DashboardLink key={item.href} {...item} collapsed={false} active={pathname === item.href} mobile />
          ))}
        </nav>
      </div>
    </div>
  );
}

function DashboardLink({
  href,
  label,
  icon: Icon,
  collapsed,
  active,
  mobile = false,
}: {
  href: string;
  label: string;
  icon: typeof HomeIcon;
  collapsed: boolean;
  active: boolean;
  mobile?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
      className={`flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-[13px] font-medium transition-colors ${
        mobile ? "min-h-14 flex-col justify-center gap-1 px-1 text-[10px]" : ""
      } ${active ? "bg-moss text-forest" : "text-lead hover:bg-paper"} ${collapsed && !mobile ? "justify-center px-1" : ""}`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      {!collapsed || mobile ? <span className="truncate">{label}</span> : null}
    </Link>
  );
}

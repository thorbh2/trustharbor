"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTableColumns, faFileSignature, faScaleBalanced, faUserShield, faGear, faBars, faXmark, faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { TrustHarborLogo } from "./TrustHarborLogo";
import { WalletConnect } from "./WalletConnect";
import { WALLETCONNECT_PROJECT_ID } from "@/app/providers";
import { hasContract, CONTRACT } from "@/lib/trustharbor";
import { CHAIN_ID } from "@/lib/studionet";
import { Hex } from "./ui";

const NAV = [
  { href: "/", label: "Deal workspace", icon: faTableColumns },
  { href: "/submit", label: "Submit proof", icon: faFileSignature },
  { href: "/disputes", label: "Disputes & appeals", icon: faScaleBalanced },
  { href: "/profile", label: "Profiles", icon: faUserShield },
  { href: "/admin", label: "Admin / status", icon: faGear },
];

export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [path]);
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[256px_1fr]">
      <aside className={`fixed inset-y-0 left-0 z-40 w-[256px] border-r border-line bg-surface transition-transform lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center justify-between border-b border-line px-4">
          <Link href="/"><TrustHarborLogo /></Link>
          <button type="button" className="text-muted lg:hidden" onClick={() => setOpen(false)}><FontAwesomeIcon icon={faXmark} /></button>
        </div>
        <nav className="space-y-1 p-3">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${active(n.href) ? "bg-primary/10 text-primary" : "text-secondary hover:bg-bg"}`}
            >
              <FontAwesomeIcon icon={n.icon} className="h-4 w-4" />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full border-t border-line p-3 text-[11px] text-muted">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> GenLayer Studionet · chain {CHAIN_ID}
          </div>
          <div className="mt-1.5">Contract {hasContract() ? <Hex value={CONTRACT} kind="contract" lead={6} tail={4} /> : <span className="text-accent">not set</span>}</div>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-secondary/40 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur lg:px-6">
          <button type="button" className="text-text lg:hidden" onClick={() => setOpen(true)} aria-label="Menu"><FontAwesomeIcon icon={faBars} /></button>
          <div className="hidden text-sm text-muted lg:block">Escrow &amp; milestone verification on GenLayer</div>
          <WalletConnect />
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 space-y-5 p-4 lg:p-6">
          {!WALLETCONNECT_PROJECT_ID && (
            <div className="flex items-start gap-2.5 rounded-md border border-accent/30 bg-accent/5 p-2.5 text-xs text-muted">
              <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5 h-3.5 w-3.5 text-accent" />
              <span><span className="font-semibold text-text">Local dev:</span> no WalletConnect project id set - injected wallets (MetaMask) work; the WalletConnect QR flow is disabled. Set <span className="mono">NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID</span> to enable it.</span>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserShield, faMagnifyingGlass, faBriefcase, faHandshake, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { ReputationChart } from "@/components/ReputationChart";
import { StatusChip, Banner, Empty, Skeleton, Hex, Stat } from "@/components/ui";
import { useLoader } from "@/lib/hooks";
import { getProfile, getClientDeals, getProviderDeals, hasContract } from "@/lib/trustharbor";

function repTier(score: number): { label: string; tone: "danger" | "accent" | "primary" | "success" } {
  if (score < 80) return { label: "Probation", tone: "danger" };
  if (score < 120) return { label: "Standard", tone: "accent" };
  if (score < 300) return { label: "Trusted", tone: "primary" };
  return { label: "Authority", tone: "success" };
}

export default function ProfilePage() {
  const { address } = useAccount();
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState("");
  useEffect(() => { if (address && !target) { setTarget(address); setQuery(address); } }, [address, target]);

  const profile = useLoader(() => (target ? getProfile(target) : Promise.resolve(null)), [target]);
  const clientDeals = useLoader(() => (target ? getClientDeals(target) : Promise.resolve([])), [target]);
  const providerDeals = useLoader(() => (target ? getProviderDeals(target) : Promise.resolve([])), [target]);

  if (!hasContract()) return <Banner tone="warn" title="No contract configured">Set the contract address to view profiles.</Banner>;

  const isValid = /^0x[0-9a-fA-F]{40}$/.test(query.trim());
  const p = profile.data;
  const tier = p ? repTier(p.reputationScore) : null;
  const toneClass = (t: string) => t === "danger" ? "text-danger" : t === "accent" ? "text-accent" : t === "success" ? "text-success" : "text-primary";
  const chipClass = (t: string) => t === "danger" ? "border-danger/40 text-danger bg-danger/10" : t === "accent" ? "border-accent/40 text-accent bg-accent/10" : t === "success" ? "border-success/40 text-success bg-success/10" : "border-primary/40 text-primary bg-primary/10";

  return (
    <div className="space-y-5">
      <div>
        <div className="label flex items-center gap-2"><FontAwesomeIcon icon={faUserShield} /> Reputation</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Profiles</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">On-chain reputation earned from completed milestones, releases, and dispute/appeal outcomes.</p>
      </div>

      <div className="card flex flex-wrap items-end gap-2 p-3">
        <label className="min-w-[260px] flex-1">
          <span className="label">Wallet address</span>
          <input className="field mt-1.5 mono" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="0x…" />
        </label>
        <button type="button" className="btn btn-primary" disabled={!isValid} onClick={() => setTarget(query.trim())}><FontAwesomeIcon icon={faMagnifyingGlass} className="h-3.5 w-3.5" /> Look up</button>
        {address && <button type="button" className="btn btn-ghost" onClick={() => { setQuery(address); setTarget(address); }}>My profile</button>}
      </div>

      {!target ? (
        <Empty icon={faUserShield} title="Enter an address" hint="Connect a wallet or paste an address to view its reputation." />
      ) : profile.loading && !p ? (
        <Skeleton className="h-40" />
      ) : profile.error ? (
        <Banner tone="danger" title="Failed to load profile" action={<button className="btn btn-ghost btn-xs" onClick={profile.reload}>Retry</button>}>{profile.error}</Banner>
      ) : !p ? (
        <Empty title="No profile" />
      ) : (
        <>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,300px)_1fr]">
            <div className="card space-y-3 p-4">
              <div className="text-xs text-muted">Address</div>
              <Hex value={p.address} lead={10} tail={8} />
              <div className="flex items-end justify-between border-t border-line pt-3">
                <div>
                  <div className="label">Reputation</div>
                  <div className={`text-3xl font-semibold tabular-nums ${toneClass(tier!.tone)}`}>{p.reputationScore}</div>
                </div>
                <span className={`chip ${chipClass(tier!.tone)}`}>{tier!.label}</span>
              </div>
              <div className="text-[11px] text-muted">Last activity tick {p.lastActivity}</div>
            </div>
            <div className="card p-4">
              <div className="label mb-2">Activity breakdown</div>
              <ReputationChart profile={p} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Deals created" value={p.dealsCreated} tone="primary" />
            <Stat label="Deals served" value={p.dealsServed} />
            <Stat label="Approved" value={p.milestonesApproved} tone="success" />
            <Stat label="Rejected" value={p.milestonesRejected} tone="danger" />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <section>
              <div className="mb-2 label flex items-center gap-2"><FontAwesomeIcon icon={faBriefcase} /> As client</div>
              {clientDeals.loading && !clientDeals.data ? <Skeleton className="h-24" /> :
                (clientDeals.data?.length ?? 0) === 0 ? <Empty title="No deals as client" /> :
                <div className="space-y-2">
                  {clientDeals.data!.slice(0, 8).map((d) => (
                    <Link key={d.dealId} href={`/deal/${d.dealId}`} className="card flex items-center justify-between gap-2 p-3 hover:bg-bg">
                      <span className="min-w-0"><span className="text-sm font-medium">{d.title}</span><span className="block truncate text-xs text-muted">{d.category}</span></span>
                      <span className="flex shrink-0 items-center gap-2"><StatusChip status={d.status} kind="deal" /><FontAwesomeIcon icon={faArrowRight} className="h-3 w-3 text-muted" /></span>
                    </Link>
                  ))}
                </div>}
            </section>
            <section>
              <div className="mb-2 label flex items-center gap-2"><FontAwesomeIcon icon={faHandshake} /> As provider</div>
              {providerDeals.loading && !providerDeals.data ? <Skeleton className="h-24" /> :
                (providerDeals.data?.length ?? 0) === 0 ? <Empty title="No deals as provider" /> :
                <div className="space-y-2">
                  {providerDeals.data!.slice(0, 8).map((d) => (
                    <Link key={d.dealId} href={`/deal/${d.dealId}`} className="card flex items-center justify-between gap-2 p-3 hover:bg-bg">
                      <span className="min-w-0"><span className="text-sm font-medium">{d.title}</span><span className="block truncate text-xs text-muted">{d.category}</span></span>
                      <span className="flex shrink-0 items-center gap-2"><StatusChip status={d.status} kind="deal" /><FontAwesomeIcon icon={faArrowRight} className="h-3 w-3 text-muted" /></span>
                    </Link>
                  ))}
                </div>}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

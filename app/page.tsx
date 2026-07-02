"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTableColumns, faPlus, faRotateRight, faChevronRight, faHandshake, faLayerGroup, faPlay, faChartColumn,
} from "@fortawesome/free-solid-svg-icons";
import { DealFlowChart } from "@/components/DealFlowChart";
import { StatusChip, Banner, Empty, Skeleton, Stat, Hex } from "@/components/ui";
import { ListInput } from "@/components/inputs";
import { useTx } from "@/components/Tx";
import { useLoader } from "@/lib/hooks";
import { getPublicStats, getRecentDeals, getActiveDeals, hasContract } from "@/lib/trustharbor";
import { isHttpUrl } from "@/lib/format";
import type { Deal } from "@/lib/types";

export default function WorkspacePage() {
  const [filter, setFilter] = useState<"recent" | "active">("recent");
  const [selected, setSelected] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const stats = useLoader(() => getPublicStats(), []);
  const deals = useLoader<Deal[]>(() => (filter === "active" ? getActiveDeals(60) : getRecentDeals(60)), [filter]);
  const all = useLoader<Deal[]>(() => getRecentDeals(100), []);

  const list = deals.data ?? [];
  const selectedDeal = useMemo(() => list.find((d) => d.dealId === selected) ?? list[0], [list, selected]);

  if (!hasContract()) {
    return <Banner tone="warn" title="No contract configured">Set <span className="mono">NEXT_PUBLIC_CONTRACT_ADDRESS</span> in <span className="mono">.env.local</span> to load live deals.</Banner>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="label flex items-center gap-2"><FontAwesomeIcon icon={faTableColumns} /> TrustHarbor</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Deal workspace</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">Create escrow deals, build milestones, and track AI-reviewed releases on GenLayer.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowCreate((v) => !v)}>
          <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" /> New deal
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.loading && !stats.data ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[76px]" />)
        ) : stats.error ? (
          <div className="col-span-full"><Banner tone="danger" title="Could not load stats" action={<button className="btn btn-ghost btn-xs" onClick={stats.reload}>Retry</button>}>{stats.error}</Banner></div>
        ) : (
          <>
            <Stat label="Deals" value={stats.data?.deals ?? 0} tone="primary" />
            <Stat label="Milestones" value={stats.data?.milestones ?? 0} />
            <Stat label="Released" value={stats.data?.releasedMilestones ?? 0} tone="success" />
            <Stat label="Open disputes" value={(stats.data?.openDisputes ?? 0) + (stats.data?.openAppeals ?? 0)} tone="accent" />
            <Stat label="Audit records" value={stats.data?.auditRecords ?? 0} />
          </>
        )}
      </div>

      {showCreate && <CreateDeal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); deals.reload(); stats.reload(); all.reload(); }} />}

      <div className="grid gap-5 lg:grid-cols-[1fr_minmax(0,380px)]">
        {/* Deal list */}
        <section className="card">
          <div className="flex items-center justify-between border-b border-line p-3">
            <div className="flex gap-1.5">
              {(["recent", "active"] as const).map((f) => (
                <button key={f} type="button" onClick={() => setFilter(f)} className={`btn btn-xs ${filter === f ? "btn-primary" : "btn-ghost"}`}>
                  {f === "recent" ? "Recent" : "Active"}
                </button>
              ))}
            </div>
            <button type="button" className="btn btn-ghost btn-xs" onClick={deals.reload}><FontAwesomeIcon icon={faRotateRight} className={`h-3 w-3 ${deals.loading ? "animate-spin" : ""}`} /> Refresh</button>
          </div>
          <div className="divide-y divide-line">
            {deals.loading && !deals.data ? (
              <div className="space-y-2 p-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
            ) : deals.error ? (
              <div className="p-3"><Banner tone="danger" title="Failed to load deals" action={<button className="btn btn-ghost btn-xs" onClick={deals.reload}>Retry</button>}>{deals.error}</Banner></div>
            ) : list.length === 0 ? (
              <Empty icon={faLayerGroup} title={filter === "active" ? "No active deals" : "No deals yet"} hint="Create a deal and add milestones to begin." />
            ) : (
              list.map((d) => (
                <button key={d.dealId} type="button" onClick={() => setSelected(d.dealId)} className={`flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-bg ${selectedDeal?.dealId === d.dealId ? "bg-bg" : ""}`}>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-line bg-bg text-primary"><FontAwesomeIcon icon={faHandshake} className="h-3.5 w-3.5" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-text">{d.title}</span>
                      <StatusChip status={d.status} kind="deal" />
                    </span>
                    <span className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                      <span className="truncate">{d.category}</span>
                      <span>· {d.milestoneIds.length} milestones</span>
                      {d.disputeIds.length > 0 && <span>· {d.disputeIds.length} disputes</span>}
                    </span>
                  </span>
                  <FontAwesomeIcon icon={faChevronRight} className="h-3 w-3 text-muted" />
                </button>
              ))
            )}
          </div>
        </section>

        {/* Right rail */}
        <section className="space-y-3">
          {selectedDeal ? (
            <DealRail deal={selectedDeal} onChanged={() => { deals.reload(); stats.reload(); all.reload(); }} />
          ) : (
            <div className="card"><Empty title="No deal selected" hint="Pick a deal to manage milestones and lifecycle." /></div>
          )}
        </section>
      </div>

      {/* Lower: D3 pipeline */}
      <section className="card p-4">
        <div className="mb-3 flex items-center gap-2"><FontAwesomeIcon icon={faChartColumn} className="h-3.5 w-3.5 text-primary" /><h2 className="text-sm font-semibold">Deal pipeline</h2></div>
        {all.loading && !all.data ? <Skeleton className="h-48" /> : <DealFlowChart deals={all.data ?? []} />}
      </section>
    </div>
  );
}

/* ── right rail: selected deal + milestone builder + activate ── */
function DealRail({ deal, onChanged }: { deal: Deal; onChanged: () => void }) {
  const { run, busy, address } = useTx();
  const isClient = !!address && deal.client.toLowerCase() === address.toLowerCase();
  const [mTitle, setMTitle] = useState("");
  const [criteria, setCriteria] = useState<string[]>([]);
  const [reqs, setReqs] = useState<string[]>([]);
  const [amount, setAmount] = useState("");
  const [due, setDue] = useState("");

  const addMilestone = async () => {
    const h = await run("Add milestone", "add_milestone", [deal.dealId, mTitle.trim(), criteria, reqs, amount.trim(), due.trim()]);
    if (h) { setMTitle(""); setCriteria([]); setReqs([]); setAmount(""); setDue(""); onChanged(); }
  };

  return (
    <>
      <div className="card space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-base font-semibold">{deal.title}</div>
            <div className="text-xs text-muted">{deal.category} · created tick {deal.createdAt}</div>
          </div>
          <StatusChip status={deal.status} kind="deal" />
        </div>
        <div className="space-y-1 text-xs text-muted">
          <div>Client <Hex value={deal.client} /></div>
          <div>Provider <Hex value={deal.provider} /></div>
          <div>Amount <span className="text-text">{deal.totalAmountLabel || "-"}</span></div>
        </div>
        <Link href={`/deal/${deal.dealId}`} className="btn btn-ghost w-full justify-center">Open deal #{deal.dealId} <FontAwesomeIcon icon={faChevronRight} className="h-3 w-3" /></Link>
        {isClient && deal.status === "draft" && (
          <button className="btn btn-primary w-full justify-center" disabled={busy || deal.milestoneIds.length === 0} onClick={() => run("Activate deal", "activate_deal", [deal.dealId]).then((h) => h && onChanged())}>
            <FontAwesomeIcon icon={faPlay} className="h-3 w-3" /> Activate deal
          </button>
        )}
      </div>

      {isClient && (deal.status === "draft" || deal.status === "active") && (
        <div className="card space-y-3 p-4">
          <h3 className="text-sm font-semibold">Add milestone</h3>
          <label className="block"><span className="label">Title</span><input className="field mt-1.5" value={mTitle} onChange={(e) => setMTitle(e.target.value)} placeholder="Repository and setup proof" /></label>
          <ListInput label="Acceptance criteria (required)" items={criteria} onChange={setCriteria} placeholder="README exists" max={12} />
          <ListInput label="Proof requirements" items={reqs} onChange={setReqs} placeholder="repository URL" max={12} />
          <div className="grid grid-cols-2 gap-2">
            <label className="block"><span className="label">Amount label</span><input className="field mt-1.5" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="50%" /></label>
            <label className="block"><span className="label">Due label</span><input className="field mt-1.5" value={due} onChange={(e) => setDue(e.target.value)} placeholder="On delivery" /></label>
          </div>
          <button className="btn btn-primary w-full justify-center" disabled={busy || !mTitle.trim() || criteria.length === 0} onClick={addMilestone}>{busy ? "Submitting…" : "Add milestone"}</button>
        </div>
      )}
    </>
  );
}

/* ── create deal ── */
function CreateDeal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { run, busy, connected, wrongNetwork } = useTx();
  const [provider, setProvider] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Web Delivery");
  const [amount, setAmount] = useState("");
  const [terms, setTerms] = useState<string[]>([]);

  const valid = /^0x[0-9a-fA-F]{40}$/.test(provider.trim()) && title.trim() && description.trim();

  const submit = async () => {
    const h = await run("Create deal", "create_deal", [provider.trim(), title.trim(), description.trim(), category.trim() || "Other", amount.trim(), terms]);
    if (h) onCreated();
  };

  return (
    <div className="card space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">New escrow deal</h2>
        <button type="button" className="text-xs text-muted hover:text-text" onClick={onClose}>Cancel</button>
      </div>
      {!connected && <Banner tone="warn" title="Connect a wallet">Use the Connect button to sign the create transaction.</Banner>}
      {connected && wrongNetwork && <Banner tone="warn" title="Wrong network">Switch to GenLayer Studionet; we’ll prompt automatically on submit.</Banner>}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2"><span className="label">Provider address</span><input className="field mt-1.5 mono" value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="0x… (the wallet delivering the work)" /></label>
        <label className="block"><span className="label">Title</span><input className="field mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Website launch verification escrow" /></label>
        <label className="block"><span className="label">Category</span><input className="field mt-1.5" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Web Delivery" /></label>
        <label className="block sm:col-span-2"><span className="label">Description</span><textarea className="field mt-1.5 min-h-[80px]" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this escrow deal covers…" /></label>
        <label className="block"><span className="label">Total amount label</span><input className="field mt-1.5" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Demo escrow - no real funds" /></label>
      </div>
      <ListInput label="Terms URLs" items={terms} onChange={setTerms} placeholder="https://docs.example/terms" max={5} validate={(v) => (isHttpUrl(v) ? null : "Must be an http(s) URL.")} />
      <div className="flex items-center justify-end gap-2">
        <button type="button" className="btn btn-ghost" onClick={onClose}>Discard</button>
        <button type="button" className="btn btn-primary" disabled={!valid || busy} onClick={submit}>{busy ? "Submitting…" : "Create deal"}</button>
      </div>
    </div>
  );
}

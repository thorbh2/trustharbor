"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft, faHandshake, faMagnifyingGlassChart, faGavel, faScaleBalanced, faMoneyBillTransfer,
  faPlay, faBan, faBoxArchive, faRotateRight, faLayerGroup, faClockRotateLeft, faLink, faFileArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import { AuditTimeline } from "@/components/AuditTimeline";
import { StatusChip, VerdictBadge, Banner, Empty, Skeleton, Hex, ExtLink } from "@/components/ui";
import { ListInput } from "@/components/inputs";
import { useTx } from "@/components/Tx";
import { useLoader } from "@/lib/hooks";
import { getDeal, getDealMilestones, getDealDisputes, getAuditTrail, hasContract } from "@/lib/trustharbor";
import { hostOf, isHttpUrl } from "@/lib/format";
import type { Milestone } from "@/lib/types";

type Tab = "milestones" | "disputes" | "audit";

export default function DealDetailPage() {
  const id = String(useParams().id);
  const [tab, setTab] = useState<Tab>("milestones");
  const { run, busy, address } = useTx();

  const deal = useLoader(() => getDeal(id), [id]);
  const milestones = useLoader(() => getDealMilestones(id), [id]);
  const disputes = useLoader(() => getDealDisputes(id), [id]);
  const audit = useLoader(() => getAuditTrail(id), [id]);

  const reloadAll = () => { deal.reload(); milestones.reload(); disputes.reload(); audit.reload(); };
  const d = deal.data;
  const isClient = !!address && !!d && d.client.toLowerCase() === address.toLowerCase();

  if (!hasContract()) return <Banner tone="warn" title="No contract configured">Set the contract address to view this deal.</Banner>;

  return (
    <div className="space-y-5">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-text"><FontAwesomeIcon icon={faArrowLeft} className="h-3 w-3" /> Deal workspace</Link>

      {deal.loading && !d ? (
        <Skeleton className="h-28" />
      ) : deal.error ? (
        <Banner tone="danger" title="Failed to load deal" action={<button className="btn btn-ghost btn-xs" onClick={deal.reload}>Retry</button>}>{deal.error}</Banner>
      ) : !d ? (
        <Empty title={`Deal #${id} not found`} hint="It may not exist on this contract." />
      ) : (
        <>
          <div className="grid gap-5 lg:grid-cols-[1fr_minmax(0,340px)]">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="label flex items-center gap-2"><FontAwesomeIcon icon={faHandshake} /> Deal #{d.dealId} · {d.category}</div>
                  <h1 className="mt-1 text-2xl font-semibold tracking-tight">{d.title}</h1>
                  <p className="mt-1 max-w-2xl text-sm text-muted">{d.description}</p>
                </div>
                <StatusChip status={d.status} kind="deal" />
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                <span>Client <Hex value={d.client} /></span>
                <span>Provider <Hex value={d.provider} /></span>
                <span>Amount <span className="text-text">{d.totalAmountLabel || "-"}</span></span>
                <span>Milestones <span className="mono text-text">{d.milestoneIds.length}</span></span>
              </div>
              {d.termsUrls.length > 0 && (
                <div className="flex flex-wrap gap-2 text-xs">
                  {d.termsUrls.map((u) => <ExtLink key={u} href={u}><FontAwesomeIcon icon={faLink} className="h-2.5 w-2.5" /> {hostOf(u)}</ExtLink>)}
                </div>
              )}
            </div>

            {isClient && (
              <div className="card space-y-2 p-3">
                <div className="label">Client controls</div>
                <div className="flex flex-wrap gap-2">
                  {d.status === "draft" && <button className="btn btn-primary btn-xs" disabled={busy || d.milestoneIds.length === 0} onClick={() => run("Activate deal", "activate_deal", [d.dealId]).then((h) => h && reloadAll())}><FontAwesomeIcon icon={faPlay} className="h-3 w-3" /> Activate</button>}
                  {!["completed", "cancelled", "archived"].includes(d.status) && <button className="btn btn-ghost btn-xs" disabled={busy} onClick={() => run("Cancel deal", "cancel_deal", [d.dealId]).then((h) => h && reloadAll())}><FontAwesomeIcon icon={faBan} className="h-3 w-3" /> Cancel</button>}
                  {["completed", "cancelled"].includes(d.status) && <button className="btn btn-ghost btn-xs" disabled={busy} onClick={() => run("Archive deal", "archive_deal", [d.dealId]).then((h) => h && reloadAll())}><FontAwesomeIcon icon={faBoxArchive} className="h-3 w-3" /> Archive</button>}
                </div>
                {d.status === "draft" && <p className="text-[11px] text-muted">Add at least one milestone, then activate so the provider can submit proof.</p>}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-b border-line">
            <div className="flex gap-1">
              {([["milestones", faLayerGroup, milestones.data?.length ?? 0], ["disputes", faGavel, disputes.data?.length ?? 0], ["audit", faClockRotateLeft, audit.data?.length ?? 0]] as const).map(([t, icon, n]) => (
                <button key={t} type="button" onClick={() => setTab(t)} className={`-mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium capitalize ${tab === t ? "border-primary text-primary" : "border-transparent text-muted hover:text-text"}`}>
                  <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5" /> {t} <span className="mono text-xs opacity-70">{n}</span>
                </button>
              ))}
            </div>
            <button type="button" className="btn btn-ghost btn-xs" onClick={reloadAll}><FontAwesomeIcon icon={faRotateRight} className="h-3 w-3" /> Refresh</button>
          </div>

          {tab === "milestones" && <MilestonesTab dealId={id} milestones={milestones.data} loading={milestones.loading} error={milestones.error} reload={milestones.reload} onAction={reloadAll} run={run} busy={busy} isClient={isClient} />}
          {tab === "disputes" && (
            disputes.loading && !disputes.data ? <Skeleton className="h-24" /> :
            (disputes.data?.length ?? 0) === 0 ? <Empty icon={faGavel} title="No disputes on this deal" /> :
            <div className="space-y-3">
              {disputes.data!.map((c) => (
                <div key={c.disputeId} className="card space-y-2 p-3.5">
                  <div className="flex items-center justify-between"><span className="text-sm font-semibold">Dispute #{c.disputeId} <span className="font-normal text-muted">· milestone #{c.milestoneId}</span></span><StatusChip status={c.status} kind="decision" /></div>
                  <p className="text-sm text-muted">{c.reason}</p>
                  <div className="text-xs text-muted">by <Hex value={c.opener} /></div>
                </div>
              ))}
            </div>
          )}
          {tab === "audit" && (
            audit.loading && !audit.data ? <Skeleton className="h-40" /> :
            (audit.data?.length ?? 0) === 0 ? <Empty icon={faClockRotateLeft} title="No audit records" /> :
            <div className="card p-4"><AuditTimeline records={audit.data!} /></div>
          )}
        </>
      )}
    </div>
  );
}

function MilestonesTab({
  dealId, milestones, loading, error, reload, onAction, run, busy, isClient,
}: {
  dealId: string; milestones?: Milestone[]; loading: boolean; error: string | null; reload: () => void;
  onAction: () => void; run: ReturnType<typeof useTx>["run"]; busy: boolean; isClient: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [mode, setMode] = useState<"dispute" | "appeal" | null>(null);
  const [reason, setReason] = useState("");
  const [urls, setUrls] = useState<string[]>([]);

  if (loading && !milestones) return <div className="space-y-2">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>;
  if (error) return <Banner tone="danger" title="Failed to load milestones" action={<button className="btn btn-ghost btn-xs" onClick={reload}>Retry</button>}>{error}</Banner>;
  if (!milestones || milestones.length === 0) return <Empty icon={faLayerGroup} title="No milestones yet" hint="The client adds milestones from the workspace, then activates the deal." />;

  const startDispute = (mid: string, m: "dispute" | "appeal") => { setOpenId(mid); setMode(m); setReason(""); setUrls([]); };
  const submitDispute = async (mil: Milestone) => {
    const fn = mode === "dispute" ? "open_dispute" : "file_appeal";
    const label = mode === "dispute" ? "Open dispute" : "File appeal";
    const h = await run(label, fn, [dealId, mil.milestoneId, reason.trim(), urls]);
    if (h) { setOpenId(null); setMode(null); onAction(); }
  };

  return (
    <div className="space-y-3">
      {milestones.map((m) => (
        <div key={m.milestoneId} className="card p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">#{m.milestoneId} {m.title}</span>
                <StatusChip status={m.status} kind="milestone" />
                <VerdictBadge verdict={m.verdict} score={m.score} />
              </div>
              <div className="mt-1 text-xs text-muted">{m.amountLabel || "-"} · due {m.dueLabel || "-"}</div>
            </div>
          </div>

          <div className="mt-2 grid gap-3 text-xs sm:grid-cols-2">
            <div>
              <div className="label">Acceptance criteria</div>
              <ul className="mt-1 list-disc pl-4 text-muted">{m.acceptanceCriteria.map((c, i) => <li key={i}>{c}</li>)}</ul>
            </div>
            {m.reviewSummary && (
              <div>
                <div className="label">AI review</div>
                <p className="mt-1 text-muted">{m.reviewSummary}</p>
                {m.criteriaMissing.length > 0 && <p className="mt-1 text-danger">Missing: {m.criteriaMissing.join(", ")}</p>}
              </div>
            )}
          </div>
          {m.proofUrls.length > 0 && (
            <div className="mt-2">
              <div className="label">Submitted proof</div>
              <div className="mt-1 flex flex-wrap gap-2 text-xs">{m.proofUrls.map((u) => <ExtLink key={u} href={u}>{hostOf(u)}</ExtLink>)}</div>
              {m.providerNote && <p className="mt-1 text-xs text-muted">“{m.providerNote}”</p>}
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
            {m.status === "submitted" && <button className="btn btn-primary btn-xs" disabled={busy} onClick={() => run("Review milestone", "review_milestone", [dealId, m.milestoneId]).then((h) => h && onAction())}><FontAwesomeIcon icon={faMagnifyingGlassChart} className="h-3 w-3" /> Run AI review</button>}
            {isClient && m.status === "approved" && <button className="btn btn-accent btn-xs" disabled={busy} onClick={() => run("Release milestone", "release_milestone", [dealId, m.milestoneId]).then((h) => h && onAction())}><FontAwesomeIcon icon={faMoneyBillTransfer} className="h-3 w-3" /> Release</button>}
            {["approved", "revision_requested", "rejected"].includes(m.status) && <button className="btn btn-ghost btn-xs" disabled={busy} onClick={() => startDispute(m.milestoneId, "dispute")}><FontAwesomeIcon icon={faGavel} className="h-3 w-3" /> Dispute</button>}
            {["rejected", "revision_requested", "disputed", "approved"].includes(m.status) && <button className="btn btn-ghost btn-xs" disabled={busy} onClick={() => startDispute(m.milestoneId, "appeal")}><FontAwesomeIcon icon={faScaleBalanced} className="h-3 w-3" /> Appeal</button>}
            {m.status === "pending" && <Link href="/submit" className="btn btn-ghost btn-xs"><FontAwesomeIcon icon={faFileArrowUp} className="h-3 w-3" /> Submit proof</Link>}
          </div>

          {openId === m.milestoneId && mode && (
            <div className="mt-3 space-y-3 rounded-md border border-line bg-bg p-3">
              <div className="text-sm font-semibold capitalize">{mode} milestone #{m.milestoneId}</div>
              <label className="block"><span className="label">Reason</span><textarea className="field mt-1.5 min-h-[72px]" value={reason} onChange={(e) => setReason(e.target.value)} placeholder={mode === "dispute" ? "Why is this review wrong?" : "Why should this be reconsidered?"} /></label>
              <ListInput label="Evidence URLs" items={urls} onChange={setUrls} placeholder="https://source.example/evidence" max={6} validate={(v) => (isHttpUrl(v) ? null : "Must be an http(s) URL.")} />
              <div className="flex justify-end gap-2">
                <button className="btn btn-ghost btn-xs" onClick={() => { setOpenId(null); setMode(null); }}>Cancel</button>
                <button className="btn btn-primary btn-xs" disabled={busy || !reason.trim()} onClick={() => submitDispute(m)}>{busy ? "Submitting…" : `Submit ${mode}`}</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGavel, faScaleBalanced, faRotateRight, faArrowRight, faBolt } from "@fortawesome/free-solid-svg-icons";
import { Banner, Empty, Skeleton, Hex, ExtLink, StatusChip } from "@/components/ui";
import { useTx } from "@/components/Tx";
import { useLoader } from "@/lib/hooks";
import { getOpenDisputes, getOpenAppeals, hasContract } from "@/lib/trustharbor";
import { hostOf } from "@/lib/format";

type Tab = "disputes" | "appeals";

export default function DisputesPage() {
  const [tab, setTab] = useState<Tab>("disputes");
  const { run, busy, connected } = useTx();
  const disputes = useLoader(() => getOpenDisputes(60), []);
  const appeals = useLoader(() => getOpenAppeals(60), []);

  if (!hasContract()) return <Banner tone="warn" title="No contract configured">Set the contract address to view disputes.</Banner>;

  const resolveD = (id: string) => run("Resolve dispute", "resolve_dispute", [id]).then((h) => h && disputes.reload());
  const resolveA = (id: string) => run("Resolve appeal", "resolve_appeal", [id]).then((h) => h && appeals.reload());

  return (
    <div className="space-y-5">
      <div>
        <div className="label flex items-center gap-2"><FontAwesomeIcon icon={faScaleBalanced} /> Adjudication queue</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Disputes &amp; appeals</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">Open disputes and appeals are re-adjudicated by the AI reviewer against the milestone’s acceptance criteria and fresh evidence.</p>
      </div>

      {!connected && <Banner tone="info" title="Read-only">Connect a wallet to resolve; anyone can trigger AI resolution.</Banner>}

      <div className="flex items-center justify-between border-b border-line">
        <div className="flex gap-1">
          {([["disputes", faGavel, disputes.data?.length ?? 0], ["appeals", faScaleBalanced, appeals.data?.length ?? 0]] as const).map(([t, icon, n]) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={`-mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium capitalize ${tab === t ? "border-primary text-primary" : "border-transparent text-muted hover:text-text"}`}>
              <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5" /> {t} <span className="mono text-xs opacity-70">{n}</span>
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-ghost btn-xs" onClick={() => { disputes.reload(); appeals.reload(); }}><FontAwesomeIcon icon={faRotateRight} className="h-3 w-3" /> Refresh</button>
      </div>

      {tab === "disputes" ? (
        disputes.loading && !disputes.data ? <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div> :
        disputes.error ? <Banner tone="danger" title="Failed to load disputes" action={<button className="btn btn-ghost btn-xs" onClick={disputes.reload}>Retry</button>}>{disputes.error}</Banner> :
        (disputes.data?.length ?? 0) === 0 ? <Empty icon={faGavel} title="No open disputes" hint="Resolved disputes are recorded in each deal’s audit trail." /> :
        <div className="space-y-3">
          {disputes.data!.map((c) => (
            <div key={c.disputeId} className="card space-y-2 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Dispute #{c.disputeId} <span className="font-normal text-muted">· deal #{c.dealId} · milestone #{c.milestoneId}</span></span>
                <StatusChip status={c.status} kind="decision" />
              </div>
              <p className="text-sm text-muted">{c.reason}</p>
              {c.evidenceUrls.length > 0 && <div className="flex flex-wrap gap-2 text-xs">{c.evidenceUrls.map((u) => <ExtLink key={u} href={u}>{hostOf(u)}</ExtLink>)}</div>}
              <div className="flex items-center justify-between border-t border-line pt-2 text-xs text-muted">
                <span>by <Hex value={c.opener} /></span>
                <div className="flex items-center gap-2">
                  <Link href={`/deal/${c.dealId}`} className="text-primary hover:underline">deal #{c.dealId} <FontAwesomeIcon icon={faArrowRight} className="h-2.5 w-2.5" /></Link>
                  <button className="btn btn-primary btn-xs" disabled={busy} onClick={() => resolveD(c.disputeId)}><FontAwesomeIcon icon={faBolt} className="h-3 w-3" /> Resolve</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        appeals.loading && !appeals.data ? <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div> :
        appeals.error ? <Banner tone="danger" title="Failed to load appeals" action={<button className="btn btn-ghost btn-xs" onClick={appeals.reload}>Retry</button>}>{appeals.error}</Banner> :
        (appeals.data?.length ?? 0) === 0 ? <Empty icon={faScaleBalanced} title="No open appeals" hint="Appeals can be filed on rejected, revision, disputed or approved milestones." /> :
        <div className="space-y-3">
          {appeals.data!.map((a) => (
            <div key={a.appealId} className="card space-y-2 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Appeal #{a.appealId} <span className="font-normal text-muted">· deal #{a.dealId} · milestone #{a.milestoneId}</span></span>
                <StatusChip status={a.status} kind="decision" />
              </div>
              <p className="text-sm text-muted">{a.reason}</p>
              {a.evidenceUrls.length > 0 && <div className="flex flex-wrap gap-2 text-xs">{a.evidenceUrls.map((u) => <ExtLink key={u} href={u}>{hostOf(u)}</ExtLink>)}</div>}
              <div className="flex items-center justify-between border-t border-line pt-2 text-xs text-muted">
                <span>by <Hex value={a.appellant} /></span>
                <div className="flex items-center gap-2">
                  <Link href={`/deal/${a.dealId}`} className="text-primary hover:underline">deal #{a.dealId} <FontAwesomeIcon icon={faArrowRight} className="h-2.5 w-2.5" /></Link>
                  <button className="btn btn-primary btn-xs" disabled={busy} onClick={() => resolveA(a.appealId)}><FontAwesomeIcon icon={faBolt} className="h-3 w-3" /> Resolve</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

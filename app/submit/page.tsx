"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileArrowUp, faCircleCheck, faArrowRight, faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import { StatusChip, Banner, Empty, Skeleton } from "@/components/ui";
import { ListInput } from "@/components/inputs";
import { useTx } from "@/components/Tx";
import { useLoader } from "@/lib/hooks";
import { getActiveDeals, getDealMilestones, hasContract } from "@/lib/trustharbor";
import { isHttpUrl } from "@/lib/format";
import type { Milestone } from "@/lib/types";

export default function SubmitPage() {
  const { run, busy, connected, wrongNetwork, address } = useTx();
  const deals = useLoader(() => getActiveDeals(60), []);
  const [dealId, setDealId] = useState("");
  const [milestoneId, setMilestoneId] = useState("");
  const [note, setNote] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const [done, setDone] = useState<string | null>(null);

  const list = deals.data ?? [];
  const selected = list.find((d) => d.dealId === dealId);
  const ms = useLoader<Milestone[]>(() => (dealId ? getDealMilestones(dealId) : Promise.resolve([])), [dealId]);
  const submittable = (ms.data ?? []).filter((m) => ["pending", "revision_requested"].includes(m.status));
  useEffect(() => { setMilestoneId(""); }, [dealId]);

  const milestone = submittable.find((m) => m.milestoneId === milestoneId);
  const isProvider = !!address && !!selected && selected.provider.toLowerCase() === address.toLowerCase();
  const valid = !!selected && !!milestone && urls.length > 0;

  const submit = async () => {
    if (!selected || !milestone) return;
    const h = await run("Submit proof", "submit_milestone_proof", [selected.dealId, milestone.milestoneId, urls, note.trim()]);
    if (h) { setDone(selected.dealId); setUrls([]); setNote(""); ms.reload(); }
  };

  if (!hasContract()) return <Banner tone="warn" title="No contract configured">Set the contract address to submit proof.</Banner>;

  return (
    <div className="space-y-5">
      <div>
        <div className="label flex items-center gap-2"><FontAwesomeIcon icon={faFileArrowUp} /> Provider intake</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Submit milestone proof</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">Attach evidence for a milestone. The AI reviewer reads each source live and recommends release, revision, or reject.</p>
      </div>

      {!connected && <Banner tone="warn" title="Connect a wallet">Connect your wallet to submit proof.</Banner>}
      {connected && wrongNetwork && <Banner tone="warn" title="Wrong network">Switch to GenLayer Studionet - we’ll prompt on submit.</Banner>}
      {selected && connected && !isProvider && <Banner tone="warn" title="Not the provider">Only the deal’s provider can submit proof. The contract will reject other senders.</Banner>}
      {done && <Banner tone="ok" title="Proof submitted" action={<Link className="btn btn-ghost btn-xs" href={`/deal/${done}`}>Open deal <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3" /></Link>}>It now awaits AI review on deal #{done}.</Banner>}

      <div className="grid gap-5 lg:grid-cols-[1fr_minmax(0,360px)]">
        <div className="card space-y-4 p-4">
          <div>
            <span className="label">Target deal</span>
            {deals.loading && !deals.data ? <Skeleton className="mt-1.5 h-10" /> :
              deals.error ? <div className="mt-1.5"><Banner tone="danger" title="Failed to load deals" action={<button className="btn btn-ghost btn-xs" onClick={deals.reload}>Retry</button>}>{deals.error}</Banner></div> :
              list.length === 0 ? <div className="mt-1.5"><Empty title="No active deals" hint="A client must activate a deal before proof can be submitted." /></div> :
              <select className="field mt-1.5" value={dealId} onChange={(e) => setDealId(e.target.value)}>
                <option value="">Select a deal…</option>
                {list.map((d) => <option key={d.dealId} value={d.dealId}>#{d.dealId} - {d.title}</option>)}
              </select>}
          </div>

          {selected && (
            <div>
              <span className="label">Milestone</span>
              {ms.loading && !ms.data ? <Skeleton className="mt-1.5 h-10" /> :
                submittable.length === 0 ? <div className="mt-1.5"><Empty icon={faLayerGroup} title="No submittable milestones" hint="Milestones must be pending or in revision to accept proof." /></div> :
                <select className="field mt-1.5" value={milestoneId} onChange={(e) => setMilestoneId(e.target.value)}>
                  <option value="">Select a milestone…</option>
                  {submittable.map((m) => <option key={m.milestoneId} value={m.milestoneId}>#{m.milestoneId} - {m.title} ({m.status.replace(/_/g, " ")})</option>)}
                </select>}
            </div>
          )}

          <ListInput label="Proof URLs (required, max 6)" items={urls} onChange={setUrls} placeholder="https://github.com/org/repo" max={6} validate={(v) => (isHttpUrl(v) ? null : "Must be an http(s) URL.")} />
          <label className="block">
            <span className="label">Provider note</span>
            <textarea className="field mt-1.5 min-h-[100px]" value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} placeholder="Summarize how the evidence meets the acceptance criteria…" />
          </label>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">{valid ? <span className="inline-flex items-center gap-1 text-success"><FontAwesomeIcon icon={faCircleCheck} className="h-3 w-3" /> Ready</span> : "Select a deal + milestone and add at least one proof URL."}</span>
            <button type="button" className="btn btn-primary" disabled={!valid || busy} onClick={submit}>{busy ? "Submitting…" : "Submit proof"}</button>
          </div>
        </div>

        <div className="space-y-3">
          {milestone ? (
            <div className="card space-y-2 p-4">
              <div className="text-sm font-semibold">{milestone.title}</div>
              <StatusChip status={milestone.status} kind="milestone" />
              <div className="label mt-1">Acceptance criteria</div>
              <ul className="list-disc space-y-0.5 pl-4 text-xs text-muted">{milestone.acceptanceCriteria.map((c, i) => <li key={i}>{c}</li>)}</ul>
              {milestone.proofRequirements.length > 0 && (<><div className="label mt-1">Proof requirements</div><ul className="list-disc space-y-0.5 pl-4 text-xs text-muted">{milestone.proofRequirements.map((c, i) => <li key={i}>{c}</li>)}</ul></>)}
            </div>
          ) : (
            <div className="card"><Empty icon={faFileArrowUp} title="Pick a milestone" hint="Select a deal and milestone to see its acceptance criteria." /></div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faRotateRight, faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { Banner, Skeleton, Stat, Hex, Copy } from "@/components/ui";
import { useLoader } from "@/lib/hooks";
import { getPublicStats, hasContract, CONTRACT } from "@/lib/trustharbor";
import { DEPLOYMENT } from "@/lib/deployment";
import { explorerAddr, explorerContract, explorerTx, truncateHex } from "@/lib/format";

export default function AdminPage() {
  const stats = useLoader(() => getPublicStats(), []);
  const contract = hasContract() ? CONTRACT : DEPLOYMENT.contractAddress;

  return (
    <div className="space-y-5">
      <div>
        <div className="label flex items-center gap-2"><FontAwesomeIcon icon={faGear} /> Operations</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Admin &amp; status</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">Contract address, explorer links, on-chain smoke proof, and live public statistics.</p>
      </div>

      {!hasContract() && <Banner tone="warn" title="Frontend contract address not set">Showing the recorded deployment address. Set <span className="mono">NEXT_PUBLIC_CONTRACT_ADDRESS</span> to enable live reads.</Banner>}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="card space-y-3 p-4">
          <div className="label">Contract</div>
          <div className="flex items-center gap-2"><Hex value={contract} lead={12} tail={10} /></div>
          <div className="grid gap-2 text-xs">
            <div className="flex items-center justify-between"><span className="text-muted">Network</span><span className="text-text">{DEPLOYMENT.network} · chain {DEPLOYMENT.chainId}</span></div>
            <div className="flex items-center justify-between"><span className="text-muted">Deployer</span><Hex value={DEPLOYMENT.deployer} /></div>
            <div className="flex items-center justify-between"><span className="text-muted">Deploy tx</span><Hex value={DEPLOYMENT.deployTxHash} kind="tx" /></div>
            <div className="flex items-center justify-between"><span className="text-muted">Faucet tx</span><Hex value={DEPLOYMENT.faucetTxHash} kind="tx" /></div>
          </div>
          <div className="flex gap-2 pt-1">
            <a className="btn btn-ghost btn-xs" href={explorerContract(contract)} target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-3 w-3" /> Contract on explorer</a>
            <a className="btn btn-ghost btn-xs" href={explorerTx(DEPLOYMENT.deployTxHash)} target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-3 w-3" /> Deploy tx</a>
          </div>
        </div>

        <div className="card p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="label">Live public stats</div>
            <button type="button" className="btn btn-ghost btn-xs" onClick={stats.reload}><FontAwesomeIcon icon={faRotateRight} className={`h-3 w-3 ${stats.loading ? "animate-spin" : ""}`} /> Refresh</button>
          </div>
          {stats.loading && !stats.data ? <Skeleton className="h-28" /> :
            stats.error ? <Banner tone="danger" title="Could not load stats" action={<button className="btn btn-ghost btn-xs" onClick={stats.reload}>Retry</button>}>{stats.error}</Banner> :
            <div className="grid grid-cols-3 gap-2">
              <Stat label="Deals" value={stats.data?.deals ?? 0} tone="primary" />
              <Stat label="Milestones" value={stats.data?.milestones ?? 0} />
              <Stat label="Released" value={stats.data?.releasedMilestones ?? 0} tone="success" />
              <Stat label="Disputes" value={stats.data?.disputes ?? 0} tone="accent" />
              <Stat label="Appeals" value={stats.data?.appeals ?? 0} tone="accent" />
              <Stat label="Audit" value={stats.data?.auditRecords ?? 0} />
            </div>}
        </div>
      </div>

      <div className="card">
        <div className="border-b border-line p-3"><h2 className="text-sm font-semibold">On-chain smoke proof - all 12 write methods</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead><tr className="border-b border-line text-left text-[0.625rem] uppercase tracking-wide text-muted">
              <th className="px-4 py-2 font-semibold">Method</th><th className="px-4 py-2 font-semibold">Transaction</th><th className="px-4 py-2 font-semibold"></th>
            </tr></thead>
            <tbody className="divide-y divide-line">
              {DEPLOYMENT.smoke.map((s) => (
                <tr key={s.hash}>
                  <td className="px-4 py-2.5 font-medium text-text">{s.label}</td>
                  <td className="px-4 py-2.5"><a href={explorerTx(s.hash)} target="_blank" rel="noreferrer" className="mono text-xs text-primary hover:underline">{truncateHex(s.hash, 10, 8)}</a></td>
                  <td className="px-4 py-2.5"><Copy value={s.hash} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

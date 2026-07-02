"use client";

import { useState, type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy, faCheck, faArrowUpRightFromSquare, faCircleInfo, faTriangleExclamation,
  faCircleExclamation, faCircleCheck, faInbox,
} from "@fortawesome/free-solid-svg-icons";
import { truncateHex, explorerTx, explorerAddr, explorerContract } from "@/lib/format";

const DEAL: Record<string, string> = {
  draft: "border-line text-muted bg-bg",
  active: "border-primary/40 text-primary bg-primary/10",
  in_review: "border-primary/40 text-primary bg-primary/10",
  disputed: "border-accent/40 text-accent bg-accent/10",
  appealed: "border-accent/40 text-accent bg-accent/10",
  completed: "border-success/40 text-success bg-success/10",
  cancelled: "border-danger/40 text-danger bg-danger/10",
  archived: "border-line text-muted bg-bg",
};
const MILESTONE: Record<string, string> = {
  pending: "border-line text-muted bg-bg",
  submitted: "border-primary/40 text-primary bg-primary/10",
  approved: "border-success/40 text-success bg-success/10",
  revision_requested: "border-accent/40 text-accent bg-accent/10",
  rejected: "border-danger/40 text-danger bg-danger/10",
  disputed: "border-accent/40 text-accent bg-accent/10",
  appealed: "border-accent/40 text-accent bg-accent/10",
  released: "border-success/40 text-success bg-success/10",
};
const DECISION: Record<string, string> = {
  open: "border-accent/40 text-accent bg-accent/10",
  client_upheld: "border-success/40 text-success bg-success/10",
  provider_upheld: "border-success/40 text-success bg-success/10",
  dismissed: "border-muted/40 text-muted bg-bg",
  accepted: "border-success/40 text-success bg-success/10",
  denied: "border-danger/40 text-danger bg-danger/10",
};
const VERDICT: Record<string, string> = {
  release: "border-success/40 text-success bg-success/10",
  revision: "border-accent/40 text-accent bg-accent/10",
  reject: "border-danger/40 text-danger bg-danger/10",
};

export function StatusChip({ status, kind }: { status: string; kind: "deal" | "milestone" | "decision" }) {
  const map = kind === "deal" ? DEAL : kind === "milestone" ? MILESTONE : DECISION;
  const cls = map[status] ?? "border-line text-muted bg-bg";
  return <span className={`chip ${cls}`}>{(status || "-").replace(/_/g, " ")}</span>;
}

export function VerdictBadge({ verdict, score }: { verdict?: string; score?: number }) {
  const cls = VERDICT[verdict ?? ""] ?? "border-line text-muted bg-bg";
  return (
    <span className={`chip ${cls}`}>
      {verdict || "unreviewed"}
      {typeof score === "number" && score > 0 ? <span className="mono opacity-80">· {score}</span> : null}
    </span>
  );
}

export function Copy({ value, className = "" }: { value: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      aria-label="Copy"
      className={`inline-grid h-6 w-6 place-items-center rounded text-muted transition-colors hover:bg-bg hover:text-text ${className}`}
      onClick={async () => { try { await navigator.clipboard.writeText(value); setDone(true); setTimeout(() => setDone(false), 1200); } catch {} }}
    >
      <FontAwesomeIcon icon={done ? faCheck : faCopy} className={`h-3 w-3 ${done ? "text-success" : ""}`} />
    </button>
  );
}

export function Hex({ value, kind = "address", lead = 6, tail = 4 }: { value: string; kind?: "address" | "contract" | "tx"; lead?: number; tail?: number }) {
  if (!value) return <span className="text-muted">-</span>;
  const href = kind === "tx" ? explorerTx(value) : kind === "contract" ? explorerContract(value) : explorerAddr(value);
  return (
    <span className="inline-flex items-center gap-1">
      <a href={href} target="_blank" rel="noreferrer" className="mono text-xs text-secondary underline-offset-2 hover:text-primary hover:underline" title={value}>
        {truncateHex(value, lead, tail)}
      </a>
      <Copy value={value} />
    </span>
  );
}

export function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
      {children}
      <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-2.5 w-2.5" />
    </a>
  );
}

type Tone = "info" | "warn" | "danger" | "ok";
const TONE: Record<Tone, { c: string; i: typeof faCircleInfo; ic: string }> = {
  info: { c: "border-primary/30 bg-primary/5", i: faCircleInfo, ic: "text-primary" },
  warn: { c: "border-accent/30 bg-accent/5", i: faTriangleExclamation, ic: "text-accent" },
  danger: { c: "border-danger/30 bg-danger/5", i: faCircleExclamation, ic: "text-danger" },
  ok: { c: "border-success/30 bg-success/5", i: faCircleCheck, ic: "text-success" },
};
export function Banner({ tone = "info", title, children, action }: { tone?: Tone; title?: string; children?: ReactNode; action?: ReactNode }) {
  const t = TONE[tone];
  return (
    <div className={`flex items-start gap-3 rounded-md border p-3 text-sm ${t.c}`}>
      <FontAwesomeIcon icon={t.i} className={`mt-0.5 h-4 w-4 ${t.ic}`} />
      <div className="flex-1">
        {title && <div className="font-semibold text-text">{title}</div>}
        {children && <div className="text-muted">{children}</div>}
      </div>
      {action}
    </div>
  );
}

export function Empty({ icon, title, hint }: { icon?: typeof faInbox; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-line bg-bg px-6 py-12 text-center">
      <FontAwesomeIcon icon={icon ?? faInbox} className="h-6 w-6 text-muted/50" />
      <div className="text-sm font-semibold text-text">{title}</div>
      {hint && <div className="max-w-sm text-xs text-muted">{hint}</div>}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse2 rounded bg-line/60 ${className}`} />;
}

export function Stat({ label, value, tone }: { label: string; value: ReactNode; tone?: "primary" | "accent" | "danger" | "success" }) {
  const c = tone === "accent" ? "text-accent" : tone === "danger" ? "text-danger" : tone === "success" ? "text-success" : tone === "primary" ? "text-primary" : "text-text";
  return (
    <div className="card p-3.5">
      <div className="label">{label}</div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums ${c}`}>{value}</div>
    </div>
  );
}

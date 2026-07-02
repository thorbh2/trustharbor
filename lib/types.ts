export type DealStatus =
  | "draft" | "active" | "in_review" | "disputed" | "appealed" | "completed" | "cancelled" | "archived";
export type MilestoneStatus =
  | "pending" | "submitted" | "approved" | "revision_requested" | "rejected" | "disputed" | "appealed" | "released";
export type Verdict = "" | "release" | "revision" | "reject";
export type DisputeStatus = "open" | "client_upheld" | "provider_upheld" | "dismissed";
export type AppealStatus = "open" | "accepted" | "denied";

export interface Deal {
  dealId: string;
  client: string;
  provider: string;
  title: string;
  description: string;
  category: string;
  totalAmountLabel: string;
  termsUrls: string[];
  status: DealStatus;
  createdAt: number;
  milestoneIds: string[];
  disputeIds: string[];
  appealIds: string[];
  auditTrailIds: string[];
}

export interface Milestone {
  milestoneId: string;
  dealId: string;
  title: string;
  acceptanceCriteria: string[];
  proofRequirements: string[];
  amountLabel: string;
  dueLabel: string;
  status: MilestoneStatus;
  proofUrls: string[];
  providerNote: string;
  score: number;
  verdict: Verdict;
  reviewSummary: string;
  strengths: string[];
  weaknesses: string[];
  riskFlags: string[];
  criteriaMet: string[];
  criteriaMissing: string[];
  rawReviewJson: string;
  createdAt: number;
  disputeIds: string[];
  appealIds: string[];
}

export interface Dispute {
  disputeId: string;
  dealId: string;
  milestoneId: string;
  opener: string;
  reason: string;
  evidenceUrls: string[];
  status: DisputeStatus;
  reviewJson: string;
  createdAt: number;
}

export interface Appeal {
  appealId: string;
  dealId: string;
  milestoneId: string;
  appellant: string;
  reason: string;
  evidenceUrls: string[];
  status: AppealStatus;
  reviewJson: string;
  createdAt: number;
}

export interface Profile {
  address: string;
  dealsCreated: number;
  dealsServed: number;
  milestonesSubmitted: number;
  milestonesApproved: number;
  milestonesRejected: number;
  disputesWon: number;
  disputesLost: number;
  appealsWon: number;
  appealsLost: number;
  reputationScore: number;
  lastActivity: number;
}

export interface AuditRecord {
  auditId: string;
  action: string;
  actor: string;
  dealId: string;
  milestoneId: string;
  disputeId: string;
  appealId: string;
  summary: string;
  statusAfter: string;
  at: number;
}

export interface PublicStats {
  deals: number;
  milestones: number;
  disputes: number;
  appeals: number;
  releasedMilestones: number;
  openDisputes: number;
  openAppeals: number;
  auditRecords: number;
  clock: number;
}

export interface ReviewDecision {
  decision: string;
  confidence: number;
  summary: string;
  riskFlags: string[];
  affectedCriteria?: string[];
  changedFields?: string[];
  reasoningDigest: string;
}

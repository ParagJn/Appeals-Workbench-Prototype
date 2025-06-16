import type { AutomatedClaimValidationOutput } from "@/ai/flows/automated-claim-validation";

export interface Claim {
  id: string;
  policyHolderName: string;
  rejectionReason: string;
  claimAmount: number;
  allocatedAmount?: number; // Added for allocated amount check
  rejectionDate: string; // ISO string
  policyId: string;
  claimDetails: string; // For AI input
}

export interface Appeal {
  id: string;
  claimId: string;
  policyHolderName: string; // Denormalized for display
  appealReason: string;
  supportingDocuments?: { name: string; url?: string }[]; // Simplified
  submissionDate: string; // ISO string
  status: 'Pending Validation' | 'Needs Agent Review' | 'Approved' | 'Rejected' | 'Info Requested';
  assignedAgent?: string;
  validationResult?: AutomatedClaimValidationOutput;
  agentComments?: string;
  finalDecisionDate?: string; // ISO string
}

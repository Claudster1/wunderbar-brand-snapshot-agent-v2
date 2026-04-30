// src/types/snapshot.ts
// Type definitions for WunderBrand Snapshot™ input and context

export type UserRoleContext =
  | "operator"
  | "strategic_lead"
  | "marketing_lead"
  | "founder"
  | "other";

export interface SnapshotInput {
  userName: string;
  businessName: string;
  businessType?:
    | "service_b2b"
    | "service_b2c"
    | "retail"
    | "ecommerce"
    | "saas"
    | "local_service";
  primaryRevenueDriver?: string | null;
  industry: string;
  website?: string;
  socials: string[];
  hasBrandGuidelines: boolean;
  brandConsistency: string;
  targetCustomers: string;
  competitorNames: string[];
  offerClarity: string;
  messagingClarity: string;
  brandVoiceDescription: string;
  primaryGoals: string[];
  marketingChannels: string[];
  visualConfidence: string;
  brandPersonalityWords: string[];

  // NEW
  userRoleContext?: UserRoleContext;
}

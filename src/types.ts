export type Sender = 'bot' | 'user';

export type MessageType = 'text' | 'score-reveal' | 'full-report';

export interface Message {
  id: string;
  sender: Sender;
  content: string;
  type?: MessageType;
  data?: any;
}

export interface BrandSnapshotData {
  score: number;
  tier: 'Low' | 'Medium' | 'High';
  summary: string;
  pillars: {
    messaging: string;
    audience: string;
    visual: string;
    positioning: string;
    trust: string;
  };
  strengths?: string[];
  red_flags?: string[];
  opportunities: string[];
  quickWins: string[];
  softCTA: string;
}

// 1️⃣ Function: calculate_snapshot_score Schema
export interface SnapshotScoreInputs {
  business: string;
  audience: string;
  offers: string;
  online_presence?: string;
  challenges: string;
  voice?: string;
  clarity_rating?: string;
}

// Internal state to track chat answers
export interface ChatStateResponses {
  business?: string;
  audience?: string;
  offers?: string;
  online_presence?: string;
  challenges?: string;
  voice?: string;
  clarity_rating?: string;
  extra_info?: string;
}

// 2️⃣ Function: save_contact Schema
export interface ContactPayload {
  first_name: string;
  last_name?: string;
  company_name?: string;
  email: string;
  score: number;
  tier?: string;
}

export enum ChatPhase {
  INTAKE = 'INTAKE',
  CALCULATING = 'CALCULATING',
  REVEAL = 'REVEAL',
  LEAD_GEN = 'LEAD_GEN',
  FINAL = 'FINAL',
}

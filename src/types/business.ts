// src/types/business.ts
// Business attribute type definitions

export type BusinessStage = 'early' | 'growing' | 'scaling';

export type YearsInBusinessRange =
  | 'pre-launch'
  | '0-1'
  | '1-3'
  | '3-5'
  | '5+';

export type TeamSize =
  | 'solo'
  | '2-5'
  | '6-15'
  | '16+';

export type PrimaryPresence =
  | 'website'
  | 'social'
  | 'marketplace'
  | 'offline';

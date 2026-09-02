/**
 * WunderBrand persona portrait assets + role → portrait selection.
 * 75 portraits (PNG, transparent, crop to circle in UI).
 * Files: `public/personas/`. Generated registry — do not hand-edit portrait rows.
 */

import {
  inferPersonaPortraitGender,
  type PersonaPortraitGenderHint,
} from "@/lib/personaPortrait";
import { inferHeritageFromPersonaName } from "@/lib/personaPortraitHeritage";

export type PersonaContext = 'B2B' | 'B2C' | 'Shared' | 'Youth';
export type PersonaVariant = 'a' | 'b' | 'c';

/** Presentation group from generation Representation line (for name/portrait alignment). */
export type PersonaHeritageGroup =
  | 'white'
  | 'hispanic'
  | 'black'
  | 'east_asian'
  | 'south_asian'
  | 'southeast_asian'
  | 'mena'
  | 'indigenous'
  | 'mixed'
  | 'unknown';

export interface PersonaPortrait {
  /** Stable id, e.g. 'wb-econ-buyer-a' */
  id: string;
  archetypeId: string;
  archetypeName: string;
  variant: PersonaVariant;
  context: PersonaContext;
  /** Inclusive age range the portrait depicts */
  ageMin: number;
  ageMax: number;
  /** Coarse heritage group for aligning culturally coded names to avatars. */
  heritageGroup: PersonaHeritageGroup;
  filename: string;
  src: string;
}

export const PERSONA_PORTRAIT_BASE = '/personas';

export const personaPortraits: PersonaPortrait[] = [
  {
    id: 'wb-econ-buyer-a',
    archetypeId: 'wb-econ-buyer',
    archetypeName: "Economic buyer",
    variant: 'a',
    context: 'B2B',
    ageMin: 55,
    ageMax: 64,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-econ-buyer-a.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-econ-buyer-a.png`,
  },
  {
    id: 'wb-econ-buyer-b',
    archetypeId: 'wb-econ-buyer',
    archetypeName: "Economic buyer",
    variant: 'b',
    context: 'B2B',
    ageMin: 45,
    ageMax: 54,
    heritageGroup: 'hispanic',
    filename: 'wunderbar-persona-wb-econ-buyer-b.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-econ-buyer-b.png`,
  },
  {
    id: 'wb-econ-buyer-c',
    archetypeId: 'wb-econ-buyer',
    archetypeName: "Economic buyer",
    variant: 'c',
    context: 'B2B',
    ageMin: 36,
    ageMax: 44,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-econ-buyer-c.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-econ-buyer-c.png`,
  },
  {
    id: 'wb-exec-sponsor-a',
    archetypeId: 'wb-exec-sponsor',
    archetypeName: "Executive sponsor",
    variant: 'a',
    context: 'B2B',
    ageMin: 55,
    ageMax: 64,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-exec-sponsor-a.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-exec-sponsor-a.png`,
  },
  {
    id: 'wb-exec-sponsor-b',
    archetypeId: 'wb-exec-sponsor',
    archetypeName: "Executive sponsor",
    variant: 'b',
    context: 'B2B',
    ageMin: 45,
    ageMax: 54,
    heritageGroup: 'hispanic',
    filename: 'wunderbar-persona-wb-exec-sponsor-b.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-exec-sponsor-b.png`,
  },
  {
    id: 'wb-exec-sponsor-c',
    archetypeId: 'wb-exec-sponsor',
    archetypeName: "Executive sponsor",
    variant: 'c',
    context: 'B2B',
    ageMin: 40,
    ageMax: 45,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-exec-sponsor-c.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-exec-sponsor-c.png`,
  },
  {
    id: 'wb-func-champion-a',
    archetypeId: 'wb-func-champion',
    archetypeName: "Functional champion",
    variant: 'a',
    context: 'B2B',
    ageMin: 25,
    ageMax: 34,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-func-champion-a.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-func-champion-a.png`,
  },
  {
    id: 'wb-func-champion-b',
    archetypeId: 'wb-func-champion',
    archetypeName: "Functional champion",
    variant: 'b',
    context: 'B2B',
    ageMin: 55,
    ageMax: 60,
    heritageGroup: 'hispanic',
    filename: 'wunderbar-persona-wb-func-champion-b.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-func-champion-b.png`,
  },
  {
    id: 'wb-func-champion-c',
    archetypeId: 'wb-func-champion',
    archetypeName: "Functional champion",
    variant: 'c',
    context: 'B2B',
    ageMin: 35,
    ageMax: 44,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-func-champion-c.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-func-champion-c.png`,
  },
  {
    id: 'wb-ops-owner-a',
    archetypeId: 'wb-ops-owner',
    archetypeName: "Operations owner",
    variant: 'a',
    context: 'B2B',
    ageMin: 26,
    ageMax: 34,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-ops-owner-a.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-ops-owner-a.png`,
  },
  {
    id: 'wb-ops-owner-b',
    archetypeId: 'wb-ops-owner',
    archetypeName: "Operations owner",
    variant: 'b',
    context: 'B2B',
    ageMin: 45,
    ageMax: 54,
    heritageGroup: 'hispanic',
    filename: 'wunderbar-persona-wb-ops-owner-b.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-ops-owner-b.png`,
  },
  {
    id: 'wb-ops-owner-c',
    archetypeId: 'wb-ops-owner',
    archetypeName: "Operations owner",
    variant: 'c',
    context: 'B2B',
    ageMin: 55,
    ageMax: 64,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-ops-owner-c.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-ops-owner-c.png`,
  },
  {
    id: 'wb-tech-eval-a',
    archetypeId: 'wb-tech-eval',
    archetypeName: "Technical evaluator",
    variant: 'a',
    context: 'B2B',
    ageMin: 21,
    ageMax: 26,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-tech-eval-a.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-tech-eval-a.png`,
  },
  {
    id: 'wb-tech-eval-b',
    archetypeId: 'wb-tech-eval',
    archetypeName: "Technical evaluator",
    variant: 'b',
    context: 'B2B',
    ageMin: 25,
    ageMax: 34,
    heritageGroup: 'hispanic',
    filename: 'wunderbar-persona-wb-tech-eval-b.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-tech-eval-b.png`,
  },
  {
    id: 'wb-tech-eval-c',
    archetypeId: 'wb-tech-eval',
    archetypeName: "Technical evaluator",
    variant: 'c',
    context: 'B2B',
    ageMin: 55,
    ageMax: 60,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-tech-eval-c.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-tech-eval-c.png`,
  },
  {
    id: 'wb-rev-lead-a',
    archetypeId: 'wb-rev-lead',
    archetypeName: "Sales/revenue lead",
    variant: 'a',
    context: 'B2B',
    ageMin: 25,
    ageMax: 34,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-rev-lead-a.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-rev-lead-a.png`,
  },
  {
    id: 'wb-rev-lead-b',
    archetypeId: 'wb-rev-lead',
    archetypeName: "Sales/revenue lead",
    variant: 'b',
    context: 'B2B',
    ageMin: 35,
    ageMax: 44,
    heritageGroup: 'hispanic',
    filename: 'wunderbar-persona-wb-rev-lead-b.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-rev-lead-b.png`,
  },
  {
    id: 'wb-rev-lead-c',
    archetypeId: 'wb-rev-lead',
    archetypeName: "Sales/revenue lead",
    variant: 'c',
    context: 'B2B',
    ageMin: 45,
    ageMax: 54,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-rev-lead-c.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-rev-lead-c.png`,
  },
  {
    id: 'wb-people-ops-a',
    archetypeId: 'wb-people-ops',
    archetypeName: "People/internal influencer",
    variant: 'a',
    context: 'B2B',
    ageMin: 25,
    ageMax: 34,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-people-ops-a.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-people-ops-a.png`,
  },
  {
    id: 'wb-people-ops-b',
    archetypeId: 'wb-people-ops',
    archetypeName: "People/internal influencer",
    variant: 'b',
    context: 'B2B',
    ageMin: 55,
    ageMax: 64,
    heritageGroup: 'hispanic',
    filename: 'wunderbar-persona-wb-people-ops-b.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-people-ops-b.png`,
  },
  {
    id: 'wb-people-ops-c',
    archetypeId: 'wb-people-ops',
    archetypeName: "People/internal influencer",
    variant: 'c',
    context: 'B2B',
    ageMin: 35,
    ageMax: 44,
    heritageGroup: 'black',
    filename: 'wunderbar-persona-wb-people-ops-c.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-people-ops-c.png`,
  },
  {
    id: 'wb-practitioner-a',
    archetypeId: 'wb-practitioner',
    archetypeName: "Practitioner/end user",
    variant: 'a',
    context: 'B2B',
    ageMin: 20,
    ageMax: 25,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-practitioner-a.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-practitioner-a.png`,
  },
  {
    id: 'wb-practitioner-b',
    archetypeId: 'wb-practitioner',
    archetypeName: "Practitioner/end user",
    variant: 'b',
    context: 'B2B',
    ageMin: 25,
    ageMax: 34,
    heritageGroup: 'hispanic',
    filename: 'wunderbar-persona-wb-practitioner-b.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-practitioner-b.png`,
  },
  {
    id: 'wb-practitioner-c',
    archetypeId: 'wb-practitioner',
    archetypeName: "Practitioner/end user",
    variant: 'c',
    context: 'B2B',
    ageMin: 65,
    ageMax: 70,
    heritageGroup: 'black',
    filename: 'wunderbar-persona-wb-practitioner-c.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-practitioner-c.png`,
  },
  {
    id: 'wb-procurement-a',
    archetypeId: 'wb-procurement',
    archetypeName: "Procurement/risk gatekeeper",
    variant: 'a',
    context: 'B2B',
    ageMin: 65,
    ageMax: 70,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-procurement-a.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-procurement-a.png`,
  },
  {
    id: 'wb-procurement-b',
    archetypeId: 'wb-procurement',
    archetypeName: "Procurement/risk gatekeeper",
    variant: 'b',
    context: 'B2B',
    ageMin: 45,
    ageMax: 54,
    heritageGroup: 'hispanic',
    filename: 'wunderbar-persona-wb-procurement-b.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-procurement-b.png`,
  },
  {
    id: 'wb-procurement-c',
    archetypeId: 'wb-procurement',
    archetypeName: "Procurement/risk gatekeeper",
    variant: 'c',
    context: 'B2B',
    ageMin: 55,
    ageMax: 64,
    heritageGroup: 'black',
    filename: 'wunderbar-persona-wb-procurement-c.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-procurement-c.png`,
  },
  {
    id: 'wb-partner-a',
    archetypeId: 'wb-partner',
    archetypeName: "Partner/channel buyer",
    variant: 'a',
    context: 'B2B',
    ageMin: 26,
    ageMax: 34,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-partner-a.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-partner-a.png`,
  },
  {
    id: 'wb-partner-b',
    archetypeId: 'wb-partner',
    archetypeName: "Partner/channel buyer",
    variant: 'b',
    context: 'B2B',
    ageMin: 35,
    ageMax: 44,
    heritageGroup: 'hispanic',
    filename: 'wunderbar-persona-wb-partner-b.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-partner-b.png`,
  },
  {
    id: 'wb-partner-c',
    archetypeId: 'wb-partner',
    archetypeName: "Partner/channel buyer",
    variant: 'c',
    context: 'B2B',
    ageMin: 45,
    ageMax: 54,
    heritageGroup: 'black',
    filename: 'wunderbar-persona-wb-partner-c.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-partner-c.png`,
  },
  {
    id: 'wb-primary-shopper-a',
    archetypeId: 'wb-primary-shopper',
    archetypeName: "Primary shopper",
    variant: 'a',
    context: 'B2C',
    ageMin: 20,
    ageMax: 25,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-primary-shopper-a.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-primary-shopper-a.png`,
  },
  {
    id: 'wb-primary-shopper-b',
    archetypeId: 'wb-primary-shopper',
    archetypeName: "Primary shopper",
    variant: 'b',
    context: 'B2C',
    ageMin: 25,
    ageMax: 34,
    heritageGroup: 'hispanic',
    filename: 'wunderbar-persona-wb-primary-shopper-b.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-primary-shopper-b.png`,
  },
  {
    id: 'wb-primary-shopper-c',
    archetypeId: 'wb-primary-shopper',
    archetypeName: "Primary shopper",
    variant: 'c',
    context: 'B2C',
    ageMin: 65,
    ageMax: 72,
    heritageGroup: 'black',
    filename: 'wunderbar-persona-wb-primary-shopper-c.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-primary-shopper-c.png`,
  },
  {
    id: 'wb-value-buyer-a',
    archetypeId: 'wb-value-buyer',
    archetypeName: "Value-conscious buyer",
    variant: 'a',
    context: 'B2C',
    ageMin: 75,
    ageMax: 80,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-value-buyer-a.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-value-buyer-a.png`,
  },
  {
    id: 'wb-value-buyer-b',
    archetypeId: 'wb-value-buyer',
    archetypeName: "Value-conscious buyer",
    variant: 'b',
    context: 'B2C',
    ageMin: 75,
    ageMax: 80,
    heritageGroup: 'hispanic',
    filename: 'wunderbar-persona-wb-value-buyer-b.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-value-buyer-b.png`,
  },
  {
    id: 'wb-value-buyer-c',
    archetypeId: 'wb-value-buyer',
    archetypeName: "Value-conscious buyer",
    variant: 'c',
    context: 'B2C',
    ageMin: 75,
    ageMax: 80,
    heritageGroup: 'black',
    filename: 'wunderbar-persona-wb-value-buyer-c.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-value-buyer-c.png`,
  },
  {
    id: 'wb-premium-buyer-a',
    archetypeId: 'wb-premium-buyer',
    archetypeName: "Premium/aspirational buyer",
    variant: 'a',
    context: 'B2C',
    ageMin: 26,
    ageMax: 34,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-premium-buyer-a.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-premium-buyer-a.png`,
  },
  {
    id: 'wb-premium-buyer-b',
    archetypeId: 'wb-premium-buyer',
    archetypeName: "Premium/aspirational buyer",
    variant: 'b',
    context: 'B2C',
    ageMin: 65,
    ageMax: 70,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-premium-buyer-b.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-premium-buyer-b.png`,
  },
  {
    id: 'wb-premium-buyer-c',
    archetypeId: 'wb-premium-buyer',
    archetypeName: "Premium/aspirational buyer",
    variant: 'c',
    context: 'B2C',
    ageMin: 55,
    ageMax: 64,
    heritageGroup: 'black',
    filename: 'wunderbar-persona-wb-premium-buyer-c.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-premium-buyer-c.png`,
  },
  {
    id: 'wb-parent-a',
    archetypeId: 'wb-parent',
    archetypeName: "Busy parent/caregiver",
    variant: 'a',
    context: 'B2C',
    ageMin: 25,
    ageMax: 34,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-parent-a.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-parent-a.png`,
  },
  {
    id: 'wb-parent-b',
    archetypeId: 'wb-parent',
    archetypeName: "Busy parent/caregiver",
    variant: 'b',
    context: 'B2C',
    ageMin: 35,
    ageMax: 44,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-parent-b.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-parent-b.png`,
  },
  {
    id: 'wb-parent-c',
    archetypeId: 'wb-parent',
    archetypeName: "Busy parent/caregiver",
    variant: 'c',
    context: 'B2C',
    ageMin: 45,
    ageMax: 54,
    heritageGroup: 'black',
    filename: 'wunderbar-persona-wb-parent-c.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-parent-c.png`,
  },
  {
    id: 'wb-life-pro-a',
    archetypeId: 'wb-life-pro',
    archetypeName: "Life-stage professional",
    variant: 'a',
    context: 'B2C',
    ageMin: 21,
    ageMax: 26,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-life-pro-a.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-life-pro-a.png`,
  },
  {
    id: 'wb-life-pro-b',
    archetypeId: 'wb-life-pro',
    archetypeName: "Life-stage professional",
    variant: 'b',
    context: 'B2C',
    ageMin: 25,
    ageMax: 34,
    heritageGroup: 'black',
    filename: 'wunderbar-persona-wb-life-pro-b.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-life-pro-b.png`,
  },
  {
    id: 'wb-life-pro-c',
    archetypeId: 'wb-life-pro',
    archetypeName: "Life-stage professional",
    variant: 'c',
    context: 'B2C',
    ageMin: 35,
    ageMax: 44,
    heritageGroup: 'black',
    filename: 'wunderbar-persona-wb-life-pro-c.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-life-pro-c.png`,
  },
  {
    id: 'wb-wellness-a',
    archetypeId: 'wb-wellness',
    archetypeName: "Health/wellness seeker",
    variant: 'a',
    context: 'B2C',
    ageMin: 20,
    ageMax: 25,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-wellness-a.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-wellness-a.png`,
  },
  {
    id: 'wb-wellness-b',
    archetypeId: 'wb-wellness',
    archetypeName: "Health/wellness seeker",
    variant: 'b',
    context: 'B2C',
    ageMin: 25,
    ageMax: 34,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-wellness-b.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-wellness-b.png`,
  },
  {
    id: 'wb-wellness-c',
    archetypeId: 'wb-wellness',
    archetypeName: "Health/wellness seeker",
    variant: 'c',
    context: 'B2C',
    ageMin: 45,
    ageMax: 54,
    heritageGroup: 'east_asian',
    filename: 'wunderbar-persona-wb-wellness-c.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-wellness-c.png`,
  },
  {
    id: 'wb-local-a',
    archetypeId: 'wb-local',
    archetypeName: "Local/community buyer",
    variant: 'a',
    context: 'B2C',
    ageMin: 75,
    ageMax: 80,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-local-a.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-local-a.png`,
  },
  {
    id: 'wb-local-b',
    archetypeId: 'wb-local',
    archetypeName: "Local/community buyer",
    variant: 'b',
    context: 'B2C',
    ageMin: 55,
    ageMax: 64,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-local-b.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-local-b.png`,
  },
  {
    id: 'wb-local-c',
    archetypeId: 'wb-local',
    archetypeName: "Local/community buyer",
    variant: 'c',
    context: 'B2C',
    ageMin: 65,
    ageMax: 74,
    heritageGroup: 'east_asian',
    filename: 'wunderbar-persona-wb-local-c.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-local-c.png`,
  },
  {
    id: 'wb-gift-a',
    archetypeId: 'wb-gift',
    archetypeName: "Gift/occasion buyer",
    variant: 'a',
    context: 'B2C',
    ageMin: 20,
    ageMax: 25,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-gift-a.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-gift-a.png`,
  },
  {
    id: 'wb-gift-b',
    archetypeId: 'wb-gift',
    archetypeName: "Gift/occasion buyer",
    variant: 'b',
    context: 'B2C',
    ageMin: 20,
    ageMax: 25,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-gift-b.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-gift-b.png`,
  },
  {
    id: 'wb-gift-c',
    archetypeId: 'wb-gift',
    archetypeName: "Gift/occasion buyer",
    variant: 'c',
    context: 'B2C',
    ageMin: 20,
    ageMax: 25,
    heritageGroup: 'east_asian',
    filename: 'wunderbar-persona-wb-gift-c.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-gift-c.png`,
  },
  {
    id: 'wb-founder-a',
    archetypeId: 'wb-founder',
    archetypeName: "Startup founder",
    variant: 'a',
    context: 'Shared',
    ageMin: 20,
    ageMax: 25,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-founder-a.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-founder-a.png`,
  },
  {
    id: 'wb-founder-b',
    archetypeId: 'wb-founder',
    archetypeName: "Startup founder",
    variant: 'b',
    context: 'Shared',
    ageMin: 25,
    ageMax: 34,
    heritageGroup: 'black',
    filename: 'wunderbar-persona-wb-founder-b.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-founder-b.png`,
  },
  {
    id: 'wb-founder-c',
    archetypeId: 'wb-founder',
    archetypeName: "Startup founder",
    variant: 'c',
    context: 'Shared',
    ageMin: 45,
    ageMax: 54,
    heritageGroup: 'black',
    filename: 'wunderbar-persona-wb-founder-c.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-founder-c.png`,
  },
  {
    id: 'wb-smb-owner-a',
    archetypeId: 'wb-smb-owner',
    archetypeName: "SMB owner-operator",
    variant: 'a',
    context: 'Shared',
    ageMin: 25,
    ageMax: 34,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-smb-owner-a.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-smb-owner-a.png`,
  },
  {
    id: 'wb-smb-owner-b',
    archetypeId: 'wb-smb-owner',
    archetypeName: "SMB owner-operator",
    variant: 'b',
    context: 'Shared',
    ageMin: 65,
    ageMax: 70,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-smb-owner-b.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-smb-owner-b.png`,
  },
  {
    id: 'wb-smb-owner-c',
    archetypeId: 'wb-smb-owner',
    archetypeName: "SMB owner-operator",
    variant: 'c',
    context: 'Shared',
    ageMin: 35,
    ageMax: 44,
    heritageGroup: 'mena',
    filename: 'wunderbar-persona-wb-smb-owner-c.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-smb-owner-c.png`,
  },
  {
    id: 'wb-senior-a',
    archetypeId: 'wb-senior',
    archetypeName: "Senior/accessibility-minded buyer",
    variant: 'a',
    context: 'Shared',
    ageMin: 65,
    ageMax: 74,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-senior-a.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-senior-a.png`,
  },
  {
    id: 'wb-senior-b',
    archetypeId: 'wb-senior',
    archetypeName: "Senior/accessibility-minded buyer",
    variant: 'b',
    context: 'Shared',
    ageMin: 75,
    ageMax: 84,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-senior-b.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-senior-b.png`,
  },
  {
    id: 'wb-senior-c',
    archetypeId: 'wb-senior',
    archetypeName: "Senior/accessibility-minded buyer",
    variant: 'c',
    context: 'Shared',
    ageMin: 65,
    ageMax: 74,
    heritageGroup: 'south_asian',
    filename: 'wunderbar-persona-wb-senior-c.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-senior-c.png`,
  },
  {
    id: 'wb-youth-a',
    archetypeId: 'wb-youth',
    archetypeName: "Youth/next-gen buyer",
    variant: 'a',
    context: 'Shared',
    ageMin: 18,
    ageMax: 24,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-youth-a.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-youth-a.png`,
  },
  {
    id: 'wb-youth-b',
    archetypeId: 'wb-youth',
    archetypeName: "Youth/next-gen buyer",
    variant: 'b',
    context: 'Shared',
    ageMin: 18,
    ageMax: 24,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-youth-b.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-youth-b.png`,
  },
  {
    id: 'wb-youth-c',
    archetypeId: 'wb-youth',
    archetypeName: "Youth/next-gen buyer",
    variant: 'c',
    context: 'Shared',
    ageMin: 18,
    ageMax: 24,
    heritageGroup: 'south_asian',
    filename: 'wunderbar-persona-wb-youth-c.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-youth-c.png`,
  },
  {
    id: 'wb-teen-consumer-a',
    archetypeId: 'wb-teen-consumer',
    archetypeName: "Teen consumer",
    variant: 'a',
    context: 'Youth',
    ageMin: 13,
    ageMax: 15,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-teen-consumer-a.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-teen-consumer-a.png`,
  },
  {
    id: 'wb-teen-consumer-b',
    archetypeId: 'wb-teen-consumer',
    archetypeName: "Teen consumer",
    variant: 'b',
    context: 'Youth',
    ageMin: 15,
    ageMax: 17,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-teen-consumer-b.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-teen-consumer-b.png`,
  },
  {
    id: 'wb-teen-consumer-c',
    archetypeId: 'wb-teen-consumer',
    archetypeName: "Teen consumer",
    variant: 'c',
    context: 'Youth',
    ageMin: 16,
    ageMax: 17,
    heritageGroup: 'east_asian',
    filename: 'wunderbar-persona-wb-teen-consumer-c.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-teen-consumer-c.png`,
  },
  {
    id: 'wb-teen-student-a',
    archetypeId: 'wb-teen-student',
    archetypeName: "Student / school-age buyer",
    variant: 'a',
    context: 'Youth',
    ageMin: 13,
    ageMax: 15,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-teen-student-a.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-teen-student-a.png`,
  },
  {
    id: 'wb-teen-student-b',
    archetypeId: 'wb-teen-student',
    archetypeName: "Student / school-age buyer",
    variant: 'b',
    context: 'Youth',
    ageMin: 15,
    ageMax: 17,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-teen-student-b.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-teen-student-b.png`,
  },
  {
    id: 'wb-teen-student-c',
    archetypeId: 'wb-teen-student',
    archetypeName: "Student / school-age buyer",
    variant: 'c',
    context: 'Youth',
    ageMin: 16,
    ageMax: 17,
    heritageGroup: 'mixed',
    filename: 'wunderbar-persona-wb-teen-student-c.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-teen-student-c.png`,
  },
  {
    id: 'wb-teen-influencer-a',
    archetypeId: 'wb-teen-influencer',
    archetypeName: "Household purchase influencer",
    variant: 'a',
    context: 'Youth',
    ageMin: 13,
    ageMax: 15,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-teen-influencer-a.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-teen-influencer-a.png`,
  },
  {
    id: 'wb-teen-influencer-b',
    archetypeId: 'wb-teen-influencer',
    archetypeName: "Household purchase influencer",
    variant: 'b',
    context: 'Youth',
    ageMin: 15,
    ageMax: 17,
    heritageGroup: 'white',
    filename: 'wunderbar-persona-wb-teen-influencer-b.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-teen-influencer-b.png`,
  },
  {
    id: 'wb-teen-influencer-c',
    archetypeId: 'wb-teen-influencer',
    archetypeName: "Household purchase influencer",
    variant: 'c',
    context: 'Youth',
    ageMin: 16,
    ageMax: 17,
    heritageGroup: 'black',
    filename: 'wunderbar-persona-wb-teen-influencer-c.png',
    src: `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-wb-teen-influencer-c.png`,
  },
];

/** Lookup by id, e.g. personaPortraitById['wb-econ-buyer-a'] */
export const personaPortraitById: Record<string, PersonaPortrait> =
  Object.fromEntries(personaPortraits.map((p) => [p.id, p]));

/** All three variants for an archetype, in a/b/c order */
export function portraitsForArchetype(archetypeId: string): PersonaPortrait[] {
  return personaPortraits
    .filter((p) => p.archetypeId === archetypeId)
    .sort((a, b) => a.variant.localeCompare(b.variant));
}

export function portraitsForContext(context: PersonaContext): PersonaPortrait[] {
  return personaPortraits.filter((p) => p.context === context);
}

export const PERSONA_ARCHETYPE_IDS = [
  'wb-econ-buyer',
  'wb-exec-sponsor',
  'wb-func-champion',
  'wb-ops-owner',
  'wb-tech-eval',
  'wb-rev-lead',
  'wb-people-ops',
  'wb-practitioner',
  'wb-procurement',
  'wb-partner',
  'wb-primary-shopper',
  'wb-value-buyer',
  'wb-premium-buyer',
  'wb-parent',
  'wb-life-pro',
  'wb-wellness',
  'wb-local',
  'wb-gift',
  'wb-founder',
  'wb-smb-owner',
  'wb-senior',
  'wb-youth',
  'wb-teen-consumer',
  'wb-teen-student',
  'wb-teen-influencer',
] as const;



// ── App selection helpers (role → local portrait) ───────────────────────────
export type PersonaArchetypeId = (typeof PERSONA_ARCHETYPE_IDS)[number];

const ROLE_RULES: Array<{ id: PersonaArchetypeId; pattern: RegExp }> = [
  { id: "wb-teen-influencer", pattern: /\b(teen influencer|household purchase influencer|kid influencer)\b/i },
  { id: "wb-teen-student", pattern: /\b(teen student|school[- ]age|high[- ]school|middle[- ]school|middle schooler)\b/i },
  { id: "wb-teen-consumer", pattern: /\b(teen consumer|teenager|\bteens?\b)\b/i },
  { id: "wb-econ-buyer", pattern: /\b(cfo|finance|budget|economic buyer|payback|controller|treasurer)\b/i },
  { id: "wb-exec-sponsor", pattern: /\b(ceo|executive sponsor|general manager|\bgm\b|managing director)\b/i },
  { id: "wb-founder", pattern: /\b(founder|co-?founder|startup)\b/i },
  { id: "wb-smb-owner", pattern: /\b(smb|small business|owner-?operator|solopreneur|shop owner)\b/i },
  { id: "wb-func-champion", pattern: /\b(cmo|marketing|growth|brand|demand gen|demand-gen)\b/i },
  { id: "wb-ops-owner", pattern: /\b(operations|vp ops|head of ops|delivery|coo)\b/i },
  { id: "wb-tech-eval", pattern: /\b(cto|revops|rev ops|it\b|technical|systems|integration|engineering)\b/i },
  { id: "wb-rev-lead", pattern: /\b(cro|sales|revenue|account executive|\bae\b)\b/i },
  { id: "wb-people-ops", pattern: /\b(chro|people ops|human resources|\bhr\b|chief of staff)\b/i },
  { id: "wb-procurement", pattern: /\b(procurement|purchasing|legal|security|compliance|risk|gatekeeper)\b/i },
  { id: "wb-partner", pattern: /\b(partner|reseller|agency|franchise|channel)\b/i },
  { id: "wb-parent", pattern: /\b(parent|caregiver|mom|dad|mother|father)\b/i },
  { id: "wb-wellness", pattern: /\b(health|wellness|patient|fitness)\b/i },
  { id: "wb-premium-buyer", pattern: /\b(premium|aspirational|luxury|high-?end)\b/i },
  { id: "wb-value-buyer", pattern: /\b(value-conscious|budget-conscious|price-sensitive|frugal)\b/i },
  { id: "wb-primary-shopper", pattern: /\b(shopper|household|consumer|buyer)\b/i },
  { id: "wb-local", pattern: /\b(local|community|neighborhood|hospitality)\b/i },
  { id: "wb-gift", pattern: /\b(gift|occasion|seasonal)\b/i },
  { id: "wb-senior", pattern: /\b(senior|retiree|older adult|accessibility)\b/i },
  { id: "wb-youth", pattern: /\b(gen ?z|youth|early[- ]career|next-gen|college|university)\b/i },
  { id: "wb-life-pro", pattern: /\b(professional|career|individual contributor|\bic\b)\b/i },
  { id: "wb-practitioner", pattern: /\b(practitioner|end[- ]user|specialist|coordinator|manager|student)\b/i },
];

const FALLBACK_BY_CONTEXT: Record<"b2b" | "b2c" | "youth" | "unknown", PersonaArchetypeId[]> = {
  b2b: ["wb-func-champion", "wb-econ-buyer", "wb-practitioner", "wb-tech-eval", "wb-ops-owner"],
  b2c: ["wb-primary-shopper", "wb-value-buyer", "wb-parent", "wb-life-pro", "wb-premium-buyer"],
  youth: ["wb-teen-consumer", "wb-teen-student", "wb-teen-influencer", "wb-youth", "wb-gift"],
  unknown: ["wb-func-champion", "wb-smb-owner", "wb-practitioner", "wb-founder", "wb-econ-buyer"],
};

function hashToUint(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** @deprecated Prefer `portraitsForArchetype(id)[n].src` — kept for call-site compatibility. */
export function personaPortraitPublicPath(
  id: PersonaArchetypeId,
  variant: PersonaVariant = "a",
): string {
  const hit = personaPortraitById[`${id}-${variant}`];
  if (hit) return hit.src;
  return `${PERSONA_PORTRAIT_BASE}/wunderbar-persona-${id}-${variant}.png`;
}

export function resolvePersonaArchetypeId(params: {
  role: string;
  personaName?: string;
  index?: number;
  audienceKind?: "b2b" | "b2c" | "youth" | "unknown";
}): PersonaArchetypeId {
  const corpus = `${params.role} ${params.personaName ?? ""}`.trim();
  for (const rule of ROLE_RULES) {
    if (rule.pattern.test(corpus)) return rule.id;
  }
  const kind = params.audienceKind ?? "unknown";
  const pool = FALLBACK_BY_CONTEXT[kind] ?? FALLBACK_BY_CONTEXT.unknown;
  const idx = Math.abs(params.index ?? 0) % pool.length;
  return pool[idx]!;
}

function pickVariant(params: {
  archetypeId: PersonaArchetypeId;
  gender: PersonaPortraitGenderHint;
  seedKey: string;
  ageYears?: number | null;
  heritageHint?: PersonaHeritageGroup | null;
  /** Prefer portraits outside these groups when the name does not force a heritage. */
  avoidHeritageGroups?: readonly PersonaHeritageGroup[];
}): PersonaVariant {
  const options = portraitsForArchetype(params.archetypeId);
  if (options.length === 0) return "a";

  let pool = options;

  // Prefer heritage-aligned portraits when the name strongly implies one.
  if (params.heritageHint) {
    const heritageHits = pool.filter((p) => p.heritageGroup === params.heritageHint);
    if (heritageHits.length > 0) pool = heritageHits;
  } else if (params.avoidHeritageGroups && params.avoidHeritageGroups.length > 0) {
    // ICP set diversity: keep co-presented personas on different heritage groups when possible.
    const avoided = new Set(params.avoidHeritageGroups);
    const diversified = pool.filter((p) => !avoided.has(p.heritageGroup));
    if (diversified.length > 0) pool = diversified;
  }

  // Prefer age-appropriate portrait when we have an age signal.
  if (typeof params.ageYears === "number" && Number.isFinite(params.ageYears)) {
    const ageHits = pool.filter(
      (p) => params.ageYears! >= p.ageMin && params.ageYears! <= p.ageMax,
    );
    if (ageHits.length === 1) return ageHits[0]!.variant;
    if (ageHits.length > 1) {
      const i = hashToUint(`${params.seedKey}|age`) % ageHits.length;
      return ageHits[i]!.variant;
    }
  }

  // Stable gender-biased pick across remaining variants.
  const order: PersonaVariant[] =
    params.gender === "male"
      ? ["b", "c", "a"]
      : params.gender === "female"
        ? ["a", "c", "b"]
        : ["a", "b", "c"];
  for (const v of order) {
    if (pool.some((p) => p.variant === v)) return v;
  }
  const i = hashToUint(params.seedKey) % pool.length;
  return pool[i]!.variant;
}

/**
 * Prefer local WunderBrand illustrations; callers may still fall back to DiceBear if null.
 * Pass `avoidHeritageGroups` when resolving a set of ICPs so co-presented faces stay diverse.
 */
export function resolveLocalPersonaPortraitSrc(params: {
  role: string;
  personaName?: string;
  index?: number;
  audienceKind?: "b2b" | "b2c" | "youth" | "unknown";
  personaRecord?: Record<string, unknown> | null;
  seedKey?: string;
  ageYears?: number | null;
  /** Heritage groups already used by earlier personas in the same ICP set. */
  avoidHeritageGroups?: readonly PersonaHeritageGroup[];
}): {
  src: string;
  archetypeId: PersonaArchetypeId;
  variant: PersonaVariant;
  remote: false;
  ageMin?: number;
  ageMax?: number;
  heritageGroup: PersonaHeritageGroup;
} {
  const seedKey =
    params.seedKey ?? `${params.role}|${params.personaName ?? ""}|${params.index ?? 0}`;
  const archetypeId = resolvePersonaArchetypeId({
    role: params.role,
    personaName: params.personaName,
    index: params.index,
    audienceKind: params.audienceKind,
  });
  const gender = inferPersonaPortraitGender({
    personaName: params.personaName?.trim() ?? "",
    personaRecord: params.personaRecord,
  });
  const heritageHint = inferHeritageFromPersonaName(params.personaName?.trim() ?? "");
  const avoidHeritageGroups = params.avoidHeritageGroups ?? [];
  const variant = pickVariant({
    archetypeId,
    gender,
    seedKey,
    ageYears: params.ageYears,
    heritageHint,
    avoidHeritageGroups,
  });

  // If the name asked for a heritage this archetype doesn't have, try same-context peers.
  let portrait = personaPortraitById[`${archetypeId}-${variant}`];
  if (heritageHint && portrait && portrait.heritageGroup !== heritageHint) {
    const peers = personaPortraits.filter(
      (p) => p.context === portrait!.context && p.heritageGroup === heritageHint,
    );
    if (peers.length > 0) {
      const i = hashToUint(`${seedKey}|heritage-peer`) % peers.length;
      portrait = peers[i]!;
    }
  }

  // Set-level diversity escape: when every local variant is already used, borrow a peer
  // from the same audience context with an unused heritage (name hint still wins above).
  if (
    !heritageHint &&
    avoidHeritageGroups.length > 0 &&
    portrait &&
    avoidHeritageGroups.includes(portrait.heritageGroup)
  ) {
    const avoided = new Set(avoidHeritageGroups);
    const peers = personaPortraits.filter(
      (p) => p.context === portrait!.context && !avoided.has(p.heritageGroup),
    );
    if (peers.length > 0) {
      const i = hashToUint(`${seedKey}|diverse-peer`) % peers.length;
      portrait = peers[i]!;
    }
  }

  return {
    src: portrait?.src ?? personaPortraitPublicPath(archetypeId, variant),
    archetypeId: (portrait?.archetypeId as PersonaArchetypeId) ?? archetypeId,
    variant: portrait?.variant ?? variant,
    remote: false,
    ageMin: portrait?.ageMin,
    ageMax: portrait?.ageMax,
    heritageGroup: portrait?.heritageGroup ?? "unknown",
  };
}

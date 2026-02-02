// src/lib/prompts/types.ts

export type BrandStage = "early" | "scaling" | "established";

export type BrandArchetype =
  | "Explorer"
  | "Sage"
  | "Hero"
  | "Caregiver"
  | "Creator"
  | "Ruler"
  | "Magician"
  | "Everyperson";

export type BlueprintPrompt = {
  id: string;
  title: string;
  purpose: string;
  prompt: string;
};

export interface ArchetypePromptMap {
  early: BlueprintPrompt[];
  scaling: BlueprintPrompt[];
  established: BlueprintPrompt[];
}

export interface PillarPromptPack {
  pillar: string;
  description: string;
  archetypes: Record<BrandArchetype, ArchetypePromptMap>;
}

export type BlueprintPromptPack = {
  pillar: string;
  description: string;
  prompts: BlueprintPrompt[];
};

export interface PromptItem {
  id: string;
  title: string;
  pillar: string;
  stage: "early" | "scaling";
  content: string;
}

export type PromptContext = {
  brandName: string;
  primaryPillar: string;
  archetype: string;
  stage: BrandStage;
};

export type PromptBlock = {
  id: string;
  title: string;
  description: string;
  prompt: (ctx: PromptContext) => string;
};

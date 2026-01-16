// src/lib/prompts/types.ts

export type BrandStage = "early" | "scaling" | "growth";

export type BrandArchetype =
  | "Explorer"
  | "Sage"
  | "Hero"
  | "Caregiver"
  | "Creator"
  | "Ruler"
  | "Magician"
  | "Everyperson";

export interface BlueprintPrompt {
  id: string;
  title: string;
  intent: string;
  prompt: string;
}

export interface ArchetypePromptMap {
  early: BlueprintPrompt[];
  scaling: BlueprintPrompt[];
  growth: BlueprintPrompt[];
}

export interface PillarPromptPack {
  pillar: string;
  description: string;
  archetypes: Record<BrandArchetype, ArchetypePromptMap>;
}

export interface PromptItem {
  id: string;
  title: string;
  pillar: string;
  stage: "early" | "scaling";
  content: string;
}

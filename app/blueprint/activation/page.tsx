"use client";

import { useState, useEffect } from "react";
import {
  positioningPromptPack,
  messagingPromptPack,
  visibilityPromptPack,
  credibilityPromptPack,
  conversionPromptPack,
} from "@/src/lib/prompts/blueprint";
import { BrandArchetype, BrandStage, BlueprintPrompt } from "@/src/lib/prompts/types";
import { BlueprintActivationHeader } from "@/components/blueprint/BlueprintActivationHeader";
import { ResolvedPillarsPanel } from "@/components/blueprint/ResolvedPillarsPanel";
import { PromptPackIntro } from "@/components/blueprint/PromptPackIntro";
import { PillarPromptSection } from "@/components/blueprint/PillarPromptSection";
import { PromptExportControls } from "@/components/blueprint/PromptExportControls";
import { BlueprintPlusNudge } from "@/components/blueprint/BlueprintPlusNudge";
import { pillarCopy, PillarKey } from "@/src/copy/pillars";
import { resolvePillarPriority } from "@/src/lib/pillars/pillarPriority";

const PROMPT_PACKS = [
  positioningPromptPack,
  messagingPromptPack,
  visibilityPromptPack,
  credibilityPromptPack,
  conversionPromptPack,
];

interface BlueprintActivationPageProps {
  userRoleContext?: string;
}

export default function BlueprintActivationPage({ userRoleContext }: BlueprintActivationPageProps = {}) {
  const [stage] = useState<BrandStage>("scaling");
  const [archetype] = useState<BrandArchetype>("Explorer");
  const [businessName, setBusinessName] = useState<string>("Your Brand");
  const [resolvedPillars, setResolvedPillars] = useState<string[]>([]);
  const [primaryPillar, setPrimaryPillar] = useState<string>("positioning");

  useEffect(() => {
    // Get snapshot data from localStorage or URL params
    const snapshotData = localStorage.getItem("snapshot_data");
    if (snapshotData) {
      try {
        const data = JSON.parse(snapshotData);
        if (data.businessName) setBusinessName(data.businessName);
        if (data.pillarScores) {
          const { primary, secondary } = resolvePillarPriority(data.pillarScores);
          setPrimaryPillar(primary);
          const allPillars = [primary, ...secondary].slice(0, 3);
          setResolvedPillars(
            allPillars.map((key) => pillarCopy[key as PillarKey]?.title || key)
          );
        }
      } catch (e) {
        console.error("Error parsing snapshot data:", e);
      }
    }
  }, []);

  // Transform prompt packs into format for PillarPromptSection
  const getPillarPrompts = (pillarKey: string): { title: string; body: string }[] => {
    const pack = PROMPT_PACKS.find((p) => p.pillar.toLowerCase() === pillarKey.toLowerCase());
    if (!pack) return [];

    const prompts = pack.archetypes[archetype]?.[stage] || [];
    return prompts.map((p: BlueprintPrompt) => ({
      title: p.title,
      body: p.prompt,
    }));
  };

  // Get all prompts for export
  const getAllPrompts = (): string => {
    return PROMPT_PACKS
      .map((pack) => {
        const prompts = pack.archetypes[archetype]?.[stage] || [];
        return prompts
          .map((p: BlueprintPrompt) => `## ${pack.pillar}: ${p.title}\n\n${p.prompt}\n`)
          .join("\n");
      })
      .join("\n\n---\n\n");
  };

  const handleCopyAll = async () => {
    const allPrompts = getAllPrompts();
    await navigator.clipboard.writeText(allPrompts);
    // Could add a toast notification here
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF download functionality
    console.log("PDF download not yet implemented");
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <BlueprintActivationHeader businessName={businessName} />

      {resolvedPillars.length > 0 && (
        <ResolvedPillarsPanel pillars={resolvedPillars} />
      )}

      <PromptPackIntro />

      <div className="space-y-12">
        {PROMPT_PACKS.map((pack) => {
          const prompts = getPillarPrompts(pack.pillar);
          if (prompts.length === 0) return null;

          return (
            <PillarPromptSection
              key={pack.pillar}
              pillar={pack.pillar}
              prompts={prompts}
            />
          );
        })}
      </div>

      <PromptExportControls
        onDownloadPDF={handleDownloadPDF}
        onCopyAll={handleCopyAll}
      />

      <BlueprintPlusNudge primaryPillar={primaryPillar} />
    </div>
  );
}

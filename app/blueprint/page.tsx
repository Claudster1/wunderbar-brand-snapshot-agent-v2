// app/blueprint/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BlueprintModule } from "@/components/blueprint/BlueprintModule";
import { blueprintCopyByPillar, PillarKey } from "@/lib/blueprintCopyByPillar";
import { fireACEvent } from "@/lib/fireACEvent";
import { BlueprintActivationPaths } from "@/components/blueprint/BlueprintActivationPaths";

export default function BlueprintPage() {
  const [primaryPillar, setPrimaryPillar] = useState<PillarKey>("positioning");
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [brandStage, setBrandStage] = useState<string>("");

  useEffect(() => {
    // Try to get primary pillar from localStorage or URL params
    const storedPillar = localStorage.getItem("primary_pillar");
    if (storedPillar && ["positioning", "messaging", "visibility", "credibility", "conversion"].includes(storedPillar)) {
      setPrimaryPillar(storedPillar as PillarKey);
    }

    const storedEmail = localStorage.getItem("brand_snapshot_email");
    if (storedEmail) {
      setEmail(storedEmail);
    }

    const stage =
      localStorage.getItem("brand_stage") ||
      localStorage.getItem("snapshot_stage") ||
      "";
    setBrandStage(stage);
  }, []);

  const copy = blueprintCopyByPillar[primaryPillar];
  const onBlueprintClick = () => {
    fireACEvent({
      email,
      eventName: "blueprint_clicked",
      tags: ["blueprint:clicked"],
      fields: {
        primary_pillar: primaryPillar,
        brand_stage: brandStage,
      },
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-20 space-y-10">
      <h1 className="text-4xl font-semibold text-[#021859]">
        WunderBrand Blueprint™
      </h1>

      <p className="mt-4 text-lg max-w-2xl">
        {copy.body}
      </p>

      <section className="grid md:grid-cols-2 gap-8">
        <BlueprintModule
          title="Brand Persona & Archetype"
          description="Defines how your brand shows up — consistently, confidently, and credibly."
        />
        <BlueprintModule
          title="Messaging Framework"
          description="Clear value propositions, narratives, and proof points."
        />
        <BlueprintModule
          title="AI Prompt Pack"
          description="Reusable prompts for content, campaigns, and messaging."
        />
        <BlueprintModule
          title="Activation Playbook"
          description="How to apply your brand across channels and teams."
        />
      </section>

      <BlueprintActivationPaths
        primaryPillar={primaryPillar}
        brandName="your brand"
      />

      <Link
        href="/checkout/blueprint"
        onClick={onBlueprintClick}
        className="inline-flex rounded-[10px] bg-[#07B0F2] px-6 py-3 text-sm font-semibold text-white hover:bg-[#059BD8] no-underline"
      >
        Activate Blueprint™ →
      </Link>
    </div>
  );
}

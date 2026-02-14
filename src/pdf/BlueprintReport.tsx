import { Page, Text, View } from "@react-pdf/renderer";
import { PillarActivationSection } from "./sections/PillarActivationSection";
import { ArchetypeSection } from "./sections/ArchetypeSection";

type BlueprintReportData = {
  brandName: string;
  primaryPillar:
    | "positioning"
    | "messaging"
    | "visibility"
    | "credibility"
    | "conversion";
  archetype: {
    name: string;
    definition: string;
  };
  secondaryArchetype?: {
    name: string;
  };
  activatedPillars: Array<{
    key: string;
    name: string;
    whyItMatters: string;
    activations: string[];
  }>;
};

export function BlueprintReport({
  blueprint,
}: {
  blueprint: BlueprintReportData;
}) {
  const {
    brandName,
    primaryPillar,
    activatedPillars,
    archetype,
    secondaryArchetype,
  } = blueprint;

  return (
    <Page size="A4" style={{ padding: 56, fontFamily: "Helvetica" }}>
      {/* Header */}
      <Text style={{ fontSize: 26, fontWeight: "bold", color: "#021859" }}>
        {brandName} — WunderBrand Blueprint™
      </Text>

      <Text
        style={{
          marginTop: 10,
          fontSize: 12,
          color: "#374151",
          marginBottom: 36,
        }}
      >
        A complete brand activation system prepared by Wunderbar Digital.
      </Text>

      {/* Context */}
      <View style={{ marginBottom: 36 }}>
        <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 8 }}>
          What this Blueprint™ delivers
        </Text>
        <Text style={{ fontSize: 11, color: "#374151", lineHeight: 1.5 }}>
          This Blueprint™ translates your Snapshot+™ insights into a clear,
          usable brand system — aligning positioning, messaging, visibility,
          credibility, and conversion into a single strategic foundation.
        </Text>
      </View>

      {/* Archetype */}
      <ArchetypeSection
        archetype={archetype}
        secondary={secondaryArchetype}
      />

      {/* Activated Pillars */}
      {activatedPillars.map((pillar: any) => (
        <PillarActivationSection
          key={pillar.key}
          pillar={pillar}
          emphasis={pillar.key === primaryPillar ? "primary" : "secondary"}
        />
      ))}

      {/* Closing */}
      <View
        style={{
          marginTop: 48,
          paddingTop: 24,
          borderTop: "1px solid #E5E7EB",
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: "bold", marginBottom: 6 }}>
          How to use this Blueprint™
        </Text>
        <Text style={{ fontSize: 11, color: "#374151" }}>
          This document is designed to guide decisions, align execution, and
          inform every marketing, content, and growth initiative moving forward.
        </Text>
      </View>
    </Page>
  );
}

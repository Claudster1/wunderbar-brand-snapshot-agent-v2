// src/pdf/sections/PillarSection.tsx
// Reusable pillar section component for PDF documents

import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { ScoreGauge } from "../components/ScoreGauge";
import { stageModifier, archetypeModifier } from "@/src/lib/pillars/pillarModifiers";
import { PILLAR_COPY, PillarKey } from "@/src/lib/pillars/pillarCopy";
import { SnapshotContext } from "@/src/lib/pillars/types";

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  card: {
    border: "1pt solid #E0E3EA",
    borderRadius: 8,
    padding: 20,
    marginBottom: 18,
  },
  primary: {
    borderColor: "#07B0F2",
    backgroundColor: "#F7FBFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  titleWrap: {
    marginLeft: 14,
    flexGrow: 1,
  },
  label: {
    fontSize: 11,
    letterSpacing: 1,
    color: "#7C8CA5",
    textTransform: "uppercase",
  },
  headline: {
    fontSize: 17,
    fontWeight: 600,
    color: "#021859",
  },
  body: {
    fontSize: 12,
    lineHeight: 1.6,
    marginBottom: 10,
  },
  why: {
    fontSize: 11,
    color: "#475569",
    lineHeight: 1.5,
  },
  modifier: {
    fontSize: 11,
    marginTop: 8,
    color: "#334155",
  },
});

interface PillarSectionProps {
  pillar: PillarKey;
  businessName: string;
  isPrimary?: boolean;
}

export function PillarSection({ 
  pillar, 
  businessName, 
  isPrimary = false 
}: PillarSectionProps) {
  const copy = PILLAR_COPY[pillar];

  return (
    <View style={styles.section}>
      <View style={[styles.card, ...(isPrimary ? [styles.primary] : [])]}>
        <Text style={styles.label}>
          {copy.label}
        </Text>

        <Text style={styles.headline}>
          {copy.headline(businessName)}
        </Text>

        <Text style={styles.body}>
          {copy.body(businessName)}
        </Text>

        <Text style={styles.why}>
          {copy.whyItMatters(businessName)}
        </Text>
      </View>
    </View>
  );
}

export function PillarPDFSection(context: SnapshotContext) {
  const { businessName, pillarScores, brandStage, archetype } = context;

  const ordered = Object.entries(pillarScores)
    .sort((a, b) => a[1] - b[1])
    .map(([p]) => p as PillarKey);

  const primaryPillar = ordered[0];

  return (
    <View>
      {ordered.map((pillar) => {
        const copy = PILLAR_COPY[pillar];
        const score = pillarScores[pillar];
        const isPrimary = pillar === primaryPillar;

        return (
          <View
            key={pillar}
            style={[styles.card, ...(isPrimary ? [styles.primary] : [])]}
          >
            <View style={styles.header}>
              <ScoreGauge score={score} />
              <View style={styles.titleWrap}>
                <Text style={styles.label}>
                  {copy.label}
                  {isPrimary ? " — Primary Opportunity" : ""}
                </Text>
                <Text style={styles.headline}>
                  {copy.headline(businessName)}
                </Text>
              </View>
            </View>

            {isPrimary ? (
              <>
                <Text style={styles.body}>
                  {copy.body(businessName)}
                </Text>

                <Text style={styles.why}>
                  {copy.whyItMatters(businessName)}
                </Text>

                <Text style={styles.modifier}>
                  {stageModifier(brandStage)} {archetypeModifier(archetype)}
                </Text>
              </>
            ) : (
              <Text style={styles.why}>
                {copy.whyItMatters(businessName)}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

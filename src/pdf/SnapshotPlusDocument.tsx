// src/pdf/SnapshotPlusDocument.tsx

import { Document, Page, View, Text } from "@react-pdf/renderer";
import { PillarSection } from "./components/PillarSection";
import { ScoreGauge } from "./components/ScoreGauge";
import { ContextCoverageMeter } from "./components/ContextCoverageMeter";
import { ImplementationNextSteps } from "./sections/ImplementationNextSteps";
import { DisclaimerPage } from "./components/DisclaimerPage";

type Props = {
  brandName: string;
  stage: "early" | "scaling";
  pillarScores: Record<string, number>;
  primaryPillar: string;
  coverage: number;
  insights: Record<string, string>;
  recommendations: Record<string, string>;
};

export function SnapshotPlusDocument({
  brandName,
  stage,
  pillarScores,
  primaryPillar,
  coverage,
  insights,
  recommendations,
}: Props) {
  return (
    <Document>
      <Page size="A4" style={{ padding: 48 }}>
        {/* HEADER */}
        <Text style={{ fontSize: 22, fontWeight: 700 }}>
          Snapshot+™ Strategic Report
        </Text>
        <Text style={{ fontSize: 12, marginBottom: 24 }}>
          {brandName}
        </Text>

        {/* SCORE GAUGE */}
        <View style={{ marginBottom: 24 }}>
          <ScoreGauge
            score={
              Object.values(pillarScores).reduce((a, b) => a + b, 0) /
              Object.keys(pillarScores).length
            }
            emphasis="primary"
          />
        </View>

        {/* COVERAGE METER */}
        <View style={{ marginBottom: 24 }}>
          <ContextCoverageMeter percent={coverage} />
        </View>
        {/* PILLAR SECTIONS */}
        {Object.entries(pillarScores).map(([pillar, score]) => (
          <PillarSection
            key={pillar}
            name={pillar.charAt(0).toUpperCase() + pillar.slice(1)}
            score={score}
            insight={insights[pillar]}
            recommendation={recommendations[pillar]}
            emphasis={pillar === primaryPillar ? "primary" : "secondary"}
          />
        ))}

        <ImplementationNextSteps />
      </Page>

      <DisclaimerPage tier="snapshot_plus" />
    </Document>
  );
}

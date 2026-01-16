// src/pdf/SnapshotPlusReport.tsx
// Snapshot+ PDF report document

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

import { ScoreGaugePDF } from "./components/ScoreGaugePDF";
import { ContextCoverageMeterPDF } from "./components/ContextCoverageMeterPDF";
import { PillarSectionPDF } from "./components/PillarSectionPDF";

import { determinePrimaryPillar } from "@/src/lib/scoring/determinePrimaryPillar";
import { computeContextCoverage } from "@/src/lib/context/coverage";
import { rolePhrase } from "@/src/lib/roleLanguage";

export function SnapshotPlusReport({ report }: { report: any }) {
  const primaryPillar = determinePrimaryPillar(report.pillarScores);
  const coverage = computeContextCoverage(report);

  return (
    <Document>
      <Page style={styles.page}>
        {/* 1️⃣ Overview: Your Brand Snapshot™ Summary */}
        <View style={styles.section}>
          <Text style={styles.h1}>Your Brand Snapshot™ Summary</Text>
          <Text style={styles.contextNote}>
            This Snapshot+™ was generated to support you in{" "}
            {rolePhrase(report.userRoleContext)} — based on the inputs you provided and
            the areas where focused alignment will have the greatest impact.
          </Text>
        </View>

        {/* 2️⃣ Alignment: Brand Alignment Score™ */}
        <View style={styles.section}>
          <Text style={styles.h1}>Brand Alignment Score™</Text>
          <ScoreGaugePDF score={report.brandAlignmentScore} />
        </View>

        {/* 3️⃣ Pillars: Pillar Analysis (Primary Expanded, Secondary Collapsed) */}
        <View style={styles.section}>
          <Text style={styles.h1}>Pillar Analysis</Text>
          {Object.entries(report.pillars).map(([key, pillar]) => (
            <PillarSectionPDF
              key={key}
              pillarKey={key}
              pillar={pillar}
              isPrimary={key === primaryPillar}
            />
          ))}
        </View>

        {/* 4️⃣ Context Gaps: What We Could Go Deeper On */}
        <View style={styles.section}>
          <Text style={styles.h2}>What We Could Go Deeper On</Text>
          <Text style={styles.body}>
            Additional strategic context would enable more precise recommendations
            and deeper insight into {report.businessName}'s brand opportunities.
          </Text>
        </View>

        {/* 5️⃣ Next Step: Your Strategic Next Step */}
        <View style={styles.section}>
          <Text style={styles.h2}>Your Strategic Next Step</Text>
          <Text style={styles.body}>
            Blueprint™ transforms these insights into a complete activation
            system for {report.businessName}.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  section: {
    marginBottom: 24,
  },
  h1: {
    fontSize: 18,
    marginBottom: 6,
    fontWeight: 700,
  },
  h2: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: 600,
  },
  body: {
    fontSize: 11,
    lineHeight: 1.5,
  },
  contextNote: {
    fontSize: 11,
    lineHeight: 1.5,
    color: "#475569",
  },
});

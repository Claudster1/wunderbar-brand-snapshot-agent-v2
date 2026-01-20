import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";
import { ScoreGauge } from "../components/ScoreGauge";

type PillarScore = {
  name: string;
  score: number;
  insight: string;
  recommendation: string;
  priority: "primary" | "secondary" | "tertiary";
};

type Props = {
  brandName: string;
  brandAlignmentScore: number;
  pillars: PillarScore[];
};

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: "Helvetica",
    color: "#021859",
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
  },
  alignmentBlock: {
    marginVertical: 24,
    padding: 20,
    borderRadius: 8,
    backgroundColor: "#F6F9FF",
  },
  alignmentScore: {
    fontSize: 36,
    fontWeight: "bold",
  },
  section: {
    marginTop: 28,
  },
  pillarHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  whyItMatters: {
    fontSize: 11,
    color: "#666",
    marginBottom: 8,
  },
  body: {
    fontSize: 12,
    lineHeight: 1.6,
  },
  recommendation: {
    marginTop: 10,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#07B0F2",
  },
  ctaBlock: {
    marginTop: 40,
    padding: 20,
    borderRadius: 8,
    backgroundColor: "#021859",
    color: "#fff",
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  ctaBody: {
    fontSize: 12,
    lineHeight: 1.6,
  },
});

export function SnapshotPlusReportDocument({
  brandName,
  brandAlignmentScore,
  pillars,
}: Props) {
  const sorted = [...pillars].sort((a, b) =>
    a.priority === "primary" ? -1 : 1
  );

  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Brand Snapshot+™</Text>
          <Text style={styles.subtitle}>Prepared for {brandName}</Text>
        </View>

        <View style={styles.alignmentBlock}>
          <Text>Brand Alignment Score™</Text>
          <Text style={styles.alignmentScore}>{brandAlignmentScore}</Text>
          <ScoreGauge value={brandAlignmentScore} />
        </View>

        {sorted.map((pillar) => (
          <View key={pillar.name} style={styles.section}>
            <Text style={styles.pillarHeader}>
              {pillar.name}
              {pillar.priority === "primary" ? " — Primary Focus Area" : ""}
            </Text>

            <Text style={styles.whyItMatters}>
              Why this matters for {brandName}
            </Text>

            <Text style={styles.body}>{pillar.insight}</Text>

            <View style={styles.recommendation}>
              <Text style={styles.body}>
                Recommended focus: {pillar.recommendation}
              </Text>
            </View>
          </View>
        ))}

        <View style={styles.ctaBlock}>
          <Text style={styles.ctaTitle}>Activate These Insights</Text>
          <Text style={styles.ctaBody}>
            Blueprint™ turns your highest-impact pillars into a complete brand
            system — messaging, positioning, and activation prompts designed
            specifically for {brandName}.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

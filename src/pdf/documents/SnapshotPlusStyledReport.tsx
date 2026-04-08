import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";
import { ScoreGauge } from "../components/ScoreGauge";
import { DisclaimerPage } from "../components/DisclaimerPage";

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
    padding: 42,
    paddingBottom: 66,
    fontFamily: "Helvetica",
    color: "#021859",
    fontSize: 10.5,
    lineHeight: 1.6,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 11,
    color: "#555",
  },
  alignmentBlock: {
    marginVertical: 18,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#F6F9FF",
  },
  alignmentScore: {
    fontSize: 32,
    fontWeight: "bold",
  },
  section: {
    marginTop: 20,
  },
  pillarHeader: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6,
  },
  whyItMatters: {
    fontSize: 10,
    color: "#666",
    marginBottom: 8,
  },
  body: {
    fontSize: 10.5,
    lineHeight: 1.6,
  },
  recommendation: {
    marginTop: 10,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#07B0F2",
  },
  ctaBlock: {
    marginTop: 28,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#021859",
    color: "#fff",
  },
  ctaTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6,
  },
  ctaBody: {
    fontSize: 10.5,
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
          <Text style={styles.title}>WunderBrand Snapshot+™</Text>
          <Text style={styles.subtitle}>Prepared for {brandName}</Text>
        </View>

        <View style={styles.alignmentBlock}>
          <Text>WunderBrand Score™</Text>
          <Text style={styles.alignmentScore}>{brandAlignmentScore}</Text>
          <ScoreGauge score={brandAlignmentScore} />
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

      <DisclaimerPage tier="snapshot_plus" />
    </Document>
  );
}

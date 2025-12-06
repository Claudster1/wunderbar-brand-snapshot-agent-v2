// components/SnapshotPdfTemplate.tsx
// React-PDF template for Brand Snapshot reports

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#021859",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#021859",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#021859",
    marginBottom: 8,
    borderBottom: "2px solid #07b0f2",
    paddingBottom: 4,
  },
  scoreContainer: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#021859",
  },
  scoreLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  pillarRow: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottom: "1px solid #e5e7eb",
  },
  pillarName: {
    fontSize: 13,
    fontWeight: 600,
    color: "#021859",
    marginBottom: 4,
    textTransform: "capitalize",
  },
  pillarScore: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 6,
  },
  pillarInsight: {
    fontSize: 10,
    color: "#111827",
    lineHeight: 1.5,
  },
  recommendationItem: {
    fontSize: 10,
    color: "#111827",
    marginBottom: 6,
    paddingLeft: 8,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 9,
    color: "#9ca3af",
  },
});

interface SnapshotPdfTemplateProps {
  report: {
    user_name?: string;
    company_name?: string;
    brand_alignment_score?: number;
    pillar_scores?: {
      positioning?: number;
      messaging?: number;
      visibility?: number;
      credibility?: number;
      conversion?: number;
    };
    insights?: {
      positioning?: string;
      messaging?: string;
      visibility?: string;
      credibility?: string;
      conversion?: string;
    };
    recommendations?: string[];
    summary?: string;
    overall_interpretation?: string;
    opportunities_summary?: string;
    upgrade_cta?: string;
  };
}

export default function SnapshotPdfTemplate({
  report,
}: SnapshotPdfTemplateProps) {
  const {
    user_name,
    company_name,
    brand_alignment_score,
    pillar_scores,
    insights,
    recommendations,
    summary,
    overall_interpretation,
    opportunities_summary,
    upgrade_cta,
  } = report;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Text style={styles.header}>Your Brand Snapshot™</Text>
        <Text style={styles.subtitle}>
          {user_name && `Prepared for: ${user_name}`}
          {company_name && ` • Company: ${company_name}`}
        </Text>

        {/* Brand Alignment Score */}
        <View style={styles.section}>
          <View style={styles.scoreContainer}>
            <Text style={styles.sectionTitle}>Brand Alignment Score™</Text>
            <Text style={styles.scoreNumber}>
              {brand_alignment_score || 0}/100
            </Text>
            <Text style={styles.scoreLabel}>
              {(brand_alignment_score || 0) >= 80
                ? "Excellent Alignment"
                : (brand_alignment_score || 0) >= 60
                ? "Strong Foundation"
                : (brand_alignment_score || 0) >= 40
                ? "Developing Brand"
                : "Needs Focus"}
            </Text>
          </View>
        </View>

        {/* Pillar Insights */}
        {pillar_scores && insights && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pillar Insights</Text>
            {Object.keys(pillar_scores).map((pillar) => {
              const score = pillar_scores[pillar as keyof typeof pillar_scores];
              const insight =
                insights[pillar as keyof typeof insights] || "No insight available.";

              return (
                <View key={pillar} style={styles.pillarRow}>
                  <Text style={styles.pillarName}>
                    {pillar.charAt(0).toUpperCase() + pillar.slice(1)}
                  </Text>
                  <Text style={styles.pillarScore}>Score: {score}/20</Text>
                  <Text style={styles.pillarInsight}>{insight}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Summary */}
        {summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.pillarInsight}>{summary}</Text>
          </View>
        )}

        {/* Overall Interpretation */}
        {overall_interpretation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Brand Alignment Interpretation</Text>
            <Text style={styles.pillarInsight}>{overall_interpretation}</Text>
          </View>
        )}

        {/* Opportunities Summary */}
        {opportunities_summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Opportunities</Text>
            <Text style={styles.pillarInsight}>{opportunities_summary}</Text>
          </View>
        )}

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended Next Steps</Text>
            {recommendations.map((rec: string, i: number) => (
              <Text key={i} style={styles.recommendationItem}>
                • {rec}
              </Text>
            ))}
          </View>
        )}

        {/* Upgrade CTA */}
        {upgrade_cta && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upgrade to Snapshot+</Text>
            <Text style={styles.pillarInsight}>{upgrade_cta}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by Wunderbar Digital • Brand Snapshot™
        </Text>
      </Page>
    </Document>
  );
}


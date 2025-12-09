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
  paletteRow: {
    flexDirection: "row",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottom: "1px solid #e5e7eb",
    alignItems: "center",
  },
  colName: {
    fontSize: 10,
    fontWeight: 600,
    color: "#021859",
    width: "25%",
  },
  swatch: {
    width: 30,
    height: 30,
    borderRadius: 4,
    border: "1px solid #e5e7eb",
    marginRight: 12,
  },
  colRole: {
    fontSize: 10,
    color: "#6b7280",
    width: "20%",
  },
  colMeaning: {
    fontSize: 10,
    color: "#111827",
    width: "45%",
    lineHeight: 1.4,
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
    company?: string;
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
    pillar_insights?: {
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
    color_palette?: Array<{
      name: string;
      hex: string;
      role: string;
      meaning: string;
    }>;
    persona?: string;
    archetype?: string;
  };
}

export default function SnapshotPdfTemplate({
  report,
}: SnapshotPdfTemplateProps) {
  const {
    user_name,
    company_name,
    company,
    brand_alignment_score,
    pillar_scores,
    insights,
    pillar_insights,
    recommendations,
    summary,
    overall_interpretation,
    opportunities_summary,
    upgrade_cta,
    color_palette,
    persona,
    archetype,
  } = report;

  const displayCompany = company || company_name;
  const displayInsights = pillar_insights || insights || {};

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Text style={styles.header}>Your Brand Snapshot™</Text>
        <Text style={styles.subtitle}>
          {user_name && `Prepared for: ${user_name}`}
          {displayCompany && ` • Company: ${displayCompany}`}
        </Text>

        {/* Brand Alignment Score */}
        <View style={styles.section}>
          <Text style={{ fontSize: 32, marginBottom: 40 }}>
            Brand Alignment Score™: <Text style={{ fontWeight: 'bold' }}>{brand_alignment_score || 0}</Text>
          </Text>
        </View>

        {/* Pillar Insights */}
        {pillar_scores && displayInsights && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pillar Insights</Text>
            {Object.keys(pillar_scores).map((pillar) => {
              const score = pillar_scores[pillar as keyof typeof pillar_scores];
              const insightData = displayInsights[pillar as keyof typeof displayInsights];
              
              // Handle both old format (string) and new format (object with strength, opportunity, action)
              const isNewFormat = insightData && typeof insightData === 'object' && 'strength' in insightData;
              
              const strength = isNewFormat ? (insightData as any).strength : null;
              const opportunity = isNewFormat ? (insightData as any).opportunity : null;
              const action = isNewFormat ? (insightData as any).action : null;
              const fallbackInsight = typeof insightData === 'string' ? insightData : "No insight available.";

              return (
                <View key={pillar} style={styles.pillarRow}>
                  <Text style={styles.pillarName}>
                    {pillar.charAt(0).toUpperCase() + pillar.slice(1)}
                  </Text>
                  <Text style={styles.pillarScore}>Score: {score}/20</Text>
                  {isNewFormat && strength && opportunity && action ? (
                    <View>
                      {strength && (
                        <View style={{ marginBottom: 6 }}>
                          <Text style={[styles.pillarInsight, { fontWeight: 'bold', color: '#059669' }]}>
                            Strength: 
                          </Text>
                          <Text style={styles.pillarInsight}>{strength}</Text>
                        </View>
                      )}
                      {opportunity && (
                        <View style={{ marginBottom: 6 }}>
                          <Text style={[styles.pillarInsight, { fontWeight: 'bold', color: '#07b0f2' }]}>
                            Opportunity: 
                          </Text>
                          <Text style={styles.pillarInsight}>{opportunity}</Text>
                        </View>
                      )}
                      {action && (
                        <View>
                          <Text style={[styles.pillarInsight, { fontWeight: 'bold', color: '#d97706' }]}>
                            Next Step: 
                          </Text>
                          <Text style={styles.pillarInsight}>{action}</Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    <Text style={styles.pillarInsight}>{fallbackInsight}</Text>
                  )}
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

        {/* Brand Persona & Archetype (Snapshot+ only) */}
        {(persona || archetype) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Brand Persona & Archetype</Text>
            {archetype && (
              <Text style={styles.pillarInsight}>
                <Text style={{ fontWeight: 'bold' }}>Archetype: </Text>
                {archetype}
              </Text>
            )}
            {persona && (
              <Text style={styles.pillarInsight}>
                <Text style={{ fontWeight: 'bold' }}>Persona: </Text>
                {persona}
              </Text>
            )}
          </View>
        )}

        {/* Color Palette (Snapshot+ only) */}
        {color_palette && color_palette.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended Brand Color Palette</Text>
            <Text style={[styles.pillarInsight, { marginBottom: 12 }]}>
              Each color plays a role in how your brand is perceived. Here's the palette WUNDY™ generated for you, with the meaning behind each choice:
            </Text>
            {color_palette.map((color, index) => (
              <View key={index} style={styles.paletteRow}>
                <Text style={styles.colName}>{color.name}</Text>
                <View style={[styles.swatch, { backgroundColor: color.hex }]} />
                <Text style={styles.colRole}>{color.role}</Text>
                <Text style={styles.colMeaning}>{color.meaning}</Text>
              </View>
            ))}
            <Text style={[styles.pillarInsight, { marginTop: 12, fontSize: 9, color: '#6b7280' }]}>
              If you'd like WUNDY™ to turn this into a fully realized visual identity system—including brand pillars, persona, archetype, typography, and a polished brand guide—you're a perfect fit for Snapshot+™.
            </Text>
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
        <Text style={{
          fontSize: 24,
          opacity: 0.9,
          position: 'absolute',
          bottom: 30,
          left: 40,
          right: 40,
          textAlign: 'center',
        }}>
          Generated by Wundy • Brand Snapshot™ • Wunderbar Digital
        </Text>
      </Page>
    </Document>
  );
}


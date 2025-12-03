// components/BrandSnapshotPDF.tsx

import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 12,
    fontFamily: "Helvetica"
  },
  heading: {
    fontSize: 22,
    color: "#021859",
    marginBottom: 8,
    fontWeight: 700
  },
  subheading: {
    fontSize: 14,
    marginTop: 20,
    marginBottom: 6,
    color: "#021859",
    fontWeight: 600
  },
  section: {
    marginBottom: 14
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: "#021859",
    marginBottom: 4
  },
  text: {
    fontSize: 12,
    lineHeight: 1.5
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 12
  }
});

export default function BrandSnapshotPDF({ data }: { data: any }) {
  const {
    userName,
    brandAlignmentScore,
    pillarScores,
    pillarInsights,
    recommendations,
    websiteNotes
  } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        <Text style={styles.heading}>Brand Snapshot™ Report</Text>
        <Text style={styles.text}>Prepared for: {userName}</Text>

        <View style={styles.divider} />

        {/* Overall Score */}
        <View style={styles.section}>
          <Text style={styles.subheading}>Brand Alignment Score™</Text>
          <Text style={styles.text}>{brandAlignmentScore} / 100</Text>
        </View>

        {/* Pillar Scores */}
        <View style={styles.section}>
          <Text style={styles.subheading}>Pillar Breakdown</Text>
          {Object.entries(pillarScores).map(([key, val]: any) => (
            <Text key={key} style={styles.text}>
              {key.charAt(0).toUpperCase() + key.slice(1)}: {val.toFixed(1)} / 20
            </Text>
          ))}
        </View>

        {/* Insights */}
        <View style={styles.section}>
          <Text style={styles.subheading}>Insights</Text>
          {Object.entries(pillarInsights).map(([key, insight]: any) => (
            <View key={key} style={{ marginBottom: 8 }}>
              <Text style={styles.label}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Text>
              <Text style={styles.text}>{insight}</Text>
            </View>
          ))}
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.subheading}>Top Recommendations</Text>
          {recommendations.map((rec: string, i: number) => (
            <Text key={i} style={styles.text}>
              • {rec}
            </Text>
          ))}
        </View>

        {/* Website Notes */}
        {websiteNotes && (
          <View style={styles.section}>
            <Text style={styles.subheading}>Website Notes</Text>
            <Text style={styles.text}>{websiteNotes}</Text>
          </View>
        )}

      </Page>
    </Document>
  );
}

// src/pdf/documents/SnapshotPlusDocument.tsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { PILLARS, BrandStage, PillarKey } from "@/lib/pillars";
import { registerPdfFonts } from "../registerFonts";
import { PdfHeader } from "../components/PdfHeader";
import { PdfFooter } from "../components/PdfFooter";
import { DisclaimerPage } from "../components/DisclaimerPage";
import { pdfTheme } from "../theme";

// Register fonts
registerPdfFonts();

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    padding: 42,
    paddingBottom: 66,
    fontSize: 11,
    color: pdfTheme.colors.text,
    lineHeight: 1.6,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    fontFamily: "Helvetica",
    fontWeight: 600,
    color: pdfTheme.colors.navy,
  },
  section: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    border: `1 solid ${pdfTheme.colors.border}`,
    backgroundColor: "#F8FBFF",
  },
  pillarTitle: {
    fontSize: 14,
    marginBottom: 6,
    fontFamily: "Helvetica",
    fontWeight: 600,
    color: pdfTheme.colors.navy,
  },
  body: {
    lineHeight: 1.6,
    fontFamily: "Helvetica",
    color: pdfTheme.colors.text,
    marginBottom: 8,
    fontSize: 10.2,
  },
  recommendationsTitle: {
    marginTop: 6,
    fontFamily: "Helvetica",
    fontWeight: 600,
    color: "#0D5BD7",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontSize: 8.5,
  },
  recommendation: {
    marginBottom: 4,
    fontFamily: "Helvetica",
    color: pdfTheme.colors.text,
    lineHeight: 1.6,
    fontSize: 10,
  },
});

interface SnapshotPlusReport {
  businessName: string;
  pillarScores: Record<PillarKey, number>;
  stage: BrandStage;
}

export function SnapshotPlusDocument({ report }: { report: SnapshotPlusReport }) {
  const ranked = (Object.keys(report.pillarScores) as PillarKey[]).sort(
    (a, b) => report.pillarScores[a] - report.pillarScores[b]
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PdfHeader
          title="WunderBrand Snapshot+™ — Brand Direction Summary"
          businessName={report.businessName}
          date={new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        />

        <Text style={styles.title}>
          Brand Direction Summary for {report.businessName}
        </Text>

        {ranked.map((pillarKey) => {
          const pillar = PILLARS[pillarKey];
          return (
            <View key={pillarKey} style={styles.section}>
              <Text style={styles.pillarTitle}>
                {pillar.title} ({report.pillarScores[pillarKey]}/20)
              </Text>

              <Text style={styles.body}>
                {pillar.expanded[report.stage](report.businessName)}
              </Text>

              <Text style={styles.recommendationsTitle}>
                Recommendations:
              </Text>

              {pillar.recommendations[report.stage].map((r, i) => (
                <Text key={i} style={styles.recommendation}>
                  • {r}
                </Text>
              ))}
            </View>
          );
        })}

        <PdfFooter businessName={report.businessName} productName="WunderBrand Snapshot+™" />
      </Page>

      <DisclaimerPage tier="snapshot_plus" />
    </Document>
  );
}

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
    fontFamily: "Inter",
    padding: 40,
    fontSize: 11,
  },
  title: {
    fontSize: 22,
    marginBottom: 12,
    fontFamily: "Inter",
    fontWeight: 600,
    color: pdfTheme.colors.navy,
  },
  section: {
    marginBottom: 20,
  },
  pillarTitle: {
    fontSize: 16,
    marginBottom: 6,
    fontFamily: "Inter",
    fontWeight: 600,
    color: pdfTheme.colors.navy,
  },
  body: {
    lineHeight: 1.5,
    fontFamily: "Inter",
    color: pdfTheme.colors.midnight,
    marginBottom: 8,
  },
  recommendationsTitle: {
    marginTop: 8,
    fontFamily: "Inter",
    fontWeight: 600,
    color: pdfTheme.colors.navy,
    marginBottom: 4,
  },
  recommendation: {
    marginBottom: 4,
    fontFamily: "Inter",
    color: pdfTheme.colors.midnight,
    lineHeight: 1.5,
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
        <PdfHeader title="WunderBrand Snapshot+™ Report" />

        <Text style={styles.title}>
          Snapshot+™ for {report.businessName}
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

        <PdfFooter />
      </Page>

      <DisclaimerPage tier="snapshot_plus" />
    </Document>
  );
}

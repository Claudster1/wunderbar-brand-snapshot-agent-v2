import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";
import { BlueprintCover } from "../sections/BlueprintCover";
import { BlueprintContinuity } from "../sections/BlueprintContinuity";
import { PillarActivation } from "../sections/PillarActivation";
import { VisibilityAEOSection } from "../sections/VisibilityAEOSection";
import { BlueprintPromptLibrary } from "../sections/BlueprintPromptLibrary";
import { BlueprintPlusCTA } from "../sections/BlueprintPlusCTA";
import { DisclaimerPage } from "../components/DisclaimerPage";

const styles = StyleSheet.create({
  page: {
    padding: 42,
    fontSize: 10.5,
    fontFamily: "Helvetica",
    color: pdfTheme.colors.text,
    lineHeight: 1.6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: pdfTheme.colors.navy,
    marginBottom: 10,
    marginTop: 20,
  },
  subsectionTitle: {
    fontSize: 11.5,
    fontWeight: 700,
    color: pdfTheme.colors.blue,
    marginBottom: 6,
    marginTop: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  body: {
    fontSize: 10.3,
    lineHeight: 1.62,
    color: pdfTheme.colors.text,
    marginBottom: 6,
  },
  card: {
    backgroundColor: "#F8FBFF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    border: `1 solid ${pdfTheme.colors.border}`,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: pdfTheme.colors.navy,
    marginBottom: 4,
  },
  bullet: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#333",
    paddingLeft: 8,
  },
  tag: {
    fontSize: 7.6,
    fontWeight: 600,
    color: "#0B4FB2",
    backgroundColor: "#E8F2FF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
});

type QuickWin = {
  asset: string;
  pillar: string;
  issue: string;
  fix: string;
  impact: string;
};

type AssetAlignmentNotes = {
  summary?: string;
  quickWins?: QuickWin[];
  weakestPillarGap?: string;
};

type PillarActivationData = {
  name: string;
  snapshotInsight: string;
  blueprintActivation: string;
};

type BlueprintReportData = {
  brandName: string;
  primaryPillar: string;
  pillars: PillarActivationData[];
  assetAlignmentNotes?: AssetAlignmentNotes;
};

export function BlueprintReportDocument({
  data,
}: {
  data: BlueprintReportData;
}) {
  const notes = data.assetAlignmentNotes;
  const hasNotes = notes && notes.quickWins && notes.quickWins.length > 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <BlueprintCover brandName={data.brandName} />
        <BlueprintContinuity primaryPillar={data.primaryPillar} />

        {data.pillars.map((p) => (
          <PillarActivation
            key={p.name}
            pillarName={p.name}
            snapshotInsight={p.snapshotInsight}
            blueprintActivation={p.blueprintActivation}
          />
        ))}

        <VisibilityAEOSection brandName={data.brandName} />
        <BlueprintPromptLibrary />

        {hasNotes && (
          <View wrap={false}>
            <Text style={styles.sectionTitle}>Asset Alignment Notes</Text>

            {notes!.summary && (
              <Text style={styles.body}>{notes!.summary}</Text>
            )}

            <Text style={styles.subsectionTitle}>Quick Wins</Text>
            {notes!.quickWins!.map((qw, i) => (
              <View key={i} style={styles.card}>
                <View style={{ flexDirection: "row" as const, marginBottom: 3 }}>
                  <Text style={{ ...styles.tag, marginRight: 6 }}>{qw.pillar}</Text>
                  <Text style={{ ...styles.cardTitle, fontSize: 10 }}>{qw.asset}</Text>
                </View>
                <Text style={styles.body}>
                  <Text style={{ fontWeight: 600 }}>Issue: </Text>{qw.issue}
                </Text>
                <Text style={styles.body}>
                  <Text style={{ fontWeight: 600 }}>Fix: </Text>{qw.fix}
                </Text>
                <Text style={{ fontSize: 9, color: "#666" }}>
                  Impact: {qw.impact}
                </Text>
              </View>
            ))}

            {notes!.weakestPillarGap && (
              <View style={{ ...styles.card, backgroundColor: "#fff4e6", marginTop: 8 }}>
                <Text style={{ ...styles.cardTitle, color: "#b35900" }}>
                  Weakest Pillar Gap
                </Text>
                <Text style={styles.body}>{notes!.weakestPillarGap}</Text>
              </View>
            )}
          </View>
        )}

        <BlueprintPlusCTA />
      </Page>

      <DisclaimerPage tier="blueprint" />
    </Document>
  );
}

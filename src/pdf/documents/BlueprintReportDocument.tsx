import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { BlueprintCover } from "../sections/BlueprintCover";
import { BlueprintContinuity } from "../sections/BlueprintContinuity";
import { PillarActivation } from "../sections/PillarActivation";
import { VisibilityAEOSection } from "../sections/VisibilityAEOSection";
import { BlueprintPromptLibrary } from "../sections/BlueprintPromptLibrary";
import { BlueprintPlusCTA } from "../sections/BlueprintPlusCTA";
import { DisclaimerPage } from "../components/DisclaimerPage";

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#0C1526",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#0C1526",
    marginBottom: 12,
    marginTop: 24,
  },
  subsectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#0C1526",
    marginBottom: 6,
    marginTop: 14,
  },
  body: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#333",
    marginBottom: 4,
  },
  card: {
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#0C1526",
    marginBottom: 3,
  },
  bullet: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#333",
    paddingLeft: 8,
  },
  tag: {
    fontSize: 8,
    fontWeight: 600,
    color: "#1B3A5C",
    backgroundColor: "#e8ecf2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
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
      <Page size="LETTER" style={styles.page}>
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

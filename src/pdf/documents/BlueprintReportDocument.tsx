import { Document, Page, StyleSheet } from "@react-pdf/renderer";
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
});

type PillarActivationData = {
  name: string;
  snapshotInsight: string;
  blueprintActivation: string;
};

type BlueprintReportData = {
  brandName: string;
  primaryPillar: string;
  pillars: PillarActivationData[];
};

export function BlueprintReportDocument({
  data,
}: {
  data: BlueprintReportData;
}) {
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
        <BlueprintPlusCTA />
      </Page>

      <DisclaimerPage tier="blueprint" />
    </Document>
  );
}

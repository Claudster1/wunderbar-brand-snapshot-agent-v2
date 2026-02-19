import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Circle,
  Rect,
} from "@react-pdf/renderer";
import { DisclaimerPage } from "./components/DisclaimerPage";

/* -----------------------------
   SVG Gauge (PDF-safe)
------------------------------ */
function Gauge({ value }: { value: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);

  return (
    <Svg width={120} height={120} viewBox="0 0 120 120">
      <Circle
        cx="60"
        cy="60"
        r={radius}
        stroke="#E5E7EB"
        strokeWidth={10}
        fill="none"
      />
      <Circle
        cx="60"
        cy="60"
        r={radius}
        stroke="#16A34A"
        strokeWidth={10}
        fill="none"
        strokeDasharray={String(circumference)}
        // @ts-expect-error Circle supports strokeDashoffset at runtime; types are incomplete
        strokeDashoffset={String(offset)}
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
      />
    </Svg>
  );
}

/* -----------------------------
   Styles
------------------------------ */
const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#0C1526",
  },
  h1: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 12,
  },
  h2: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 28,
    marginBottom: 10,
  },
  h3: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 6,
  },
  body: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 10,
  },
  callout: {
    backgroundColor: "#F5F7FB",
    padding: 14,
    borderRadius: 6,
    marginVertical: 12,
  },
  subtle: {
    fontSize: 11,
    color: "#475569",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E3EA",
    marginVertical: 24,
  },
  pillarCardPrimary: {
    padding: 16,
    border: "2 solid #16A34A",
    borderRadius: 8,
    marginBottom: 16,
  },
  pillarCard: {
    padding: 16,
    border: "1 solid #E5E7EB",
    borderRadius: 8,
    marginBottom: 16,
  },
  ctaBox: {
    marginTop: 32,
    padding: 20,
    borderRadius: 8,
    backgroundColor: "#021859",
    color: "#FFFFFF",
  },
});

/* -----------------------------
   Document
------------------------------ */
export function SnapshotPlusReport({
  brandName,
  userRolePhrase,
  stage,
  archetype,
  brandAlignmentScore,
  pillarScores,
  primaryPillar,
  pillarInsights,
  recommendations,
  contextCoverage,
}: any) {
  return (
    <Document>
      <Page style={styles.page}>
        {/* Cover */}
        <Text style={styles.h1}>WunderBrand Snapshot+™ — Brand Direction Summary</Text>
        <Text style={styles.body}>Prepared for {brandName}</Text>

        <View style={{ marginTop: 24, alignItems: "center" }}>
          <Gauge value={brandAlignmentScore} />
          <Text style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>
            WunderBrand Score™
          </Text>
          <Text style={styles.subtle}>
            A composite view of how clearly and consistently {brandName} shows
            up today
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Context */}
        <Text style={styles.h2}>How to Read This Report</Text>
        <Text style={styles.body}>
          This Snapshot+™ reflects your current brand foundation based on the
          inputs provided and contextual signals available today. The strongest
          opportunity is highlighted first, followed by supporting areas.
        </Text>

        <Text style={styles.subtle}>
          Brand stage detected: {stage} • Primary archetype: {archetype}
        </Text>

        <View style={styles.divider} />

        {/* Pillars */}
        <Text style={styles.h2}>Your Brand Pillars</Text>

        {Object.entries(pillarScores).map(([pillar, score]: any) => {
          const isPrimary = pillar === primaryPillar;

          return (
            <View
              key={pillar}
              style={isPrimary ? styles.pillarCardPrimary : styles.pillarCard}
            >
              <Text style={styles.h3}>
                {pillar} {isPrimary ? "(Primary Focus Area)" : ""}
              </Text>

              <Text style={styles.subtle}>Score: {score}/20</Text>

              <Text style={styles.body}>{pillarInsights[pillar]}</Text>

              {isPrimary && (
                <>
                  <Text style={styles.body}>
                    <Text style={{ fontWeight: 700 }}>
                      Why this matters for {brandName}:
                    </Text>{" "}
                    This pillar has the greatest influence on how effectively
                    your brand converts clarity into confidence at this stage.
                  </Text>

                  <Text style={styles.body}>
                    <Text style={{ fontWeight: 700 }}>
                      Strategic direction:
                    </Text>{" "}
                    {recommendations[pillar]}
                  </Text>
                </>
              )}
            </View>
          );
        })}

        <View style={styles.divider} />

        {/* Context Coverage */}
        <Text style={styles.h2}>Context Coverage</Text>
        <Text style={styles.body}>
          This Snapshot+™ is based on the information currently available.
          Additional inputs (channels, assets, audience depth) could further
          sharpen future insights.
        </Text>

        <Text style={styles.subtle}>Coverage level: {contextCoverage}%</Text>

        <View style={styles.divider} />

        {/* Upgrade CTA */}
        <View style={styles.ctaBox}>
          <Text style={{ fontSize: 18, fontWeight: 700 }}>
            Ready to turn clarity into activation?
          </Text>
          <Text style={{ marginTop: 8, fontSize: 12 }}>
            Blueprint™ builds directly on your {primaryPillar} opportunity —
            translating these insights into a complete, AI-ready brand system.
          </Text>
        </View>
      </Page>

      <DisclaimerPage tier="snapshot_plus" />
    </Document>
  );
}

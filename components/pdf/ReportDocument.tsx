// components/pdf/ReportDocument.tsx

import React from "react";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
  Link,
} from "@react-pdf/renderer";

const LOGO_URL = "https://d268zs2sdbzvo0.cloudfront.net/66e09bd196e8d5672b143fb8_528e12f9-22c9-4c46-8d90-59238d4c8141_logo.webp";

// ---------------------------
// FONT REGISTRATION
// ---------------------------
Font.register({
  family: "HelveticaNeue",
  fonts: [
    { src: "/fonts/HelveticaNeue-Regular.ttf" },
    { src: "/fonts/HelveticaNeue-Medium.ttf", fontWeight: 500 },
    { src: "/fonts/HelveticaNeue-Bold.ttf", fontWeight: 700 },
  ],
});

// ---------------------------
// STYLES
// ---------------------------
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "HelveticaNeue",
    color: "#0C1526",
    fontSize: 12,
    lineHeight: 1.5,
  },

  h1: {
    fontSize: 26,
    fontWeight: 700,
    color: "#021859",
    marginBottom: 12,
  },

  h2: {
    fontSize: 18,
    fontWeight: 700,
    color: "#021859",
    marginTop: 20,
    marginBottom: 6,
  },

  h3: {
    fontSize: 14,
    fontWeight: 600,
    marginTop: 16,
    marginBottom: 4,
    color: "#021859",
  },

  section: {
    marginTop: 18,
    marginBottom: 12,
  },

  scoreBox: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#F5F7FB",
    border: "1px solid #E0E3EA",
    marginBottom: 14,
  },

  meterTrack: {
    width: "100%",
    height: 8,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
    marginTop: 8,
    marginBottom: 4,
  },

  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #E5E7EB",
    paddingVertical: 6,
  },

  footer: {
    marginTop: 40,
    fontSize: 10,
    textAlign: "center",
    color: "#6B7280",
  },

  pageFooter: {
    position: "absolute",
    bottom: 16,
    left: 40,
    right: 40,
    borderTop: "0.5px solid #E5E7EB",
    paddingTop: 6,
  },
  pageFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pageFooterText: {
    fontSize: 7,
    color: "#9CA3AF",
  },
  pageFooterUrl: {
    fontSize: 7,
    color: "#07B0F2",
    textDecoration: "none",
  },
  pageFooterConfidential: {
    fontSize: 6.5,
    color: "#B0B8C4",
    textAlign: "center",
    marginTop: 3,
  },
  pageFooterTerms: {
    fontSize: 6.5,
    color: "#B0B8C4",
    textAlign: "center",
    marginTop: 3,
  },
  coverLogo: {
    width: 100,
    marginBottom: 20,
  },
  coverDate: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 4,
  },
  coverConfidential: {
    fontSize: 9,
    color: "#9CA3AF",
    marginTop: 24,
    textAlign: "center",
  },
});

// Helper functions for dynamic styles
const getMeterFill = (percent: number) => ({
  width: `${percent}%`,
  height: 8,
  borderRadius: 10,
  backgroundColor:
    percent >= 80 ? "#22C55E" : percent >= 60 ? "#FACC15" : "#EF4444",
});

const getCol = (width: string) => ({
  width,
  paddingRight: 6,
});

const getColorSwatch = (hex: string) => ({
  width: 24,
  height: 24,
  borderRadius: 4,
  backgroundColor: hex,
});

// -----------------------------------
// PAGE FOOTER HELPER
// -----------------------------------
const DocFooter = ({ businessName, productName }: { businessName?: string; productName: string }) => (
  <View style={styles.pageFooter} fixed>
    <View style={styles.pageFooterRow}>
      <Text style={styles.pageFooterText}>© {new Date().getFullYear()} Wunderbar Digital · {productName}</Text>
      <Link src="https://wunderbardigital.com" style={styles.pageFooterUrl}>wunderbardigital.com</Link>
    </View>
    {businessName && (
      <Text style={styles.pageFooterConfidential}>
        Confidential — Prepared exclusively for {businessName}. Unauthorized distribution is prohibited.
      </Text>
    )}
    <Text style={styles.pageFooterTerms}>
      Licensed for internal use. Redistribution prohibited. © {new Date().getFullYear()} Wunderbar Digital
    </Text>
  </View>
);

// -----------------------------------
// MAIN DOCUMENT COMPONENT
// -----------------------------------
export const ReportDocument = ({
  userName,
  businessName,
  brandAlignmentScore,
  pillarScores,
  pillarInsights,
  recommendations,
  suggestedPalette,
  isPlus = false,
  report,
  persona,
  archetype,
  brandVoice,
  opportunitiesMap,
  roadmap30,
  roadmap60,
  roadmap90,
}: any) => {
  const percent = brandAlignmentScore;
  const productLabel = isPlus ? "WunderBrand Snapshot+™" : "WunderBrand Snapshot™";
  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const scoreLabel =
    percent >= 80
      ? "Excellent Alignment"
      : percent >= 60
      ? "Strong Foundation"
      : "Needs Focused Attention";

  return (
    <Document>
      {/* ============================================================
          PAGE 1 — COVER PAGE
      ============================================================ */}
      <Page style={styles.page}>
        <Image src={LOGO_URL} style={styles.coverLogo} />
        <Text style={styles.h1}>Your {productLabel} Report</Text>
        <Text>Prepared for {userName || "you"}</Text>
        <Text>{businessName}</Text>
        <Text style={styles.coverDate}>{reportDate}</Text>

        <View style={{ marginTop: 30 }}>
          <Text style={styles.h2}>WunderBrand Score™</Text>

          <View style={styles.scoreBox}>
            <Text style={{ fontSize: 28, fontWeight: 700, color: "#021859" }}>
              {brandAlignmentScore}/100
            </Text>
            <Text style={{ fontSize: 12, marginTop: 4 }}>{scoreLabel}</Text>

            <View style={styles.meterTrack}>
              <View style={getMeterFill(percent)} />
            </View>
          </View>

          <Text style={styles.h3}>How Your Score Is Calculated</Text>
          <Text>
            Your WunderBrand Score™ reflects how clearly, consistently, and
            confidently your brand shows up across five key pillars:
          </Text>
          <Text>
            Positioning, Messaging, Visibility, Credibility, and Conversion.
          </Text>
        </View>

        <Text style={styles.coverConfidential}>
          Confidential — Prepared exclusively for {businessName || "you"}
        </Text>
        <Text
          style={{
            marginTop: 12,
            fontSize: 10,
            textAlign: "center",
            color: "#6B7280",
          }}
        >
          © {new Date().getFullYear()} Wunderbar Digital. All rights reserved. | wunderbardigital.com
        </Text>
        <DocFooter businessName={businessName} productName={productLabel} />
      </Page>

      {/* ============================================================
          PAGE 2 — PILLAR BREAKDOWN
      ============================================================ */}
      <Page style={styles.page}>
        <Text style={styles.h1}>Your Pillar Breakdown</Text>

        {Object.keys(pillarScores).map((pillar) => {
          const score = pillarScores[pillar];
          const pct = (score / 20) * 100;

          // Handle both old format (string) and new format (object)
          const insightData = pillarInsights[pillar];
          const insight = typeof insightData === 'string' 
            ? insightData 
            : insightData?.opportunity || insightData?.strength || "No insight available.";

          return (
            <View key={pillar} style={styles.section}>
              <Text style={styles.h2}>
                {pillar.charAt(0).toUpperCase() + pillar.slice(1)}
              </Text>

              <View style={styles.scoreBox}>
                <Text style={{ fontSize: 20, fontWeight: 700 }}>
                  {score}/20
                </Text>

                <View style={styles.meterTrack}>
                  <View style={getMeterFill(pct)} />
                </View>

                <Text style={{ marginTop: 6 }}>{insight}</Text>
              </View>
            </View>
          );
        })}

        <DocFooter businessName={businessName} productName={productLabel} />
      </Page>

      {/* ============================================================
          PAGE 3 — BRAND COLOR PALETTE
      ============================================================ */}
      <Page style={styles.page}>
        <Text style={styles.h1}>Recommended Brand Color Palette</Text>

        <Text style={{ marginTop: 6 }}>
          Based on your brand persona, archetype, tone, and strategic goals,
          Wundy™ recommends the following palette:
        </Text>

        {/* TABLE HEADER */}
        <View style={[styles.tableRow, { fontWeight: 700 }]}>
          <Text style={getCol("25%")}>Color Name</Text>
          <Text style={getCol("20%")}>Swatch</Text>
          <Text style={getCol("20%")}>Role</Text>
          <Text style={getCol("35%")}>Meaning</Text>
        </View>

        {(suggestedPalette || []).map((color: any, i: number) => (
          <View key={i} style={styles.tableRow}>
            <Text style={getCol("25%")}>{color.name || 'Color'}</Text>

            <View style={[getCol("20%"), { flexDirection: "row" }]}>
              <View style={getColorSwatch(color.hex || '#000000')} />
            </View>

            <Text style={getCol("20%")}>{color.role || 'Primary'}</Text>
            <Text style={getCol("35%")}>{color.meaning || 'No meaning specified'}</Text>
          </View>
        ))}

        <DocFooter businessName={businessName} productName={productLabel} />
      </Page>

      {/* ============================================================
          PAGE 4 — RECOMMENDATIONS
      ============================================================ */}
      <Page style={styles.page}>
        <Text style={styles.h1}>Your Custom Recommendations</Text>

        <Text>
          These recommendations are tailored to your inputs and reflect the
          highest-impact next steps Wundy™ suggests for strengthening your
          brand's clarity, trust, and performance.
        </Text>

        {(recommendations || []).map((rec: any, i: number) => {
          // Handle both string and object formats
          const recText = typeof rec === 'string' ? rec : rec.description || rec.title || 'No recommendation';
          
          return (
            <View key={i} style={styles.section}>
              <Text style={styles.h2}>Recommendation {i + 1}</Text>
              <Text>{recText}</Text>
            </View>
          );
        })}

        <DocFooter businessName={businessName} productName={productLabel} />
      </Page>

      {/* ============================================================
          PAGE 5 — SNAPSHOT+™ UPGRADE INVITE
      ============================================================ */}
      <Page style={styles.page}>
        <Text style={styles.h1}>Upgrade to Snapshot+™</Text>

        <Text style={{ marginBottom: 16 }}>
          Snapshot+™ takes your WunderBrand Snapshot™ foundation and elevates it into
          a complete strategic brand toolkit — crafted uniquely for your
          business.
        </Text>

        <Text style={styles.h2}>Snapshot+™ Includes:</Text>

        <View style={{ marginTop: 10 }}>
          <Text>• Brand Persona & Archetype Development</Text>
          <Text>• Messaging Framework + Value Proposition</Text>
          <Text>• Homepage Copy Outline</Text>
          <Text>• Visual Identity Direction + Palette Expansion</Text>
          <Text>• Brand Voice Guide</Text>
          <Text>• SEO & AEO Optimization Strategies (AI search optimization)</Text>
          <Text>• Priority Roadmap for the Next 90 Days</Text>
        </View>

        <Text style={{ marginTop: 18 }}>
          Want Wundy™ to take your brand from "clearer" to "powerfully
          unmistakable"?  
          Upgrade now at WunderbarDigital.com.
        </Text>

        <Text style={styles.footer}>
          © {new Date().getFullYear()} Wunderbar Digital. All rights reserved.
        </Text>
        <DocFooter businessName={businessName} productName={productLabel} />
      </Page>
    </Document>
  );
};

export default ReportDocument;

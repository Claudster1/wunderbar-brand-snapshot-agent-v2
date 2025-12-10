// ---------------------------------------------
// components/pdf/ReportDocument.tsx
// React-PDF template for Brand Snapshot™ Report
// ---------------------------------------------

import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";

// ---------------------------------------------
// REGISTER FONTS (Helvetica-like system fonts)
// ---------------------------------------------
Font.register({
  family: "Helvetica",
  src: "https://fonts.cdnfonts.com/s/14165/Helvetica.ttf",
});

// ---------------------------------------------
// ASSETS (from existing /src/assets folder)
// ---------------------------------------------
import WundyHero from "@/assets/wundy-hero.png";
import BrandLogo from "@/assets/logo-blue.png";

// ---------------------------------------------
// BRAND COLORS
// ---------------------------------------------
const colors = {
  navy: "#021859",
  blue: "#07B0F2",
  aqua: "#27CDF2",
  midnight: "#0C1526",
  gray: "#F2F2F2",
};

// ---------------------------------------------
// PDF STYLES
// ---------------------------------------------
const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: "Helvetica",
    color: colors.midnight,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  logo: {
    width: 120,
  },

  wundy: {
    width: 80,
  },

  title: {
    fontSize: 22,
    fontWeight: 700,
    color: colors.navy,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: colors.navy,
    marginTop: 24,
    marginBottom: 8,
  },

  paragraph: {
    fontSize: 11,
    lineHeight: 1.5,
    marginBottom: 8,
  },

  scoreBox: {
    backgroundColor: colors.gray,
    padding: 16,
    borderRadius: 6,
    marginTop: 8,
    marginBottom: 16,
  },

  scoreNumber: {
    fontSize: 32,
    fontWeight: 700,
    color: colors.blue,
  },

  table: {
    width: "auto",
    marginTop: 12,
  },

  tableRow: {
    flexDirection: "row",
    borderBottomColor: "#DDD",
    borderBottomWidth: 1,
    paddingVertical: 6,
  },

  tableHeader: {
    fontSize: 11,
    fontWeight: 700,
    flex: 1,
  },

  tableCell: {
    fontSize: 10,
    flex: 1,
  },

  swatch: {
    width: 14,
    height: 14,
    borderRadius: 2,
    marginRight: 6,
  },

  swatchCell: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  footer: {
    marginTop: 36,
    fontSize: 9,
    color: "#555",
    textAlign: "center",
  },
});

// ---------------------------------------------
// TYPES
// ---------------------------------------------
interface ReportDocumentProps {
  data: {
    user?: string | null;
    userName?: string;
    brandAlignmentScore?: number;
    scores?: {
      brandAlignmentScore?: number;
      pillarScores?: Record<string, number>;
    };
    pillarScores?: Record<string, number>;
    pillarInsights?: Record<string, string | { strength?: string; opportunity?: string; action?: string }>;
    insights?: Record<string, string>;
    recommendedPalette?: Array<{
      name: string;
      hex: string;
      role: string;
      meaning: string;
    }>;
    color_palette?: Array<{
      name: string;
      hex: string;
      role: string;
      meaning: string;
    }>;
    colorPalette?: Array<{
      name: string;
      hex: string;
      role: string;
      meaning: string;
    }>;
    recommendations?: string[] | Array<{ title: string; description: string }>;
    metadata?: Record<string, any>;
  };
}

// ---------------------------------------------
// MAIN PDF DOCUMENT
// ---------------------------------------------
export default function ReportDocument({ data }: ReportDocumentProps) {
  // Extract and normalize data
  const brandAlignmentScore = data.brandAlignmentScore || data.scores?.brandAlignmentScore || 0;
  const pillarScores = data.pillarScores || data.scores?.pillarScores || {};
  const pillarInsights = data.pillarInsights || data.insights || {};
  
  // Use recommendedPalette, color_palette, or colorPalette
  const palette = data.recommendedPalette || data.color_palette || data.colorPalette || [];

  return (
    <Document>
      {/* ====== PAGE 1 ====== */}
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          {BrandLogo && (
            <Image style={styles.logo} src={BrandLogo} />
          )}
          {WundyHero && (
            <Image style={styles.wundy} src={WundyHero} />
          )}
        </View>

        {/* TITLE */}
        <Text style={styles.title}>Your Brand Snapshot™ Report</Text>

        <Text style={styles.paragraph}>
          Here's your personalized Brand Alignment Score™ and a high-level read
          on how clearly and consistently your brand is currently showing up
          across the five foundational pillars.
        </Text>

        {/* SCORE SECTION */}
        <Text style={styles.sectionTitle}>Brand Alignment Score™</Text>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreNumber}>{brandAlignmentScore}</Text>
        </View>

        {/* PILLAR SCORES TABLE */}
        <Text style={styles.sectionTitle}>Pillar Breakdown</Text>

        <View style={styles.table}>
          {/* HEADER ROW */}
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>Pillar</Text>
            <Text style={styles.tableHeader}>Score</Text>
            <Text style={styles.tableHeader}>Insight</Text>
          </View>

          {Object.entries(pillarScores).map(([pillar, score]) => {
            // Handle both old format (string) and new format (object)
            const insightData = pillarInsights[pillar];
            const insight = typeof insightData === 'string' 
              ? insightData 
              : insightData?.opportunity || insightData?.strength || "No insight available.";

            return (
              <View style={styles.tableRow} key={pillar}>
                <Text style={styles.tableCell}>
                  {pillar.charAt(0).toUpperCase() + pillar.slice(1)}
                </Text>
                <Text style={styles.tableCell}>{score}/20</Text>
                <Text style={styles.tableCell}>{insight}</Text>
              </View>
            );
          })}
        </View>

        {/* COLOR SYSTEM */}
        {palette && palette.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recommended Color Palette</Text>

            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableHeader}>Color Name</Text>
                <Text style={styles.tableHeader}>Swatch</Text>
                <Text style={styles.tableHeader}>Role</Text>
                <Text style={styles.tableHeader}>Meaning</Text>
              </View>

              {palette.map((color: any, index: number) => (
                <View style={styles.tableRow} key={color.name || index}>
                  <Text style={styles.tableCell}>{color.name || 'Color'}</Text>
                  <View style={styles.swatchCell}>
                    <View style={[styles.swatch, { backgroundColor: color.hex || '#000000' }]} />
                    <Text style={styles.tableCell}>{color.hex || ''}</Text>
                  </View>
                  <Text style={styles.tableCell}>{color.role || 'Primary'}</Text>
                  <Text style={styles.tableCell}>{color.meaning || 'No meaning specified'}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* FOOTER */}
        <Text style={styles.footer}>
          © {new Date().getFullYear()} Wunderbar Digital. All rights reserved.
        </Text>
      </Page>
    </Document>
  );
}


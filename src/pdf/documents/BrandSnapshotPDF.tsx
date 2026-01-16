// src/pdf/documents/BrandSnapshotPDF.tsx
// Free Brand Snapshot™ PDF Document
// Uses centralized theme for consistent styling

import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { stylePresets, colors, fonts, spacing, getMeterFill, getScoreLabel } from "../theme";
import { registerPdfFonts } from "../registerFonts";

// Register fonts
registerPdfFonts();

interface BrandSnapshotPDFProps {
  userName?: string;
  businessName?: string;
  brandAlignmentScore: number;
  pillarScores: {
    positioning: number;
    messaging: number;
    visibility: number;
    credibility: number;
    conversion: number;
  };
  pillarInsights: {
    positioning?: string;
    messaging?: string;
    visibility?: string;
    credibility?: string;
    conversion?: string;
  };
  recommendations?: Array<string | { title?: string; description?: string }>;
  suggestedPalette?: Array<{
    name: string;
    hex: string;
    role?: string;
    meaning?: string;
  }>;
}

export const BrandSnapshotPDF = ({
  userName,
  businessName,
  brandAlignmentScore,
  pillarScores,
  pillarInsights,
  recommendations = [],
  suggestedPalette = [],
}: BrandSnapshotPDFProps) => {
  const scoreLabel = getScoreLabel(brandAlignmentScore);

  return (
    <Document>
      {/* PAGE 1 — COVER PAGE */}
      <Page style={stylePresets.page}>
        <Text style={stylePresets.h1}>Your Brand Snapshot™ Report</Text>
        <Text style={stylePresets.body}>
          Prepared for {userName || "you"}
        </Text>
        {businessName && (
          <Text style={stylePresets.body}>{businessName}</Text>
        )}

        <View style={{ marginTop: spacing["3xl"] }}>
          <Text style={stylePresets.h2}>Brand Alignment Score™</Text>

          <View style={stylePresets.scoreBox}>
            <Text style={{ fontSize: fonts["4xl"], fontWeight: fonts.bold, color: colors.navy }}>
              {brandAlignmentScore}/100
            </Text>
            <Text style={{ fontSize: fonts.base, marginTop: spacing.xs }}>
              {scoreLabel}
            </Text>

            <View style={stylePresets.meterTrack}>
              <View style={getMeterFill(brandAlignmentScore)} />
            </View>
          </View>

          <Text style={stylePresets.h3}>How Your Score Is Calculated</Text>
          <Text style={stylePresets.body}>
            Your Brand Alignment Score™ reflects how clearly, consistently, and
            confidently your brand shows up across five key pillars:
          </Text>
          <Text style={stylePresets.body}>
            Positioning, Messaging, Visibility, Credibility, and Conversion.
          </Text>
        </View>

        <Text style={stylePresets.footer}>
          © 2025 Wunderbar Digital. All rights reserved.
        </Text>
      </Page>

      {/* PAGE 2 — PILLAR BREAKDOWN */}
      <Page style={stylePresets.page}>
        <Text style={stylePresets.h1}>Your Pillar Breakdown</Text>

        {Object.entries(pillarScores).map(([pillar, score]) => {
          const pct = (score / 20) * 100;
          const insightData = pillarInsights[pillar as keyof typeof pillarInsights];
          const insight = typeof insightData === 'string' 
            ? insightData 
            : insightData?.opportunity || insightData?.strength || "No insight available.";

          return (
            <View key={pillar} style={stylePresets.section}>
              <Text style={stylePresets.h2}>
                {pillar.charAt(0).toUpperCase() + pillar.slice(1)}
              </Text>

              <View style={stylePresets.scoreBox}>
                <Text style={{ fontSize: fonts.xl, fontWeight: fonts.bold }}>
                  {score}/20
                </Text>

                <View style={stylePresets.meterTrack}>
                  <View style={getMeterFill(pct)} />
                </View>

                <Text style={{ marginTop: spacing.sm, ...stylePresets.body }}>
                  {insight}
                </Text>
              </View>
            </View>
          );
        })}

        <Text style={stylePresets.footer}>
          © 2025 Wunderbar Digital. Brand Snapshot™ is a trademark of Wunderbar Digital.
        </Text>
      </Page>

      {/* PAGE 3 — RECOMMENDATIONS */}
      {recommendations.length > 0 && (
        <Page style={stylePresets.page}>
          <Text style={stylePresets.h1}>Your Custom Recommendations</Text>

          <Text style={{ marginBottom: spacing.md, ...stylePresets.body }}>
            These recommendations are tailored to your inputs and reflect the
            highest-impact next steps for strengthening your brand's clarity, trust, and performance.
          </Text>

          {recommendations.map((rec, i) => {
            const recText = typeof rec === 'string' 
              ? rec 
              : rec.description || rec.title || 'No recommendation';
            
            return (
              <View key={i} style={stylePresets.section}>
                <Text style={stylePresets.h2}>Recommendation {i + 1}</Text>
                <Text style={stylePresets.body}>{recText}</Text>
              </View>
            );
          })}

          <Text style={stylePresets.footer}>
            Want a deeper transformation? Upgrade to Snapshot+™ for full brand guidance.
          </Text>
        </Page>
      )}

      {/* PAGE 4 — COLOR PALETTE (if provided) */}
      {suggestedPalette.length > 0 && (
        <Page style={stylePresets.page}>
          <Text style={stylePresets.h1}>Recommended Brand Color Palette</Text>

          <Text style={{ marginTop: spacing.sm, ...stylePresets.body }}>
            Based on your brand persona, archetype, tone, and strategic goals,
            Wundy recommends the following palette:
          </Text>

          {/* TABLE HEADER */}
          <View style={[stylePresets.tableRow, { fontWeight: fonts.bold }]}>
            <Text style={{ width: "25%", paddingRight: spacing.sm }}>Color Name</Text>
            <Text style={{ width: "20%", paddingRight: spacing.sm }}>Swatch</Text>
            <Text style={{ width: "20%", paddingRight: spacing.sm }}>Role</Text>
            <Text style={{ width: "35%" }}>Meaning</Text>
          </View>

          {suggestedPalette.map((color, i) => (
            <View key={i} style={stylePresets.tableRow}>
              <Text style={{ width: "25%", paddingRight: spacing.sm }}>
                {color.name || 'Color'}
              </Text>

              <View style={{ width: "20%", paddingRight: spacing.sm, flexDirection: "row" }}>
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 4,
                  backgroundColor: color.hex || '#000000',
                  border: `1px solid ${colors.borderLight}`,
                }} />
              </View>

              <Text style={{ width: "20%", paddingRight: spacing.sm }}>
                {color.role || 'Primary'}
              </Text>
              <Text style={{ width: "35%" }}>
                {color.meaning || 'No meaning specified'}
              </Text>
            </View>
          ))}

          <Text style={stylePresets.footer}>
            Custom palette generated dynamically for your brand.
          </Text>
        </Page>
      )}

      {/* PAGE 5 — SNAPSHOT+™ UPGRADE INVITE */}
      <Page style={stylePresets.page}>
        <Text style={stylePresets.h1}>Upgrade to Snapshot+™</Text>

        <Text style={{ marginBottom: spacing.lg, ...stylePresets.body }}>
          Snapshot+™ takes your Brand Snapshot™ foundation and elevates it into
          a complete strategic brand toolkit — crafted uniquely for your business.
        </Text>

        <Text style={stylePresets.h2}>Snapshot+™ Includes:</Text>

        <View style={{ marginTop: spacing.md }}>
          <Text style={stylePresets.body}>• Brand Persona & Archetype Development</Text>
          <Text style={stylePresets.body}>• Messaging Framework + Value Proposition</Text>
          <Text style={stylePresets.body}>• Homepage Copy Outline</Text>
          <Text style={stylePresets.body}>• Visual Identity Direction + Palette Expansion</Text>
          <Text style={stylePresets.body}>• Brand Voice Guide</Text>
          <Text style={stylePresets.body}>• SEO & AEO Optimization Strategies (AI search optimization)</Text>
          <Text style={stylePresets.body}>• Priority Roadmap for the Next 90 Days</Text>
        </View>

        <Text style={{ marginTop: spacing.xl, ...stylePresets.body }}>
          Want Wundy to take your brand from "clearer" to "powerfully unmistakable"?  
          Upgrade now at WunderbarDigital.com.
        </Text>

        <Text style={stylePresets.footer}>
          © 2025 Wunderbar Digital. Snapshot+™ is a trademark of Wunderbar Digital.
        </Text>
      </Page>
    </Document>
  );
};

export default BrandSnapshotPDF;

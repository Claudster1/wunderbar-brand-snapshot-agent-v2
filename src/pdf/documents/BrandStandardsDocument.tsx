// Brand Standards Guide — PDF export from the Brand Workbook.
// Uses @react-pdf/renderer to generate a polished, multi-page brand guide.

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { pdfTheme, colors, fonts, layout, spacing } from "../theme";

// ─── Types ───
interface WorkbookData {
  business_name?: string;
  positioning_statement?: string;
  unique_value_proposition?: string;
  competitive_differentiation?: string;
  elevator_pitch_30s?: string;
  elevator_pitch_60s?: string;
  elevator_pitch_email?: string;
  messaging_pillars?: Array<{ title: string; description: string; proof_points?: string[] }>;
  brand_voice_attributes?: string[];
  tone_guidelines?: string;
  voice_dos?: string[];
  voice_donts?: string[];
  sample_rewrites?: Array<{ before: string; after: string }>;
  primary_audience?: { description?: string; pain_points?: string[]; decision_triggers?: string[] } | null;
  secondary_audience?: { description?: string; pain_points?: string[]; decision_triggers?: string[] } | null;
  key_differentiators?: Array<{ differentiator: string; competitive_advantage?: string; proof?: string } | string>;
  brand_archetype?: string;
  archetype_description?: string;
  archetype_application?: string;
  brand_alignment_score?: number;
  primary_pillar?: string;
}

// ─── Styles ───
const s = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.6,
    color: pdfTheme.colors.text,
  },
  coverPage: {
    padding: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: pdfTheme.colors.navy,
    fontFamily: "Helvetica",
  },
  coverInner: {
    padding: 64,
    alignItems: "center",
  },
  coverTitle: {
    fontSize: 36,
    fontWeight: 700,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 12,
  },
  coverSubtitle: {
    fontSize: 14,
    color: pdfTheme.colors.blue,
    textAlign: "center",
    marginBottom: 40,
    fontWeight: 600,
  },
  coverBrand: {
    fontSize: 20,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
    fontWeight: 600,
  },
  coverWatermark: {
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    marginTop: 60,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: pdfTheme.colors.navy,
    marginBottom: 16,
    borderBottom: `2px solid ${pdfTheme.colors.blue}`,
    paddingBottom: 8,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: pdfTheme.colors.navy,
    marginTop: 18,
    marginBottom: 6,
  },
  body: {
    fontSize: 11,
    lineHeight: 1.7,
    marginBottom: 10,
    color: pdfTheme.colors.text,
  },
  card: {
    backgroundColor: "#F8FAFD",
    borderRadius: 6,
    padding: 16,
    marginBottom: 12,
    border: `1px solid ${colors.borderLight}`,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: pdfTheme.colors.navy,
    marginBottom: 4,
  },
  tag: {
    backgroundColor: "#EBF8FF",
    color: pdfTheme.colors.blue,
    borderRadius: 12,
    padding: "4px 10px",
    fontSize: 10,
    fontWeight: 600,
    marginRight: 6,
    marginBottom: 4,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  bullet: {
    fontSize: 11,
    marginBottom: 4,
    paddingLeft: 12,
  },
  archetypeBadge: {
    backgroundColor: pdfTheme.colors.navy,
    color: "#FFFFFF",
    borderRadius: 8,
    padding: "12px 24px",
    textAlign: "center",
    marginBottom: 16,
  },
  archetypeLabel: {
    fontSize: 9,
    color: pdfTheme.colors.blue,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  archetypeName: {
    fontSize: 20,
    fontWeight: 700,
    color: "#FFFFFF",
  },
  doRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  doCol: {
    flex: 1,
  },
  doHeader: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 6,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#9CA3AF",
  },
});

// ─── Document ───
export function BrandStandardsDocument({ data }: { data: WorkbookData }) {
  const businessName = data.business_name || "Your Brand";
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document title={`${businessName} — Brand Standards Guide`} author="WunderBrand">
      {/* Cover Page */}
      <Page size="A4" style={s.coverPage}>
        <View style={s.coverInner}>
          <Text style={s.coverTitle}>Brand Standards Guide</Text>
          <Text style={s.coverSubtitle}>WunderBrand Blueprint+\u2122</Text>
          <Text style={s.coverBrand}>{businessName}</Text>
          <Text style={s.coverWatermark}>
            Generated {today} | Powered by WunderBrand
          </Text>
        </View>
      </Page>

      {/* Positioning */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>Brand Positioning</Text>

        {data.positioning_statement ? (
          <>
            <Text style={s.subsectionTitle}>Positioning Statement</Text>
            <Text style={s.body}>{data.positioning_statement}</Text>
          </>
        ) : null}

        {data.unique_value_proposition ? (
          <>
            <Text style={s.subsectionTitle}>Unique Value Proposition</Text>
            <Text style={s.body}>{data.unique_value_proposition}</Text>
          </>
        ) : null}

        {data.competitive_differentiation ? (
          <>
            <Text style={s.subsectionTitle}>Competitive Differentiation</Text>
            <Text style={s.body}>{data.competitive_differentiation}</Text>
          </>
        ) : null}

        <View style={s.footer}>
          <Text>{businessName} — Brand Standards Guide</Text>
          <Text>WunderBrand Blueprint+\u2122</Text>
        </View>
      </Page>

      {/* Elevator Pitches */}
      {(data.elevator_pitch_30s || data.elevator_pitch_60s || data.elevator_pitch_email) && (
        <Page size="A4" style={s.page}>
          <Text style={s.sectionTitle}>Elevator Pitches</Text>

          {data.elevator_pitch_30s ? (
            <View style={s.card}>
              <Text style={s.cardTitle}>30-Second Pitch</Text>
              <Text style={s.body}>{data.elevator_pitch_30s}</Text>
            </View>
          ) : null}

          {data.elevator_pitch_60s ? (
            <View style={s.card}>
              <Text style={s.cardTitle}>60-Second Pitch</Text>
              <Text style={s.body}>{data.elevator_pitch_60s}</Text>
            </View>
          ) : null}

          {data.elevator_pitch_email ? (
            <View style={s.card}>
              <Text style={s.cardTitle}>Email Pitch</Text>
              <Text style={s.body}>{data.elevator_pitch_email}</Text>
            </View>
          ) : null}

          <View style={s.footer}>
            <Text>{businessName} — Brand Standards Guide</Text>
            <Text>WunderBrand Blueprint+\u2122</Text>
          </View>
        </Page>
      )}

      {/* Messaging Pillars */}
      {data.messaging_pillars && data.messaging_pillars.length > 0 && (
        <Page size="A4" style={s.page}>
          <Text style={s.sectionTitle}>Messaging Pillars</Text>

          {data.messaging_pillars.map((pillar, idx) => (
            <View key={idx} style={s.card}>
              <Text style={s.cardTitle}>{pillar.title}</Text>
              <Text style={s.body}>{pillar.description}</Text>
              {pillar.proof_points && pillar.proof_points.length > 0 && (
                <>
                  <Text style={{ ...s.subsectionTitle, fontSize: 11, marginTop: 6 }}>Proof Points</Text>
                  {pillar.proof_points.map((pp, i) => (
                    <Text key={i} style={s.bullet}>• {pp}</Text>
                  ))}
                </>
              )}
            </View>
          ))}

          <View style={s.footer}>
            <Text>{businessName} — Brand Standards Guide</Text>
            <Text>WunderBrand Blueprint+\u2122</Text>
          </View>
        </Page>
      )}

      {/* Brand Voice & Tone */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>Brand Voice & Tone</Text>

        {data.brand_voice_attributes && data.brand_voice_attributes.length > 0 && (
          <>
            <Text style={s.subsectionTitle}>Voice Attributes</Text>
            <View style={s.tagRow}>
              {data.brand_voice_attributes.map((attr, idx) => (
                <Text key={idx} style={s.tag}>{attr}</Text>
              ))}
            </View>
          </>
        )}

        {data.tone_guidelines ? (
          <>
            <Text style={s.subsectionTitle}>Tone Guidelines</Text>
            <Text style={s.body}>{data.tone_guidelines}</Text>
          </>
        ) : null}

        {(data.voice_dos && data.voice_dos.length > 0) || (data.voice_donts && data.voice_donts.length > 0) ? (
          <View style={s.doRow}>
            <View style={s.doCol}>
              <Text style={{ ...s.doHeader, color: "#059669" }}>Do</Text>
              {(data.voice_dos || []).map((item, idx) => (
                <Text key={idx} style={s.bullet}>✓ {item}</Text>
              ))}
            </View>
            <View style={s.doCol}>
              <Text style={{ ...s.doHeader, color: "#DC2626" }}>Don&apos;t</Text>
              {(data.voice_donts || []).map((item, idx) => (
                <Text key={idx} style={s.bullet}>✗ {item}</Text>
              ))}
            </View>
          </View>
        ) : null}

        <View style={s.footer}>
          <Text>{businessName} — Brand Standards Guide</Text>
          <Text>WunderBrand Blueprint+\u2122</Text>
        </View>
      </Page>

      {/* Audience Profiles */}
      {(data.primary_audience || data.secondary_audience) && (
        <Page size="A4" style={s.page}>
          <Text style={s.sectionTitle}>Audience Profiles</Text>

          {data.primary_audience && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Primary Audience</Text>
              <Text style={s.body}>
                {data.primary_audience.description || JSON.stringify(data.primary_audience)}
              </Text>
              {data.primary_audience.pain_points && data.primary_audience.pain_points.length > 0 && (
                <>
                  <Text style={{ ...s.subsectionTitle, fontSize: 11, marginTop: 6 }}>Pain Points</Text>
                  {data.primary_audience.pain_points.map((pp, idx) => (
                    <Text key={idx} style={s.bullet}>• {pp}</Text>
                  ))}
                </>
              )}
            </View>
          )}

          {data.secondary_audience && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Secondary Audience</Text>
              <Text style={s.body}>
                {data.secondary_audience.description || JSON.stringify(data.secondary_audience)}
              </Text>
            </View>
          )}

          <View style={s.footer}>
            <Text>{businessName} — Brand Standards Guide</Text>
            <Text>WunderBrand Blueprint+\u2122</Text>
          </View>
        </Page>
      )}

      {/* Key Differentiators */}
      {data.key_differentiators && data.key_differentiators.length > 0 && (
        <Page size="A4" style={s.page}>
          <Text style={s.sectionTitle}>Key Differentiators</Text>

          {data.key_differentiators.map((diff, idx) => {
            const text = typeof diff === "string" ? diff : diff.differentiator;
            const advantage = typeof diff === "object" ? diff.competitive_advantage : undefined;
            return (
              <View key={idx} style={s.card}>
                <Text style={s.cardTitle}>{text}</Text>
                {advantage && <Text style={s.body}>{advantage}</Text>}
              </View>
            );
          })}

          <View style={s.footer}>
            <Text>{businessName} — Brand Standards Guide</Text>
            <Text>WunderBrand Blueprint+\u2122</Text>
          </View>
        </Page>
      )}

      {/* Brand Archetype */}
      {data.brand_archetype && (
        <Page size="A4" style={s.page}>
          <Text style={s.sectionTitle}>Brand Archetype</Text>

          <View style={s.archetypeBadge}>
            <Text style={s.archetypeLabel}>Your Archetype</Text>
            <Text style={s.archetypeName}>{data.brand_archetype}</Text>
          </View>

          {data.archetype_description ? (
            <>
              <Text style={s.subsectionTitle}>Description</Text>
              <Text style={s.body}>{data.archetype_description}</Text>
            </>
          ) : null}

          {data.archetype_application ? (
            <>
              <Text style={s.subsectionTitle}>How to Apply</Text>
              <Text style={s.body}>{data.archetype_application}</Text>
            </>
          ) : null}

          <View style={s.footer}>
            <Text>{businessName} — Brand Standards Guide</Text>
            <Text>WunderBrand Blueprint+\u2122</Text>
          </View>
        </Page>
      )}
    </Document>
  );
}

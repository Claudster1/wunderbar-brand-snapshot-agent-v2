// Brand Standards Guide — PDF export from the Brand Workbook.
// Uses @react-pdf/renderer to generate a polished, multi-page brand guide.

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Link,
} from "@react-pdf/renderer";
import { pdfTheme, colors, fonts, layout, spacing } from "../theme";
import { DisclaimerPage } from "../components/DisclaimerPage";

const LOGO_URL = "https://d268zs2sdbzvo0.cloudfront.net/66e09bd196e8d5672b143fb8_528e12f9-22c9-4c46-8d90-59238d4c8141_logo.webp";

// ─── Types ───
interface TypographyLevel {
  font: string;
  weight: string;
  size: string;
  usage: string;
}

interface ImageryDont {
  dont: string;
  why: string;
  alternative: string;
}

interface PlatformImagery {
  platform: string;
  dimensions?: string;
  style_adaptation: string;
  examples?: string[];
}

interface MoodBoardDescriptors {
  adjectives?: string[];
  textures?: string[];
  environments?: string[];
  lighting_conditions?: string;
  color_moods?: string;
  designer_note?: string;
}

interface ImageryByAudience {
  persona: string;
  visual_tone_shift: string;
  example_image_descriptions?: string[];
}

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
  typography_tone?: string;
  typography_recommendations?: {
    headline?: TypographyLevel;
    subheadline?: TypographyLevel;
    body?: TypographyLevel;
    caption?: TypographyLevel;
    accent?: TypographyLevel;
  };
  brand_imagery_direction?: {
    photography_style_direction?: string;
    subject_matter_guidance?: { show?: string[]; avoid?: string[] };
    stock_photo_selection_criteria?: {
      lighting?: string;
      composition?: string;
      color_temperature?: string;
      diversity?: string;
      authenticity_markers?: string;
    };
    image_donts?: ImageryDont[];
    color_application_in_imagery?: string;
    platform_specific_imagery_guidance?: PlatformImagery[];
    mood_board_descriptors?: MoodBoardDescriptors;
    imagery_by_audience?: ImageryByAudience[];
  };
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
    justifyContent: "center",
    flex: 1,
  },
  coverLogo: {
    width: 140,
    marginBottom: 48,
    opacity: 0.9,
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
    marginBottom: 48,
    fontWeight: 600,
  },
  coverPreparedLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 6,
  },
  coverBrand: {
    fontSize: 24,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 6,
    fontWeight: 700,
  },
  coverDate: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    marginBottom: 40,
  },
  coverConfidential: {
    fontSize: 9,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  coverUrl: {
    fontSize: 10,
    color: pdfTheme.colors.blue,
    textAlign: "center",
    textDecoration: "none",
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
    bottom: 20,
    left: 48,
    right: 48,
    borderTop: `0.5px solid ${colors.borderLight}`,
    paddingTop: 8,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 8,
    color: "#9CA3AF",
  },
  footerConfidential: {
    fontSize: 7,
    color: "#B0B8C4",
    textAlign: "center",
    marginTop: 4,
  },
  footerTerms: {
    fontSize: 7,
    color: "#B0B8C4",
    textAlign: "center",
    marginTop: 4,
  },
  // Typography System styles
  typeSample: {
    backgroundColor: "#F8FAFD",
    borderRadius: 6,
    padding: 16,
    marginBottom: 14,
    border: `1px solid ${colors.borderLight}`,
  },
  typeLevelLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: pdfTheme.colors.blue,
    textTransform: "uppercase" as const,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  typeSpec: {
    fontSize: 9,
    color: "#9CA3AF",
    marginTop: 6,
  },
  typeUsage: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 4,
    lineHeight: 1.5,
  },
  // Imagery styles
  imageryCard: {
    backgroundColor: "#F8FAFD",
    borderRadius: 6,
    padding: 14,
    marginBottom: 10,
    border: `1px solid ${colors.borderLight}`,
  },
  imageryLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: pdfTheme.colors.blue,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    marginBottom: 4,
  },
  channelCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    borderLeft: `3px solid ${pdfTheme.colors.blue}`,
    border: `1px solid ${colors.borderLight}`,
  },
  channelName: {
    fontSize: 12,
    fontWeight: 700,
    color: pdfTheme.colors.navy,
    marginBottom: 4,
  },
  channelDimensions: {
    fontSize: 9,
    color: pdfTheme.colors.blue,
    fontWeight: 600,
    marginBottom: 4,
  },
  twoCol: {
    flexDirection: "row" as const,
    gap: 12,
  },
  col: {
    flex: 1,
  },
  dontCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    borderLeft: `3px solid #EF4444`,
  },
  dontLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#991B1B",
    marginBottom: 3,
  },
  dontWhy: {
    fontSize: 10,
    color: "#6B7280",
    lineHeight: 1.5,
    marginBottom: 3,
  },
  dontAlt: {
    fontSize: 10,
    color: "#059669",
    fontWeight: 600,
    lineHeight: 1.5,
  },
  moodTag: {
    backgroundColor: "#EBF8FF",
    color: pdfTheme.colors.navy,
    borderRadius: 10,
    padding: "3px 8px",
    fontSize: 9,
    fontWeight: 600,
    marginRight: 4,
    marginBottom: 4,
  },
});

// ─── Page Footer Helper ───
function PageFooter({ businessName }: { businessName: string }) {
  return (
    <View style={s.footer} fixed>
      <View style={s.footerRow}>
        <Text>{businessName} {"\u2014"} Brand Standards Guide</Text>
        <Text>WunderBrand Blueprint+{"\u2122"} | wunderbardigital.com</Text>
      </View>
      <Text style={s.footerConfidential}>
        Confidential {"\u2014"} Prepared exclusively for {businessName}. Unauthorized distribution is prohibited.
      </Text>
      <Text style={s.footerTerms}>
        Licensed for internal use. Redistribution prohibited. © {new Date().getFullYear()} Wunderbar Digital
      </Text>
    </View>
  );
}

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
          <Image style={s.coverLogo} src={LOGO_URL} />
          <Text style={s.coverTitle}>Brand Standards Guide</Text>
          <Text style={s.coverSubtitle}>WunderBrand Blueprint+{"\u2122"}</Text>
          <Text style={s.coverPreparedLabel}>Prepared for</Text>
          <Text style={s.coverBrand}>{businessName}</Text>
          <Text style={s.coverDate}>{today}</Text>
          <Text style={s.coverConfidential}>
            Confidential {"\u2014"} Prepared exclusively for {businessName}
          </Text>
          <Link src="https://wunderbardigital.com" style={s.coverUrl}>
            wunderbardigital.com
          </Link>
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

        <PageFooter businessName={businessName} />
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

          <PageFooter businessName={businessName} />
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

          <PageFooter businessName={businessName} />
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

        <PageFooter businessName={businessName} />
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

          <PageFooter businessName={businessName} />
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

          <PageFooter businessName={businessName} />
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

          <PageFooter businessName={businessName} />
        </Page>
      )}

      {/* Typography System */}
      {(data.typography_tone || data.typography_recommendations) && (
        <Page size="A4" style={s.page}>
          <Text style={s.sectionTitle}>Typography System</Text>

          {data.typography_tone && (
            <>
              <Text style={s.subsectionTitle}>Typography Direction</Text>
              <Text style={s.body}>{data.typography_tone}</Text>
            </>
          )}

          <Text style={{ ...s.subsectionTitle, marginTop: 20 }}>Type Hierarchy</Text>

          {/* Headline sample */}
          <View style={s.typeSample}>
            <Text style={s.typeLevelLabel}>Headline</Text>
            <Text style={{ fontSize: 28, fontWeight: 700, color: pdfTheme.colors.navy, lineHeight: 1.2 }}>
              {data.typography_recommendations?.headline
                ? `${businessName}: ${data.typography_recommendations.headline.usage}`
                : `${businessName} Brand Headline`}
            </Text>
            <Text style={s.typeSpec}>
              {data.typography_recommendations?.headline
                ? `${data.typography_recommendations.headline.font} \u2022 ${data.typography_recommendations.headline.weight} \u2022 ${data.typography_recommendations.headline.size}`
                : "Bold \u2022 28\u201336pt \u2022 Use for page titles and hero sections"}
            </Text>
            {data.typography_recommendations?.headline?.usage && (
              <Text style={s.typeUsage}>{data.typography_recommendations.headline.usage}</Text>
            )}
          </View>

          {/* Subheadline sample */}
          <View style={s.typeSample}>
            <Text style={s.typeLevelLabel}>Subheadline</Text>
            <Text style={{ fontSize: 18, fontWeight: 600, color: pdfTheme.colors.navy, lineHeight: 1.3 }}>
              {data.typography_recommendations?.subheadline
                ? `Supporting context for ${businessName}`
                : "Supporting message that adds clarity and context"}
            </Text>
            <Text style={s.typeSpec}>
              {data.typography_recommendations?.subheadline
                ? `${data.typography_recommendations.subheadline.font} \u2022 ${data.typography_recommendations.subheadline.weight} \u2022 ${data.typography_recommendations.subheadline.size}`
                : "Semibold \u2022 18\u201322pt \u2022 Use for section headers and card titles"}
            </Text>
            {data.typography_recommendations?.subheadline?.usage && (
              <Text style={s.typeUsage}>{data.typography_recommendations.subheadline.usage}</Text>
            )}
          </View>

          {/* Body sample */}
          <View style={s.typeSample}>
            <Text style={s.typeLevelLabel}>Body Text</Text>
            <Text style={{ fontSize: 12, fontWeight: 400, color: pdfTheme.colors.text, lineHeight: 1.7 }}>
              This is {businessName}&apos;s standard body text. It should be comfortable to read in paragraphs, with generous line height and clear contrast. Every sentence should earn its place {"\u2014"} concise, purposeful, and aligned with the brand voice.
            </Text>
            <Text style={s.typeSpec}>
              {data.typography_recommendations?.body
                ? `${data.typography_recommendations.body.font} \u2022 ${data.typography_recommendations.body.weight} \u2022 ${data.typography_recommendations.body.size}`
                : "Regular \u2022 11\u201313pt \u2022 Use for paragraphs, descriptions, and long-form content"}
            </Text>
            {data.typography_recommendations?.body?.usage && (
              <Text style={s.typeUsage}>{data.typography_recommendations.body.usage}</Text>
            )}
          </View>

          {/* Caption sample */}
          <View style={s.typeSample}>
            <Text style={s.typeLevelLabel}>Caption / Small Text</Text>
            <Text style={{ fontSize: 9, fontWeight: 400, color: "#6B7280", lineHeight: 1.5 }}>
              Photo credit \u2022 {businessName} \u2022 {new Date().getFullYear()} \u2014 Used for labels, metadata, timestamps, and fine print.
            </Text>
            <Text style={s.typeSpec}>
              {data.typography_recommendations?.caption
                ? `${data.typography_recommendations.caption.font} \u2022 ${data.typography_recommendations.caption.weight} \u2022 ${data.typography_recommendations.caption.size}`
                : "Regular \u2022 8\u201310pt \u2022 Use for photo credits, dates, disclaimers, and metadata"}
            </Text>
          </View>

          {/* Accent / CTA sample */}
          <View style={s.typeSample}>
            <Text style={s.typeLevelLabel}>Accent / CTA</Text>
            <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
              <View style={{
                backgroundColor: pdfTheme.colors.navy,
                borderRadius: 4,
                paddingVertical: 8,
                paddingHorizontal: 20,
              }}>
                <Text style={{ fontSize: 11, fontWeight: 700, color: "#FFFFFF", textTransform: "uppercase", letterSpacing: 1 }}>
                  Get Started
                </Text>
              </View>
              <View style={{
                borderRadius: 4,
                paddingVertical: 8,
                paddingHorizontal: 20,
                border: `1.5px solid ${pdfTheme.colors.blue}`,
              }}>
                <Text style={{ fontSize: 11, fontWeight: 700, color: pdfTheme.colors.blue, textTransform: "uppercase", letterSpacing: 1 }}>
                  Learn More
                </Text>
              </View>
            </View>
            <Text style={s.typeSpec}>
              {data.typography_recommendations?.accent
                ? `${data.typography_recommendations.accent.font} \u2022 ${data.typography_recommendations.accent.weight} \u2022 ${data.typography_recommendations.accent.size}`
                : "Bold \u2022 11\u201312pt \u2022 Uppercase \u2022 Use for buttons, CTAs, and navigation links"}
            </Text>
          </View>

          <PageFooter businessName={businessName} />
        </Page>
      )}

      {/* Brand Imagery Direction */}
      {data.brand_imagery_direction && (
        <>
          <Page size="A4" style={s.page}>
            <Text style={s.sectionTitle}>Brand Imagery Direction</Text>

            {/* Photography Style */}
            {data.brand_imagery_direction.photography_style_direction && (
              <>
                <Text style={s.subsectionTitle}>Photography Style</Text>
                <Text style={s.body}>{data.brand_imagery_direction.photography_style_direction}</Text>
              </>
            )}

            {/* Subject Matter: Show / Avoid */}
            {data.brand_imagery_direction.subject_matter_guidance && (
              <>
                <Text style={s.subsectionTitle}>Subject Matter Guidance</Text>
                <View style={s.twoCol}>
                  <View style={s.col}>
                    <View style={{ ...s.imageryCard, borderLeft: `3px solid #059669` }}>
                      <Text style={{ ...s.imageryLabel, color: "#059669" }}>Show</Text>
                      {(data.brand_imagery_direction.subject_matter_guidance.show || []).map((item, i) => (
                        <Text key={i} style={{ ...s.bullet, fontSize: 10 }}>{"\u2713"} {item}</Text>
                      ))}
                    </View>
                  </View>
                  <View style={s.col}>
                    <View style={{ ...s.imageryCard, borderLeft: `3px solid #EF4444` }}>
                      <Text style={{ ...s.imageryLabel, color: "#EF4444" }}>Avoid</Text>
                      {(data.brand_imagery_direction.subject_matter_guidance.avoid || []).map((item, i) => (
                        <Text key={i} style={{ ...s.bullet, fontSize: 10 }}>{"\u2717"} {item}</Text>
                      ))}
                    </View>
                  </View>
                </View>
              </>
            )}

            {/* Stock Photo Selection Criteria */}
            {data.brand_imagery_direction.stock_photo_selection_criteria && (() => {
              const criteria = data.brand_imagery_direction.stock_photo_selection_criteria!;
              const entries = [
                criteria.lighting && { label: "Lighting", value: criteria.lighting },
                criteria.composition && { label: "Composition", value: criteria.composition },
                criteria.color_temperature && { label: "Color Temperature", value: criteria.color_temperature },
                criteria.diversity && { label: "Diversity", value: criteria.diversity },
                criteria.authenticity_markers && { label: "Authenticity", value: criteria.authenticity_markers },
              ].filter(Boolean) as Array<{ label: string; value: string }>;

              return entries.length > 0 ? (
                <>
                  <Text style={s.subsectionTitle}>Photo Selection Criteria</Text>
                  {entries.map((entry, i) => (
                    <View key={i} style={{ marginBottom: 6 }}>
                      <Text style={{ fontSize: 10, fontWeight: 700, color: pdfTheme.colors.navy }}>{entry.label}</Text>
                      <Text style={{ fontSize: 10, color: pdfTheme.colors.text, lineHeight: 1.6 }}>{entry.value}</Text>
                    </View>
                  ))}
                </>
              ) : null;
            })()}

            {/* Color Application in Imagery */}
            {data.brand_imagery_direction.color_application_in_imagery && (
              <>
                <Text style={s.subsectionTitle}>Color Application in Imagery</Text>
                <Text style={s.body}>{data.brand_imagery_direction.color_application_in_imagery}</Text>
              </>
            )}

            <PageFooter businessName={businessName} />
          </Page>

          {/* Imagery by Channel (separate page to avoid overflow) */}
          {data.brand_imagery_direction.platform_specific_imagery_guidance &&
            data.brand_imagery_direction.platform_specific_imagery_guidance.length > 0 && (
            <Page size="A4" style={s.page}>
              <Text style={s.sectionTitle}>Imagery by Channel</Text>
              <Text style={s.body}>
                Platform-specific guidance to maintain visual consistency across every touchpoint.
              </Text>

              {data.brand_imagery_direction.platform_specific_imagery_guidance.map((platform, i) => (
                <View key={i} style={s.channelCard}>
                  <Text style={s.channelName}>{platform.platform}</Text>
                  {platform.dimensions && (
                    <Text style={s.channelDimensions}>{platform.dimensions}</Text>
                  )}
                  <Text style={{ fontSize: 10, color: pdfTheme.colors.text, lineHeight: 1.6 }}>
                    {platform.style_adaptation}
                  </Text>
                  {platform.examples && platform.examples.length > 0 && (
                    <View style={{ marginTop: 4 }}>
                      {platform.examples.map((ex, j) => (
                        <Text key={j} style={{ fontSize: 9, color: "#6B7280", paddingLeft: 8, marginBottom: 2 }}>
                          {"\u2022"} {ex}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ))}

              <PageFooter businessName={businessName} />
            </Page>
          )}

          {/* Mood Board + Audience Imagery + Image Don'ts */}
          {(data.brand_imagery_direction.mood_board_descriptors ||
            data.brand_imagery_direction.imagery_by_audience ||
            data.brand_imagery_direction.image_donts) && (
            <Page size="A4" style={s.page}>
              {/* Mood Board Descriptors */}
              {data.brand_imagery_direction.mood_board_descriptors && (() => {
                const mood = data.brand_imagery_direction.mood_board_descriptors!;
                return (
                  <>
                    <Text style={s.sectionTitle}>Visual Mood Board</Text>

                    {mood.adjectives && mood.adjectives.length > 0 && (
                      <>
                        <Text style={s.subsectionTitle}>Mood Keywords</Text>
                        <View style={s.tagRow}>
                          {mood.adjectives.map((adj, i) => (
                            <Text key={i} style={s.moodTag}>{adj}</Text>
                          ))}
                        </View>
                      </>
                    )}

                    {mood.textures && mood.textures.length > 0 && (
                      <>
                        <Text style={{ ...s.subsectionTitle, fontSize: 12 }}>Textures</Text>
                        <View style={s.tagRow}>
                          {mood.textures.map((tex, i) => (
                            <Text key={i} style={s.moodTag}>{tex}</Text>
                          ))}
                        </View>
                      </>
                    )}

                    {mood.environments && mood.environments.length > 0 && (
                      <>
                        <Text style={{ ...s.subsectionTitle, fontSize: 12 }}>Environments</Text>
                        <View style={s.tagRow}>
                          {mood.environments.map((env, i) => (
                            <Text key={i} style={s.moodTag}>{env}</Text>
                          ))}
                        </View>
                      </>
                    )}

                    {mood.lighting_conditions && (
                      <View style={{ marginBottom: 8 }}>
                        <Text style={{ fontSize: 10, fontWeight: 700, color: pdfTheme.colors.navy }}>Lighting</Text>
                        <Text style={{ fontSize: 10, color: pdfTheme.colors.text, lineHeight: 1.6 }}>{mood.lighting_conditions}</Text>
                      </View>
                    )}

                    {mood.color_moods && (
                      <View style={{ marginBottom: 8 }}>
                        <Text style={{ fontSize: 10, fontWeight: 700, color: pdfTheme.colors.navy }}>Color Mood</Text>
                        <Text style={{ fontSize: 10, color: pdfTheme.colors.text, lineHeight: 1.6 }}>{mood.color_moods}</Text>
                      </View>
                    )}

                    {mood.designer_note && (
                      <View style={{ ...s.imageryCard, borderLeft: `3px solid ${pdfTheme.colors.blue}`, marginTop: 8 }}>
                        <Text style={s.imageryLabel}>Designer Brief</Text>
                        <Text style={{ fontSize: 10, color: pdfTheme.colors.text, lineHeight: 1.7, fontStyle: "italic" }}>
                          {mood.designer_note}
                        </Text>
                      </View>
                    )}
                  </>
                );
              })()}

              {/* Imagery by Audience */}
              {data.brand_imagery_direction.imagery_by_audience &&
                data.brand_imagery_direction.imagery_by_audience.length > 0 && (
                <>
                  <Text style={{ ...s.subsectionTitle, marginTop: 16 }}>Imagery by Audience</Text>
                  {data.brand_imagery_direction.imagery_by_audience.map((aud, i) => (
                    <View key={i} style={s.card}>
                      <Text style={s.cardTitle}>{aud.persona}</Text>
                      <Text style={{ fontSize: 10, color: pdfTheme.colors.text, lineHeight: 1.6 }}>
                        {aud.visual_tone_shift}
                      </Text>
                      {aud.example_image_descriptions && aud.example_image_descriptions.length > 0 && (
                        <View style={{ marginTop: 6 }}>
                          <Text style={{ fontSize: 9, fontWeight: 700, color: "#6B7280", marginBottom: 3 }}>Example imagery:</Text>
                          {aud.example_image_descriptions.map((desc, j) => (
                            <Text key={j} style={{ fontSize: 9, color: "#6B7280", paddingLeft: 8, marginBottom: 2 }}>
                              {"\u2022"} {desc}
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </>
              )}

              {/* Image Don'ts */}
              {data.brand_imagery_direction.image_donts &&
                data.brand_imagery_direction.image_donts.length > 0 && (
                <>
                  <Text style={{ ...s.subsectionTitle, marginTop: 16 }}>Imagery Pitfalls to Avoid</Text>
                  {data.brand_imagery_direction.image_donts.map((item, i) => (
                    <View key={i} style={s.dontCard}>
                      <Text style={s.dontLabel}>{"\u2717"} {item.dont}</Text>
                      <Text style={s.dontWhy}>Why: {item.why}</Text>
                      <Text style={s.dontAlt}>{"\u2713"} Instead: {item.alternative}</Text>
                    </View>
                  ))}
                </>
              )}

              <PageFooter businessName={businessName} />
            </Page>
          )}
        </>
      )}

      <DisclaimerPage tier="blueprint_plus" />
    </Document>
  );
}

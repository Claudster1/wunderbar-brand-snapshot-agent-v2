// Brand Standards & Guidelines Guide — PDF export from the Brand Workbook.
//
// Structured for anyone who touches the brand: marketing, sales, contractors,
// agencies, internal teams. Sections:
//
//   1. Brand Foundations — who we are
//   2. Visual Identity — how we look
//   3. Verbal Identity — how we sound
//   4. Applications & Examples — how we show up
//   5. Governance & Access — who owns what (fill-in-the-blank)

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
import { pdfTheme, colors } from "../theme";
import { DisclaimerPage } from "../components/DisclaimerPage";

const LOGO_URL = "https://d268zs2sdbzvo0.cloudfront.net/66e09bd196e8d5672b143fb8_528e12f9-22c9-4c46-8d90-59238d4c8141_logo.webp";

// ─── Types ───

interface ColorSwatch {
  name: string;
  hex: string;
  rgb?: string;
  cmyk?: string;
  usage?: string;
}

interface AvoidColor {
  name: string;
  hex?: string;
  reason: string;
}

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

interface SampleExecution {
  channel: string;
  format: string;
  description: string;
  key_elements?: string[];
}

interface DoAndDont {
  area: string;
  do_example: string;
  dont_example: string;
  why: string;
}

interface ContentPillar {
  name: string;
  description: string;
  example_topics?: string[];
  suggested_formats?: string[];
}

interface MessagingPillar {
  title: string;
  description: string;
  proof_points?: string[];
}

interface Audience {
  description?: string;
  pain_points?: string[];
  decision_triggers?: string[];
  demographics?: string;
  psychographics?: string;
}

interface Differentiator {
  differentiator: string;
  competitive_advantage?: string;
  proof?: string;
}

interface WorkbookData {
  business_name?: string;

  // Brand Foundations
  positioning_statement?: string;
  unique_value_proposition?: string;
  competitive_differentiation?: string;
  brand_archetype?: string;
  archetype_description?: string;
  archetype_application?: string;
  brand_alignment_score?: number;
  primary_pillar?: string;
  key_differentiators?: Array<Differentiator | string>;
  primary_audience?: Audience | null;
  secondary_audience?: Audience | null;

  // Messaging (existing columns)
  elevator_pitch_30s?: string;
  elevator_pitch_60s?: string;
  elevator_pitch_email?: string;
  messaging_pillars?: MessagingPillar[];
  brand_voice_attributes?: string[];
  tone_guidelines?: string;
  voice_dos?: string[];
  voice_donts?: string[];
  sample_rewrites?: Array<{ before: string; after: string }>;

  // Typography (existing)
  typography_tone?: string;
  typography_recommendations?: {
    headline?: TypographyLevel;
    subheadline?: TypographyLevel;
    body?: TypographyLevel;
    caption?: TypographyLevel;
    accent?: TypographyLevel;
  };

  // Imagery (existing)
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

  // Rich brand standards data (from Blueprint+ report via JSONB column)
  brand_standards_data?: {
    // Brand Foundations
    brand_story?: {
      headline?: string;
      narrative?: string;
      founder_story?: string;
    };
    brand_purpose?: string;
    brand_promise?: string;
    mission?: string;
    vision?: string;
    values?: string[] | Array<{ name: string; description: string }>;

    // Persona
    persona_summary?: string;
    core_identity?: {
      who_you_are?: string;
      what_you_stand_for?: string;
      how_you_show_up?: string;
    };
    personality_traits?: string[];
    communication_style?: string;

    // Visual
    color_palette?: ColorSwatch[];
    secondary_palette?: ColorSwatch[];
    avoid_colors?: AvoidColor[];
    visual_consistency_principles?: string;
    logo_guidelines?: {
      overview?: string;
      clear_space?: string;
      minimum_size?: string;
      placement_rules?: string[];
      incorrect_uses?: string[];
    };
    layout_guidelines?: {
      overview?: string;
      margins?: string;
      spacing?: string;
      grid_system?: string;
      digital_patterns?: string[];
      print_patterns?: string[];
    };

    // Verbal
    writing_guidelines?: {
      overview?: string;
      grammar_preferences?: string[];
      jargon_rules?: string;
      point_of_view?: string;
      inclusive_language?: string;
      style_preferences?: string[];
    };
    taglines?: Array<{ tagline: string; usage?: string }>;
    boilerplate?: {
      one_liner?: string;
      short_description?: string;
      full_boilerplate?: string;
      proposal_intro?: string;
      industry_specific?: string;
    };

    // Applications
    sample_executions?: SampleExecution[];
    do_and_dont_pages?: DoAndDont[];
    content_pillars?: ContentPillar[];

    // Governance template
    governance_template?: {
      brand_owner_role?: string;
      review_cadence?: string;
      exception_process?: string;
    };
  };
}

// ─── Styles ───

const s = StyleSheet.create({
  page: {
    padding: 48,
    paddingBottom: 72,
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
  coverLogo: { width: 140, marginBottom: 48, opacity: 0.9 },
  coverTitle: {
    fontSize: 36, fontWeight: 700, color: "#FFFFFF",
    textAlign: "center", marginBottom: 12,
  },
  coverSubtitle: {
    fontSize: 14, color: pdfTheme.colors.blue, textAlign: "center",
    marginBottom: 48, fontWeight: 600,
  },
  coverPreparedLabel: {
    fontSize: 10, color: "rgba(255,255,255,0.5)", textAlign: "center",
    textTransform: "uppercase", letterSpacing: 2, marginBottom: 6,
  },
  coverBrand: {
    fontSize: 24, color: "#FFFFFF", textAlign: "center",
    marginBottom: 6, fontWeight: 700,
  },
  coverDate: {
    fontSize: 12, color: "rgba(255,255,255,0.6)", textAlign: "center",
    marginBottom: 40,
  },
  coverConfidential: {
    fontSize: 9, color: "rgba(255,255,255,0.4)", textAlign: "center",
    marginBottom: 6, letterSpacing: 0.5,
  },
  coverUrl: {
    fontSize: 10, color: pdfTheme.colors.blue, textAlign: "center",
    textDecoration: "none",
  },

  // Section divider page
  dividerPage: {
    padding: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: pdfTheme.colors.navy,
    fontFamily: "Helvetica",
  },
  dividerNumber: {
    fontSize: 64, fontWeight: 700, color: pdfTheme.colors.blue,
    marginBottom: 16, opacity: 0.6,
  },
  dividerTitle: {
    fontSize: 32, fontWeight: 700, color: "#FFFFFF",
    textAlign: "center", marginBottom: 8,
  },
  dividerSubtitle: {
    fontSize: 14, color: "rgba(255,255,255,0.6)", textAlign: "center",
    maxWidth: 400,
  },

  // Content
  sectionTitle: {
    fontSize: 22, fontWeight: 700, color: pdfTheme.colors.navy,
    marginBottom: 16, borderBottom: `2px solid ${pdfTheme.colors.blue}`,
    paddingBottom: 8,
  },
  subsectionTitle: {
    fontSize: 14, fontWeight: 700, color: pdfTheme.colors.navy,
    marginTop: 18, marginBottom: 6,
  },
  body: {
    fontSize: 11, lineHeight: 1.7, marginBottom: 10,
    color: pdfTheme.colors.text,
  },
  bodySmall: {
    fontSize: 10, lineHeight: 1.6, marginBottom: 6,
    color: pdfTheme.colors.text,
  },
  card: {
    backgroundColor: "#F8FAFD", borderRadius: 6, padding: 16,
    marginBottom: 12, border: `1px solid ${colors.borderLight}`,
  },
  cardTitle: {
    fontSize: 13, fontWeight: 700, color: pdfTheme.colors.navy,
    marginBottom: 4,
  },
  tag: {
    backgroundColor: "#EBF8FF", color: pdfTheme.colors.blue,
    borderRadius: 12, padding: "4px 10px", fontSize: 10,
    fontWeight: 600, marginRight: 6, marginBottom: 4,
  },
  tagRow: {
    flexDirection: "row" as const, flexWrap: "wrap" as const,
    gap: 6, marginBottom: 10,
  },
  bullet: { fontSize: 11, marginBottom: 4, paddingLeft: 12 },
  bulletSmall: { fontSize: 10, marginBottom: 3, paddingLeft: 12, color: "#555" },

  // Archetype
  archetypeBadge: {
    backgroundColor: pdfTheme.colors.navy, color: "#FFFFFF",
    borderRadius: 8, padding: "12px 24px", textAlign: "center",
    marginBottom: 16,
  },
  archetypeLabel: {
    fontSize: 9, color: pdfTheme.colors.blue, fontWeight: 700,
    textTransform: "uppercase" as const, letterSpacing: 1, marginBottom: 4,
  },
  archetypeName: { fontSize: 20, fontWeight: 700, color: "#FFFFFF" },

  // Two-column layout
  twoCol: { flexDirection: "row" as const, gap: 12 },
  col: { flex: 1 },

  // Do / Don't
  doRow: { flexDirection: "row" as const, gap: 16, marginTop: 8 },
  doCol: { flex: 1 },
  doHeader: { fontSize: 12, fontWeight: 700, marginBottom: 6 },
  doCard: {
    backgroundColor: "#F0FDF4", borderRadius: 6, padding: 10,
    marginBottom: 8, borderLeft: "3px solid #059669",
  },
  dontCard: {
    backgroundColor: "#FEF2F2", borderRadius: 6, padding: 10,
    marginBottom: 8, borderLeft: "3px solid #EF4444",
  },
  dontLabel: { fontSize: 11, fontWeight: 700, color: "#991B1B", marginBottom: 3 },
  dontWhy: { fontSize: 10, color: "#6B7280", lineHeight: 1.5, marginBottom: 3 },
  dontAlt: { fontSize: 10, color: "#059669", fontWeight: 600, lineHeight: 1.5 },

  // Color swatch
  swatchRow: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: 10, marginBottom: 12 },
  swatch: {
    width: 100, borderRadius: 6, overflow: "hidden" as const,
    border: `1px solid ${colors.borderLight}`, marginBottom: 8,
  },
  swatchColor: { height: 48 },
  swatchInfo: { padding: 8, backgroundColor: "#fff" },
  swatchName: { fontSize: 9, fontWeight: 700, color: pdfTheme.colors.navy, marginBottom: 2 },
  swatchHex: { fontSize: 8, color: "#6B7280" },
  swatchUsage: { fontSize: 8, color: "#9CA3AF", marginTop: 2 },

  // Typography
  typeSample: {
    backgroundColor: "#F8FAFD", borderRadius: 6, padding: 16,
    marginBottom: 14, border: `1px solid ${colors.borderLight}`,
  },
  typeLevelLabel: {
    fontSize: 9, fontWeight: 700, color: pdfTheme.colors.blue,
    textTransform: "uppercase" as const, letterSpacing: 1.5, marginBottom: 6,
  },
  typeSpec: { fontSize: 9, color: "#9CA3AF", marginTop: 6 },
  typeUsage: { fontSize: 10, color: "#6B7280", marginTop: 4, lineHeight: 1.5 },

  // Imagery
  imageryCard: {
    backgroundColor: "#F8FAFD", borderRadius: 6, padding: 14,
    marginBottom: 10, border: `1px solid ${colors.borderLight}`,
  },
  imageryLabel: {
    fontSize: 9, fontWeight: 700, color: pdfTheme.colors.blue,
    textTransform: "uppercase" as const, letterSpacing: 1, marginBottom: 4,
  },
  channelCard: {
    backgroundColor: "#FFFFFF", borderRadius: 6, padding: 12,
    marginBottom: 8, borderLeft: `3px solid ${pdfTheme.colors.blue}`,
    border: `1px solid ${colors.borderLight}`,
  },
  channelName: { fontSize: 12, fontWeight: 700, color: pdfTheme.colors.navy, marginBottom: 4 },
  channelDimensions: { fontSize: 9, color: pdfTheme.colors.blue, fontWeight: 600, marginBottom: 4 },
  moodTag: {
    backgroundColor: "#EBF8FF", color: pdfTheme.colors.navy,
    borderRadius: 10, padding: "3px 8px", fontSize: 9,
    fontWeight: 600, marginRight: 4, marginBottom: 4,
  },

  // Governance fill-in
  fillIn: {
    backgroundColor: "#FFFBEB", borderRadius: 6, padding: 14,
    marginBottom: 10, border: "1px dashed #D97706",
  },
  fillInLabel: {
    fontSize: 10, fontWeight: 700, color: "#92400E",
    marginBottom: 4, textTransform: "uppercase" as const, letterSpacing: 0.5,
  },
  fillInLine: {
    borderBottom: "1px solid #D1D5DB", marginBottom: 12,
    paddingBottom: 16, minHeight: 20,
  },
  fillInHint: { fontSize: 9, color: "#9CA3AF", fontStyle: "italic" as const, marginBottom: 6 },

  // Footer
  footer: {
    position: "absolute" as const, bottom: 20, left: 48, right: 48,
    borderTop: `0.5px solid ${colors.borderLight}`, paddingTop: 8,
  },
  footerRow: {
    flexDirection: "row" as const, justifyContent: "space-between" as const,
    alignItems: "center" as const, fontSize: 8, color: "#9CA3AF",
  },
  footerConfidential: {
    fontSize: 7, color: "#B0B8C4", textAlign: "center" as const, marginTop: 4,
  },
});

// ─── Helpers ───

function PageFooter({ businessName }: { businessName: string }) {
  return (
    <View style={s.footer} fixed>
      <View style={s.footerRow}>
        <Text>{businessName} {"\u2014"} Brand Standards & Guidelines</Text>
        <Text>WunderBrand Blueprint+{"\u2122"} | wunderbardigital.com</Text>
      </View>
      <Text style={s.footerConfidential}>
        Confidential {"\u2014"} Prepared exclusively for {businessName}. Unauthorized distribution is prohibited.
      </Text>
    </View>
  );
}

function SectionDivider({ number, title, subtitle }: { number: string; title: string; subtitle: string }) {
  return (
    <Page size="A4" style={s.dividerPage}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 64 }}>
        <Text style={s.dividerNumber}>{number}</Text>
        <Text style={s.dividerTitle}>{title}</Text>
        <Text style={s.dividerSubtitle}>{subtitle}</Text>
      </View>
    </Page>
  );
}

function ColorSwatchBlock({ swatch }: { swatch: ColorSwatch }) {
  return (
    <View style={s.swatch}>
      <View style={{ ...s.swatchColor, backgroundColor: swatch.hex || "#ccc" }} />
      <View style={s.swatchInfo}>
        <Text style={s.swatchName}>{swatch.name}</Text>
        <Text style={s.swatchHex}>{swatch.hex}</Text>
        {swatch.rgb && <Text style={s.swatchHex}>RGB: {swatch.rgb}</Text>}
        {swatch.cmyk && <Text style={s.swatchHex}>CMYK: {swatch.cmyk}</Text>}
        {swatch.usage && <Text style={s.swatchUsage}>{swatch.usage}</Text>}
      </View>
    </View>
  );
}

// ─── Document ───

export function BrandStandardsDocument({ data }: { data: WorkbookData }) {
  const biz = data.business_name || "Your Brand";
  const bsd = data.brand_standards_data || {};
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <Document title={`${biz} — Brand Standards & Guidelines`} author="WunderBrand">

      {/* ═══════ Cover Page ═══════ */}
      <Page size="A4" style={s.coverPage}>
        <View style={s.coverInner}>
          <Image style={s.coverLogo} src={LOGO_URL} />
          <Text style={s.coverTitle}>Brand Standards{"\n"}& Guidelines</Text>
          <Text style={s.coverSubtitle}>WunderBrand Blueprint+{"\u2122"}</Text>
          <Text style={s.coverPreparedLabel}>Prepared for</Text>
          <Text style={s.coverBrand}>{biz}</Text>
          <Text style={s.coverDate}>{today}</Text>
          <Text style={s.coverConfidential}>
            Confidential {"\u2014"} For internal and authorized partner use only
          </Text>
          <Link src="https://wunderbardigital.com" style={s.coverUrl}>
            wunderbardigital.com
          </Link>
        </View>
      </Page>

      {/* ═══════ Table of Contents ═══════ */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>What{"\u2019"}s Inside</Text>
        <Text style={s.body}>
          This guide is the single source of truth for how {biz} presents itself to the world. Whether you{"\u2019"}re writing a social post, briefing an agency, designing a pitch deck, or onboarding a new team member {"\u2014"} start here.
        </Text>
        <View style={{ marginTop: 16 }}>
          {[
            { num: "01", title: "Brand Foundations", desc: "Who we are, what we stand for, and how we\u2019re positioned" },
            { num: "02", title: "Visual Identity", desc: "Colors, typography, imagery, and layout rules" },
            { num: "03", title: "Verbal Identity", desc: "How we sound, write, and communicate" },
            { num: "04", title: "Applications & Examples", desc: "The brand in action across channels" },
            { num: "05", title: "Governance & Access", desc: "Who owns the brand and how to get assets" },
          ].map((item) => (
            <View key={item.num} style={{ flexDirection: "row" as const, marginBottom: 14, alignItems: "flex-start" as const }}>
              <Text style={{ fontSize: 20, fontWeight: 700, color: pdfTheme.colors.blue, width: 40, marginRight: 12 }}>
                {item.num}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: 700, color: pdfTheme.colors.navy }}>{item.title}</Text>
                <Text style={{ fontSize: 10, color: "#6B7280", marginTop: 2 }}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
        <PageFooter businessName={biz} />
      </Page>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1: BRAND FOUNDATIONS
          ═══════════════════════════════════════════════════════════════ */}

      <SectionDivider number="01" title="Brand Foundations" subtitle="Who we are, what we believe, and the position we own in the market" />

      {/* Brand Story & Purpose */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>Brand Story & Purpose</Text>

        {bsd.brand_story?.narrative && (
          <>
            {bsd.brand_story.headline && (
              <Text style={{ fontSize: 16, fontWeight: 700, color: pdfTheme.colors.navy, marginBottom: 10 }}>
                {bsd.brand_story.headline}
              </Text>
            )}
            <Text style={s.body}>{bsd.brand_story.narrative}</Text>
          </>
        )}

        {bsd.brand_purpose && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Our Purpose</Text>
            <Text style={s.body}>{bsd.brand_purpose}</Text>
          </View>
        )}

        {bsd.brand_promise && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Our Brand Promise</Text>
            <Text style={s.body}>{bsd.brand_promise}</Text>
          </View>
        )}

        {bsd.brand_story?.founder_story && (
          <>
            <Text style={s.subsectionTitle}>Founder Story</Text>
            <Text style={s.body}>{bsd.brand_story.founder_story}</Text>
          </>
        )}

        <PageFooter businessName={biz} />
      </Page>

      {/* Mission, Vision & Values */}
      {(bsd.mission || bsd.vision || bsd.values) && (
        <Page size="A4" style={s.page}>
          <Text style={s.sectionTitle}>Mission, Vision & Values</Text>

          {bsd.mission && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Mission</Text>
              <Text style={s.body}>{bsd.mission}</Text>
            </View>
          )}

          {bsd.vision && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Vision</Text>
              <Text style={s.body}>{bsd.vision}</Text>
            </View>
          )}

          {bsd.values && bsd.values.length > 0 && (
            <>
              <Text style={s.subsectionTitle}>Core Values</Text>
              {bsd.values.map((val, i) => {
                const name = typeof val === "string" ? val : val.name;
                const desc = typeof val === "string" ? undefined : val.description;
                return (
                  <View key={i} style={s.card}>
                    <Text style={s.cardTitle}>{name}</Text>
                    {desc && <Text style={s.bodySmall}>{desc}</Text>}
                  </View>
                );
              })}
            </>
          )}

          <PageFooter businessName={biz} />
        </Page>
      )}

      {/* Brand Positioning */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>Brand Positioning</Text>

        {data.positioning_statement && (
          <>
            <Text style={s.subsectionTitle}>Positioning Statement</Text>
            <View style={{ ...s.card, borderLeft: `3px solid ${pdfTheme.colors.blue}` }}>
              <Text style={{ ...s.body, fontStyle: "italic" as const, fontSize: 12 }}>
                {data.positioning_statement}
              </Text>
            </View>
          </>
        )}

        {data.unique_value_proposition && (
          <>
            <Text style={s.subsectionTitle}>Unique Value Proposition</Text>
            <Text style={s.body}>{data.unique_value_proposition}</Text>
          </>
        )}

        {data.competitive_differentiation && (
          <>
            <Text style={s.subsectionTitle}>Competitive Differentiation</Text>
            <Text style={s.body}>{data.competitive_differentiation}</Text>
          </>
        )}

        {data.key_differentiators && data.key_differentiators.length > 0 && (
          <>
            <Text style={s.subsectionTitle}>Key Differentiators</Text>
            {data.key_differentiators.map((diff, idx) => {
              const text = typeof diff === "string" ? diff : diff.differentiator;
              const advantage = typeof diff === "object" ? diff.competitive_advantage : undefined;
              return (
                <View key={idx} style={s.card}>
                  <Text style={s.cardTitle}>{text}</Text>
                  {advantage && <Text style={s.bodySmall}>{advantage}</Text>}
                </View>
              );
            })}
          </>
        )}

        <PageFooter businessName={biz} />
      </Page>

      {/* Brand Personality & Archetype */}
      {(data.brand_archetype || bsd.persona_summary) && (
        <Page size="A4" style={s.page}>
          <Text style={s.sectionTitle}>Brand Personality & Archetype</Text>

          {data.brand_archetype && (
            <View style={s.archetypeBadge}>
              <Text style={s.archetypeLabel}>Brand Archetype</Text>
              <Text style={s.archetypeName}>{data.brand_archetype}</Text>
            </View>
          )}

          {data.archetype_description && (
            <Text style={s.body}>{data.archetype_description}</Text>
          )}

          {bsd.persona_summary && (
            <>
              <Text style={s.subsectionTitle}>Brand Persona</Text>
              <Text style={s.body}>{bsd.persona_summary}</Text>
            </>
          )}

          {bsd.core_identity && (
            <View style={s.twoCol}>
              {bsd.core_identity.who_you_are && (
                <View style={{ ...s.col, ...s.card }}>
                  <Text style={s.cardTitle}>Who We Are</Text>
                  <Text style={s.bodySmall}>{bsd.core_identity.who_you_are}</Text>
                </View>
              )}
              {bsd.core_identity.what_you_stand_for && (
                <View style={{ ...s.col, ...s.card }}>
                  <Text style={s.cardTitle}>What We Stand For</Text>
                  <Text style={s.bodySmall}>{bsd.core_identity.what_you_stand_for}</Text>
                </View>
              )}
            </View>
          )}

          {bsd.core_identity?.how_you_show_up && (
            <View style={s.card}>
              <Text style={s.cardTitle}>How We Show Up</Text>
              <Text style={s.bodySmall}>{bsd.core_identity.how_you_show_up}</Text>
            </View>
          )}

          {bsd.personality_traits && bsd.personality_traits.length > 0 && (
            <>
              <Text style={s.subsectionTitle}>Personality Traits</Text>
              <View style={s.tagRow}>
                {bsd.personality_traits.map((trait, i) => (
                  <Text key={i} style={s.tag}>{trait}</Text>
                ))}
              </View>
            </>
          )}

          {data.archetype_application && (
            <>
              <Text style={s.subsectionTitle}>How to Apply This in Practice</Text>
              <Text style={s.body}>{data.archetype_application}</Text>
            </>
          )}

          <PageFooter businessName={biz} />
        </Page>
      )}

      {/* Target Audiences */}
      {(data.primary_audience || data.secondary_audience) && (
        <Page size="A4" style={s.page}>
          <Text style={s.sectionTitle}>Target Audiences</Text>
          <Text style={s.body}>
            Understanding who we{"\u2019"}re talking to is essential for creating relevant, on-brand content. Here are the audience profiles every team member and partner should reference.
          </Text>

          {data.primary_audience && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Primary Audience</Text>
              <Text style={s.bodySmall}>
                {data.primary_audience.description || JSON.stringify(data.primary_audience)}
              </Text>
              {data.primary_audience.pain_points && data.primary_audience.pain_points.length > 0 && (
                <>
                  <Text style={{ ...s.cardTitle, fontSize: 11, marginTop: 8 }}>Pain Points</Text>
                  {data.primary_audience.pain_points.map((pp, i) => (
                    <Text key={i} style={s.bulletSmall}>{"\u2022"} {pp}</Text>
                  ))}
                </>
              )}
              {data.primary_audience.decision_triggers && data.primary_audience.decision_triggers.length > 0 && (
                <>
                  <Text style={{ ...s.cardTitle, fontSize: 11, marginTop: 8 }}>Decision Triggers</Text>
                  {data.primary_audience.decision_triggers.map((dt, i) => (
                    <Text key={i} style={s.bulletSmall}>{"\u2022"} {dt}</Text>
                  ))}
                </>
              )}
            </View>
          )}

          {data.secondary_audience && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Secondary Audience</Text>
              <Text style={s.bodySmall}>
                {data.secondary_audience.description || JSON.stringify(data.secondary_audience)}
              </Text>
            </View>
          )}

          <PageFooter businessName={biz} />
        </Page>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2: VISUAL IDENTITY
          ═══════════════════════════════════════════════════════════════ */}

      <SectionDivider number="02" title="Visual Identity" subtitle="The visual system that makes us recognizable at a glance" />

      {/* Logo System */}
      {bsd.logo_guidelines && (
        <Page size="A4" style={s.page}>
          <Text style={s.sectionTitle}>Logo System</Text>

          {bsd.logo_guidelines.overview && (
            <Text style={s.body}>{bsd.logo_guidelines.overview}</Text>
          )}

          <View style={s.twoCol}>
            {bsd.logo_guidelines.clear_space && (
              <View style={{ ...s.col, ...s.card }}>
                <Text style={s.cardTitle}>Clear Space</Text>
                <Text style={s.bodySmall}>{bsd.logo_guidelines.clear_space}</Text>
              </View>
            )}
            {bsd.logo_guidelines.minimum_size && (
              <View style={{ ...s.col, ...s.card }}>
                <Text style={s.cardTitle}>Minimum Size</Text>
                <Text style={s.bodySmall}>{bsd.logo_guidelines.minimum_size}</Text>
              </View>
            )}
          </View>

          {bsd.logo_guidelines.placement_rules && bsd.logo_guidelines.placement_rules.length > 0 && (
            <>
              <Text style={s.subsectionTitle}>Placement Rules</Text>
              {bsd.logo_guidelines.placement_rules.map((rule, i) => (
                <Text key={i} style={s.bullet}>{"\u2713"} {rule}</Text>
              ))}
            </>
          )}

          {bsd.logo_guidelines.incorrect_uses && bsd.logo_guidelines.incorrect_uses.length > 0 && (
            <>
              <Text style={{ ...s.subsectionTitle, color: "#DC2626" }}>Incorrect Uses</Text>
              {bsd.logo_guidelines.incorrect_uses.map((use, i) => (
                <Text key={i} style={{ ...s.bullet, color: "#991B1B" }}>{"\u2717"} {use}</Text>
              ))}
            </>
          )}

          <PageFooter businessName={biz} />
        </Page>
      )}

      {/* Color Palette */}
      {(bsd.color_palette && bsd.color_palette.length > 0) && (
        <Page size="A4" style={s.page}>
          <Text style={s.sectionTitle}>Color Palette</Text>

          <Text style={s.subsectionTitle}>Primary Palette</Text>
          <View style={s.swatchRow}>
            {bsd.color_palette.map((c, i) => (
              <ColorSwatchBlock key={i} swatch={c} />
            ))}
          </View>

          {bsd.secondary_palette && bsd.secondary_palette.length > 0 && (
            <>
              <Text style={s.subsectionTitle}>Secondary / Accent Palette</Text>
              <View style={s.swatchRow}>
                {bsd.secondary_palette.map((c, i) => (
                  <ColorSwatchBlock key={i} swatch={c} />
                ))}
              </View>
            </>
          )}

          {bsd.avoid_colors && bsd.avoid_colors.length > 0 && (
            <>
              <Text style={{ ...s.subsectionTitle, color: "#DC2626" }}>Colors to Avoid</Text>
              {bsd.avoid_colors.map((ac, i) => (
                <View key={i} style={{ flexDirection: "row" as const, alignItems: "center" as const, marginBottom: 6 }}>
                  {ac.hex && (
                    <View style={{ width: 20, height: 20, borderRadius: 4, backgroundColor: ac.hex, marginRight: 8, border: `1px solid ${colors.borderLight}` }} />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10, fontWeight: 700, color: "#991B1B" }}>{ac.name}</Text>
                    <Text style={{ fontSize: 9, color: "#6B7280" }}>{ac.reason}</Text>
                  </View>
                </View>
              ))}
            </>
          )}

          <PageFooter businessName={biz} />
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

          <Text style={{ ...s.subsectionTitle, marginTop: 16 }}>Type Hierarchy</Text>

          <View style={s.typeSample}>
            <Text style={s.typeLevelLabel}>Headline</Text>
            <Text style={{ fontSize: 28, fontWeight: 700, color: pdfTheme.colors.navy, lineHeight: 1.2 }}>
              {data.typography_recommendations?.headline
                ? `${biz}: ${data.typography_recommendations.headline.usage}`
                : `${biz} Brand Headline`}
            </Text>
            <Text style={s.typeSpec}>
              {data.typography_recommendations?.headline
                ? `${data.typography_recommendations.headline.font} \u2022 ${data.typography_recommendations.headline.weight} \u2022 ${data.typography_recommendations.headline.size}`
                : "Bold \u2022 28\u201336pt \u2022 Page titles and hero sections"}
            </Text>
          </View>

          <View style={s.typeSample}>
            <Text style={s.typeLevelLabel}>Subheadline</Text>
            <Text style={{ fontSize: 18, fontWeight: 600, color: pdfTheme.colors.navy, lineHeight: 1.3 }}>
              Supporting message that adds clarity and context
            </Text>
            <Text style={s.typeSpec}>
              {data.typography_recommendations?.subheadline
                ? `${data.typography_recommendations.subheadline.font} \u2022 ${data.typography_recommendations.subheadline.weight} \u2022 ${data.typography_recommendations.subheadline.size}`
                : "Semibold \u2022 18\u201322pt \u2022 Section headers and card titles"}
            </Text>
          </View>

          <View style={s.typeSample}>
            <Text style={s.typeLevelLabel}>Body Text</Text>
            <Text style={{ fontSize: 12, fontWeight: 400, color: pdfTheme.colors.text, lineHeight: 1.7 }}>
              This is {biz}{"\u2019"}s standard body text. It should be comfortable to read in paragraphs, with generous line height and clear contrast.
            </Text>
            <Text style={s.typeSpec}>
              {data.typography_recommendations?.body
                ? `${data.typography_recommendations.body.font} \u2022 ${data.typography_recommendations.body.weight} \u2022 ${data.typography_recommendations.body.size}`
                : "Regular \u2022 11\u201313pt \u2022 Paragraphs, descriptions, long-form"}
            </Text>
          </View>

          <View style={s.typeSample}>
            <Text style={s.typeLevelLabel}>Caption / Small Text</Text>
            <Text style={{ fontSize: 9, fontWeight: 400, color: "#6B7280", lineHeight: 1.5 }}>
              Photo credit \u2022 {biz} \u2022 {new Date().getFullYear()} {"\u2014"} Labels, metadata, fine print
            </Text>
            <Text style={s.typeSpec}>
              {data.typography_recommendations?.caption
                ? `${data.typography_recommendations.caption.font} \u2022 ${data.typography_recommendations.caption.weight} \u2022 ${data.typography_recommendations.caption.size}`
                : "Regular \u2022 8\u201310pt \u2022 Credits, dates, disclaimers"}
            </Text>
          </View>

          <View style={s.typeSample}>
            <Text style={s.typeLevelLabel}>Accent / CTA</Text>
            <View style={{ flexDirection: "row" as const, gap: 12, alignItems: "center" as const }}>
              <View style={{ backgroundColor: pdfTheme.colors.navy, borderRadius: 4, paddingVertical: 8, paddingHorizontal: 20 }}>
                <Text style={{ fontSize: 11, fontWeight: 700, color: "#FFFFFF", textTransform: "uppercase" as const, letterSpacing: 1 }}>
                  Get Started
                </Text>
              </View>
              <View style={{ borderRadius: 4, paddingVertical: 8, paddingHorizontal: 20, border: `1.5px solid ${pdfTheme.colors.blue}` }}>
                <Text style={{ fontSize: 11, fontWeight: 700, color: pdfTheme.colors.blue, textTransform: "uppercase" as const, letterSpacing: 1 }}>
                  Learn More
                </Text>
              </View>
            </View>
            <Text style={s.typeSpec}>
              {data.typography_recommendations?.accent
                ? `${data.typography_recommendations.accent.font} \u2022 ${data.typography_recommendations.accent.weight} \u2022 ${data.typography_recommendations.accent.size}`
                : "Bold \u2022 11\u201312pt \u2022 Uppercase \u2022 Buttons and navigation"}
            </Text>
          </View>

          <PageFooter businessName={biz} />
        </Page>
      )}

      {/* Layout Guidelines */}
      {bsd.layout_guidelines && (
        <Page size="A4" style={s.page}>
          <Text style={s.sectionTitle}>Layout & Grid Guidelines</Text>

          {bsd.layout_guidelines.overview && (
            <Text style={s.body}>{bsd.layout_guidelines.overview}</Text>
          )}

          <View style={s.twoCol}>
            {bsd.layout_guidelines.margins && (
              <View style={{ ...s.col, ...s.card }}>
                <Text style={s.cardTitle}>Margins</Text>
                <Text style={s.bodySmall}>{bsd.layout_guidelines.margins}</Text>
              </View>
            )}
            {bsd.layout_guidelines.spacing && (
              <View style={{ ...s.col, ...s.card }}>
                <Text style={s.cardTitle}>Spacing</Text>
                <Text style={s.bodySmall}>{bsd.layout_guidelines.spacing}</Text>
              </View>
            )}
          </View>

          {bsd.layout_guidelines.grid_system && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Grid System</Text>
              <Text style={s.bodySmall}>{bsd.layout_guidelines.grid_system}</Text>
            </View>
          )}

          {bsd.layout_guidelines.digital_patterns && bsd.layout_guidelines.digital_patterns.length > 0 && (
            <>
              <Text style={s.subsectionTitle}>Digital Layout Patterns</Text>
              {bsd.layout_guidelines.digital_patterns.map((p, i) => (
                <Text key={i} style={s.bullet}>{"\u2022"} {p}</Text>
              ))}
            </>
          )}

          {bsd.layout_guidelines.print_patterns && bsd.layout_guidelines.print_patterns.length > 0 && (
            <>
              <Text style={s.subsectionTitle}>Print Layout Patterns</Text>
              {bsd.layout_guidelines.print_patterns.map((p, i) => (
                <Text key={i} style={s.bullet}>{"\u2022"} {p}</Text>
              ))}
            </>
          )}

          <PageFooter businessName={biz} />
        </Page>
      )}

      {/* Imagery & Photography Direction */}
      {data.brand_imagery_direction && (
        <>
          <Page size="A4" style={s.page}>
            <Text style={s.sectionTitle}>Imagery & Photography</Text>

            {data.brand_imagery_direction.photography_style_direction && (
              <>
                <Text style={s.subsectionTitle}>Photography Style</Text>
                <Text style={s.body}>{data.brand_imagery_direction.photography_style_direction}</Text>
              </>
            )}

            {data.brand_imagery_direction.subject_matter_guidance && (
              <>
                <Text style={s.subsectionTitle}>Subject Matter Guidance</Text>
                <View style={s.twoCol}>
                  <View style={s.col}>
                    <View style={{ ...s.imageryCard, borderLeft: "3px solid #059669" }}>
                      <Text style={{ ...s.imageryLabel, color: "#059669" }}>Show</Text>
                      {(data.brand_imagery_direction.subject_matter_guidance.show || []).map((item, i) => (
                        <Text key={i} style={{ ...s.bulletSmall }}>{"\u2713"} {item}</Text>
                      ))}
                    </View>
                  </View>
                  <View style={s.col}>
                    <View style={{ ...s.imageryCard, borderLeft: "3px solid #EF4444" }}>
                      <Text style={{ ...s.imageryLabel, color: "#EF4444" }}>Avoid</Text>
                      {(data.brand_imagery_direction.subject_matter_guidance.avoid || []).map((item, i) => (
                        <Text key={i} style={{ ...s.bulletSmall }}>{"\u2717"} {item}</Text>
                      ))}
                    </View>
                  </View>
                </View>
              </>
            )}

            {data.brand_imagery_direction.stock_photo_selection_criteria && (() => {
              const c = data.brand_imagery_direction.stock_photo_selection_criteria!;
              const entries = [
                c.lighting && { l: "Lighting", v: c.lighting },
                c.composition && { l: "Composition", v: c.composition },
                c.color_temperature && { l: "Color Temperature", v: c.color_temperature },
                c.diversity && { l: "Diversity", v: c.diversity },
                c.authenticity_markers && { l: "Authenticity", v: c.authenticity_markers },
              ].filter(Boolean) as Array<{ l: string; v: string }>;
              return entries.length > 0 ? (
                <>
                  <Text style={s.subsectionTitle}>Photo Selection Criteria</Text>
                  {entries.map((e, i) => (
                    <View key={i} style={{ marginBottom: 6 }}>
                      <Text style={{ fontSize: 10, fontWeight: 700, color: pdfTheme.colors.navy }}>{e.l}</Text>
                      <Text style={{ fontSize: 10, color: pdfTheme.colors.text, lineHeight: 1.6 }}>{e.v}</Text>
                    </View>
                  ))}
                </>
              ) : null;
            })()}

            {data.brand_imagery_direction.color_application_in_imagery && (
              <>
                <Text style={s.subsectionTitle}>Color Application in Imagery</Text>
                <Text style={s.body}>{data.brand_imagery_direction.color_application_in_imagery}</Text>
              </>
            )}

            <PageFooter businessName={biz} />
          </Page>

          {/* Imagery by Channel */}
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
                  {platform.dimensions && <Text style={s.channelDimensions}>{platform.dimensions}</Text>}
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
              <PageFooter businessName={biz} />
            </Page>
          )}

          {/* Mood Board + Image Don'ts */}
          {(data.brand_imagery_direction.mood_board_descriptors ||
            data.brand_imagery_direction.image_donts) && (
            <Page size="A4" style={s.page}>
              {data.brand_imagery_direction.mood_board_descriptors && (() => {
                const mood = data.brand_imagery_direction.mood_board_descriptors!;
                return (
                  <>
                    <Text style={s.sectionTitle}>Visual Mood Board</Text>
                    {mood.adjectives && mood.adjectives.length > 0 && (
                      <>
                        <Text style={s.subsectionTitle}>Mood Keywords</Text>
                        <View style={s.tagRow}>
                          {mood.adjectives.map((adj, i) => <Text key={i} style={s.moodTag}>{adj}</Text>)}
                        </View>
                      </>
                    )}
                    {mood.textures && mood.textures.length > 0 && (
                      <>
                        <Text style={{ ...s.subsectionTitle, fontSize: 12 }}>Textures</Text>
                        <View style={s.tagRow}>
                          {mood.textures.map((t, i) => <Text key={i} style={s.moodTag}>{t}</Text>)}
                        </View>
                      </>
                    )}
                    {mood.environments && mood.environments.length > 0 && (
                      <>
                        <Text style={{ ...s.subsectionTitle, fontSize: 12 }}>Environments</Text>
                        <View style={s.tagRow}>
                          {mood.environments.map((e, i) => <Text key={i} style={s.moodTag}>{e}</Text>)}
                        </View>
                      </>
                    )}
                    {mood.designer_note && (
                      <View style={{ ...s.imageryCard, borderLeft: `3px solid ${pdfTheme.colors.blue}`, marginTop: 8 }}>
                        <Text style={s.imageryLabel}>Designer Brief</Text>
                        <Text style={{ fontSize: 10, color: pdfTheme.colors.text, lineHeight: 1.7, fontStyle: "italic" as const }}>
                          {mood.designer_note}
                        </Text>
                      </View>
                    )}
                  </>
                );
              })()}

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

              <PageFooter businessName={biz} />
            </Page>
          )}
        </>
      )}

      {bsd.visual_consistency_principles && (
        <Page size="A4" style={s.page}>
          <Text style={s.sectionTitle}>Visual Consistency Principles</Text>
          <Text style={s.body}>{bsd.visual_consistency_principles}</Text>
          <PageFooter businessName={biz} />
        </Page>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3: VERBAL IDENTITY
          ═══════════════════════════════════════════════════════════════ */}

      <SectionDivider number="03" title="Verbal Identity" subtitle="How we sound, write, and communicate across every touchpoint" />

      {/* Brand Voice & Tone */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>Brand Voice & Tone</Text>

        {bsd.communication_style && (
          <Text style={s.body}>{bsd.communication_style}</Text>
        )}

        {data.brand_voice_attributes && data.brand_voice_attributes.length > 0 && (
          <>
            <Text style={s.subsectionTitle}>Voice Attributes</Text>
            <View style={s.tagRow}>
              {data.brand_voice_attributes.map((attr, i) => (
                <Text key={i} style={s.tag}>{attr}</Text>
              ))}
            </View>
          </>
        )}

        {data.tone_guidelines && (
          <>
            <Text style={s.subsectionTitle}>Tone Guidelines</Text>
            <Text style={s.body}>{data.tone_guidelines}</Text>
          </>
        )}

        {((data.voice_dos && data.voice_dos.length > 0) || (data.voice_donts && data.voice_donts.length > 0)) && (
          <View style={s.doRow}>
            <View style={s.doCol}>
              <Text style={{ ...s.doHeader, color: "#059669" }}>Do</Text>
              {(data.voice_dos || []).map((item, i) => (
                <Text key={i} style={s.bullet}>{"\u2713"} {item}</Text>
              ))}
            </View>
            <View style={s.doCol}>
              <Text style={{ ...s.doHeader, color: "#DC2626" }}>Don{"\u2019"}t</Text>
              {(data.voice_donts || []).map((item, i) => (
                <Text key={i} style={s.bullet}>{"\u2717"} {item}</Text>
              ))}
            </View>
          </View>
        )}

        {data.sample_rewrites && data.sample_rewrites.length > 0 && (
          <>
            <Text style={{ ...s.subsectionTitle, marginTop: 16 }}>Before & After Rewrites</Text>
            {data.sample_rewrites.map((rw, i) => (
              <View key={i} style={{ marginBottom: 10 }}>
                <View style={s.dontCard}>
                  <Text style={{ fontSize: 9, fontWeight: 700, color: "#991B1B", marginBottom: 2 }}>Before (off-brand)</Text>
                  <Text style={s.bodySmall}>{rw.before}</Text>
                </View>
                <View style={s.doCard}>
                  <Text style={{ fontSize: 9, fontWeight: 700, color: "#059669", marginBottom: 2 }}>After (on-brand)</Text>
                  <Text style={s.bodySmall}>{rw.after}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        <PageFooter businessName={biz} />
      </Page>

      {/* Writing Guidelines */}
      {bsd.writing_guidelines && (
        <Page size="A4" style={s.page}>
          <Text style={s.sectionTitle}>Writing Guidelines</Text>

          {bsd.writing_guidelines.overview && (
            <Text style={s.body}>{bsd.writing_guidelines.overview}</Text>
          )}

          {bsd.writing_guidelines.point_of_view && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Point of View</Text>
              <Text style={s.bodySmall}>{bsd.writing_guidelines.point_of_view}</Text>
            </View>
          )}

          {bsd.writing_guidelines.grammar_preferences && bsd.writing_guidelines.grammar_preferences.length > 0 && (
            <>
              <Text style={s.subsectionTitle}>Grammar & Style Preferences</Text>
              {bsd.writing_guidelines.grammar_preferences.map((p, i) => (
                <Text key={i} style={s.bullet}>{"\u2022"} {p}</Text>
              ))}
            </>
          )}

          {bsd.writing_guidelines.style_preferences && bsd.writing_guidelines.style_preferences.length > 0 && (
            <>
              <Text style={s.subsectionTitle}>Style Preferences</Text>
              {bsd.writing_guidelines.style_preferences.map((p, i) => (
                <Text key={i} style={s.bullet}>{"\u2022"} {p}</Text>
              ))}
            </>
          )}

          {bsd.writing_guidelines.jargon_rules && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Jargon & Terminology</Text>
              <Text style={s.bodySmall}>{bsd.writing_guidelines.jargon_rules}</Text>
            </View>
          )}

          {bsd.writing_guidelines.inclusive_language && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Inclusive Language</Text>
              <Text style={s.bodySmall}>{bsd.writing_guidelines.inclusive_language}</Text>
            </View>
          )}

          <PageFooter businessName={biz} />
        </Page>
      )}

      {/* Messaging Pillars */}
      {data.messaging_pillars && data.messaging_pillars.length > 0 && (
        <Page size="A4" style={s.page}>
          <Text style={s.sectionTitle}>Messaging Pillars</Text>

          {data.messaging_pillars.map((pillar, idx) => (
            <View key={idx} style={s.card}>
              <Text style={s.cardTitle}>{pillar.title}</Text>
              <Text style={s.bodySmall}>{pillar.description}</Text>
              {pillar.proof_points && pillar.proof_points.length > 0 && (
                <>
                  <Text style={{ ...s.cardTitle, fontSize: 10, marginTop: 8 }}>Proof Points</Text>
                  {pillar.proof_points.map((pp, i) => (
                    <Text key={i} style={s.bulletSmall}>{"\u2022"} {pp}</Text>
                  ))}
                </>
              )}
            </View>
          ))}

          <PageFooter businessName={biz} />
        </Page>
      )}

      {/* Reusable Messaging */}
      {(data.elevator_pitch_30s || data.elevator_pitch_60s || data.elevator_pitch_email || bsd.taglines || bsd.boilerplate) && (
        <Page size="A4" style={s.page}>
          <Text style={s.sectionTitle}>Reusable Messaging</Text>
          <Text style={s.body}>
            Pre-approved messaging that anyone on the team can use as-is or adapt for context.
          </Text>

          {data.elevator_pitch_30s && (
            <View style={s.card}>
              <Text style={s.cardTitle}>30-Second Elevator Pitch</Text>
              <Text style={s.bodySmall}>{data.elevator_pitch_30s}</Text>
            </View>
          )}

          {data.elevator_pitch_60s && (
            <View style={s.card}>
              <Text style={s.cardTitle}>60-Second Elevator Pitch</Text>
              <Text style={s.bodySmall}>{data.elevator_pitch_60s}</Text>
            </View>
          )}

          {data.elevator_pitch_email && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Email Introduction</Text>
              <Text style={s.bodySmall}>{data.elevator_pitch_email}</Text>
            </View>
          )}

          {bsd.taglines && bsd.taglines.length > 0 && (
            <>
              <Text style={s.subsectionTitle}>Taglines</Text>
              {bsd.taglines.map((t, i) => (
                <View key={i} style={s.card}>
                  <Text style={{ fontSize: 14, fontWeight: 700, color: pdfTheme.colors.navy, fontStyle: "italic" as const }}>
                    {"\u201C"}{t.tagline}{"\u201D"}
                  </Text>
                  {t.usage && <Text style={{ ...s.bodySmall, marginTop: 4 }}>Use: {t.usage}</Text>}
                </View>
              ))}
            </>
          )}

          <PageFooter businessName={biz} />
        </Page>
      )}

      {/* Boilerplate Descriptions */}
      {bsd.boilerplate && (
        <Page size="A4" style={s.page}>
          <Text style={s.sectionTitle}>Company Descriptions</Text>
          <Text style={s.body}>
            Pre-approved descriptions for use across bios, press releases, proposals, and directories.
          </Text>

          {bsd.boilerplate.one_liner && (
            <View style={s.card}>
              <Text style={s.cardTitle}>One-Liner</Text>
              <Text style={s.bodySmall}>{bsd.boilerplate.one_liner}</Text>
            </View>
          )}

          {bsd.boilerplate.short_description && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Short Description</Text>
              <Text style={s.bodySmall}>{bsd.boilerplate.short_description}</Text>
            </View>
          )}

          {bsd.boilerplate.full_boilerplate && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Full Boilerplate</Text>
              <Text style={s.bodySmall}>{bsd.boilerplate.full_boilerplate}</Text>
            </View>
          )}

          {bsd.boilerplate.proposal_intro && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Proposal / Pitch Deck Intro</Text>
              <Text style={s.bodySmall}>{bsd.boilerplate.proposal_intro}</Text>
            </View>
          )}

          {bsd.boilerplate.industry_specific && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Industry-Specific Version</Text>
              <Text style={s.bodySmall}>{bsd.boilerplate.industry_specific}</Text>
            </View>
          )}

          <PageFooter businessName={biz} />
        </Page>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 4: APPLICATIONS & EXAMPLES
          ═══════════════════════════════════════════════════════════════ */}

      <SectionDivider number="04" title="Applications & Examples" subtitle="The brand in action — patterns to follow, not rules to memorize" />

      {/* Content Pillars */}
      {bsd.content_pillars && bsd.content_pillars.length > 0 && (
        <Page size="A4" style={s.page}>
          <Text style={s.sectionTitle}>Content Pillars</Text>
          <Text style={s.body}>
            These are the core themes {biz} should consistently create content around. Use them to plan content calendars, brief writers, and evaluate whether content is on-brand.
          </Text>

          {bsd.content_pillars.map((pillar, i) => (
            <View key={i} style={s.card}>
              <Text style={s.cardTitle}>{pillar.name}</Text>
              <Text style={s.bodySmall}>{pillar.description}</Text>
              {pillar.example_topics && pillar.example_topics.length > 0 && (
                <View style={{ marginTop: 6 }}>
                  <Text style={{ fontSize: 9, fontWeight: 700, color: "#6B7280", marginBottom: 3 }}>Example topics:</Text>
                  {pillar.example_topics.map((t, j) => (
                    <Text key={j} style={s.bulletSmall}>{"\u2022"} {t}</Text>
                  ))}
                </View>
              )}
              {pillar.suggested_formats && pillar.suggested_formats.length > 0 && (
                <View style={{ marginTop: 4 }}>
                  <Text style={{ fontSize: 9, fontWeight: 700, color: "#6B7280", marginBottom: 3 }}>Formats:</Text>
                  <View style={s.tagRow}>
                    {pillar.suggested_formats.map((f, j) => (
                      <Text key={j} style={{ ...s.tag, fontSize: 8 }}>{f}</Text>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ))}

          <PageFooter businessName={biz} />
        </Page>
      )}

      {/* Sample Executions */}
      {bsd.sample_executions && bsd.sample_executions.length > 0 && (
        <Page size="A4" style={s.page}>
          <Text style={s.sectionTitle}>Sample Executions</Text>
          <Text style={s.body}>
            Here{"\u2019"}s how {biz}{"\u2019"}s brand should show up across different channels and formats. Use these as templates when creating new content.
          </Text>

          {bsd.sample_executions.map((exec, i) => (
            <View key={i} style={s.channelCard}>
              <View style={{ flexDirection: "row" as const, marginBottom: 4 }}>
                <Text style={{ ...s.tag, marginRight: 6 }}>{exec.channel}</Text>
                <Text style={{ fontSize: 11, fontWeight: 700, color: pdfTheme.colors.navy }}>{exec.format}</Text>
              </View>
              <Text style={s.bodySmall}>{exec.description}</Text>
              {exec.key_elements && exec.key_elements.length > 0 && (
                <View style={{ marginTop: 4 }}>
                  {exec.key_elements.map((el, j) => (
                    <Text key={j} style={s.bulletSmall}>{"\u2022"} {el}</Text>
                  ))}
                </View>
              )}
            </View>
          ))}

          <PageFooter businessName={biz} />
        </Page>
      )}

      {/* Do / Don't Reference */}
      {bsd.do_and_dont_pages && bsd.do_and_dont_pages.length > 0 && (
        <Page size="A4" style={s.page}>
          <Text style={s.sectionTitle}>Do / Don{"\u2019"}t Reference</Text>
          <Text style={s.body}>
            Common scenarios where the brand can drift. Keep this page handy as a quick-check before publishing.
          </Text>

          {bsd.do_and_dont_pages.map((item, i) => (
            <View key={i} style={{ marginBottom: 14 }}>
              <Text style={{ ...s.subsectionTitle, fontSize: 12 }}>{item.area}</Text>
              <View style={s.twoCol}>
                <View style={{ ...s.col }}>
                  <View style={s.doCard}>
                    <Text style={{ fontSize: 9, fontWeight: 700, color: "#059669", marginBottom: 2 }}>Do</Text>
                    <Text style={s.bodySmall}>{item.do_example}</Text>
                  </View>
                </View>
                <View style={{ ...s.col }}>
                  <View style={s.dontCard}>
                    <Text style={{ fontSize: 9, fontWeight: 700, color: "#991B1B", marginBottom: 2 }}>Don{"\u2019"}t</Text>
                    <Text style={s.bodySmall}>{item.dont_example}</Text>
                  </View>
                </View>
              </View>
              <Text style={{ fontSize: 9, color: "#6B7280", fontStyle: "italic" as const, paddingLeft: 4 }}>
                Why: {item.why}
              </Text>
            </View>
          ))}

          <PageFooter businessName={biz} />
        </Page>
      )}

      {/* Imagery by Audience */}
      {data.brand_imagery_direction?.imagery_by_audience &&
        data.brand_imagery_direction.imagery_by_audience.length > 0 && (
        <Page size="A4" style={s.page}>
          <Text style={s.sectionTitle}>Imagery by Audience</Text>
          <Text style={s.body}>
            How visual tone shifts when speaking to different audience segments.
          </Text>

          {data.brand_imagery_direction.imagery_by_audience.map((aud, i) => (
            <View key={i} style={s.card}>
              <Text style={s.cardTitle}>{aud.persona}</Text>
              <Text style={s.bodySmall}>{aud.visual_tone_shift}</Text>
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

          <PageFooter businessName={biz} />
        </Page>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 5: GOVERNANCE & ACCESS
          ═══════════════════════════════════════════════════════════════ */}

      <SectionDivider number="05" title="Governance & Access" subtitle="Who owns the brand, how to get assets, and how to stay aligned" />

      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>Brand Governance</Text>
        <Text style={s.body}>
          Complete this section to formalize who owns brand decisions, how to request assets, and where to find official resources. This ensures the guidelines are actually used and maintained.
        </Text>

        <View style={s.fillIn}>
          <Text style={s.fillInLabel}>Brand Owner / Team</Text>
          <Text style={s.fillInHint}>Who is the primary point of contact for brand decisions? Include name, role, and contact information.</Text>
          <View style={s.fillInLine}>
            <Text style={{ fontSize: 10, color: "#D1D5DB" }}>
              {bsd.governance_template?.brand_owner_role || " "}
            </Text>
          </View>
        </View>

        <View style={s.fillIn}>
          <Text style={s.fillInLabel}>Asset Request Process</Text>
          <Text style={s.fillInHint}>How should team members, contractors, or agencies request official brand assets, logos, templates, or new materials?</Text>
          <View style={s.fillInLine}>
            <Text style={{ fontSize: 10, color: "#D1D5DB" }}> </Text>
          </View>
        </View>

        <View style={s.fillIn}>
          <Text style={s.fillInLabel}>Exception Process</Text>
          <Text style={s.fillInHint}>What{"\u2019"}s the process for requesting an exception to these guidelines? (e.g., co-branded content, partner materials, special campaigns)</Text>
          <View style={s.fillInLine}>
            <Text style={{ fontSize: 10, color: "#D1D5DB" }}>
              {bsd.governance_template?.exception_process || " "}
            </Text>
          </View>
        </View>

        <View style={s.fillIn}>
          <Text style={s.fillInLabel}>Review & Update Schedule</Text>
          <Text style={s.fillInHint}>How often will these guidelines be reviewed and updated? Who is responsible for updates?</Text>
          <View style={s.fillInLine}>
            <Text style={{ fontSize: 10, color: "#D1D5DB" }}>
              {bsd.governance_template?.review_cadence || " "}
            </Text>
          </View>
        </View>

        <View style={s.fillIn}>
          <Text style={s.fillInLabel}>Official Asset Library</Text>
          <Text style={s.fillInHint}>Where can team members find official logos, templates, fonts, and brand assets? Include URLs or folder locations.</Text>
          <View style={s.fillInLine}>
            <Text style={{ fontSize: 10, color: "#D1D5DB" }}> </Text>
          </View>
        </View>

        <View style={s.fillIn}>
          <Text style={s.fillInLabel}>Approved Vendors & Tools</Text>
          <Text style={s.fillInHint}>List any approved design tools, stock photo providers, printing vendors, or other resources the team should use.</Text>
          <View style={s.fillInLine}>
            <Text style={{ fontSize: 10, color: "#D1D5DB" }}> </Text>
          </View>
        </View>

        <PageFooter businessName={biz} />
      </Page>

      <DisclaimerPage tier="blueprint_plus" />
    </Document>
  );
}

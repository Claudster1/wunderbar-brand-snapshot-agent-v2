// AI Prompt Library — standalone document
// For: Anyone using AI tools (ChatGPT, Claude, etc.) for the brand
/* eslint-disable react/no-unescaped-entities */

import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";
import { DisclaimerPage } from "../components/DisclaimerPage";
import { SectionDividerPage } from "../components/SectionDividerPage";
import type { BlueprintEngineOutput } from "../types/blueprintReport";

const LOGO_URL = "https://d268zs2sdbzvo0.cloudfront.net/66e09bd196e8d5672b143fb8_528e12f9-22c9-4c46-8d90-59238d4c8141_logo.webp";

const s = StyleSheet.create({
  page: { padding: 42, paddingBottom: 66, fontFamily: "Helvetica", fontSize: 10, color: "#2D3A4A", lineHeight: 1.6 },
  cover: { padding: 42, fontFamily: "Helvetica", justifyContent: "center", alignItems: "center", backgroundColor: pdfTheme.colors.navy },
  logo: { width: 100, marginBottom: 30, opacity: 0.9 },
  coverTitle: { fontSize: 26, fontWeight: "bold", color: "#FFFFFF", textAlign: "center", marginBottom: 6 },
  coverSub: { fontSize: 12, color: pdfTheme.colors.aqua, textAlign: "center", marginBottom: 24 },
  coverMeta: { fontSize: 9, color: "#FFFFFF", textAlign: "center", opacity: 0.7, marginTop: 3 },
  h1: { fontSize: 19, fontWeight: "bold", color: "#021859", marginBottom: 8, marginTop: 18 },
  h2: { fontSize: 13, fontWeight: "bold", color: "#021859", marginBottom: 5, marginTop: 14 },
  body: { fontSize: 10, lineHeight: 1.6, marginBottom: 6, color: "#2D3A4A" },
  small: { fontSize: 9, color: "#6B7280", lineHeight: 1.5 },
  label: { fontSize: 8, fontWeight: "bold", color: "#0D5BD7", textTransform: "uppercase", letterSpacing: 1.1, marginBottom: 3, marginTop: 8 },
  cardTitle: { fontSize: 11, fontWeight: "bold", color: pdfTheme.colors.navy, marginBottom: 4 },
  promptCard: { backgroundColor: "#F8FBFF", borderRadius: 8, padding: 14, marginBottom: 10, border: "1 solid #E2EAF5" },
  promptBlock: { backgroundColor: "#EFF6FF", borderRadius: 6, padding: 10, marginBottom: 6, borderLeft: `3 solid ${pdfTheme.colors.blue}`, border: "1 solid #DCE9FF" },
  promptText: { fontSize: 9, lineHeight: 1.5, fontFamily: "Courier" },
  tag: { backgroundColor: "#DBEAFE", borderRadius: 3, paddingHorizontal: 6, paddingVertical: 2, marginRight: 4 },
  tagText: { fontSize: 8, color: pdfTheme.colors.blue, fontWeight: "bold" },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 4 },
  footer: { position: "absolute", bottom: 18, left: 42, right: 42, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#9CA3AF" },
  /** Neutral intro — green/red reserved for Do / Don’t content in other documents */
  intro: {
    backgroundColor: "#EEF6FF",
    borderRadius: 6,
    padding: 14,
    marginBottom: 16,
    borderLeft: `3 solid ${pdfTheme.colors.blue}`,
    border: "1 solid #DCE9FF",
  },
  standards: { backgroundColor: "#EEF5FF", borderRadius: 6, padding: 14, marginBottom: 16, borderLeft: `3 solid ${pdfTheme.colors.navy}` },
});

interface Props { data: BlueprintEngineOutput; brandName: string }

export function PromptLibraryDocument({ data, brandName }: Props) {
  const d = data;
  const allPrompts = [
    ...(d.foundationalPromptPack?.prompts || []),
    ...(d.executionPromptPack?.prompts || []),
  ];
  const categories = [...new Set(allPrompts.map(p => p.category))];
  const primaryArchetype = d.brandArchetypeSystem?.primary?.name || "The Sage";
  const primaryAudience =
    d.audiencePersonas?.primaryICP?.name ||
    d.audiencePersonas?.primaryICP?.summary ||
    "B2B decision-makers";
  const positioningStatement =
    d.brandFoundation?.positioningStatement ||
    d.executiveSummary?.synthesis ||
    `${brandName} helps ${primaryAudience} make confident decisions.`;
  const brandVoice = d.brandPersona?.communicationStyle?.tone || "clear, confident, and practical";
  const voiceTraits = (d.visualVerbalSignals?.voiceTraits || []).slice(0, 3).join(", ") || "clear, confident, strategic";
  const typographyTone = d.visualDirection?.typographyTone || "clean, modern, highly legible";
  const visualPrinciples = d.visualDirection?.visualConsistencyPrinciples || "consistent spacing, restrained accent use, and high readability";
  const visualDirectionAny = d.visualDirection as Record<string, unknown> | undefined;
  const brandImageryAny = d.brandImageryDirection as Record<string, unknown> | undefined;
  const moodBoardDescriptorsAny =
    (brandImageryAny?.["moodBoardDescriptors"] as Record<string, unknown> | undefined) ||
    (brandImageryAny?.["mood_board_descriptors"] as Record<string, unknown> | undefined);
  const imageryMoodFromVisualDirection =
    visualDirectionAny && typeof visualDirectionAny["imageryMoodDirection"] === "object"
      ? ((visualDirectionAny["imageryMoodDirection"] as Record<string, unknown>)["visualMood"] as string | undefined)
      : undefined;
  const preferredPhrases = (d.voiceToneGuide?.phrasesToUse || []).slice(0, 3).join("; ");
  const avoidPhrases = (d.voiceToneGuide?.phrasesToAvoid || []).slice(0, 3).join("; ");
  const paletteLine = (d.visualDirection?.colorPalette || [])
    .slice(0, 3)
    .map((c) => `${c.name} ${c.hex}`)
    .join(" | ");
  const brandStandardsPromptPrefix =
    `Follow these brand standards strictly: positioning "${positioningStatement}"; voice "${brandVoice}" with traits (${voiceTraits}); typography tone "${typographyTone}"; visual principles "${visualPrinciples}"` +
    (preferredPhrases ? `; phrases to prefer "${preferredPhrases}"` : "") +
    (avoidPhrases ? `; phrases to avoid "${avoidPhrases}"` : "") +
    (paletteLine ? `; approved color palette ${paletteLine}.` : ".");
  const imageryMood =
    d.brandImageryDirection?.photographyStyleDirection ||
    imageryMoodFromVisualDirection ||
    "clean, authentic, modern brand photography";
  const imageryTextures = ((moodBoardDescriptorsAny?.["textures"] as string[] | undefined) || [])
    .slice(0, 4)
    .join(", ");
  const imageryEnvironments = ((moodBoardDescriptorsAny?.["environments"] as string[] | undefined) || [])
    .slice(0, 4)
    .join(", ");
  const imageDonts = (d.brandImageryDirection?.imageDonts || [])
    .slice(0, 3)
    .map((item) => item?.dont)
    .filter(Boolean)
    .join("; ");
  const visualPromptPrefix =
    `${brandStandardsPromptPrefix} Visual direction: ${imageryMood}.` +
    (imageryTextures ? ` Preferred textures: ${imageryTextures}.` : "") +
    (imageryEnvironments ? ` Preferred environments: ${imageryEnvironments}.` : "") +
    (imageDonts ? ` Not this: ${imageDonts}.` : "");

  const sectionPromptMap = [
    {
      section: "Executive Summary",
      purpose: "Create a concise top-line narrative for leadership and stakeholders.",
      prompt: `${brandStandardsPromptPrefix} Write a 200-word executive summary for ${brandName}. Include current strategic context, the highest-leverage priority, and the expected 90-day outcome.`,
    },
    {
      section: "Brand Diagnostic Context",
      purpose: "Translate diagnostic outcomes into a plain-language interpretation and action path.",
      prompt: `${brandStandardsPromptPrefix} Explain ${brandName}'s current brand performance context in plain language for a non-marketer. Then provide 3 immediate fixes and 3 medium-term fixes tied to business outcomes.`,
    },
    {
      section: "Pillar Results",
      purpose: "Generate pillar-by-pillar diagnostic insights with specific next steps.",
      prompt: `${brandStandardsPromptPrefix} Using these pillars (Positioning, Messaging, Visibility, Credibility, Conversion), write a short analysis for each pillar with: current state, risk if unchanged, and one concrete implementation step.`,
    },
    {
      section: "Archetype Activation",
      purpose: "Apply archetype guidance to real marketing and sales execution.",
      prompt: `${brandStandardsPromptPrefix} For ${brandName}, activate the ${primaryArchetype} archetype across homepage copy, LinkedIn posts, sales call language, and onboarding email tone. Provide one concrete example per channel.`,
    },
    {
      section: "Competitive Positioning",
      purpose: "Clarify differentiation and market whitespace.",
      prompt: `${brandStandardsPromptPrefix} Based on this positioning statement: "${positioningStatement}", draft a competitive positioning narrative that defines what ${brandName} should own, what to avoid, and how to communicate distinction in 5 sentences.`,
    },
    {
      section: "Customer Journey Map",
      purpose: "Map stage-by-stage messaging and CTA strategy.",
      prompt: `${brandStandardsPromptPrefix} Create a 6-stage customer journey (Awareness to Advocacy) for ${brandName}. For each stage, provide user intent, key message, trust signal, and CTA.`,
    },
    {
      section: "SEO + AEO Strategy",
      purpose: "Produce discoverability prompts for search and AI answer engines.",
      prompt: `${brandStandardsPromptPrefix} Generate 15 high-intent search queries and 10 AI-answer-style questions for ${brandName}. Group by funnel stage and recommend one content asset for each group.`,
    },
    {
      section: "Conversion Strategy",
      purpose: "Improve conversion copy and CTA pathways.",
      prompt: `${brandStandardsPromptPrefix} Rewrite ${brandName}'s primary conversion pathway with one core CTA, supporting CTA, trust block, and objection-handling copy. Keep language direct and outcome-driven.`,
    },
    {
      section: "Email Framework",
      purpose: "Create complete lifecycle email copy aligned to the strategy.",
      prompt: `${brandStandardsPromptPrefix} Write a 5-email sequence for ${brandName} (Welcome, Education, Proof, Offer, Follow-up). Include subject line, preview text, and full body copy for each email.`,
    },
    {
      section: "Social Strategy",
      purpose: "Generate platform-specific content prompts and examples.",
      prompt: `${brandStandardsPromptPrefix} Build a 30-day content plan for ${brandName} focused on LinkedIn and YouTube. Include weekly themes, post prompts, hooks, and a CTA for each post.`,
    },
  ];
  const visualPromptMap = [
    {
      section: "Mood Board Direction",
      purpose: "Generate a distinct, brand-specific visual concept board for creative teams.",
      prompt:
        `${visualPromptPrefix} Create 8 mood board image prompts for ${brandName}. For each, include: subject, scene, lighting, lens/composition, color treatment, and why it reinforces the brand archetype.`,
    },
    {
      section: "Homepage Hero Visuals",
      purpose: "Produce high-converting hero visual concepts aligned to positioning and CTA intent.",
      prompt:
        `${visualPromptPrefix} Create 5 homepage hero visual prompts for ${brandName}. Each must reflect the positioning statement "${positioningStatement}" and support a conversion-first above-the-fold CTA.`,
    },
    {
      section: "Paid Ad Creative Concepts",
      purpose: "Generate ad-ready visual directions tailored to audience segments and channel constraints.",
      prompt:
        `${visualPromptPrefix} Generate 10 ad creative prompts for ${brandName}: 4 LinkedIn, 3 Meta, 3 Google Display. For each, include target persona angle, headline overlay suggestion, and proof cue.`,
    },
    {
      section: "Social Post Visual System",
      purpose: "Create repeatable visual templates for weekly content publishing.",
      prompt:
        `${visualPromptPrefix} Design a 30-day social visual prompt system for ${brandName} with 4 template types: insight post, proof post, education carousel, offer post. Include composition rules and on-image text guidance.`,
    },
    {
      section: "Brand Photography Shot List",
      purpose: "Define a practical photography brief that teams or contractors can execute.",
      prompt:
        `${visualPromptPrefix} Build a 20-shot photography list for ${brandName} covering founder, team, service delivery, customer outcomes, and workspace context. Include framing notes and usage location (site, sales deck, social, email).`,
    },
    {
      section: "Do/Don't Visual QA",
      purpose: "Prevent off-brand image generation before publishing.",
      prompt:
        `${visualPromptPrefix} Create a visual QA checklist for ${brandName} with 10 pass/fail checks and 6 negative prompt constraints that prevent off-brand outputs.`,
    },
  ];

  return (
    <Document>
      <Page size="A4" style={s.cover}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={LOGO_URL} style={s.logo} />
        <Text style={s.coverTitle}>AI Prompt Library</Text>
        <Text style={s.coverSub}>{brandName} — {allPrompts.length} Custom Prompts</Text>
        <Text style={{ ...s.coverMeta, marginTop: 26 }}>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</Text>
        <Text style={{ ...s.coverMeta, marginTop: 34, fontSize: 8 }}>Built from your WunderBrand Blueprint™</Text>
      </Page>

      <SectionDividerPage
        label="Section"
        title="Guardrails and Quick Map"
        subtitle="Brand standards constraints and section-by-section prompt starters."
      />

      <Page size="A4" style={s.page} wrap>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>AI Prompt Library — {brandName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

        <Text style={s.h1}>How to Use These Prompts</Text>
        <View style={s.intro}>
          <Text style={s.body}>These {allPrompts.length} prompts are generated directly from {brandName}'s brand strategy — not templates. Each one is calibrated to your positioning, voice, archetype, and audience.</Text>
          <Text style={s.body}>Copy any prompt and paste it into ChatGPT, Claude, Gemini, or any AI writing tool. The outputs will be aligned with your brand from the start.</Text>
        </View>

        <Text style={s.h2}>Brand Standards Guardrails</Text>
        <View style={s.standards}>
          <Text style={s.body}>Positioning: {positioningStatement}</Text>
          <Text style={s.body}>Voice: {brandVoice} ({voiceTraits})</Text>
          <Text style={s.body}>Typography Tone: {typographyTone}</Text>
          <Text style={s.body}>Visual Consistency: {visualPrinciples}</Text>
          {preferredPhrases ? <Text style={s.body}>Preferred Phrases: {preferredPhrases}</Text> : null}
          {avoidPhrases ? <Text style={s.body}>Avoid Phrases: {avoidPhrases}</Text> : null}
          {paletteLine ? <Text style={s.body}>Approved Palette: {paletteLine}</Text> : null}
          <Text style={s.small}>When using any prompt, keep these constraints in the prompt header so generated outputs stay brand-consistent.</Text>
        </View>

        <Text style={s.h1}>Section-to-Prompt Quick Map</Text>
        <Text style={s.body}>
          Use this map when you want to build or refine one report section at a time.
          Each prompt is written to produce implementation-ready output.
        </Text>
        {sectionPromptMap.map((item, i) => (
          <View key={i} style={s.promptCard} wrap={false}>
            <Text style={s.cardTitle}>{item.section}</Text>
            <Text style={s.small}>{item.purpose}</Text>
            <View style={s.promptBlock}>
              <Text style={s.promptText}>{item.prompt}</Text>
            </View>
          </View>
        ))}

        <Text style={s.h2}>Visual Generation Prompt Pack</Text>
        <Text style={s.body}>
          Use these prompts to generate on-brand visuals (images, ad creative, social templates, and mood boards)
          while keeping output tightly aligned to {brandName}'s strategy and visual standards.
        </Text>
        {visualPromptMap.map((item, i) => (
          <View key={`visual-${i}`} style={s.promptCard} wrap={false}>
            <Text style={s.cardTitle}>{item.section}</Text>
            <Text style={s.small}>{item.purpose}</Text>
            <View style={s.promptBlock}>
              <Text style={s.promptText}>{item.prompt}</Text>
            </View>
          </View>
        ))}

      </Page>

      <SectionDividerPage
        label="Section"
        title={d.foundationalPromptPack?.packName || "Foundational Prompts"}
        subtitle="Core positioning, voice, and messaging setup prompts."
      />

      <Page size="A4" style={s.page} wrap>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>AI Prompt Library — {brandName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

        <Text style={s.h1}>{d.foundationalPromptPack?.packName || "Foundational Prompts"}</Text>
        <Text style={s.body}>{d.foundationalPromptPack?.description}</Text>
        {d.foundationalPromptPack?.prompts?.map((p, i) => (
          <View key={i} style={s.promptCard} wrap={false}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={s.cardTitle}>{p.title}</Text>
              <View style={s.tag}><Text style={s.tagText}>{p.category}</Text></View>
            </View>
            <Text style={s.body}>{p.instruction}</Text>
            <View style={s.promptBlock}><Text style={s.promptText}>{p.prompt}</Text></View>
            <Text style={s.small}>{p.whyItMatters}</Text>
          </View>
        ))}

      </Page>

      <SectionDividerPage
        label="Section"
        title={d.executionPromptPack?.packName || "Execution Prompts"}
        subtitle="Channel execution prompts with on-brand output constraints."
      />

      <Page size="A4" style={s.page} wrap>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>AI Prompt Library — {brandName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

        <Text style={s.h1}>{d.executionPromptPack?.packName || "Execution Prompts"}</Text>
        <Text style={s.body}>{d.executionPromptPack?.description}</Text>
        {d.executionPromptPack?.prompts?.map((p, i) => (
          <View key={i} style={s.promptCard} wrap={false}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={s.cardTitle}>{p.title}</Text>
              <View style={s.tag}><Text style={s.tagText}>{p.category}</Text></View>
            </View>
            <Text style={s.body}>{p.instruction}</Text>
            <View style={s.promptBlock}><Text style={s.promptText}>{p.prompt}</Text></View>
            <Text style={s.small}>{p.whyItMatters}</Text>
          </View>
        ))}

        <Text style={s.h2}>Prompts by Category</Text>
        {categories.map((cat) => (
          <View key={cat} style={{ marginBottom: 6 }}>
            <Text style={s.label}>{cat}</Text>
            {allPrompts.filter(p => p.category === cat).map((p, i) => (
              <Text key={i} style={s.body}>• {p.title}</Text>
            ))}
          </View>
        ))}
      </Page>

      <DisclaimerPage tier="blueprint" />
    </Document>
  );
}

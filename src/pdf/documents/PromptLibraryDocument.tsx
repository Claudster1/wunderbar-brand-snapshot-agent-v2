// AI Prompt Library — standalone document
// For: Anyone using AI tools (ChatGPT, Claude, etc.) for the brand
/* eslint-disable react/no-unescaped-entities */

import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";
import { DisclaimerPage } from "../components/DisclaimerPage";
import { SectionDividerPage } from "../components/SectionDividerPage";
import { PdfHeader } from "../components/PdfHeader";
import type { BlueprintEngineOutput } from "../types/blueprintReport";
import type { PromptItem } from "../types/blueprintReport";
import {
  allPromptBodiesIdentical,
  normalizePromptItemForPdf,
  parseHexAccent,
} from "@/src/pdf/lib/promptPackDisplay";
import { PDF_WUNDERBAR_LOGO_SRC } from "../constants/pdfLogo";


const PAGE_PAD = 48;
const FOOTER_BOTTOM = 20;

const s = StyleSheet.create({
  page: {
    padding: PAGE_PAD,
    paddingBottom: 72,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1D1D1F",
    lineHeight: 1.55,
    backgroundColor: "#FFFFFF",
  },
  cover: {
    padding: PAGE_PAD,
    fontFamily: "Helvetica",
    justifyContent: "flex-start",
    backgroundColor: "#F5F5F7",
  },
  coverAccentBar: {
    height: 4,
    width: "100%",
    marginBottom: 36,
    backgroundColor: pdfTheme.colors.blue,
  },
  logo: { width: 88, marginBottom: 28, opacity: 0.95 },
  coverKicker: {
    fontSize: 9,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: "#6E6E73",
    marginBottom: 10,
    fontWeight: 600,
  },
  coverTitle: {
    fontSize: 32,
    fontWeight: 700,
    color: pdfTheme.colors.navy,
    marginBottom: 8,
    letterSpacing: -0.6,
    lineHeight: 1.1,
  },
  coverBrand: {
    fontSize: 15,
    fontWeight: 600,
    color: "#3A3A3C",
    marginBottom: 22,
    letterSpacing: -0.2,
  },
  coverSub: { fontSize: 11, color: "#6E6E73", lineHeight: 1.5, maxWidth: 420, marginBottom: 28 },
  coverMeta: { fontSize: 8, color: "#86868B", marginTop: 4 },
  h1: {
    fontSize: 18,
    fontWeight: 700,
    color: pdfTheme.colors.navy,
    marginBottom: 10,
    marginTop: 6,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 12,
    fontWeight: 700,
    color: pdfTheme.colors.navy,
    marginBottom: 6,
    marginTop: 18,
    letterSpacing: 0.2,
  },
  body: { fontSize: 10, lineHeight: 1.6, marginBottom: 8, color: "#3A3A3C" },
  small: { fontSize: 8.5, color: "#6E6E73", lineHeight: 1.5 },
  label: {
    fontSize: 7.5,
    fontWeight: 700,
    color: "#6E6E73",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    marginBottom: 4,
    marginTop: 10,
  },
  cardTitle: { fontSize: 11.5, fontWeight: 700, color: pdfTheme.colors.navy, marginBottom: 2, letterSpacing: -0.2 },
  promptCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    border: "1 solid #E5E5EA",
  },
  promptBlock: {
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    border: "1 solid #E8E8ED",
    borderLeftWidth: 3,
    borderLeftColor: pdfTheme.colors.blue,
  },
  promptText: { fontSize: 9, lineHeight: 1.55, fontFamily: "Courier", color: "#1D1D1F" },
  tag: {
    backgroundColor: "#E8F4FF",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 8,
  },
  tagText: { fontSize: 7.5, color: pdfTheme.colors.navy, fontWeight: 700 },
  rowTitle: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  footer: {
    position: "absolute",
    bottom: FOOTER_BOTTOM,
    left: PAGE_PAD,
    right: PAGE_PAD,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "1 solid #E5E5EA",
    paddingTop: 8,
  },
  footerText: { fontSize: 7, color: "#86868B" },
  intro: {
    backgroundColor: "#FAFAFA",
    borderRadius: 10,
    padding: 16,
    marginBottom: 18,
    border: "1 solid #E5E5EA",
    borderLeftWidth: 3,
    borderLeftColor: pdfTheme.colors.blue,
  },
  standards: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    marginBottom: 18,
    border: "1 solid #E5E5EA",
  },
  guardrailOnce: {
    backgroundColor: "#F5F5F7",
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    border: "1 solid #E5E5EA",
  },
  guardrailTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: "#6E6E73",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  dupNote: {
    backgroundColor: "#FFF8E6",
    border: "1 solid #F5D090",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
});

interface Props {
  data: BlueprintEngineOutput;
  brandName: string;
}

function renderPromptCards(
  prompts: PromptItem[] | undefined,
  guardrailPrefix: string,
  brandAccent: string | undefined,
  borderLeftColor: string,
) {
  const list = prompts || [];
  if (!list.length) {
    return <Text style={s.body}>No prompts were included in this export.</Text>;
  }

  const dupAll = allPromptBodiesIdentical(list);
  const blockBorder = { ...s.promptBlock, borderLeftColor: borderLeftColor };

  if (dupAll) {
    const first = (list[0]?.prompt || "").trim();
    return (
      <>
        <View style={s.dupNote}>
          <Text style={{ ...s.body, fontWeight: 600, marginBottom: 6 }}>
            Identical prompt text detected for every item
          </Text>
          <Text style={s.small}>
            Your report data repeated the same body in each slot — often a generation or parsing issue. Titles below
            still reflect the intended prompt topics; regenerate the Blueprint+ report to receive distinct copy per
            prompt. The shared block is shown once so this PDF stays usable.
          </Text>
        </View>
        <View style={blockBorder}>
          <Text style={s.promptText}>{first || "—"}</Text>
        </View>
        <Text style={{ ...s.h2, marginTop: 16 }}>Prompt index</Text>
        {list.map((p, i) => (
          <Text key={i} style={s.body}>
            • {(p.title || "Untitled").trim()} ({(p.category || "General").trim()})
          </Text>
        ))}
      </>
    );
  }

  return list.map((p, i) => {
    const n = normalizePromptItemForPdf(p, { guardrailPrefix });
    return (
      <View key={`${n.title}-${i}`} style={s.promptCard} wrap={false}>
        <View style={s.rowTitle}>
          <Text style={s.cardTitle}>{n.title}</Text>
          <View style={[s.tag, brandAccent ? { borderWidth: 1, borderColor: brandAccent } : {}]}>
            <Text style={[s.tagText, brandAccent ? { color: brandAccent } : {}]}>{n.category}</Text>
          </View>
        </View>
        {n.instructionBlock ? (
          <>
            <Text style={s.label}>How to use</Text>
            <Text style={s.body}>{n.instructionBlock}</Text>
          </>
        ) : null}
        <Text style={s.label}>Copy-ready prompt</Text>
        <View style={blockBorder}>
          <Text style={s.promptText}>{n.copyBlock}</Text>
        </View>
        {n.whyItMatters ? (
          <>
            <Text style={s.label}>Why it matters</Text>
            <Text style={s.small}>{n.whyItMatters}</Text>
          </>
        ) : null}
      </View>
    );
  });
}

export function PromptLibraryDocument({ data, brandName }: Props) {
  const d = data;
  const allPrompts = [...(d.foundationalPromptPack?.prompts || []), ...(d.executionPromptPack?.prompts || [])];
  const categories = [...new Set(allPrompts.map((p) => p.category).filter(Boolean))];
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
  const brandAccent =
    parseHexAccent(d.visualDirection?.colorPalette?.[0]?.hex) ||
    parseHexAccent(d.visualDirection?.colorPalette?.[1]?.hex);

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
      prompt: `${visualPromptPrefix} Create 8 mood board image prompts for ${brandName}. For each, include: subject, scene, lighting, lens/composition, color treatment, and why it reinforces the brand archetype.`,
    },
    {
      section: "Homepage Hero Visuals",
      purpose: "Produce high-converting hero visual concepts aligned to positioning and CTA intent.",
      prompt: `${visualPromptPrefix} Create 5 homepage hero visual prompts for ${brandName}. Each must reflect the positioning statement "${positioningStatement}" and support a conversion-first above-the-fold CTA.`,
    },
    {
      section: "Paid Ad Creative Concepts",
      purpose: "Generate ad-ready visual directions tailored to audience segments and channel constraints.",
      prompt: `${visualPromptPrefix} Generate 10 ad creative prompts for ${brandName}: 4 LinkedIn, 3 Meta, 3 Google Display. For each, include target persona angle, headline overlay suggestion, and proof cue.`,
    },
    {
      section: "Social Post Visual System",
      purpose: "Create repeatable visual templates for weekly content publishing.",
      prompt: `${visualPromptPrefix} Design a 30-day social visual prompt system for ${brandName} with 4 template types: insight post, proof post, education carousel, offer post. Include composition rules and on-image text guidance.`,
    },
    {
      section: "Brand Photography Shot List",
      purpose: "Define a practical photography brief that teams or contractors can execute.",
      prompt: `${visualPromptPrefix} Build a 20-shot photography list for ${brandName} covering founder, team, service delivery, customer outcomes, and workspace context. Include framing notes and usage location (site, sales deck, social, email).`,
    },
    {
      section: "Do/Don't Visual QA",
      purpose: "Prevent off-brand image generation before publishing.",
      prompt: `${visualPromptPrefix} Create a visual QA checklist for ${brandName} with 10 pass/fail checks and 6 negative prompt constraints that prevent off-brand outputs.`,
    },
  ];

  const printedDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const accentBarColor = brandAccent || pdfTheme.colors.blue;
  const cardRail = brandAccent || pdfTheme.colors.blue;

  return (
    <Document>
      <Page size="A4" style={s.cover}>
        <View style={[s.coverAccentBar, { backgroundColor: accentBarColor }]} />
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={PDF_WUNDERBAR_LOGO_SRC} style={s.logo} />
        <Text style={s.coverKicker}>WunderBrand · AI Prompt Library</Text>
        <Text style={s.coverTitle}>Prompt Library</Text>
        <Text style={s.coverBrand}>{brandName}</Text>
        <Text style={s.coverSub}>
          {allPrompts.length} prompts calibrated to your strategy — copy any block into your AI tool. Brand guardrails
          and palette from your Blueprint+ output are summarized inside; your first listed color also accents this PDF
          for quick visual alignment.
        </Text>
        {paletteLine ? <Text style={{ ...s.coverSub, marginBottom: 12 }}>Palette: {paletteLine}</Text> : null}
        <Text style={s.coverMeta}>{printedDate}</Text>
        <Text style={{ ...s.coverMeta, marginTop: 20 }}>Built from your WunderBrand Blueprint+™</Text>
      </Page>

      <SectionDividerPage
        label="Section"
        title="Guardrails and Quick Map"
        subtitle="Brand standards constraints and section-by-section prompt starters."
        accentHex={brandAccent}
      />

      <Page size="A4" style={s.page} wrap>
        <PdfHeader title="AI Prompt Library" businessName={brandName} date={printedDate} accentHex={brandAccent} />
        <View style={s.footer} fixed>
          <Text style={s.footerText}>AI Prompt Library — {brandName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

        <Text style={s.h1}>How to use these prompts</Text>
        <View style={s.intro}>
          <Text style={s.body}>
            These {allPrompts.length} prompts are generated from {brandName}&apos;s strategy — not generic templates.
            Paste the Copy-ready prompt blocks into ChatGPT, Claude, Gemini, or similar tools.
          </Text>
          <Text style={s.body}>
            If How to use and Copy-ready looked identical before, your export repeated the same string in both fields —
            this PDF deduplicates that for readability.
          </Text>
        </View>

        <Text style={s.h2}>Brand standards guardrails</Text>
        <View style={s.standards}>
          <Text style={s.body}>Positioning: {positioningStatement}</Text>
          <Text style={s.body}>
            Voice: {brandVoice} ({voiceTraits})
          </Text>
          <Text style={s.body}>Typography tone: {typographyTone}</Text>
          <Text style={s.body}>Visual consistency: {visualPrinciples}</Text>
          {preferredPhrases ? <Text style={s.body}>Preferred phrases: {preferredPhrases}</Text> : null}
          {avoidPhrases ? <Text style={s.body}>Avoid phrases: {avoidPhrases}</Text> : null}
          {paletteLine ? <Text style={s.body}>Approved palette: {paletteLine}</Text> : null}
          <Text style={s.small}>Prepend the “shared header” block once per session if your tool works better with a single system preamble.</Text>
        </View>

        <View style={s.guardrailOnce}>
          <Text style={s.guardrailTitle}>Shared header (optional — paste once per chat)</Text>
          <Text style={s.promptText}>{brandStandardsPromptPrefix}</Text>
        </View>

        <Text style={s.h1}>Section-to-prompt quick map</Text>
        <Text style={s.body}>Use when you want one report section at a time. Each card is a distinct task.</Text>
        {sectionPromptMap.map((item, i) => (
          <View key={i} style={s.promptCard} wrap={false}>
            <Text style={s.cardTitle}>{item.section}</Text>
            <Text style={s.small}>{item.purpose}</Text>
            <View style={[s.promptBlock, { borderLeftColor: cardRail }]}>
              <Text style={s.promptText}>{item.prompt}</Text>
            </View>
          </View>
        ))}

        <Text style={s.h2}>Visual generation prompt pack</Text>
        <Text style={s.body}>Image / ad / social visual prompts aligned to your visual and imagery direction.</Text>
        {visualPromptMap.map((item, i) => (
          <View key={`visual-${i}`} style={s.promptCard} wrap={false}>
            <Text style={s.cardTitle}>{item.section}</Text>
            <Text style={s.small}>{item.purpose}</Text>
            <View style={[s.promptBlock, { borderLeftColor: cardRail }]}>
              <Text style={s.promptText}>{item.prompt}</Text>
            </View>
          </View>
        ))}
      </Page>

      <SectionDividerPage
        label="Section"
        title={d.foundationalPromptPack?.packName || "Foundational Prompts"}
        subtitle="Core positioning, voice, and messaging setup prompts."
        accentHex={brandAccent}
      />

      <Page size="A4" style={s.page} wrap>
        <PdfHeader title="Foundational prompts" businessName={brandName} date={printedDate} accentHex={brandAccent} />
        <View style={s.footer} fixed>
          <Text style={s.footerText}>AI Prompt Library — {brandName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

        <Text style={s.h1}>{d.foundationalPromptPack?.packName || "Foundational Prompts"}</Text>
        <Text style={s.body}>{d.foundationalPromptPack?.description}</Text>
        <View style={s.guardrailOnce}>
          <Text style={s.guardrailTitle}>Strip duplicate prefix from pack items (auto)</Text>
          <Text style={s.small}>
            The cards below remove this shared prefix from each item when it was repeated in every `prompt` field.
          </Text>
          <Text style={[s.promptText, { marginTop: 6 }]}>{brandStandardsPromptPrefix}</Text>
        </View>
        {renderPromptCards(d.foundationalPromptPack?.prompts, brandStandardsPromptPrefix, brandAccent, cardRail)}
      </Page>

      <SectionDividerPage
        label="Section"
        title={d.executionPromptPack?.packName || "Execution Prompts"}
        subtitle="Channel execution prompts with on-brand output constraints."
        accentHex={brandAccent}
      />

      <Page size="A4" style={s.page} wrap>
        <PdfHeader title="Execution prompts" businessName={brandName} date={printedDate} accentHex={brandAccent} />
        <View style={s.footer} fixed>
          <Text style={s.footerText}>AI Prompt Library — {brandName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

        <Text style={s.h1}>{d.executionPromptPack?.packName || "Execution Prompts"}</Text>
        <Text style={s.body}>{d.executionPromptPack?.description}</Text>
        {renderPromptCards(d.executionPromptPack?.prompts, brandStandardsPromptPrefix, brandAccent, cardRail)}

        <Text style={s.h2}>Prompts by category</Text>
        {categories.map((cat) => (
          <View key={cat} style={{ marginBottom: 8 }}>
            <Text style={s.label}>{cat}</Text>
            {allPrompts
              .filter((p) => p.category === cat)
              .map((p, i) => (
                <Text key={i} style={s.body}>
                  • {(p.title || "Untitled").trim()}
                </Text>
              ))}
          </View>
        ))}
      </Page>

      <DisclaimerPage tier="blueprint" />
    </Document>
  );
}

// Brand Messaging Playbook — standalone document
// For: Content creators, copywriters, marketing team
/* eslint-disable react/no-unescaped-entities */

import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";
import { EXAMPLE_CALLOUT, SEMANTIC_DO, SEMANTIC_DONT } from "../reportVisualTokens";
import { DisclaimerPage } from "../components/DisclaimerPage";
import { SectionDividerPage } from "../components/SectionDividerPage";
import { PdfHeader } from "../components/PdfHeader";
import type { BlueprintEngineOutput } from "../types/blueprintReport";
import { parseHexAccent } from "@/src/pdf/lib/promptPackDisplay";
import { PDF_WUNDERBAR_LOGO_SRC } from "../constants/pdfLogo";


const s = StyleSheet.create({
  page: { padding: 48, paddingBottom: 92, fontFamily: "Helvetica", fontSize: 10, color: "#2D3A4A", lineHeight: 1.6 },
  cover: { padding: 42, fontFamily: "Helvetica", justifyContent: "center", alignItems: "center", backgroundColor: pdfTheme.colors.navy },
  logo: { width: 100, marginBottom: 30, opacity: 0.9 },
  coverTitle: { fontSize: 26, fontWeight: "bold", color: "#FFFFFF", textAlign: "center", marginBottom: 6 },
  coverSub: { fontSize: 12, color: pdfTheme.colors.aqua, textAlign: "center", marginBottom: 24 },
  coverMeta: { fontSize: 9, color: "#FFFFFF", textAlign: "center", opacity: 0.7, marginTop: 3 },
  h1: { fontSize: 19, fontWeight: "bold", color: "#021859", marginBottom: 8, marginTop: 18 },
  h2: { fontSize: 13, fontWeight: "bold", color: "#021859", marginBottom: 5, marginTop: 14 },
  h3: { fontSize: 11, fontWeight: "bold", color: "#021859", marginBottom: 3, marginTop: 8 },
  body: { fontSize: 10, lineHeight: 1.6, marginBottom: 6, color: "#2D3A4A" },
  small: { fontSize: 9, color: "#6B7280", lineHeight: 1.5 },
  label: { fontSize: 8, fontWeight: "bold", color: "#0D5BD7", textTransform: "uppercase", letterSpacing: 1.1, marginBottom: 3, marginTop: 9 },
  card: { backgroundColor: "#F8FBFF", borderRadius: 8, padding: 12, marginBottom: 10, border: "1 solid #E2EAF5" },
  cardTitle: { fontSize: 11, fontWeight: "bold", color: pdfTheme.colors.navy, marginBottom: 4 },
  accentCard: { backgroundColor: "#EFF6FF", borderRadius: 8, padding: 12, marginBottom: 10, borderLeft: `3 solid ${pdfTheme.colors.blue}`, border: "1 solid #D9E8FF" },
  avoidCard: {
    backgroundColor: SEMANTIC_DONT.bg,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeft: `3 solid ${SEMANTIC_DONT.border}`,
    border: "1 solid #FECACA",
  },
  doCard: {
    backgroundColor: SEMANTIC_DO.bg,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeft: `3 solid ${SEMANTIC_DO.border}`,
    border: "1 solid #D1FAE5",
  },
  bullet: { fontSize: 10, lineHeight: 1.55, marginBottom: 3, paddingLeft: 10 },
  row: { flexDirection: "row", marginBottom: 6 },
  col2: { width: "50%", paddingRight: 8 },
  col3: { width: "33%", paddingRight: 6 },
  footer: { position: "absolute", bottom: 22, left: 48, right: 48, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#9CA3AF" },
});

interface Props { data: BlueprintEngineOutput; brandName: string }

export function MessagingPlaybookDocument({ data, brandName }: Props) {
  const d = data;
  const palette = d.visualDirection?.colorPalette as Array<{ hex?: string }> | undefined;
  const brandAccent = parseHexAccent(Array.isArray(palette) ? palette.map((entry) => entry?.hex).find(Boolean) : undefined) || pdfTheme.colors.blue;
  const printedDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  return (
    <Document>
      <Page size="A4" style={s.cover}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={PDF_WUNDERBAR_LOGO_SRC} style={s.logo} />
        <Text style={s.coverTitle}>Brand Messaging Playbook</Text>
        <Text style={s.coverSub}>{brandName}</Text>
        <View style={{ width: 76, height: 3, borderRadius: 999, backgroundColor: brandAccent, marginTop: 10, marginBottom: 16 }} />
        <Text style={{ ...s.coverMeta, marginTop: 26 }}>{printedDate}</Text>
        <Text style={{ ...s.coverMeta, marginTop: 34, fontSize: 8 }}>CONFIDENTIAL — For marketing team use</Text>
      </Page>

      <SectionDividerPage
        label="Section"
        title="Voice and Messaging Foundations"
        subtitle="Persona, voice rules, and the core messaging system."
        accentHex={brandAccent}
      />

      <Page size="A4" style={s.page} wrap>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Messaging Playbook — {brandName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

        <PdfHeader title="Messaging Playbook" businessName={brandName} date={printedDate} accentHex={brandAccent} />

        <Text style={s.h1}>Brand Voice & Persona</Text>
        <Text style={s.body}>{d.brandPersona?.personaSummary}</Text>
        <View style={s.row} wrap={false}>
          <View style={s.col3}><View style={s.card}><Text style={s.label}>Tone</Text><Text style={s.body}>{d.brandPersona?.communicationStyle?.tone}</Text></View></View>
          <View style={s.col3}><View style={s.card}><Text style={s.label}>Pace</Text><Text style={s.body}>{d.brandPersona?.communicationStyle?.pace}</Text></View></View>
          <View style={s.col3}><View style={s.card}><Text style={s.label}>Energy</Text><Text style={s.body}>{d.brandPersona?.communicationStyle?.energy}</Text></View></View>
        </View>
        {d.visualVerbalSignals?.voiceTraits?.length > 0 && (
          <>
            <Text style={s.label}>Voice Traits</Text>
            {d.visualVerbalSignals.voiceTraits.map((t, i) => <Text key={i} style={s.bullet}>• {t}</Text>)}
          </>
        )}

        <Text style={s.h2}>Do this / Not this — quick reference</Text>
        <View style={s.row} wrap={false}>
          <View style={s.col2}>
            <View style={s.doCard}>
              <Text style={{ ...s.cardTitle, color: SEMANTIC_DO.label }}>Do this</Text>
              {d.brandPersona?.doAndDont?.do?.map((item, i) => (
                <View key={i} style={{ marginBottom: 4 }}>
                  <Text style={{ ...s.body, fontWeight: "bold" }}>{item.guideline}</Text>
                  <Text style={s.small}>{item.example}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={s.col2}>
            <View style={s.avoidCard}>
              <Text style={{ ...s.cardTitle, color: SEMANTIC_DONT.label }}>Not this</Text>
              {d.brandPersona?.doAndDont?.dont?.map((item, i) => (
                <View key={i} style={{ marginBottom: 4 }}>
                  <Text style={{ ...s.body, fontWeight: "bold" }}>{item.guideline}</Text>
                  <Text style={s.small}>{item.example}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <Text style={s.h1}>Core Messaging System</Text>
        <Text style={s.label}>Core Message</Text>
        <View style={s.accentCard} wrap={false}><Text style={s.body}>{d.messagingSystem?.coreMessage}</Text></View>
        <Text style={s.label}>Supporting Messages</Text>
        {d.messagingSystem?.supportingMessages?.map((m, i) => <Text key={i} style={s.bullet}>• {m}</Text>)}
        <Text style={s.label}>Proof Points</Text>
        {d.messagingSystem?.proofPoints?.map((p, i) => <Text key={i} style={s.bullet}>• {p}</Text>)}
        <Text style={s.label}>Never Say</Text>
        {d.messagingSystem?.whatNotToSay?.map((w, i) => <Text key={i} style={{ ...s.bullet, color: SEMANTIC_DONT.label }}>✕ {w}</Text>)}
      </Page>

      <SectionDividerPage
        label="Section"
        title="Pillars and Taglines"
        subtitle="Message architecture, content themes, and positioning language."
        accentHex={brandAccent}
      />

      <Page size="A4" style={s.page} wrap>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Messaging Playbook — {brandName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

        <PdfHeader title="Messaging Playbook" businessName={brandName} date={printedDate} accentHex={brandAccent} />

        <Text style={s.h1}>Messaging Pillars</Text>
        {d.messagingPillars?.map((mp, i) => (
          <View key={i} style={s.card} wrap={false}>
            <Text style={s.cardTitle}>{mp.name}</Text>
            <Text style={s.body}>{mp.whatItCommunicates}</Text>
            <Text
              style={{
                fontSize: 9,
                fontWeight: "bold",
                color: EXAMPLE_CALLOUT.labelColor,
                marginBottom: 3,
                marginTop: 9,
              }}
            >
              {EXAMPLE_CALLOUT.labelPrefix}
            </Text>
            <Text style={{ ...s.body, fontStyle: "italic", color: EXAMPLE_CALLOUT.bodyColor }}>"{mp.exampleMessage}"</Text>
            <Text style={s.label}>Channel Examples</Text>
            <View style={s.row}>
              <View style={s.col3}><Text style={s.small}>Website: {mp.channelExamples?.website}</Text></View>
              <View style={s.col3}><Text style={s.small}>Social: {mp.channelExamples?.social}</Text></View>
              <View style={s.col3}><Text style={s.small}>Email: {mp.channelExamples?.email}</Text></View>
            </View>
          </View>
        ))}

        <Text style={s.h1}>Content Pillars</Text>
        {d.contentPillars?.map((cp, i) => (
          <View key={i} style={s.card} wrap={false}>
            <Text style={s.cardTitle}>{cp.name}</Text>
            <Text style={s.body}>{cp.description}</Text>
            <Text style={s.label}>Example Topics</Text>
            {cp.exampleTopics?.map((t, j) => <Text key={j} style={s.bullet}>• {t}</Text>)}
            <Text style={s.small}>Reinforces: {cp.messagingPillarConnection}</Text>
          </View>
        ))}

        <Text style={s.h1}>Taglines</Text>
        {d.taglineRecommendations?.map((t, i) => (
          <View key={i} style={s.accentCard} wrap={false}>
            <Text style={{ fontSize: 14, fontWeight: "bold", color: pdfTheme.colors.navy, marginBottom: 3 }}>"{t.tagline}"</Text>
            <Text style={s.body}>{t.rationale}</Text>
            <Text style={s.small}>Best used on: {t.bestUsedOn}</Text>
          </View>
        ))}
      </Page>

      <SectionDividerPage
        label="Section"
        title="Ready-to-Use Copy"
        subtitle="Practical copy assets and headline / CTA references."
        accentHex={brandAccent}
      />

      <Page size="A4" style={s.page} wrap>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Messaging Playbook — {brandName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

        <PdfHeader title="Messaging Playbook" businessName={brandName} date={printedDate} accentHex={brandAccent} />

        <Text style={s.h1}>Ready-to-Use Copy</Text>
        <Text style={s.label}>One-Liner</Text>
        <View style={s.accentCard}><Text style={s.body}>{d.companyDescription?.oneLiner}</Text></View>
        <Text style={s.label}>Short Description</Text>
        <Text style={s.body}>{d.companyDescription?.shortDescription}</Text>
        <Text style={s.label}>Elevator Pitch</Text>
        <View style={s.accentCard}><Text style={s.body}>{d.brandStory?.elevatorPitch}</Text></View>
        <Text style={s.label}>Full Boilerplate</Text>
        <Text style={s.body}>{d.companyDescription?.fullBoilerplate}</Text>
        <Text style={s.label}>Proposal Intro</Text>
        <Text style={s.body}>{d.companyDescription?.proposalIntro}</Text>

        <Text style={s.h2}>Headline & CTA Examples</Text>
        <View style={s.row} wrap={false}>
          <View style={s.col2}>
            <View style={s.doCard}>
              <Text style={{ ...s.cardTitle, color: SEMANTIC_DO.label }}>Headlines — Do this</Text>
              {d.brandPersona?.messagingExamples?.headlines?.use?.map((h, i) => <Text key={i} style={s.bullet}>• {h}</Text>)}
            </View>
          </View>
          <View style={s.col2}>
            <View style={s.doCard}>
              <Text style={{ ...s.cardTitle, color: SEMANTIC_DO.label }}>CTAs — Use</Text>
              {d.brandPersona?.messagingExamples?.ctaButtons?.use?.map((c, i) => <Text key={i} style={s.bullet}>• {c}</Text>)}
            </View>
          </View>
        </View>
      </Page>

      <DisclaimerPage tier="blueprint" />
    </Document>
  );
}

// Brand Messaging Playbook — standalone document
// For: Content creators, copywriters, marketing team

import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";
import { DisclaimerPage } from "../components/DisclaimerPage";
import type { BlueprintEngineOutput } from "../types/blueprintReport";

const LOGO_URL = "https://d268zs2sdbzvo0.cloudfront.net/66e09bd196e8d5672b143fb8_528e12f9-22c9-4c46-8d90-59238d4c8141_logo.webp";

const s = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: pdfTheme.colors.text, lineHeight: 1.55 },
  cover: { padding: 40, fontFamily: "Helvetica", justifyContent: "center", alignItems: "center", backgroundColor: pdfTheme.colors.navy },
  logo: { width: 100, marginBottom: 30, opacity: 0.9 },
  coverTitle: { fontSize: 26, fontWeight: "bold", color: "#FFFFFF", textAlign: "center", marginBottom: 6 },
  coverSub: { fontSize: 12, color: pdfTheme.colors.aqua, textAlign: "center", marginBottom: 24 },
  coverMeta: { fontSize: 9, color: "#FFFFFF", textAlign: "center", opacity: 0.7, marginTop: 3 },
  h1: { fontSize: 20, fontWeight: "bold", color: pdfTheme.colors.navy, marginBottom: 10, marginTop: 20 },
  h2: { fontSize: 14, fontWeight: "bold", color: pdfTheme.colors.navy, marginBottom: 6, marginTop: 16 },
  h3: { fontSize: 11, fontWeight: "bold", color: pdfTheme.colors.navy, marginBottom: 3, marginTop: 10 },
  body: { fontSize: 10, lineHeight: 1.55, marginBottom: 6 },
  small: { fontSize: 9, color: "#6B7280", lineHeight: 1.5 },
  label: { fontSize: 8, fontWeight: "bold", color: pdfTheme.colors.blue, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3, marginTop: 10 },
  card: { backgroundColor: "#F8FAFC", borderRadius: 6, padding: 12, marginBottom: 8, border: "1 solid #E5E7EB" },
  cardTitle: { fontSize: 11, fontWeight: "bold", color: pdfTheme.colors.navy, marginBottom: 4 },
  accentCard: { backgroundColor: "#EFF6FF", borderRadius: 6, padding: 12, marginBottom: 8, borderLeft: `3 solid ${pdfTheme.colors.blue}` },
  avoidCard: { backgroundColor: "#FEF2F2", borderRadius: 6, padding: 12, marginBottom: 8, borderLeft: "3 solid #EF4444" },
  bullet: { fontSize: 10, lineHeight: 1.55, marginBottom: 3, paddingLeft: 10 },
  row: { flexDirection: "row", marginBottom: 6 },
  col2: { width: "50%", paddingRight: 8 },
  col3: { width: "33%", paddingRight: 6 },
  footer: { position: "absolute", bottom: 20, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#9CA3AF" },
});

interface Props { data: BlueprintEngineOutput; brandName: string }

export function MessagingPlaybookDocument({ data, brandName }: Props) {
  const d = data;
  return (
    <Document>
      <Page size="A4" style={s.cover}>
        <Image src={LOGO_URL} style={s.logo} />
        <Text style={s.coverTitle}>Brand Messaging Playbook</Text>
        <Text style={s.coverSub}>{brandName}</Text>
        <Text style={{ ...s.coverMeta, marginTop: 30 }}>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</Text>
        <Text style={{ ...s.coverMeta, marginTop: 40, fontSize: 8 }}>CONFIDENTIAL — For marketing team use</Text>
      </Page>

      <Page size="A4" style={s.page} wrap>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Messaging Playbook — {brandName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

        <Text style={s.h1}>Brand Voice & Persona</Text>
        <Text style={s.body}>{d.brandPersona?.personaSummary}</Text>
        <View style={s.row}>
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

        <Text style={s.h2}>Do / Don't Quick Reference</Text>
        <View style={s.row}>
          <View style={s.col2}>
            <View style={s.accentCard}>
              <Text style={s.cardTitle}>Do</Text>
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
              <Text style={s.cardTitle}>Don't</Text>
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
        <View style={s.accentCard}><Text style={s.body}>{d.messagingSystem?.coreMessage}</Text></View>
        <Text style={s.label}>Supporting Messages</Text>
        {d.messagingSystem?.supportingMessages?.map((m, i) => <Text key={i} style={s.bullet}>• {m}</Text>)}
        <Text style={s.label}>Proof Points</Text>
        {d.messagingSystem?.proofPoints?.map((p, i) => <Text key={i} style={s.bullet}>• {p}</Text>)}
        <Text style={s.label}>Never Say</Text>
        {d.messagingSystem?.whatNotToSay?.map((w, i) => <Text key={i} style={{ ...s.bullet, color: "#EF4444" }}>✕ {w}</Text>)}

        <Text style={s.h1}>Messaging Pillars</Text>
        {d.messagingPillars?.map((mp, i) => (
          <View key={i} style={s.card} wrap={false}>
            <Text style={s.cardTitle}>{mp.name}</Text>
            <Text style={s.body}>{mp.whatItCommunicates}</Text>
            <Text style={s.label}>Example</Text>
            <Text style={{ ...s.body, fontStyle: "italic" }}>"{mp.exampleMessage}"</Text>
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
        <View style={s.row}>
          <View style={s.col2}>
            <View style={s.accentCard}>
              <Text style={s.cardTitle}>Headlines — Use</Text>
              {d.brandPersona?.messagingExamples?.headlines?.use?.map((h, i) => <Text key={i} style={s.bullet}>• {h}</Text>)}
            </View>
          </View>
          <View style={s.col2}>
            <View style={s.accentCard}>
              <Text style={s.cardTitle}>CTAs — Use</Text>
              {d.brandPersona?.messagingExamples?.ctaButtons?.use?.map((c, i) => <Text key={i} style={s.bullet}>• {c}</Text>)}
            </View>
          </View>
        </View>
      </Page>

      <DisclaimerPage tier="blueprint" />
    </Document>
  );
}

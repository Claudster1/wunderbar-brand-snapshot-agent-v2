import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";
import { DisclaimerPage } from "../components/DisclaimerPage";
import { SectionDividerPage } from "../components/SectionDividerPage";
import { PdfHeader } from "../components/PdfHeader";
import type { BlueprintEngineOutput } from "../types/blueprintReport";
import { parseHexAccent } from "@/src/pdf/lib/promptPackDisplay";
import { PDF_WUNDERBAR_LOGO_SRC } from "../constants/pdfLogo";

const s = StyleSheet.create({
  cover: {
    padding: 48,
    fontFamily: "Helvetica",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: pdfTheme.colors.navy,
  },
  logo: { width: 104, marginBottom: 28, opacity: 0.92 },
  coverTitle: { fontSize: 24, fontWeight: "bold", color: "#FFFFFF", textAlign: "center", marginBottom: 8 },
  coverSub: { fontSize: 12, color: pdfTheme.colors.aqua, textAlign: "center" },
  page: {
    padding: 48,
    paddingBottom: 92,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#2D3A4A",
    lineHeight: 1.6,
  },
  h1: { fontSize: 19, fontWeight: "bold", color: "#021859", marginBottom: 8 },
  h2: { fontSize: 13, fontWeight: "bold", color: "#021859", marginBottom: 6, marginTop: 14 },
  body: { fontSize: 10, lineHeight: 1.6, marginBottom: 6, color: "#2D3A4A" },
  small: { fontSize: 9, color: "#6B7280", lineHeight: 1.5 },
  card: {
    backgroundColor: "#F8FBFF",
    borderRadius: 8,
    border: "1 solid #E2EAF5",
    padding: 12,
    marginBottom: 10,
  },
  doCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    border: "1 solid #BBF7D0",
    padding: 12,
    marginBottom: 10,
  },
  dontCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    border: "1 solid #FECACA",
    padding: 12,
    marginBottom: 10,
  },
  label: {
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
    color: pdfTheme.colors.blue,
  },
  doLabel: {
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
    color: "#166534",
  },
  dontLabel: {
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
    color: "#991B1B",
  },
  listItem: { fontSize: 10, marginBottom: 4, lineHeight: 1.5 },
  footer: { position: "absolute", bottom: 22, left: 48, right: 48, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#9CA3AF" },
});

interface Props {
  data: BlueprintEngineOutput;
  brandName: string;
}

export function VoiceChecklistDocument({ data, brandName }: Props) {
  const palette = data.visualDirection?.colorPalette as Array<{ hex?: string }> | undefined;
  const brandAccent = parseHexAccent(Array.isArray(palette) ? palette.map((entry) => entry?.hex).find(Boolean) : undefined) || pdfTheme.colors.blue;
  const printedDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const tone = data.brandPersona?.communicationStyle?.tone || "Clear, confident, practical";
  const pace = data.brandPersona?.communicationStyle?.pace || "Direct and structured";
  const energy = data.brandPersona?.communicationStyle?.energy || "Warm authority";

  const doItems = (
    data.brandPersona?.doAndDont?.do?.map((i) => i.guideline || i.example) ||
    data.voiceToneGuide?.phrasesToUse ||
    []
  ).slice(0, 12);

  const dontItems = (
    data.brandPersona?.doAndDont?.dont?.map((i) => i.guideline || i.example) ||
    data.voiceToneGuide?.phrasesToAvoid ||
    []
  ).slice(0, 12);

  const sampleUse = data.voiceToneGuide?.phrasesToUse?.slice(0, 6) || [];
  const sampleAvoid = data.voiceToneGuide?.phrasesToAvoid?.slice(0, 6) || [];
  const position = data.brandFoundation?.positioningStatement || data.executiveSummary?.synthesis || "";

  return (
    <Document>
      <Page size="A4" style={s.cover}>
        <Image src={PDF_WUNDERBAR_LOGO_SRC} style={s.logo} />
        <Text style={s.coverTitle}>Voice Do and Don&apos;t Checklist</Text>
        <Text style={s.coverSub}>{brandName} Brand Language Guardrails</Text>
        <View style={{ width: 76, height: 3, borderRadius: 999, backgroundColor: brandAccent, marginTop: 10, marginBottom: 16 }} />
        <Text style={s.small}>{printedDate}</Text>
      </Page>

      <SectionDividerPage
        label="Section"
        title="Voice Profile and Rules"
        subtitle="Core tone profile plus approved and off-brand language patterns."
        accentHex={brandAccent}
      />

      <Page size="A4" style={s.page} wrap>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Voice Checklist - {brandName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
        <PdfHeader title="Voice Checklist" businessName={brandName} date={printedDate} accentHex={brandAccent} />

        <Text style={s.h1}>Core Voice Profile</Text>
        <View style={s.card} wrap={false}>
          <Text style={s.body}>Tone: {tone}</Text>
          <Text style={s.body}>Pace: {pace}</Text>
          <Text style={s.body}>Energy: {energy}</Text>
          {position ? <Text style={s.small}>Positioning anchor: {position}</Text> : null}
        </View>

        <Text style={s.h2}>Do This</Text>
        <View style={s.doCard} wrap={false}>
          <Text style={s.doLabel}>Approved patterns</Text>
          {doItems.length > 0 ? (
            doItems.map((item, idx) => (
              <Text key={idx} style={s.listItem}>
                • {String(item)}
              </Text>
            ))
          ) : (
            <Text style={s.listItem}>• Lead with outcomes and practical clarity.</Text>
          )}
        </View>

        <Text style={s.h2}>Avoid This</Text>
        <View style={s.dontCard} wrap={false}>
          <Text style={s.dontLabel}>Off-brand patterns</Text>
          {dontItems.length > 0 ? (
            dontItems.map((item, idx) => (
              <Text key={idx} style={s.listItem}>
                • {String(item)}
              </Text>
            ))
          ) : (
            <Text style={s.listItem}>• Avoid vague, generic, or jargon-heavy language.</Text>
          )}
        </View>

        {(sampleUse.length > 0 || sampleAvoid.length > 0) && (
          <>
            <Text style={s.h2}>Phrase Reference</Text>
            <View style={s.card}>
              {sampleUse.length > 0 ? (
                <>
                  <Text style={s.label}>Do this</Text>
                  {sampleUse.map((p, idx) => (
                    <Text key={`use-${idx}`} style={s.listItem}>
                      • {p}
                    </Text>
                  ))}
                </>
              ) : null}
              {sampleAvoid.length > 0 ? (
                <>
                  <Text style={{ ...s.label, marginTop: 8 }}>Not this</Text>
                  {sampleAvoid.map((p, idx) => (
                    <Text key={`avoid-${idx}`} style={s.listItem}>
                      • {p}
                    </Text>
                  ))}
                </>
              ) : null}
            </View>
          </>
        )}
      </Page>

      <DisclaimerPage tier="blueprint" />
    </Document>
  );
}

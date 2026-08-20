import React from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";
import { PdfHeader, PDF_HEADER_RESERVED } from "../components/PdfHeader";
import { PdfFooter, PDF_FOOTER_RESERVED } from "../components/PdfFooter";
import { registerPdfFonts } from "../registerFonts";

registerPdfFonts();

type Data = Record<string, any>;

const s = StyleSheet.create({
  page: {
    paddingTop: PDF_HEADER_RESERVED + 8,
    paddingBottom: PDF_FOOTER_RESERVED + 8,
    paddingHorizontal: 36,
    fontFamily: "Lato",
    fontSize: 10.5,
    lineHeight: 1.55,
    color: pdfTheme.colors.text,
    backgroundColor: "#F5F5F7",
  },
  h1: {
    fontFamily: "Lato",
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 8,
    color: pdfTheme.colors.navy,
    letterSpacing: -0.3,
  },
  sub: { fontFamily: "Lato", fontSize: 10, color: pdfTheme.colors.muted, marginBottom: 14 },
  sec: { marginBottom: 12 },
  h2: {
    fontFamily: "Lato",
    fontSize: 11,
    fontWeight: 700,
    color: pdfTheme.colors.blue,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  body: { fontFamily: "Lato", marginBottom: 4, color: pdfTheme.colors.text, fontSize: 10 },
  bullet: { fontFamily: "Lato", marginBottom: 3, color: pdfTheme.colors.text, fontSize: 10 },
  card: {
    borderWidth: 1,
    borderColor: pdfTheme.colors.border,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: "rgba(7, 176, 242, 0.55)",
    padding: 12,
    paddingLeft: 14,
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
  },
});

export function ExternalBrandGuideDocument({ data }: { data: Data }) {
  const biz = String(data.business_name || "Your Brand");
  const bsd = (data.brand_standards_data || {}) as Record<string, any>;
  const colors = Array.isArray(bsd.color_palette) ? bsd.color_palette.slice(0, 6) : [];
  const values = Array.isArray(bsd.values) ? bsd.values : [];
  const voice = Array.isArray(data.brand_voice_attributes) ? data.brand_voice_attributes.slice(0, 4) : [];
  const reportDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <Document title={`${biz} External Brand Guide`}>
      <Page size="A4" style={s.page}>
        <PdfHeader
          title="External Brand Guide"
          businessName={biz}
          date={reportDate}
          productName="WunderBrand Blueprint+™"
        />
        <Text style={s.h1}>External Brand Guide</Text>
        <Text style={s.sub}>Audience: agencies, freelancers, media partners, and external collaborators.</Text>

        <View style={s.sec}>
          <Text style={s.h2}>1. Brand Introduction</Text>
          <View style={s.card}>
            <Text style={s.body}>{data.positioning_statement || `${biz} brand overview and positioning summary.`}</Text>
            {values.length > 0 && (
              <Text style={s.body}>
                Personality:{" "}
                {values
                  .slice(0, 5)
                  .map((v: any) => (typeof v === "string" ? v : v?.name))
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            )}
            {voice.length > 0 && <Text style={s.body}>Voice summary: {voice.join(", ")}.</Text>}
          </View>
        </View>

        <View style={s.sec}>
          <Text style={s.h2}>2. Logo System</Text>
          <View style={s.card}>
            <Text style={s.body}>• Primary and secondary lockups</Text>
            <Text style={s.body}>• Clear space and minimum size rules</Text>
            <Text style={s.body}>• Approved color versions and prohibited uses</Text>
            <Text style={s.body}>• Download links to approved logo package</Text>
          </View>
        </View>

        <View style={s.sec}>
          <Text style={s.h2}>3. Color Palette</Text>
          <View style={s.card}>
            {colors.length > 0 ? (
              colors.map((c: any, idx: number) => (
                <Text key={idx} style={s.bullet}>
                  • {c?.name || `Color ${idx + 1}`}: {c?.hex || "n/a"}
                </Text>
              ))
            ) : (
              <Text style={s.body}>Primary and secondary palette with HEX/RGB/CMYK usage guidance.</Text>
            )}
          </View>
        </View>

        <View style={s.sec}>
          <Text style={s.h2}>4. Typography</Text>
          <Text style={s.body}>Primary typefaces, hierarchy, scale, and fallback fonts for digital.</Text>
        </View>

        <View style={s.sec}>
          <Text style={s.h2}>5. Voice & Tone (Summary)</Text>
          <Text style={s.body}>{data.tone_guidelines || "Tone guidance for external collaborators."}</Text>
        </View>

        <View style={s.sec}>
          <Text style={s.h2}>6. Imagery & Photography</Text>
          <Text style={s.body}>
            {data.brand_imagery_direction?.photography_style_direction ||
              "Photography direction, what to avoid, illustration notes, and stock guidance."}
          </Text>
        </View>

        <View style={s.sec}>
          <Text style={s.h2}>7. Templates & Layout Guidance</Text>
          <Text style={s.body}>Template access, spacing basics, and layout do/don't patterns.</Text>
        </View>

        <View style={s.sec}>
          <Text style={s.h2}>8. Digital Standards</Text>
          <Text style={s.body}>Social specs, email signatures/banners, and web asset requirements.</Text>
        </View>

        <View style={s.sec}>
          <Text style={s.h2}>9. Approval & Contact</Text>
          <Text style={s.body}>Brand contact and turnaround expectations for external usage approvals.</Text>
        </View>

        <PdfFooter businessName={biz} productName="External Brand Guide" showPageNumbers />
      </Page>
    </Document>
  );
}

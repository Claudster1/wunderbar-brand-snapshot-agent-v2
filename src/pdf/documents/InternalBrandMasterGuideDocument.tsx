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
  sub: { fontFamily: "Lato", fontSize: 10, color: pdfTheme.colors.muted, marginBottom: 12 },
  sec: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: pdfTheme.colors.border,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: "rgba(7, 176, 242, 0.55)",
    padding: 12,
    paddingLeft: 14,
    backgroundColor: "#FFFFFF",
  },
  h2: {
    fontFamily: "Lato",
    fontSize: 11,
    fontWeight: 700,
    color: pdfTheme.colors.blue,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  line: { fontFamily: "Lato", marginBottom: 3, color: pdfTheme.colors.text, fontSize: 10 },
});

export function InternalBrandMasterGuideDocument({ data }: { data: Data }) {
  const biz = String(data.business_name || "Your Brand");
  const bsd = (data.brand_standards_data || {}) as Record<string, any>;
  const pillars = Array.isArray(data.brand_pillars) ? data.brand_pillars.slice(0, 4) : [];
  const values = Array.isArray(data.brand_values) ? data.brand_values.slice(0, 6) : [];
  const reportDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <Document title={`${biz} Internal Brand Master Guide`}>
      <Page size="A4" style={s.page}>
        <PdfHeader
          title="Internal Brand Master Guide"
          businessName={biz}
          date={reportDate}
          productName="WunderBrand Blueprint+™"
        />
        <Text style={s.h1}>Internal Brand Master Guide</Text>
        <Text style={s.sub}>Audience: internal teams across marketing, content, design, product, CX, sales, and leadership.</Text>

        <View style={s.sec}>
          <Text style={s.h2}>1. Brand Foundations</Text>
          <Text style={s.line}>• Business: {biz}</Text>
          <Text style={s.line}>• North-star positioning and differentiation guidance.</Text>
          {pillars.length > 0 && pillars.map((p: any, i: number) => (
            <Text key={i} style={s.line}>• Pillar {i + 1}: {String(p?.pillar || p?.name || p)}</Text>
          ))}
          {values.length > 0 && <Text style={s.line}>• Core values: {values.map((v: any) => String(v?.name || v)).join(", ")}</Text>}
        </View>

        <View style={s.sec}>
          <Text style={s.h2}>2. Voice & Messaging System</Text>
          <Text style={s.line}>• Voice principles and tonal guardrails by context.</Text>
          <Text style={s.line}>• Message hierarchy for awareness, consideration, and conversion.</Text>
          <Text style={s.line}>• Approved and restricted language examples.</Text>
        </View>

        <View style={s.sec}>
          <Text style={s.h2}>3. Visual System (Internal Reference)</Text>
          <Text style={s.line}>• Logo architecture and use-case matrix.</Text>
          <Text style={s.line}>• Color, typography, iconography, and visual treatment rules.</Text>
          <Text style={s.line}>• Accessibility and contrast requirements.</Text>
        </View>

        <View style={s.sec}>
          <Text style={s.h2}>4. Channel & Content Adaptation</Text>
          <Text style={s.line}>• Channel-specific expression examples and templates.</Text>
          <Text style={s.line}>• Creative briefing checklist and QA gates.</Text>
        </View>

        <View style={s.sec}>
          <Text style={s.h2}>5. Governance & Workflow</Text>
          <Text style={s.line}>• Brand owner role: {bsd?.governance_template?.brand_owner_role || "Brand lead"}</Text>
          <Text style={s.line}>• Review cadence, approval flow, and escalation path.</Text>
          <Text style={s.line}>• Update cycle and version-control policy.</Text>
        </View>

        <PdfFooter businessName={biz} productName="Internal Brand Master Guide" showPageNumbers />
      </Page>
    </Document>
  );
}

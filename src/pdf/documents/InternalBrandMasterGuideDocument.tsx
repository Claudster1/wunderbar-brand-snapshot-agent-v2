import React from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";

type Data = Record<string, any>;

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 10.5, lineHeight: 1.5, color: "#0F172A" },
  h1: { fontSize: 22, fontWeight: 700, marginBottom: 8, color: pdfTheme.colors.navy },
  sub: { fontSize: 10, color: "#64748B", marginBottom: 12 },
  sec: { marginBottom: 10, border: "1 solid #E2E8F0", borderRadius: 4, padding: 8, backgroundColor: "#F8FAFC" },
  h2: { fontSize: 12, fontWeight: 700, color: pdfTheme.colors.navy, marginBottom: 4 },
  line: { marginBottom: 2 },
  foot: { position: "absolute", bottom: 18, left: 40, right: 40, fontSize: 8, color: "#94A3B8" },
});

export function InternalBrandMasterGuideDocument({ data }: { data: Data }) {
  const biz = String(data.business_name || "Your Brand");
  const bsd = (data.brand_standards_data || {}) as Record<string, any>;
  const pillars = Array.isArray(data.brand_pillars) ? data.brand_pillars.slice(0, 4) : [];
  const values = Array.isArray(data.brand_values) ? data.brand_values.slice(0, 6) : [];

  return (
    <Document title={`${biz} Internal Brand Master Guide`}>
      <Page size="A4" style={s.page}>
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

        <Text style={s.foot}>This internal guide is the source of truth. External and vendor docs are controlled derivatives.</Text>
      </Page>
    </Document>
  );
}

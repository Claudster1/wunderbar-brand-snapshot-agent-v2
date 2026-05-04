import React from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";

type Data = Record<string, any>;

const s = StyleSheet.create({
  page: { padding: 42, fontSize: 11, lineHeight: 1.55, color: "#0F172A" },
  h1: { fontSize: 24, fontWeight: 700, marginBottom: 8, color: pdfTheme.colors.navy },
  sub: { fontSize: 11, color: "#475569", marginBottom: 16 },
  sec: { marginBottom: 14 },
  h2: { fontSize: 14, fontWeight: 700, color: pdfTheme.colors.navy, marginBottom: 6 },
  body: { marginBottom: 4 },
  bullet: { marginBottom: 3 },
  card: { border: "1 solid #E2E8F0", borderRadius: 4, padding: 10, marginBottom: 8, backgroundColor: "#F8FAFC" },
  foot: { position: "absolute", bottom: 20, left: 42, right: 42, fontSize: 8, color: "#94A3B8" },
});

export function ExternalBrandGuideDocument({ data }: { data: Data }) {
  const biz = String(data.business_name || "Your Brand");
  const bsd = (data.brand_standards_data || {}) as Record<string, any>;
  const colors = Array.isArray(bsd.color_palette) ? bsd.color_palette.slice(0, 6) : [];
  const values = Array.isArray(bsd.values) ? bsd.values : [];
  const voice = Array.isArray(data.brand_voice_attributes) ? data.brand_voice_attributes.slice(0, 4) : [];

  return (
    <Document title={`${biz} External Brand Guide`}>
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>External Brand Guide</Text>
        <Text style={s.sub}>Audience: agencies, freelancers, media partners, and external collaborators.</Text>

        <View style={s.sec}>
          <Text style={s.h2}>1. Brand Introduction</Text>
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

        <View style={s.sec}>
          <Text style={s.h2}>2. Logo System</Text>
          <View style={s.card}>
            <Text style={s.body}>- Primary and secondary lockups</Text>
            <Text style={s.body}>- Clear space and minimum size rules</Text>
            <Text style={s.body}>- Approved color versions and prohibited uses</Text>
            <Text style={s.body}>- Download links to approved logo package</Text>
          </View>
        </View>

        <View style={s.sec}>
          <Text style={s.h2}>3. Color Palette</Text>
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

        <Text style={s.foot}>Confidential — External guide for approved collaborators only.</Text>
      </Page>
    </Document>
  );
}

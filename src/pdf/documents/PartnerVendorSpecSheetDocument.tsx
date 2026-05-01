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

export function PartnerVendorSpecSheetDocument({ data }: { data: Data }) {
  const biz = String(data.business_name || "Your Brand");
  const bsd = (data.brand_standards_data || {}) as Record<string, any>;
  const colors = Array.isArray(bsd.color_palette) ? bsd.color_palette.slice(0, 4) : [];
  const headlineFont = data.typography_recommendations?.headline?.font || "Primary headline font";
  const bodyFont = data.typography_recommendations?.body?.font || "Primary body font";

  return (
    <Document title={`${biz} Partner Vendor Spec Sheet`}>
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>Partner & Vendor Spec Sheet</Text>
        <Text style={s.sub}>Audience: printers, event vendors, merchandise suppliers, media buyers, and one-time collaborators.</Text>

        <View style={s.sec}>
          <Text style={s.h2}>1. Logo Quick Reference</Text>
          <Text style={s.line}>• Use approved primary lockup only.</Text>
          <Text style={s.line}>• Respect clear space and minimum size requirements.</Text>
          <Text style={s.line}>• Do not distort, recolor, or recompose logo marks.</Text>
        </View>

        <View style={s.sec}>
          <Text style={s.h2}>2. Brand Colors</Text>
          {colors.length > 0 ? (
            colors.map((c: any, idx: number) => (
              <Text key={idx} style={s.line}>
                • {c?.name || `Color ${idx + 1}`}: HEX {c?.hex || "n/a"} | RGB {c?.rgb || "n/a"} | CMYK {c?.cmyk || "n/a"}
              </Text>
            ))
          ) : (
            <Text style={s.line}>• Primary colors only; do not use unlisted colors.</Text>
          )}
        </View>

        <View style={s.sec}>
          <Text style={s.h2}>3. Typography (Abbreviated)</Text>
          <Text style={s.line}>• Headline font: {headlineFont}</Text>
          <Text style={s.line}>• Body font: {bodyFont}</Text>
          <Text style={s.line}>• Use approved fallback stack for digital placements.</Text>
        </View>

        <View style={s.sec}>
          <Text style={s.h2}>4. File Format Requirements</Text>
          <Text style={s.line}>• Digital: RGB, 72dpi minimum.</Text>
          <Text style={s.line}>• Print: CMYK, 300dpi minimum.</Text>
          <Text style={s.line}>• Accepted formats by medium: SVG/PDF/EPS/PNG/JPG as specified.</Text>
        </View>

        <View style={s.sec}>
          <Text style={s.h2}>5. Production Notes</Text>
          <Text style={s.line}>• Mandatory proof approval before production.</Text>
          <Text style={s.line}>• Apply medium-specific safe zones and finishing requirements.</Text>
        </View>

        <View style={s.sec}>
          <Text style={s.h2}>6. Contact</Text>
          <Text style={s.line}>• Primary brand contact: {bsd?.governance_template?.brand_owner_role || "Brand team contact"}</Text>
          <Text style={s.line}>• Include approval submission deadline in project brief.</Text>
        </View>

        <Text style={s.foot}>Keep this document to 1–2 pages per project. Extended guidance lives in the External Brand Guide.</Text>
      </Page>
    </Document>
  );
}

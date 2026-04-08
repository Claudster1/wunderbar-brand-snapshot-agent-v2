import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { DisclaimerPage } from "../components/DisclaimerPage";
import type { ProductTier } from "@/components/results/tabConfig";

const s = StyleSheet.create({
  page: {
    padding: 42,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#2D3A4A",
    lineHeight: 1.6,
  },
  kicker: {
    fontSize: 11,
    fontWeight: 800,
    color: "#021859",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.45,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "#021859",
    marginBottom: 10,
  },
  meta: {
    fontSize: 9,
    color: "#6B7280",
    marginBottom: 12,
  },
  label: {
    fontSize: 8,
    fontWeight: 700,
    color: "#0D5BD7",
    marginTop: 10,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "#F8FBFF",
    borderRadius: 8,
    padding: 12,
    border: "1 solid #E2EAF5",
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.6,
    marginBottom: 8,
  },
  bullet: {
    fontSize: 10,
    lineHeight: 1.6,
    marginBottom: 4,
    paddingLeft: 10,
  },
});

type Props = {
  productTier: ProductTier;
  brandName: string;
  sectionLabel: string;
  sectionBody: string;
  /** Whether PDF reflects saved Workbook text or default report plan text. */
  bodySource?: "workbook" | "report";
  /** Optional note when exporting a named saved version. */
  versionNote?: string;
};

function mapToDisclaimerTier(tier: ProductTier): "snapshot" | "snapshot_plus" | "blueprint" | "blueprint_plus" {
  if (tier === "snapshot-plus") return "snapshot_plus";
  if (tier === "blueprint-plus") return "blueprint_plus";
  if (tier === "snapshot") return "snapshot";
  return "blueprint";
}

function splitParagraphs(body: string): string[] {
  return body
    .split(/\n{2,}/g)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function ActivationPlanSectionDocument({
  productTier,
  brandName,
  sectionLabel,
  sectionBody,
  bodySource = "report",
  versionNote,
}: Props) {
  const disclaimerTier = mapToDisclaimerTier(productTier);
  const reportDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const paragraphs = splitParagraphs(sectionBody);
  const sourceLine =
    bodySource === "workbook"
      ? "Content source: saved Workbook text (matches your latest edits where the plan block is present)."
      : "Content source: default plan from your report (open Workbook and save edits to export your refined version).";

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.kicker}>Activation Plan</Text>
        <Text style={s.title}>{sectionLabel}</Text>
        <Text style={s.meta}>
          {brandName} • Generated {reportDate}
          {versionNote ? ` • ${versionNote}` : ""}
        </Text>
        <Text style={{ ...s.meta, marginBottom: 10 }}>{sourceLine}</Text>

        <View style={s.card}>
          <Text style={s.label}>Plan content (editable in your Workbook)</Text>
          {paragraphs.length > 0 ? (
            paragraphs.map((p, idx) => (
              <Text key={idx} style={s.paragraph}>
                {p}
              </Text>
            ))
          ) : (
            <Text style={s.paragraph}>No plan content available for this section.</Text>
          )}
        </View>

        <Text style={s.meta}>Tip: use “Edit in Workbook” to update this plan, then download again.</Text>
      </Page>

      <DisclaimerPage tier={disclaimerTier} />
    </Document>
  );
}


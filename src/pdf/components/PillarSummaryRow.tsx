// src/pdf/components/PillarSummaryRow.tsx
// Pillar summary row component for PDF documents

import { View, Text as PdfText, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: pdfTheme.spacing.sm || 8,
    gap: pdfTheme.spacing.md || 16,
  },
  score: {
    fontSize: pdfTheme.fontSizes.base || 12,
    fontWeight: 600,
    color: pdfTheme.colors.blue || "#07B0F2",
    minWidth: 50,
  },
  text: {
    flex: 1,
    fontSize: pdfTheme.fontSizes.sm || 11,
    color: pdfTheme.colors.midnight || "#0C1526",
    lineHeight: 1.5,
  },
});

export function PillarSummaryRow({
  children,
}: {
  children: React.ReactNode;
}) {
  return <View style={styles.row}>{children}</View>;
}

export function Score({ children }: { children: React.ReactNode }) {
  return <PdfText style={styles.score}>{children}</PdfText>;
}

// Text component (aliased to avoid conflict with React-PDF Text)
export function Text({ children }: { children: React.ReactNode }) {
  return <PdfText style={styles.text}>{children}</PdfText>;
}

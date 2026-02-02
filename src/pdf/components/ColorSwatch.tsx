
// src/pdf/components/ColorSwatch.tsx
// Reusable color swatch component for PDF documents (used in Blueprint+™)

import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";

const swatchSize = 22;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: pdfTheme.spacing.sm,
  },
  swatch: {
    width: swatchSize,
    height: swatchSize,
    borderRadius: 4,
    border: `1px solid ${pdfTheme.colors.border}`,
    marginRight: pdfTheme.spacing.md,
  },
  label: {
    fontFamily: "Inter",
    fontSize: pdfTheme.fontSizes.sm,
    color: pdfTheme.colors.midnight,
  },
});

export const ColorSwatch = ({
  name,
  hex,
}: {
  name: string;
  hex: string;
}) => (
  <View style={styles.row}>
    <View style={[styles.swatch, { backgroundColor: hex }]} />
    <Text style={styles.label}>{name} — {hex}</Text>
  </View>
);

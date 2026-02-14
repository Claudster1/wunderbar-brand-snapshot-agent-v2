// src/pdf/components/PdfFooter.tsx
// Reusable footer component for PDF documents

import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";

const styles = StyleSheet.create({
  container: {
    paddingTop: pdfTheme.spacing.sm,
    paddingBottom: pdfTheme.spacing.md,
    paddingHorizontal: pdfTheme.spacing.xl,
    borderTop: `1px solid ${pdfTheme.colors.border}`,
    fontFamily: "Inter",
  },
  text: {
    fontSize: pdfTheme.fontSizes.xs,
    color: pdfTheme.colors.midnight,
    opacity: 0.6,
  },
});

export const PdfFooter = () => (
  <View style={styles.container} fixed>
    <Text style={styles.text}>
      © {new Date().getFullYear()} Wunderbar Digital · WunderBrand Suite™
    </Text>
  </View>
);

// src/pdf/components/PdfHeader.tsx
// Reusable header component for PDF documents

import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";

const styles = StyleSheet.create({
  container: {
    paddingVertical: pdfTheme.spacing.md,
    paddingHorizontal: pdfTheme.spacing.xl,
    borderBottom: `1px solid ${pdfTheme.colors.border}`,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontFamily: "Inter",
    fontSize: pdfTheme.fontSizes.lg,
    color: pdfTheme.colors.navy,
    fontWeight: 600,
  },
  logo: {
    width: 64,
  },
});

export const PdfHeader = ({ title }: { title: string }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    <Image style={styles.logo} src="/pdf/logo-wunderbar.png" />
  </View>
);

// src/pdf/components/PageTitle.tsx
// Reusable page title component for PDF documents

import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";

const styles = StyleSheet.create({
  container: {
    marginBottom: pdfTheme.spacing.md,
    paddingHorizontal: pdfTheme.spacing.xl,
    paddingVertical: pdfTheme.spacing.md,
    backgroundColor: "#F3F8FF",
    borderBottom: "1px solid #DDE6F2",
  },
  title: {
    fontFamily: "Helvetica",
    fontSize: 24,
    fontWeight: 700,
    color: pdfTheme.colors.navy,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: "Helvetica",
    fontSize: pdfTheme.fontSizes.sm,
    color: "#34445E",
    lineHeight: 1.45,
  },
});

export const PageTitle = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
  </View>
);

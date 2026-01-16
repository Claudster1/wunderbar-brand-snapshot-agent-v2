// src/pdf/components/PageTitle.tsx
// Reusable page title component for PDF documents

import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";

const styles = StyleSheet.create({
  container: {
    marginBottom: pdfTheme.spacing.lg,
  },
  title: {
    fontFamily: "Inter",
    fontSize: pdfTheme.fontSizes.xxl,
    fontWeight: 700,
    color: pdfTheme.colors.navy,
    marginBottom: pdfTheme.spacing.sm,
  },
  subtitle: {
    fontFamily: "Inter",
    fontSize: pdfTheme.fontSizes.base,
    color: pdfTheme.colors.midnight,
    opacity: 0.7,
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

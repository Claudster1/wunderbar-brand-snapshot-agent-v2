// src/pdf/components/ArchetypeCard.tsx
// Reusable archetype card component for PDF documents

import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";

const styles = StyleSheet.create({
  container: {
    padding: pdfTheme.spacing.lg,
    border: `1px solid ${pdfTheme.colors.border}`,
    borderRadius: 6,
    marginBottom: pdfTheme.spacing.md,
  },
  title: {
    fontFamily: "Inter",
    fontSize: pdfTheme.fontSizes.lg,
    fontWeight: 600,
    color: pdfTheme.colors.navy,
    marginBottom: pdfTheme.spacing.sm,
  },
  body: {
    fontFamily: "Inter",
    fontSize: pdfTheme.fontSizes.base,
    color: pdfTheme.colors.midnight,
    lineHeight: 1.5,
  },
});

export const ArchetypeCard = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.body}>{description}</Text>
  </View>
);

// src/pdf/components/ArchetypeCard.tsx
// Reusable archetype card component for PDF documents

import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";

const styles = StyleSheet.create({
  container: {
    padding: pdfTheme.spacing.lg,
    borderWidth: 1,
    borderColor: pdfTheme.colors.border,
    borderLeftWidth: 3,
    borderLeftColor: "rgba(7, 176, 242, 0.55)",
    borderRadius: 12,
    marginBottom: pdfTheme.spacing.md,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontFamily: "Lato",
    fontSize: pdfTheme.fontSizes.lg,
    fontWeight: 700,
    color: pdfTheme.colors.navy,
    marginBottom: pdfTheme.spacing.sm,
  },
  body: {
    fontFamily: "Lato",
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

// src/pdf/components/PersonaCard.tsx
// Reusable persona card component for PDF documents

import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";

const styles = StyleSheet.create({
  container: {
    padding: pdfTheme.spacing.lg,
    border: `1px solid ${pdfTheme.colors.border}`,
    borderRadius: 6,
    marginBottom: pdfTheme.spacing.md,
  },
  name: {
    fontFamily: "Inter",
    fontSize: pdfTheme.fontSizes.lg,
    fontWeight: 600,
    marginBottom: pdfTheme.spacing.sm,
    color: pdfTheme.colors.navy,
  },
  text: {
    fontFamily: "Inter",
    fontSize: pdfTheme.fontSizes.base,
    color: pdfTheme.colors.midnight,
    lineHeight: 1.5,
  },
});

export const PersonaCard = ({
  name,
  description,
}: {
  name: string;
  description: string;
}) => (
  <View style={styles.container}>
    <Text style={styles.name}>{name}</Text>
    <Text style={styles.text}>{description}</Text>
  </View>
);

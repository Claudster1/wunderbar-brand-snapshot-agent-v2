// src/pdf/components/PersonaCard.tsx
// Reusable persona card component for PDF documents

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
  name: {
    fontFamily: "Lato",
    fontSize: pdfTheme.fontSizes.lg,
    fontWeight: 700,
    marginBottom: pdfTheme.spacing.sm,
    color: pdfTheme.colors.navy,
  },
  text: {
    fontFamily: "Lato",
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

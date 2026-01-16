// src/pdf/components/Section.tsx
// Reusable section container component for PDF documents

import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: pdfTheme.spacing.xl,
    paddingVertical: pdfTheme.spacing.lg,
    marginBottom: pdfTheme.spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
    color: "#021859",
    marginBottom: pdfTheme.spacing.md,
  },
});

export const Section = ({ 
  title, 
  children 
}: { 
  title?: string; 
  children: any 
}) => (
  <View style={styles.section}>
    {title && <Text style={styles.title}>{title}</Text>}
    {children}
  </View>
);

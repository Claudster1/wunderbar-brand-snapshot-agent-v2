// src/pdf/components/SectionHeader.tsx
// Section header component for PDF documents

import { Text, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";

const styles = StyleSheet.create({
  header: {
    fontSize: 16,
    fontWeight: 700,
    color: pdfTheme.colors.navy,
    marginBottom: 10,
    marginTop: 8,
    letterSpacing: 0.2,
    lineHeight: 1.3,
  },
});

export function SectionHeader({ children }: { children: React.ReactNode }) {
  return <Text style={styles.header}>{children}</Text>;
}

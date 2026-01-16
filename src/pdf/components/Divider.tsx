// src/pdf/components/Divider.tsx
// Reusable divider component for PDF documents

import { View, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: pdfTheme.colors.border,
    marginVertical: pdfTheme.spacing.lg,
  },
});

export const Divider = () => <View style={styles.divider} />;

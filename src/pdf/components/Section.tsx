// src/pdf/components/Section.tsx
// Reusable section container component for PDF documents

import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    marginBottom: 8,
    borderBottom: "1px solid #EAF1FB",
  },
  title: {
    fontSize: 11,
    fontWeight: 600,
    color: "#0B5FCC",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1.1,
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

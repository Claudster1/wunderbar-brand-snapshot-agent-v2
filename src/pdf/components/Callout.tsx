// src/pdf/components/Callout.tsx
// Callout/emphasis block component for PDF documents

import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: "#EFF6FF",
    borderLeft: `3px solid ${pdfTheme.colors.blue || "#07B0F2"}`,
    marginBottom: 10,
    borderRadius: 6,
    border: "1 solid #DCE9FF",
  },
  text: {
    fontSize: 10,
    color: "#1F2C3D",
    lineHeight: 1.6,
  },
});

export function Callout({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

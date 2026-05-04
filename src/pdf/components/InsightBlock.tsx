// src/pdf/components/InsightBlock.tsx
// Reusable insight block component for PDF documents

import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: "#F8FBFF",
    borderRadius: 8,
    border: `1px solid #E2EAF5`,
  },
  title: {
    fontFamily: "Helvetica",
    fontSize: 11.5,
    fontWeight: 600,
    color: pdfTheme.colors.navy,
    marginBottom: 6,
  },
  text: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: pdfTheme.colors.text,
    lineHeight: 1.62,
  },
});

export const InsightBlock = ({
  title,
  text,
  children,
}: {
  title: string;
  text?: string;
  children?: React.ReactNode;
}) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    {children ? (
      <Text style={styles.text}>{children}</Text>
    ) : text ? (
      <Text style={styles.text}>{text}</Text>
    ) : null}
  </View>
);

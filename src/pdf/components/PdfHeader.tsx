// src/pdf/components/PdfHeader.tsx
// Reusable header component for PDF documents

import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";

const LOGO_URL = "https://d268zs2sdbzvo0.cloudfront.net/66e09bd196e8d5672b143fb8_528e12f9-22c9-4c46-8d90-59238d4c8141_logo.webp";

const styles = StyleSheet.create({
  container: {
    paddingVertical: pdfTheme.spacing.md,
    paddingHorizontal: pdfTheme.spacing.xl,
    borderBottom: `1px solid ${pdfTheme.colors.border}`,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftCol: {
    flex: 1,
  },
  title: {
    fontFamily: "Inter",
    fontSize: pdfTheme.fontSizes.lg,
    color: pdfTheme.colors.navy,
    fontWeight: 600,
  },
  preparedFor: {
    fontSize: 9,
    color: "#6B7280",
    marginTop: 4,
  },
  date: {
    fontSize: 8,
    color: "#9CA3AF",
    marginTop: 2,
  },
  logo: {
    width: 80,
  },
});

interface PdfHeaderProps {
  title: string;
  businessName?: string;
  date?: string;
}

export const PdfHeader = ({ title, businessName, date }: PdfHeaderProps) => (
  <View style={styles.container}>
    <View style={styles.leftCol}>
      <Text style={styles.title}>{title}</Text>
      {businessName && (
        <Text style={styles.preparedFor}>Prepared for {businessName}</Text>
      )}
      {date && <Text style={styles.date}>{date}</Text>}
    </View>
    <Image style={styles.logo} src={LOGO_URL} />
  </View>
);

// src/pdf/components/PdfFooter.tsx
// Reusable footer component for PDF documents

import { View, Text, StyleSheet, Link } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";

const styles = StyleSheet.create({
  container: {
    paddingTop: pdfTheme.spacing.sm,
    paddingBottom: pdfTheme.spacing.md,
    paddingHorizontal: pdfTheme.spacing.xl,
    borderTop: `1px solid ${pdfTheme.colors.border}`,
    fontFamily: "Inter",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  text: {
    fontSize: pdfTheme.fontSizes.xs,
    color: pdfTheme.colors.midnight,
    opacity: 0.6,
  },
  confidential: {
    fontSize: 7,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 4,
  },
  terms: {
    fontSize: 7,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 4,
  },
  url: {
    fontSize: pdfTheme.fontSizes.xs,
    color: "#07B0F2",
    textDecoration: "none",
    opacity: 0.8,
  },
});

interface PdfFooterProps {
  businessName?: string;
  productName?: string;
}

export const PdfFooter = ({ businessName, productName }: PdfFooterProps = {}) => (
  <View style={styles.container} fixed>
    <View style={styles.row}>
      <Text style={styles.text}>
        © {new Date().getFullYear()} Wunderbar Digital · {productName || "WunderBrand Suite™"}
      </Text>
      <Link src="https://wunderbardigital.com" style={styles.url}>
        wunderbardigital.com
      </Link>
    </View>
    {businessName && (
      <Text style={styles.confidential}>
        Confidential — Prepared exclusively for {businessName}. Unauthorized distribution is prohibited.
      </Text>
    )}
    <Text style={styles.terms}>
      Licensed for internal use. Redistribution prohibited. © {new Date().getFullYear()} Wunderbar Digital
    </Text>
  </View>
);

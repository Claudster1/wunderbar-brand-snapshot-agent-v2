// src/pdf/components/PdfFooter.tsx
// Reusable footer component for PDF documents

import { View, Text, StyleSheet, Link } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingBottom: 9,
    paddingHorizontal: 22,
    borderTop: `1px solid #E4EBF7`,
    fontFamily: "Helvetica",
    backgroundColor: "#FBFDFF",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  text: {
    fontSize: 7.2,
    color: pdfTheme.colors.midnight,
    opacity: 0.76,
  },
  confidential: {
    fontSize: 6.8,
    color: "#8C9AB2",
    textAlign: "center",
    marginTop: 3,
  },
  terms: {
    fontSize: 6.5,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 3,
  },
  url: {
    fontSize: 7.2,
    color: pdfTheme.colors.blue,
    textDecoration: "none",
    opacity: 0.98,
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
      <Link src="https://wunderbardigital.com/?utm_source=wunderbrand_app&utm_medium=pdf_footer&utm_campaign=report_delivery&utm_content=pdf_footer_component" style={styles.url}>
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

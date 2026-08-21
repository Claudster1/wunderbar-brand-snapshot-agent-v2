// src/pdf/components/PdfFooter.tsx
// Suite-aligned footer chrome

import { View, Text, StyleSheet, Link } from "@react-pdf/renderer";
import {
  SUITE_ACCENT_BRIGHT,
  SUITE_BORDER,
  SUITE_CHROME_MUTED,
  SUITE_MUTED,
} from "@/components/results/suiteBrandTokens";

/** Reserve this much bottom padding on Page styles so body clears the fixed footer. */
export const PDF_FOOTER_RESERVED = 56;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 28,
    borderTopWidth: 1,
    borderTopColor: SUITE_BORDER,
    backgroundColor: "#FFFFFF",
    fontFamily: "Lato",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  text: {
    fontFamily: "Lato",
    fontSize: 7.5,
    fontWeight: 700,
    color: SUITE_MUTED,
  },
  confidential: {
    fontFamily: "Lato",
    fontSize: 6.8,
    color: SUITE_CHROME_MUTED,
    textAlign: "center",
    marginTop: 3,
  },
  url: {
    fontFamily: "Lato",
    fontSize: 7.5,
    fontWeight: 700,
    color: SUITE_ACCENT_BRIGHT,
    textDecoration: "none",
  },
  pageNum: {
    fontFamily: "Lato",
    fontSize: 7.5,
    fontWeight: 700,
    color: SUITE_MUTED,
  },
});

interface PdfFooterProps {
  businessName?: string;
  productName?: string;
  /** Show “n / total” on the right (Downloads library docs). */
  showPageNumbers?: boolean;
}

export const PdfFooter = ({
  businessName,
  productName,
  showPageNumbers = false,
}: PdfFooterProps = {}) => (
  <View style={styles.container} fixed>
    <View style={styles.row}>
      <Text style={styles.text}>
        © {new Date().getFullYear()} Wunderbar Digital · {productName || "WunderBrand Suite™"}
        {businessName ? ` — ${businessName}` : ""}
      </Text>
      {showPageNumbers ? (
        <Text
          style={styles.pageNum}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        />
      ) : (
        <Link
          src="https://wunderbardigital.com/?utm_source=wunderbrand_app&utm_medium=pdf_footer&utm_campaign=report_delivery&utm_content=pdf_footer_component"
          style={styles.url}
        >
          wunderbardigital.com
        </Link>
      )}
    </View>
    {businessName ? (
      <Text style={styles.confidential}>
        Confidential — Prepared exclusively for {businessName}. Unauthorized distribution is prohibited.
      </Text>
    ) : (
      <Text style={styles.confidential}>
        Licensed for internal use. Redistribution prohibited.
      </Text>
    )}
  </View>
);

// src/pdf/components/PdfHeader.tsx
// Suite-aligned sticky chrome — mirrors CompactResultsHeader

import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import {
  SUITE_ACCENT_BRIGHT,
  SUITE_BORDER,
  SUITE_HEADER_META,
  SUITE_NAVY,
  SUITE_TEXT_PRIMARY,
} from "@/components/results/suiteBrandTokens";
import { PDF_WUNDERBAR_LOGO_SRC } from "../constants/pdfLogo";

/** Reserve this much top padding on Page styles so body clears the fixed header. */
export const PDF_HEADER_RESERVED = 64;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    paddingHorizontal: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: SUITE_BORDER,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 12,
    minWidth: 0,
  },
  logoWrap: {
    paddingRight: 14,
    marginRight: 12,
    borderRightWidth: 1,
    borderRightColor: SUITE_BORDER,
  },
  logo: {
    width: 88,
    height: 20,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  company: {
    fontFamily: "Lato",
    fontSize: 11,
    fontWeight: 700,
    color: SUITE_NAVY,
    letterSpacing: -0.2,
  },
  sep: {
    fontFamily: "Lato",
    fontSize: 10,
    fontWeight: 700,
    color: SUITE_HEADER_META,
    marginHorizontal: 6,
  },
  metaText: {
    fontFamily: "Lato",
    fontSize: 9,
    fontWeight: 700,
    color: SUITE_HEADER_META,
  },
  right: {
    alignItems: "flex-end",
    flexShrink: 0,
  },
  product: {
    fontFamily: "Lato",
    fontSize: 11,
    fontWeight: 700,
    color: SUITE_ACCENT_BRIGHT,
    letterSpacing: -0.2,
    textAlign: "right",
  },
  powered: {
    fontFamily: "Lato",
    fontSize: 8,
    fontWeight: 700,
    color: SUITE_HEADER_META,
    marginTop: 2,
    textAlign: "right",
  },
  sectionLabel: {
    fontFamily: "Lato",
    fontSize: 7.5,
    fontWeight: 700,
    color: SUITE_TEXT_PRIMARY,
    opacity: 0.55,
    marginTop: 2,
    textAlign: "right",
  },
});

interface PdfHeaderProps {
  title: string;
  businessName?: string;
  date?: string;
  productName?: string;
  /** Optional validated brand hex — hairline accent under header for client-aligned PDFs. */
  accentHex?: string;
}

export const PdfHeader = ({
  title,
  businessName,
  date,
  productName = "WunderBrand Snapshot™",
  accentHex,
}: PdfHeaderProps) => (
  <View
    style={[
      styles.container,
      accentHex ? { borderBottomWidth: 2, borderBottomColor: accentHex } : {},
    ]}
    fixed
  >
    <View style={styles.left}>
      <View style={styles.logoWrap}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image style={styles.logo} src={PDF_WUNDERBAR_LOGO_SRC} />
      </View>
      <View style={styles.meta}>
        {businessName ? (
          <>
            <Text style={styles.company}>{businessName}</Text>
            <Text style={styles.sep}>·</Text>
          </>
        ) : null}
        {date ? (
          <>
            <Text style={styles.metaText}>{date}</Text>
            <Text style={styles.sep}>·</Text>
          </>
        ) : null}
        <Text style={styles.metaText}>Confidential</Text>
      </View>
    </View>
    <View style={styles.right}>
      <Text style={styles.product}>{productName}</Text>
      <Text style={styles.powered}>Powered by Wunderbar Digital</Text>
      {title ? <Text style={styles.sectionLabel}>{title}</Text> : null}
    </View>
  </View>
);

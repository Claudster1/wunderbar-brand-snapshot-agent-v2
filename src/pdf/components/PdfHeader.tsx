// src/pdf/components/PdfHeader.tsx
// Reusable header component for PDF documents

import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";
import { PDF_WUNDERBAR_LOGO_SRC } from "../constants/pdfLogo";


const styles = StyleSheet.create({
  container: {
    paddingTop: 14,
    paddingBottom: 10,
    paddingHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#E4EBF7",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FCFF",
  },
  leftCol: {
    flex: 1,
  },
  kicker: {
    fontSize: 7.8,
    color: "#0D5BD7",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 3,
    fontWeight: 600,
  },
  title: {
    fontFamily: "Helvetica",
    fontSize: 12.6,
    color: pdfTheme.colors.navy,
    fontWeight: 600,
    lineHeight: 1.3,
  },
  preparedFor: {
    fontSize: 7.4,
    color: "#60708E",
    marginTop: 2,
  },
  date: {
    fontSize: 7,
    color: "#7E8EA9",
    marginTop: 2,
  },
  logo: {
    width: 94,
    height: 22,
    marginTop: 1,
  },
});

interface PdfHeaderProps {
  title: string;
  businessName?: string;
  date?: string;
  /** Optional validated brand hex — hairline accent under header for client-aligned PDFs. */
  accentHex?: string;
}

export const PdfHeader = ({ title, businessName, date, accentHex }: PdfHeaderProps) => (
  <View
    style={[
      styles.container,
      accentHex ? { borderBottomWidth: 2, borderBottomColor: accentHex } : {},
    ]}
  >
    <View style={styles.leftCol}>
      <Text style={styles.kicker}>WunderBrand Report</Text>
      <Text style={styles.title}>{title}</Text>
      {businessName && (
        <Text style={styles.preparedFor}>Prepared for {businessName}</Text>
      )}
      {date && <Text style={styles.date}>{date}</Text>}
    </View>
    {/* eslint-disable-next-line jsx-a11y/alt-text */}
    <Image style={styles.logo} src={PDF_WUNDERBAR_LOGO_SRC} />
  </View>
);

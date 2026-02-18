// src/pdf/SnapshotPlusPDF.tsx
// Snapshot+ PDF document component

import { Document, Page, Text, View } from "@react-pdf/renderer";
import { SnapshotPDFSection } from "./snapshotPlusSections";
import { registerPdfFonts } from "./registerFonts";
import { DisclaimerPage } from "./components/DisclaimerPage";

// Register fonts
registerPdfFonts();

export function SnapshotPlusPDF({
  sections,
}: {
  sections: SnapshotPDFSection[];
}) {
  return (
    <Document>
      <Page size="A4" style={{ padding: 40 }}>
        {sections.map((section) => (
          <View key={section.id} style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: section.emphasis === "primary" ? 18 : 14,
                fontWeight: "bold",
                marginBottom: 8,
              }}
            >
              {section.title}
            </Text>

            {section.body.map((line, i) => (
              <Text
                key={i}
                style={{
                  fontSize: 11,
                  marginBottom: 6,
                }}
              >
                {line}
              </Text>
            ))}
          </View>
        ))}
      </Page>

      <DisclaimerPage tier="snapshot_plus" />
    </Document>
  );
}

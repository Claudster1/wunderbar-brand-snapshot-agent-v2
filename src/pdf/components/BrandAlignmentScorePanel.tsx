// src/pdf/components/BrandAlignmentScorePanel.tsx
// WunderBrand Score™ panel — mirrors results MainGauge + range legend

import { View, StyleSheet } from "@react-pdf/renderer";
import { MainGaugePDF } from "./MainGaugePDF";
import { SUITE_BORDER, SUITE_RADIUS_MD } from "@/components/results/suiteBrandTokens";

const styles = StyleSheet.create({
  panel: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: SUITE_BORDER,
    borderRadius: SUITE_RADIUS_MD,
    padding: 16,
    marginBottom: 12,
  },
});

interface BrandAlignmentScorePanelProps {
  score: number; // 0-100
  size?: number;
}

export function BrandAlignmentScorePanel({
  score,
}: BrandAlignmentScorePanelProps) {
  return (
    <View style={styles.panel}>
      <MainGaugePDF score={score} showLegend width={210} />
    </View>
  );
}

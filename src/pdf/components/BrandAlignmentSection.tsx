// src/pdf/components/BrandAlignmentSection.tsx
// PDF component for Brand Alignment Score section

import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { ScoreGaugePDF } from "./ScoreGaugePDF";

interface BrandAlignmentSectionProps {
  score: number;
  brandName: string;
}

const styles = StyleSheet.create({
  h1: {
    fontSize: 18,
    marginBottom: 6,
    fontWeight: 700,
  },
  h2: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: 600,
  },
  body: {
    fontSize: 11,
    lineHeight: 1.5,
    marginTop: 12,
  },
});

export function BrandAlignmentSection({
  score,
  brandName,
}: BrandAlignmentSectionProps) {
  return (
    <View>
      <Text style={styles.h1}>{brandName}</Text>
      <Text style={styles.h2}>Brand Alignment Score™</Text>

      <ScoreGaugePDF score={score} />

      <Text style={styles.body}>
        This score reflects how aligned your positioning, messaging, visibility,
        credibility, and conversion signals are today.
      </Text>
    </View>
  );
}

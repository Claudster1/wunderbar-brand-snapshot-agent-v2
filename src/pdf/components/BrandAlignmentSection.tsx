// src/pdf/components/BrandAlignmentSection.tsx
// PDF component for WunderBrand Score™ section with score range legend

import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { BrandAlignmentScorePanel } from "./BrandAlignmentScorePanel";

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
    marginBottom: 10,
    fontWeight: 600,
  },
  body: {
    fontSize: 11,
    lineHeight: 1.5,
    marginTop: 8,
  },
});

export function BrandAlignmentSection({
  score,
  brandName,
}: BrandAlignmentSectionProps) {
  return (
    <View>
      <Text style={styles.h1}>{brandName}</Text>
      <Text style={styles.h2}>WunderBrand Score™</Text>

      <BrandAlignmentScorePanel score={score} />

      <Text style={styles.body}>
        This score reflects how aligned your positioning, messaging, visibility,
        credibility, and conversion signals are today.
      </Text>
    </View>
  );
}

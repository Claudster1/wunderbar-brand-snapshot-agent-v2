// src/pdf/components/RecommendationBlock.tsx
// Suite recommendation card

import { View, Text, StyleSheet } from "@react-pdf/renderer";
import {
  SUITE_BORDER,
  SUITE_NAVY,
  SUITE_RADIUS_MD,
  SUITE_TEXT_PRIMARY,
} from "@/components/results/suiteBrandTokens";

const styles = StyleSheet.create({
  container: {
    padding: 12,
    paddingLeft: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: SUITE_RADIUS_MD,
    borderWidth: 1,
    borderColor: SUITE_BORDER,
    borderLeftWidth: 3,
    borderLeftColor: "rgba(7, 176, 242, 0.55)",
    marginBottom: 8,
  },
  title: {
    fontFamily: "Lato",
    fontSize: 11,
    fontWeight: 700,
    color: SUITE_NAVY,
    marginBottom: 5,
    letterSpacing: -0.15,
  },
  text: {
    fontFamily: "Lato",
    fontSize: 9.5,
    color: SUITE_TEXT_PRIMARY,
    lineHeight: 1.55,
  },
});

export const RecommendationBlock = ({
  title,
  text,
}: {
  title: string;
  text: string;
}) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.text}>{text}</Text>
  </View>
);

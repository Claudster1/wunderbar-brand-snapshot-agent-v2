// src/pdf/components/Callout.tsx
// Suite callout / emphasis block

import type { ReactNode } from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import {
  SUITE_BORDER,
  SUITE_RADIUS_MD,
  SUITE_TEXT_PRIMARY,
} from "@/components/results/suiteBrandTokens";

const styles = StyleSheet.create({
  container: {
    padding: 12,
    paddingLeft: 14,
    backgroundColor: "#FFFFFF",
    borderLeftWidth: 3,
    borderLeftColor: "rgba(7, 176, 242, 0.55)",
    marginBottom: 10,
    borderRadius: SUITE_RADIUS_MD,
    borderWidth: 1,
    borderColor: SUITE_BORDER,
  },
  text: {
    fontFamily: "Lato",
    fontSize: 10,
    color: SUITE_TEXT_PRIMARY,
    lineHeight: 1.55,
  },
});

export function Callout({ children }: { children: ReactNode }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

// src/pdf/components/PageTitle.tsx
// Suite intro-band title (eyebrow + title + guidance)

import { View, Text, StyleSheet } from "@react-pdf/renderer";
import {
  SUITE_ACCENT_BRIGHT,
  SUITE_MUTED,
  SUITE_NAVY,
  SUITE_RADIUS_LG,
} from "@/components/results/suiteBrandTokens";

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
    marginHorizontal: 28,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(7, 176, 242, 0.22)",
    borderRadius: SUITE_RADIUS_LG,
    borderLeftWidth: 3,
    borderLeftColor: "rgba(7, 176, 242, 0.55)",
    backgroundColor: "#FFFFFF",
  },
  eyebrow: {
    fontFamily: "Lato",
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 1.1,
    color: SUITE_ACCENT_BRIGHT,
    textTransform: "uppercase",
    marginBottom: 5,
  },
  title: {
    fontFamily: "Lato",
    fontSize: 16,
    fontWeight: 700,
    color: SUITE_NAVY,
    letterSpacing: -0.3,
    lineHeight: 1.25,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "Lato",
    fontSize: 10,
    fontWeight: 400,
    color: SUITE_MUTED,
    lineHeight: 1.5,
  },
});

export const PageTitle = ({
  title,
  subtitle,
  eyebrow = "WunderBrand",
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) => (
  <View style={styles.container}>
    {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
  </View>
);

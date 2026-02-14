import { View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  h1: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 12,
  },
  body: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 10,
  },
  callout: {
    backgroundColor: "#F5F7FB",
    padding: 14,
    borderRadius: 6,
    marginVertical: 12,
  },
});

export function BlueprintCover({ brandName }: { brandName: string }) {
  return (
    <View>
      <Text style={styles.h1}>Your WunderBrand Blueprint™</Text>
      <Text style={styles.body}>
        This document translates the clarity you gained in Snapshot+™ into a
        structured brand system — built specifically for {brandName}.
      </Text>

      <View style={styles.callout}>
        <Text style={styles.body}>
          Blueprint™ is designed to help you apply your brand consistently
          across messaging, channels, tools, and teams — without guesswork.
        </Text>
      </View>
    </View>
  );
}

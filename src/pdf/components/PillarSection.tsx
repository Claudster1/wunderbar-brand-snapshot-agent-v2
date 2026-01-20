// src/pdf/components/PillarSection.tsx

import { View, Text } from "@react-pdf/renderer";

export function PillarSection({
  title,
  score,
  isPrimary,
  insight,
}: {
  title: string;
  score: number;
  isPrimary: boolean;
  insight: string;
}) {
  return (
    <View
      style={{
        marginBottom: isPrimary ? 20 : 10,
        padding: isPrimary ? 12 : 6,
        backgroundColor: isPrimary ? "#F8FAFC" : "transparent",
        borderRadius: 6,
      }}
    >
      <Text style={{ fontSize: isPrimary ? 14 : 11, fontWeight: 600 }}>
        {title} — {score}/20
      </Text>
      <Text style={{ fontSize: 10, marginTop: 4 }}>{insight}</Text>
    </View>
  );
}

// src/pdf/components/PillarSection.tsx

import { View, Text } from "@react-pdf/renderer";

type PillarSectionProps = {
  pillar: string;
  score: number;
  isPrimary: boolean;
};

export function PillarSection({
  pillar,
  score,
  isPrimary,
}: PillarSectionProps) {
  return (
    <View style={{ marginBottom: 24 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: 600 }}>
          {pillar.toUpperCase()}
        </Text>

        <Text style={{ fontSize: 12 }}>{score}/20</Text>
      </View>

      {isPrimary && (
        <View
          style={{
            marginTop: 6,
            backgroundColor: "#E6F2FF",
            padding: 6,
            borderRadius: 4,
            width: "fit-content",
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: 600, color: "#0070F3" }}>
            PRIMARY FOCUS AREA
          </Text>
        </View>
      )}

      {/* Insights + recommendations */}
    </View>
  );
}

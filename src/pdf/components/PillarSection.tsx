// src/pdf/components/PillarSection.tsx

import { View, Text } from "@react-pdf/renderer";
import { ScoreGauge } from "../components/ScoreGauge";

interface PillarSectionProps {
  name: string;
  score: number;
  insight: string;
  recommendation: string;
  emphasis?: "primary" | "secondary" | "tertiary";
}

export function PillarSection({
  name,
  score,
  insight,
  recommendation,
  emphasis = "secondary",
}: PillarSectionProps) {
  const titleSize =
    emphasis === "primary" ? 18 : emphasis === "secondary" ? 15 : 13;

  return (
    <View style={{ marginBottom: emphasis === "primary" ? 32 : 20 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <ScoreGauge score={score} emphasis={emphasis} />

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: titleSize,
              fontWeight: "bold",
              color: "#021859",
              marginBottom: 6,
            }}
          >
            {name}
          </Text>

          <Text style={{ fontSize: 11, color: "#374151", marginBottom: 8 }}>
            {insight}
          </Text>

          {emphasis !== "tertiary" && (
            <Text
              style={{
                fontSize: 11,
                color: "#021859",
                fontWeight: "medium",
              }}
            >
              Priority focus: {recommendation}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

import { View, Text } from "@react-pdf/renderer";
import { ScoreGauge } from "../components/ScoreGauge";

export function SnapshotScoreSection({
  brandAlignmentScore,
  primaryPillar,
}: {
  brandAlignmentScore: number;
  primaryPillar: string;
}) {
  return (
    <View style={{ marginBottom: 32, alignItems: "center" }}>
      <Text style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
        Brand Alignment Score™
      </Text>

      <ScoreGauge score={brandAlignmentScore} size={150} />

      <Text style={{ fontSize: 11, marginTop: 10 }}>
        Primary focus area: {primaryPillar}
      </Text>

      <Text style={{ fontSize: 11, marginTop: 12 }}>
        Snapshot+™ helps you address this directly with prioritized guidance
        focused on {primaryPillar}.
      </Text>
    </View>
  );
}

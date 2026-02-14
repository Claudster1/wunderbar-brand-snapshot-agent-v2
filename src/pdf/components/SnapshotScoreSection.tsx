import { View, Text } from "@react-pdf/renderer";
import { BrandAlignmentScorePanel } from "./BrandAlignmentScorePanel";

export function SnapshotScoreSection({
  brandAlignmentScore,
  primaryPillar,
}: {
  brandAlignmentScore: number;
  primaryPillar: string;
}) {
  return (
    <View style={{ marginBottom: 32 }}>
      <Text style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, textAlign: "center" }}>
        WunderBrand Score™
      </Text>

      <BrandAlignmentScorePanel score={brandAlignmentScore} size={130} />

      <Text style={{ fontSize: 11, marginTop: 10, textAlign: "center" }}>
        Primary focus area: {primaryPillar}
      </Text>

      <Text style={{ fontSize: 11, marginTop: 12, textAlign: "center" }}>
        Snapshot+™ helps you address this directly with prioritized guidance
        focused on {primaryPillar}.
      </Text>
    </View>
  );
}

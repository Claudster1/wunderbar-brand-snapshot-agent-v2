import { View, Text } from "@react-pdf/renderer";

export function ContextCoverageSection({
  coverage,
}: {
  coverage: { pillar: string; covered: boolean }[];
}) {
  return (
    <View style={{ marginTop: 24 }}>
      <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 8 }}>
        Context Coverage Overview
      </Text>

      {coverage.map((item) => (
        <View
          key={item.pillar}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <Text>{item.pillar}</Text>
          <Text style={{ color: item.covered ? "#2E7D32" : "#B71C1C" }}>
            {item.covered ? "Covered" : "Opportunity"}
          </Text>
        </View>
      ))}

      <Text style={{ fontSize: 10, marginTop: 10 }}>
        Snapshot+™ expands on uncovered areas to deliver deeper clarity and
        more precise recommendations.
      </Text>
    </View>
  );
}

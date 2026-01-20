import { View, Text } from "@react-pdf/renderer";

export function BlueprintPlusSection({
  pillar,
  insights,
  contextCoverage,
}: {
  pillar: string;
  insights: string[];
  contextCoverage: number;
}) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
        Blueprint+™ — Advanced {pillar}
      </Text>

      <Text style={{ fontSize: 11, marginBottom: 10 }}>
        This section builds on your Snapshot+™ insights using deeper context
        from your inputs ({contextCoverage}% coverage).
      </Text>

      {insights.map((line, i) => (
        <Text key={i} style={{ fontSize: 11, marginBottom: 4 }}>
          • {line}
        </Text>
      ))}
    </View>
  );
}

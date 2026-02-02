import { View, Text } from "@react-pdf/renderer";

export function ArchetypeSection({
  archetype,
  secondary,
}: {
  archetype: { name: string; definition: string };
  secondary?: { name: string };
}) {
  return (
    <View style={{ marginBottom: 40 }}>
      <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
        Brand Archetype
      </Text>

      <Text style={{ fontSize: 11, color: "#374151", marginBottom: 8 }}>
        Your brand expresses the{" "}
        <Text style={{ fontWeight: "bold" }}>{archetype.name}</Text> archetype
        — guiding how you show up, communicate, and build trust.
      </Text>

      <Text style={{ fontSize: 11, color: "#374151", marginBottom: 12 }}>
        {archetype.definition}
      </Text>

      {secondary && (
        <Text style={{ fontSize: 11, color: "#374151" }}>
          Secondary influence:{" "}
          <Text style={{ fontWeight: "bold" }}>{secondary.name}</Text>
        </Text>
      )}
    </View>
  );
}

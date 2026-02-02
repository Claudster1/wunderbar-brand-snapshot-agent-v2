import { View, Text } from "@react-pdf/renderer";

export function PillarActivationSection({
  pillar,
  emphasis,
}: {
  pillar: {
    name: string;
    whyItMatters: string;
    activations: string[];
  };
  emphasis?: "primary" | "secondary";
}) {
  return (
    <View style={{ marginBottom: emphasis === "primary" ? 40 : 28 }}>
      <Text
        style={{
          fontSize: emphasis === "primary" ? 18 : 15,
          fontWeight: "bold",
          color: "#021859",
          marginBottom: 6,
        }}
      >
        {pillar.name} Activation
      </Text>

      <Text style={{ fontSize: 11, color: "#374151", marginBottom: 10 }}>
        Why this matters: {pillar.whyItMatters}
      </Text>

      <View style={{ marginLeft: 12 }}>
        {pillar.activations.map((item, idx) => (
          <Text
            key={idx}
            style={{
              fontSize: 11,
              color: "#021859",
              marginBottom: 6,
            }}
          >
            • {item}
          </Text>
        ))}
      </View>
    </View>
  );
}

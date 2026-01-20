import { View, Text } from "@react-pdf/renderer";

export function PillarScoreRow({
  label,
  score,
  emphasis = false,
}: {
  label: string;
  score: number;
  emphasis?: boolean;
}) {
  return (
    <View
      style={{
        marginBottom: 8,
        padding: 6,
        backgroundColor: emphasis ? "#EEF2FF" : "transparent",
      }}
    >
      <Text style={{ fontSize: emphasis ? 13 : 11, fontWeight: "bold" }}>
        {label}
      </Text>
      <Text style={{ fontSize: 11 }}>Score: {score}/20</Text>
    </View>
  );
}

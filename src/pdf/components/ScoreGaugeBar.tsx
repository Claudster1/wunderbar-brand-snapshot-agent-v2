import { View } from "@react-pdf/renderer";

export function ScoreGaugeBar({ score }: { score: number }) {
  const percent = Math.round((score / 20) * 100);

  return (
    <View
      style={{
        width: "100%",
        height: 8,
        backgroundColor: "#E5E7EB",
        borderRadius: 4,
        overflow: "hidden",
        marginTop: 6,
        marginBottom: 12,
      }}
    >
      <View
        style={{
          width: `${percent}%`,
          height: "100%",
          backgroundColor:
            percent >= 75 ? "#16A34A" :
            percent >= 50 ? "#EAB308" :
            "#DC2626",
        }}
      />
    </View>
  );
}

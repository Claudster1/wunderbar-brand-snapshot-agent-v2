// src/pdf/components/PdfGauge.tsx

import { View, Text } from "@react-pdf/renderer";

export function PdfGauge({ score }: { score: number }) {
  return (
    <View>
      <Text>Score: {score}%</Text>
      {/* Visual bar representation */}
      <View style={{ height: 6, width: `${score}%`, backgroundColor: "#10B981" }} />
    </View>
  );
}

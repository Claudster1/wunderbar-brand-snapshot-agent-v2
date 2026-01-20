import { View, Text } from "@react-pdf/renderer";
import { pdfStyles } from "../styles";

export function PillarBlock({
  title,
  insight,
  action,
}: {
  title: string;
  insight: string;
  action: string;
}) {
  return (
    <View style={pdfStyles.section}>
      <Text style={pdfStyles.h3}>{title}</Text>
      <Text style={pdfStyles.body}>{insight}</Text>

      <Text style={[pdfStyles.body, { marginTop: 6 }]}>
        Recommended focus:
      </Text>
      <Text style={pdfStyles.body}>{action}</Text>
    </View>
  );
}

import { View, Text } from "@react-pdf/renderer";
import { ScoreGaugeBar as ScoreGauge } from "./ScoreGaugeBar";
import { ContextCoverage, uncoveredPillars } from "@/lib/enrichment/coverage";

type PillarPDFProps = {
  title: string;
  score: number;
  summary: string;
  insight: string;
  appliedContext?: string[];
  nextMove: string;
  coverage: ContextCoverage;
};

export function RenderPillarSection({
  title,
  score,
  summary,
  insight,
  appliedContext,
  nextMove,
  coverage,
}: PillarPDFProps) {
  return (
    <View style={{ marginBottom: 28 }}>
      <Text style={{ fontSize: 16, fontWeight: 700 }}>{title}</Text>
      <Text style={{ fontSize: 12, marginTop: 4 }}>Score: {score}/20</Text>
      <ScoreGauge score={score} />

      <Text style={{ marginTop: 8 }}>{summary}</Text>

      <Text style={{ marginTop: 8, fontWeight: 600 }}>What this means</Text>
      <Text>{insight}</Text>

      {appliedContext?.length ? (
        <>
          <Text style={{ marginTop: 8, fontWeight: 600 }}>
            Context applied
          </Text>
          {appliedContext.map((item, i) => (
            <Text key={i}>• {item}</Text>
          ))}
        </>
      ) : null}

      {uncoveredPillars(coverage).length ? (
        <>
          <Text style={{ marginTop: 8, fontWeight: 600 }}>
            What we could go deeper on
          </Text>
          {uncoveredPillars(coverage).map((item, i) => (
            <Text key={i}>• {item}</Text>
          ))}
        </>
      ) : null}

      <Text style={{ marginTop: 10, fontWeight: 600 }}>Next step</Text>
      <Text>{nextMove}</Text>
    </View>
  );
}

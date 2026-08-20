// src/pdf/components/MainGaugePDF.tsx
// Semicircle WunderBrand Score™ gauge — mirrors results MainGauge

import { View, Text, Svg, Path, Circle, Polygon, StyleSheet } from "@react-pdf/renderer";
import {
  SUITE_BORDER,
  SUITE_MUTED,
  SUITE_NAVY,
} from "@/components/results/suiteBrandTokens";

const NAVY = SUITE_NAVY;
const MUTED = SUITE_MUTED;
const GREEN = "#22C55E";
const GOOD_GREEN = "#4ADE80";
const YELLOW = "#EAB308";
const ORANGE = "#F97316";
const RED_S = "#EF4444";
const BORDER = SUITE_BORDER;

const RANGES = [
  { label: "Strong", min: 80, max: 100, color: GREEN },
  { label: "Good", min: 60, max: 79, color: GOOD_GREEN },
  { label: "Fair", min: 40, max: 59, color: YELLOW },
  { label: "Weak", min: 20, max: 39, color: ORANGE },
  { label: "Critical", min: 0, max: 19, color: RED_S },
] as const;

const COLOR_STOPS: [number, number[]][] = [
  [0, [239, 68, 68]],
  [0.25, [249, 115, 22]],
  [0.45, [234, 179, 8]],
  [0.65, [74, 222, 128]],
  [1, [22, 128, 61]],
];

function interpolateColor(value: number): string {
  let index = 0;
  for (let candidate = 1; candidate < COLOR_STOPS.length; candidate += 1) {
    if (value <= COLOR_STOPS[candidate][0]) {
      index = candidate - 1;
      break;
    }
  }
  if (value >= 1) index = COLOR_STOPS.length - 2;
  const [startAt, startColor] = COLOR_STOPS[index];
  const [endAt, endColor] = COLOR_STOPS[index + 1];
  const fraction = (value - startAt) / (endAt - startAt || 1);
  const r = Math.round(startColor[0] + (endColor[0] - startColor[0]) * fraction);
  const g = Math.round(startColor[1] + (endColor[1] - startColor[1]) * fraction);
  const b = Math.round(startColor[2] + (endColor[2] - startColor[2]) * fraction);
  return `rgb(${r},${g},${b})`;
}

/** Soft tint backgrounds for legend (react-pdf handles hex more reliably than rgba borders). */
function softTint(hex: string): string {
  const map: Record<string, string> = {
    [GREEN]: "#E8F9EF",
    [GOOD_GREEN]: "#ECFCEF",
    [YELLOW]: "#FEF9E7",
    [ORANGE]: "#FFF1E8",
    [RED_S]: "#FEECEC",
  };
  return map[hex] ?? "#F4F7FB";
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  gaugeCol: {
    alignItems: "center",
    width: 210,
    marginRight: 16,
  },
  scoreNumber: {
    fontFamily: "Lato",
    fontSize: 40,
    fontWeight: 700,
    color: NAVY,
    textAlign: "center",
    marginTop: 2,
  },
  scoreOutOf: {
    fontFamily: "Lato",
    fontSize: 11,
    fontWeight: 400,
    color: MUTED,
    textAlign: "center",
    marginTop: 2,
  },
  legend: {
    flex: 1,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 3,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendLabel: {
    fontFamily: "Lato",
    fontSize: 11,
    fontWeight: 700,
    width: 56,
  },
  legendRange: {
    fontFamily: "Lato",
    fontSize: 11,
    fontWeight: 400,
    color: MUTED,
  },
});

export function MainGaugePDF({
  score,
  showLegend = true,
  width = 210,
}: {
  score: number;
  showLegend?: boolean;
  width?: number;
}) {
  const safeScore = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
  const strokeWidth = 20;
  const radius = 68;
  const centerX = width / 2;
  const centerY = radius + strokeWidth / 2 + 18;
  const svgHeight = centerY + 4;

  const point = (degrees: number, pointRadius: number) => {
    const radians = (degrees * Math.PI) / 180;
    return {
      x: Math.round((centerX + pointRadius * Math.cos(radians)) * 100) / 100,
      y: Math.round((centerY - pointRadius * Math.sin(radians)) * 100) / 100,
    };
  };

  const segmentCount = 60;
  const segments = Array.from({ length: segmentCount }, (_, index) => {
    const firstAngle = 180 - (index / segmentCount) * 180;
    const secondAngle = 180 - ((index + 1) / segmentCount) * 180;
    const first = point(firstAngle, radius);
    const second = point(secondAngle, radius);
    return {
      d: `M ${first.x.toFixed(2)} ${first.y.toFixed(2)} A ${radius} ${radius} 0 0 0 ${second.x.toFixed(2)} ${second.y.toFixed(2)}`,
      color: interpolateColor((index + 0.5) / segmentCount),
    };
  });

  const needleAngle = 180 - (safeScore / 100) * 180;
  const needleTip = point(needleAngle, radius - 2);
  const needleBaseOne = point(needleAngle + 90, 3);
  const needleBaseTwo = point(needleAngle - 90, 3);
  const needleTail = point(needleAngle + 180, 14);
  const leftCap = point(180, radius);
  const rightCap = point(0, radius);

  return (
    <View style={styles.row}>
      <View style={styles.gaugeCol}>
        <Svg width={width} height={svgHeight}>
          {segments.map((segment, index) => (
            <Path
              key={index}
              d={segment.d}
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
              fill="none"
            />
          ))}
          <Circle cx={leftCap.x} cy={leftCap.y} r={strokeWidth / 2} fill={interpolateColor(0)} />
          <Circle cx={rightCap.x} cy={rightCap.y} r={strokeWidth / 2} fill={interpolateColor(1)} />
          {[0, 20, 40, 60, 80, 100].map((tick) => {
            const labelPoint = point(180 - (tick / 100) * 180, radius + strokeWidth / 2 + 12);
            return (
              <Text
                key={tick}
                x={labelPoint.x}
                y={labelPoint.y + 3}
                textAnchor="middle"
                fill="#94A3B8"
                style={{ fontSize: 8, fontFamily: "Lato", fontWeight: 700 }}
              >
                {String(tick)}
              </Text>
            );
          })}
          <Polygon
            points={`${needleTip.x},${needleTip.y} ${needleBaseOne.x},${needleBaseOne.y} ${needleTail.x},${needleTail.y} ${needleBaseTwo.x},${needleBaseTwo.y}`}
            fill={NAVY}
          />
          <Circle cx={centerX} cy={centerY} r={5} fill={NAVY} />
          <Circle cx={centerX} cy={centerY} r={2} fill="#FFFFFF" />
        </Svg>
        <Text style={styles.scoreNumber}>{safeScore}</Text>
        <Text style={styles.scoreOutOf}>out of 100</Text>
      </View>

      {showLegend ? (
        <View style={styles.legend}>
          {RANGES.map((range) => {
            const active = safeScore >= range.min && safeScore <= range.max;
            return (
              <View
                key={range.label}
                style={[
                  styles.legendRow,
                  active
                    ? {
                        backgroundColor: softTint(range.color),
                        borderWidth: 1.5,
                        borderColor: range.color,
                      }
                    : {
                        borderWidth: 1,
                        borderColor: BORDER,
                        backgroundColor: "#FFFFFF",
                      },
                ]}
              >
                <View style={[styles.legendDot, { backgroundColor: range.color }]} />
                <Text style={[styles.legendLabel, { color: active ? range.color : MUTED }]}>
                  {range.label}
                </Text>
                <Text style={styles.legendRange}>
                  {range.min}–{range.max}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

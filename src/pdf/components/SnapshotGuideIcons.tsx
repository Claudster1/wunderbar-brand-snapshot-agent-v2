// src/pdf/components/SnapshotGuideIcons.tsx
// react-pdf ports of Snapshot results guide icons (PillarIcon, SummaryCardIcon, BrandArchetypeIcon)

import { View, Text, Svg, Path, Circle, Ellipse, Rect, StyleSheet } from "@react-pdf/renderer";
import { SUITE_ACCENT_BRIGHT, SUITE_NAVY } from "@/components/results/suiteBrandTokens";

const BLUE = SUITE_ACCENT_BRIGHT;
const WHITE = "#FFFFFF";

const styles = StyleSheet.create({
  iconWrap: {
    marginRight: 8,
    marginTop: 1,
  },
  summaryIconWrap: {
    marginBottom: 6,
    alignSelf: "center",
  },
  archetypeWrap: {
    marginBottom: 8,
    alignItems: "center",
  },
  numberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  numberText: {
    fontFamily: "Lato",
    fontSize: 10,
    fontWeight: 900,
    color: WHITE,
  },
});

export function SummaryGuideIcon({
  kind,
  size = 18,
}: {
  kind: "overall" | "strongest" | "opportunity";
  size?: number;
}) {
  if (kind === "overall") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Circle cx="12" cy="12" r="10" stroke={BLUE} strokeWidth="2" fill="none" />
        <Path d="M12 6v6l4 2" stroke={BLUE} strokeWidth="2" strokeLinecap="round" fill="none" />
      </Svg>
    );
  }
  if (kind === "strongest") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M12 2l3 7h7l-5.5 4.5 2 7L12 16l-6.5 4.5 2-7L2 9h7z"
          stroke={BLUE}
          strokeWidth="2"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M10.3 3.2L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.2a2 2 0 00-3.4 0z"
        stroke={BLUE}
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
      <Path d="M12 9v4M12 17h.01" stroke={BLUE} strokeWidth="2" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function PillarGuideIcon({
  pillar,
  size = 16,
}: {
  pillar: string;
  size?: number;
}) {
  const key = pillar.toLowerCase();
  if (key === "positioning") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Circle cx="12" cy="12" r="10" stroke={BLUE} strokeWidth="1.8" fill="none" />
        <Circle cx="12" cy="12" r="6" stroke={BLUE} strokeWidth="1.5" fill="none" />
        <Circle cx="12" cy="12" r="2.5" fill={BLUE} />
      </Svg>
    );
  }
  if (key === "messaging") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M4 4h16v12H8l-4 4V4z" stroke={BLUE} strokeWidth="1.8" strokeLinejoin="round" fill="none" />
        <Path d="M8 8h8M8 11h5" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </Svg>
    );
  }
  if (key === "visibility") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
          stroke={BLUE}
          strokeWidth="1.8"
          strokeLinejoin="round"
          fill="none"
        />
        <Circle cx="12" cy="12" r="3.5" stroke={BLUE} strokeWidth="1.8" fill="none" />
        <Circle cx="12" cy="12" r="1.5" fill={BLUE} />
      </Svg>
    );
  }
  if (key === "credibility") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M12 2l2.9 5.8L21 9l-4.5 4.4 1.1 6.3L12 17l-5.6 2.7 1.1-6.3L3 9l6.1-1.2L12 2z"
          stroke={BLUE}
          strokeWidth="1.8"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    );
  }
  // conversion + default
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 3v14M8 13l4 4 4-4"
        stroke={BLUE}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path d="M5 20h14" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function PillarIconTile({ pillar }: { pillar: string }) {
  return (
    <View style={styles.iconWrap}>
      <PillarGuideIcon pillar={pillar} size={16} />
    </View>
  );
}

/** Simplified archetype glyphs for PDF (mirrors BrandArchetypeIcon outlines). */
export function ArchetypeGuideIcon({
  archetype,
  size = 56,
}: {
  archetype?: string | null;
  size?: number;
}) {
  const name = (archetype || "").toLowerCase();
  const sw = 2.2;

  if (name.includes("sage") || name.includes("guide")) {
    return (
      <Svg width={size} height={size} viewBox="0 0 48 56">
        <Ellipse cx="24" cy="30" rx="16" ry="20" stroke={BLUE} strokeWidth={sw} fill="none" />
        <Circle cx="17" cy="26" r="7.5" stroke={BLUE} strokeWidth={sw} fill="none" />
        <Circle cx="31" cy="26" r="7.5" stroke={BLUE} strokeWidth={sw} fill="none" />
        <Circle cx="17" cy="26" r="4" fill={BLUE} />
        <Circle cx="31" cy="26" r="4" fill={BLUE} />
        <Path d="M22 35l2 3.5 2-3.5" stroke={BLUE} strokeWidth={sw} strokeLinecap="round" fill="none" />
        <Path d="M10 14l8 7M38 14l-8 7" stroke={BLUE} strokeWidth={sw} strokeLinecap="round" fill="none" />
      </Svg>
    );
  }
  if (name.includes("explorer")) {
    return (
      <Svg width={size} height={size} viewBox="0 0 48 56">
        <Path d="M4 48l14-28 10 14 6-8 10 22H4z" stroke={BLUE} strokeWidth={sw} strokeLinejoin="round" fill="none" />
        <Circle cx="36" cy="14" r="5" stroke={BLUE} strokeWidth={sw} fill="none" />
      </Svg>
    );
  }
  if (name.includes("hero")) {
    return (
      <Svg width={size} height={size} viewBox="0 0 48 56">
        <Path
          d="M24 4L6 14v14c0 12 8 19 18 24 10-5 18-12 18-24V14L24 4z"
          stroke={BLUE}
          strokeWidth={sw}
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    );
  }
  if (name.includes("creator")) {
    return (
      <Svg width={size} height={size} viewBox="0 0 48 56">
        <Rect x="4" y="18" width="40" height="28" rx="4" stroke={BLUE} strokeWidth={sw} fill="none" />
        <Circle cx="24" cy="33" r="9" stroke={BLUE} strokeWidth={sw} fill="none" />
      </Svg>
    );
  }
  if (name.includes("caregiver")) {
    return (
      <Svg width={size} height={size} viewBox="0 0 48 56">
        <Path
          d="M18 10h12v12h12v12H30v12H18V34H6V22h12V10z"
          stroke={BLUE}
          strokeWidth={sw}
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    );
  }
  if (name.includes("ruler")) {
    return (
      <Svg width={size} height={size} viewBox="0 0 48 56">
        <Path d="M6 44V12l9 10 9-18 9 18 9-10v32H6z" stroke={BLUE} strokeWidth={sw} strokeLinejoin="round" fill="none" />
      </Svg>
    );
  }
  if (name.includes("magician")) {
    return (
      <Svg width={size} height={size} viewBox="0 0 48 56">
        <Path
          d="M24 4l6 14h15l-12 10 5 15-14-9-14 9 5-15L3 18h15z"
          stroke={BLUE}
          strokeWidth={sw}
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    );
  }
  // Default: mark / crosshair
  return (
    <Svg width={size} height={size} viewBox="0 0 48 56">
      <Circle cx="24" cy="24" r="14" stroke={BLUE} strokeWidth={sw} fill="none" />
      <Path d="M24 14v20M14 24h20" stroke={BLUE} strokeWidth={sw} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function ArchetypeIconTile({ archetype }: { archetype?: string | null }) {
  return (
    <View style={styles.archetypeWrap}>
      <ArchetypeGuideIcon archetype={archetype} size={64} />
    </View>
  );
}

export function StepNumberBadge({ n }: { n: number }) {
  return (
    <View style={styles.numberBadge}>
      <Text style={styles.numberText}>{n}</Text>
    </View>
  );
}

/** Small check / alert markers for Working / Unclear cards */
export function StatusMark({ kind }: { kind: "working" | "unclear" }) {
  if (kind === "working") {
    return (
      <Svg width={12} height={12} viewBox="0 0 12 12">
        <Circle cx="6" cy="6" r="5.5" fill="#22C55E" />
        <Path d="M3.5 6.2l1.6 1.6 3.4-3.4" stroke={WHITE} strokeWidth="1.4" strokeLinecap="round" fill="none" />
      </Svg>
    );
  }
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12">
      <Circle cx="6" cy="6" r="5.5" fill="#F97316" />
      <Path d="M6 3.5v3M6 8.5h.01" stroke={WHITE} strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function SummaryIconTile({ kind }: { kind: "overall" | "strongest" | "opportunity" }) {
  return (
    <View style={styles.summaryIconWrap}>
      <SummaryGuideIcon kind={kind} size={18} />
    </View>
  );
}

export { BLUE as GUIDE_BLUE, SUITE_NAVY as GUIDE_NAVY };

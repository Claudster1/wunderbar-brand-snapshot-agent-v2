import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
  Link,
} from "@react-pdf/renderer";

const LOGO_URL = "https://d268zs2sdbzvo0.cloudfront.net/66e09bd196e8d5672b143fb8_528e12f9-22c9-4c46-8d90-59238d4c8141_logo.webp";

Font.register({
  family: "Inter",
  fonts: [{ src: "https://fonts.gstatic.com/s/inter/v12/UcCO3H6mNWsBAg.ttf" }],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Inter",
    fontSize: 11,
    color: "#0C1526",
    lineHeight: 1.5,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 10,
    color: "#021859",
    fontWeight: 600,
  },
  block: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#F5F7FB",
    borderRadius: 6,
  },
  header: {
    paddingBottom: 16,
    borderBottom: "2px solid #021859",
    marginBottom: 24,
  },
  title: { fontSize: 28, color: "#021859", marginBottom: 4 },
  listItem: { marginBottom: 6 },
});

const pillarLabels: Record<string, string> = {
  positioning: "Positioning",
  messaging: "Messaging",
  visibility: "Visibility",
  credibility: "Credibility",
  conversion: "Conversion",
};

function DocFooter({ businessName }: { businessName?: string }) {
  return (
    <View style={{ position: "absolute", bottom: 16, left: 40, right: 40, borderTop: "0.5px solid #E5E7EB", paddingTop: 6 }} fixed>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 7, color: "#9CA3AF" }}>© {new Date().getFullYear()} Wunderbar Digital · WunderBrand Blueprint+™</Text>
        <Link src="https://wunderbardigital.com" style={{ fontSize: 7, color: "#07B0F2", textDecoration: "none" }}>wunderbardigital.com</Link>
      </View>
      {businessName && (
        <Text style={{ fontSize: 6.5, color: "#B0B8C4", textAlign: "center", marginTop: 3 }}>
          Confidential — Prepared exclusively for {businessName}. Unauthorized distribution is prohibited.
        </Text>
      )}
    </View>
  );
}

export function BlueprintPlusDocument({ data }: { data: any }) {
  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const businessName = data.businessName;

  const hasFoundation =
    typeof data.brandAlignmentScore === "number" &&
    data.pillarScores &&
    typeof data.pillarScores.positioning === "number";
  const hasBlueprintContent =
    data.brandEssence ?? data.brandPromise ?? data.differentiation ?? data.messagingPillars?.length;
  const brandStory = data.brandStory ?? {};
  const positioning = data.positioning ?? {};
  const journey = Array.isArray(data.journey) ? data.journey : [];
  const contentRoadmap = Array.isArray(data.contentRoadmap) ? data.contentRoadmap : [];
  const visualDirection = Array.isArray(data.visualDirection) ? data.visualDirection : [];
  const decisionFilters = Array.isArray(data.decisionFilters) ? data.decisionFilters : [];
  const aiPrompts = Array.isArray(data.aiPrompts) ? data.aiPrompts : [];

  return (
    <Document>
      {/* PAGE 1 — COVER */}
      <Page size="A4" style={styles.page}>
        <Image src={LOGO_URL} style={{ width: 100, marginBottom: 16 }} />
        <View style={styles.header}>
          <Text style={styles.title}>WunderBrand Blueprint+™</Text>
          <Text>The advanced strategic foundation for scalable brand growth.</Text>
        </View>

        <Text>Prepared for {businessName || data.userName || "you"}</Text>
        <Text style={{ fontSize: 10, color: "#6B7280", marginTop: 4 }}>{reportDate}</Text>
        <Text style={{ marginTop: 12 }}>
          This report synthesizes deeper customer insights, narrative frameworks,
          positioning strategy, and execution plans into a single, actionable system
          designed for clarity, alignment, and growth.
        </Text>
        <Text style={{ fontSize: 9, color: "#9CA3AF", marginTop: 24, textAlign: "center" }}>
          Confidential — Prepared exclusively for {businessName || data.userName || "you"}
        </Text>
        <DocFooter businessName={businessName} />
      </Page>

      {/* Foundation: WunderBrand Score™ + Pillars (when provided) */}
      {hasFoundation && (
        <>
          <Page size="A4" style={styles.page}>
            <Text style={styles.sectionTitle}>WunderBrand Score™</Text>
            <View style={styles.block}>
              <Text style={{ fontSize: 28, fontWeight: 700, color: "#021859" }}>
                {data.brandAlignmentScore}
              </Text>
              <Text>out of 100</Text>
            </View>
            {data.primaryPillar && (
              <View style={styles.block}>
                <Text style={{ fontWeight: 600 }}>Primary focus area</Text>
                <Text>{pillarLabels[data.primaryPillar] ?? data.primaryPillar}</Text>
              </View>
            )}
            {typeof data.contextCoverage === "number" && (
              <View style={styles.block}>
                <Text style={{ fontWeight: 600 }}>Context coverage</Text>
                <Text>{data.contextCoverage}%</Text>
              </View>
            )}
            <DocFooter businessName={businessName} />
          </Page>
          <Page size="A4" style={styles.page}>
            <Text style={styles.sectionTitle}>Brand Pillar Analysis</Text>
            {data.pillarScores &&
              Object.entries(data.pillarScores).map(([key, score]: [string, unknown]) => (
                <View key={key} style={styles.block}>
                  <Text style={{ fontWeight: 600 }}>
                    {pillarLabels[key] ?? key} — {String(score)}/20
                  </Text>
                  {data.pillarInsights?.[key] && <Text style={{ marginTop: 6 }}>{data.pillarInsights[key]}</Text>}
                  {data.recommendations?.[key] && (
                    <Text style={{ marginTop: 6, fontStyle: "italic" }}>{data.recommendations[key]}</Text>
                  )}
                </View>
              ))}
            <DocFooter businessName={businessName} />
          </Page>
        </>
      )}

      {/* Blueprint content: Essence, Promise, Differentiation, Persona, Archetype, Voice, Messaging, Color, Prompts */}
      {hasBlueprintContent && (
        <>
          {(data.brandEssence ?? data.brandPromise ?? data.differentiation) && (
            <Page size="A4" style={styles.page}>
              {data.brandEssence && (
                <>
                  <Text style={styles.sectionTitle}>Brand Essence</Text>
                  <View style={styles.block}><Text>{data.brandEssence}</Text></View>
                </>
              )}
              {data.brandPromise && (
                <>
                  <Text style={styles.sectionTitle}>Brand Promise</Text>
                  <View style={styles.block}><Text>{data.brandPromise}</Text></View>
                </>
              )}
              {data.differentiation && (
                <>
                  <Text style={styles.sectionTitle}>Differentiation</Text>
                  <View style={styles.block}><Text>{data.differentiation}</Text></View>
                </>
              )}
              <DocFooter businessName={businessName} />
            </Page>
          )}
          {(data.persona ?? data.archetype) && (
            <Page size="A4" style={styles.page}>
              {data.persona && (
                <>
                  <Text style={styles.sectionTitle}>Brand Persona</Text>
                  <View style={styles.block}>
                    <Text>
                      {typeof data.persona === "string"
                        ? data.persona
                        : data.persona?.summary ?? data.persona?.description ?? ""}
                    </Text>
                  </View>
                </>
              )}
              {data.archetype && (
                <>
                  <Text style={styles.sectionTitle}>Brand Archetype</Text>
                  <View style={styles.block}>
                    <Text>
                      {typeof data.archetype === "string"
                        ? data.archetype
                        : data.archetype?.summary ?? data.archetype?.description ?? ""}
                    </Text>
                  </View>
                </>
              )}
              <DocFooter businessName={businessName} />
            </Page>
          )}
          {Array.isArray(data.toneOfVoice) && data.toneOfVoice.length > 0 && (
            <Page size="A4" style={styles.page}>
              <Text style={styles.sectionTitle}>Tone of Voice</Text>
              {data.toneOfVoice.map((t: any, idx: number) => (
                <View key={idx} style={styles.block}>
                  <Text style={{ fontWeight: 600 }}>{t.name}</Text>
                  <Text>{t.detail}</Text>
                </View>
              ))}
              <DocFooter businessName={businessName} />
            </Page>
          )}
          {Array.isArray(data.messagingPillars) && data.messagingPillars.length > 0 && (
            <Page size="A4" style={styles.page}>
              <Text style={styles.sectionTitle}>Messaging Pillars</Text>
              {data.messagingPillars.map((p: any, idx: number) => (
                <View key={idx} style={styles.block}>
                  <Text style={{ fontWeight: 600 }}>{p.title}</Text>
                  <Text>{p.detail}</Text>
                </View>
              ))}
              <DocFooter businessName={businessName} />
            </Page>
          )}
          {Array.isArray(data.colorPalette) && data.colorPalette.length > 0 && (
            <Page size="A4" style={styles.page}>
              <Text style={styles.sectionTitle}>Recommended Color Palette</Text>
              {data.colorPalette.map((c: any, idx: number) => (
                <View key={idx} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                  <View style={{ width: 20, height: 20, backgroundColor: c.hex ?? "#000", border: "1px solid #000", marginRight: 12 }} />
                  <Text>{c.name ?? ""} — {c.hex ?? ""}</Text>
                </View>
              ))}
              <DocFooter businessName={businessName} />
            </Page>
          )}
        </>
      )}

      {/* PAGE — BRAND STORY FRAMEWORK */}
      {(brandStory.long ?? brandStory.short) && (
        <Page size="A4" style={styles.page}>
          {brandStory.long && (
            <>
              <Text style={styles.sectionTitle}>Brand Story Framework</Text>
              <View style={styles.block}><Text>{brandStory.long}</Text></View>
            </>
          )}
          {brandStory.short && (
            <>
              <Text style={styles.sectionTitle}>Elevator Pitch</Text>
              <View style={styles.block}><Text>{brandStory.short}</Text></View>
            </>
          )}
          <DocFooter businessName={businessName} />
        </Page>
      )}

      {/* PAGE — POSITIONING PLATFORM */}
      {(positioning.statement ?? (Array.isArray(positioning.differentiators) && positioning.differentiators.length > 0)) && (
        <Page size="A4" style={styles.page}>
          {positioning.statement && (
            <>
              <Text style={styles.sectionTitle}>Positioning Statement</Text>
              <View style={styles.block}><Text>{positioning.statement}</Text></View>
            </>
          )}
          {Array.isArray(positioning.differentiators) && positioning.differentiators.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Differentiation Matrix</Text>
              {positioning.differentiators.map((d: any, idx: number) => (
                <View key={idx} style={styles.block}>
                  <Text style={{ fontWeight: 600 }}>{d.name}</Text>
                  <Text>{d.detail}</Text>
                </View>
              ))}
            </>
          )}
          <DocFooter businessName={businessName} />
        </Page>
      )}

      {/* CUSTOMER JOURNEY */}
      {journey.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Customer Journey Map</Text>
          {journey.map((stage: any, idx: number) => (
            <View key={idx} style={styles.block}>
              <Text style={{ fontWeight: 600 }}>{stage.stage}</Text>
              <Text>Goal: {stage.goal}</Text>
              <Text>Emotion: {stage.emotion}</Text>
              <Text>Opportunities: {stage.opportunities}</Text>
            </View>
          ))}
          <DocFooter businessName={businessName} />
        </Page>
      )}

      {/* 12-MONTH CONTENT ROADMAP */}
      {contentRoadmap.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>12-Month Content Roadmap</Text>
          {contentRoadmap.map((m: any, idx: number) => (
            <View key={idx} style={styles.block}>
              <Text style={{ fontWeight: 600 }}>{m.month}</Text>
              <Text>{m.theme}</Text>
            </View>
          ))}
          <DocFooter businessName={businessName} />
        </Page>
      )}

      {/* VISUAL DIRECTION */}
      {visualDirection.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Visual Direction</Text>
          {visualDirection.map((v: any, idx: number) => (
            <View key={idx} style={styles.block}>
              <Text style={{ fontWeight: 600 }}>{v.category}</Text>
              <Text>{v.description}</Text>
            </View>
          ))}
          <DocFooter businessName={businessName} />
        </Page>
      )}

      {/* PERSONALITY + DECISION FILTERS */}
      {(data.personality ?? decisionFilters.length > 0) && (
        <Page size="A4" style={styles.page}>
          {data.personality && (
            <>
              <Text style={styles.sectionTitle}>Brand Personality</Text>
              <View style={styles.block}><Text>{data.personality}</Text></View>
            </>
          )}
          {decisionFilters.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Decision Filters</Text>
              {decisionFilters.map((f: any, idx: number) => (
                <View key={idx} style={styles.block}><Text>• {f}</Text></View>
              ))}
            </>
          )}
          <DocFooter businessName={businessName} />
        </Page>
      )}

      {/* AI PROMPT LIBRARY */}
      {aiPrompts.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>AI Prompt Library — Extended</Text>
          {aiPrompts.map((p: any, idx: number) => (
            <View key={idx} style={styles.block}>
              <Text style={{ fontWeight: 600 }}>{p.name}</Text>
              <Text>{p.prompt}</Text>
            </View>
          ))}
          <DocFooter businessName={businessName} />
        </Page>
      )}

      {/* ADDITIONAL PAGES */}
      {data.additionalSections?.map((section: any, idx: number) => (
        <Page key={idx} size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.block}>
            <Text>{section.content}</Text>
          </View>
          <DocFooter businessName={businessName} />
        </Page>
      ))}

      {/* SERVICES — Managed Marketing & AI Consulting (no product upsell) */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Work with us</Text>
        <Text style={{ marginBottom: 16 }}>
          Put your brand system into action with our services:
        </Text>
        <View style={[styles.block, { marginBottom: 16 }]}>
          <Text style={{ fontWeight: 600, marginBottom: 6 }}>Managed Marketing</Text>
          <Text>
            We run your marketing so you can focus on your business — strategy, content,
            campaigns, and performance aligned to your brand.
          </Text>
        </View>
        <View style={styles.block}>
          <Text style={{ fontWeight: 600, marginBottom: 6 }}>AI Consulting</Text>
          <Text>
            We help you adopt AI confidently — from brand-safe prompts and workflows to
            AI strategy and implementation so your brand stays consistent at scale.
          </Text>
        </View>
        <Text style={{ marginTop: 20, fontSize: 10, color: "#5a6c8a" }}>
          wunderbardigital.com — Get in touch to learn more.
        </Text>
        <DocFooter businessName={businessName} />
      </Page>
    </Document>
  );
}



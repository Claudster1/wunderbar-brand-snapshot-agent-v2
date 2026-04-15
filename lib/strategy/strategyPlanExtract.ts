/**
 * Pulls Blueprint-style `full_report` fragments into prose-first blocks for the Strategy tab.
 * Shapes are defensive — AI output uses camelCase; we tolerate partial objects.
 */

import { readerFriendlyTrackingRow } from "@/lib/strategy/strategyReaderFriendly";

function asRecord(v: unknown): Record<string, unknown> | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}

function asString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export type StrategyNarrativeBlock = {
  title: string;
  body: string;
  /** Distinct chrome in Strategy tab (e.g. per-ICP playbooks in Sales & Marketing Alignment). */
  visualVariant?: "icp-playbook";
  /** 1-based index among ICP playbook blocks in the section (accent rotation). */
  icpPlaybookIndex?: number;
};

export type StrategyPlanTableRow = {
  label: string;
  value: string;
  /** Optional parallel phrasing for briefings — never replaces `value`. */
  readerFriendly?: string;
};

export type StrategyPlanSection = {
  id: string;
  label: string;
  intro: string;
  blocks: StrategyNarrativeBlock[];
  /** Optional compact tables — rendered as strategy evidence, not task lists */
  tables?: { caption: string; rows: StrategyPlanTableRow[] }[];
};

function joinParagraphs(...parts: string[]): string {
  return parts.filter(Boolean).join("\n\n");
}

export function extractOutcomesAndMeasurement(diagnostic: Record<string, unknown>): StrategyPlanSection | null {
  const mf = asRecord(diagnostic.measurementFramework);
  const sc = asRecord(diagnostic.brandHealthScorecard);
  const ex = asRecord(diagnostic.executiveSummary);

  const blocks: StrategyNarrativeBlock[] = [];
  if (mf) {
    const overview = asString(mf.overview);
    if (overview) blocks.push({ title: "How we measure progress", body: overview });
  }
  if (sc) {
    const overview = asString(sc.overview);
    if (overview) blocks.push({ title: "Brand health lens", body: overview });
  }

  const tables: StrategyPlanSection["tables"] = [];

  const perSection = Array.isArray(mf?.perSectionKPIs) ? mf.perSectionKPIs : [];
  if (perSection.length > 0) {
    const rows = perSection.slice(0, 10).map((raw) => {
      const r = asRecord(raw) ?? {};
      const section = asString(r.section) || "Focus area";
      const kpi = asString(r.kpi);
      const target = asString(r.target);
      const rec = asString(r.recommendation);
      const value = joinParagraphs(
        kpi && `KPI: ${kpi}`,
        target && `Target: ${target}`,
        rec && `Direction: ${rec}`,
      );
      return { label: section, value: value || "—" };
    });
    tables.push({ caption: "KPI map by strategic focus", rows });
  }

  const leading = Array.isArray(mf?.leadingIndicators) ? mf.leadingIndicators : [];
  if (leading.length > 0) {
    const rows = leading.slice(0, 8).map((raw) => {
      const r = asRecord(raw) ?? {};
      const ind = asString(r.indicator) || "Indicator";
      const means = asString(r.whatItMeans);
      const tf = asString(r.timeframe);
      return {
        label: ind,
        value: joinParagraphs(means, tf && `Cadence: ${tf}`),
      };
    });
    tables.push({ caption: "Leading signals to watch", rows });
  }

  const dims = Array.isArray(sc?.scorecardDimensions) ? sc.scorecardDimensions : [];
  if (dims.length > 0) {
    const rows = dims.slice(0, 8).map((raw) => {
      const r = asRecord(raw) ?? {};
      const dim = asString(r.dimension) || "Dimension";
      const cur = asString(r.currentState);
      const tgt = asString(r.targetState);
      const km = asString(r.keyMetric);
      return {
        label: dim,
        value: joinParagraphs(
          cur && `Today: ${cur}`,
          tgt && `Aim: ${tgt}`,
          km && `Primary metric: ${km}`,
        ),
      };
    });
    tables.push({ caption: "Scorecard dimensions", rows });
  }

  const liSc = Array.isArray(sc?.leadingIndicators) ? sc.leadingIndicators : [];
  if (liSc.length > 0 && blocks.length < 4) {
    const body = liSc
      .slice(0, 6)
      .map((raw) => {
        const r = asRecord(raw) ?? {};
        const ind = asString(r.indicator);
        const w = asString(r.whatItMeans);
        const a = asString(r.actionToTake);
        if (!ind && !w) return "";
        return joinParagraphs(ind && `${ind}`, w, a && `Implication: ${a}`);
      })
      .filter(Boolean)
      .join("\n\n");
    if (body) blocks.push({ title: "Early-warning indicators", body });
  }

  const lag = Array.isArray(sc?.laggingIndicators) ? sc.laggingIndicators : [];
  if (lag.length > 0) {
    const body = lag
      .slice(0, 5)
      .map((raw) => {
        const r = asRecord(raw) ?? {};
        return joinParagraphs(
          asString(r.indicator) && `${asString(r.indicator)}`,
          asString(r.whatItMeans),
          asString(r.benchmarkContext) && `Context: ${asString(r.benchmarkContext)}`,
        );
      })
      .filter(Boolean)
      .join("\n\n");
    if (body) blocks.push({ title: "Lagging outcomes", body });
  }

  const track = Array.isArray(mf?.trackingRecommendations) ? mf.trackingRecommendations : [];
  if (track.length > 0) {
    const rows = track.slice(0, 8).map((raw) => {
      const r = asRecord(raw) ?? {};
      const m = asString(r.metric) || "Metric";
      const tool = asString(r.tool);
      const how = asString(r.howToSetUp);
      const freq = asString(r.frequency);
      const fromModel = asString(r.readerFriendlyOneLiner) || asString(r.reader_friendly_one_liner);
      const readerFriendly =
        readerFriendlyTrackingRow({
          metric: m,
          tool,
          howToSetUp: how,
          frequency: freq,
          readerFriendlyOneLiner: fromModel || undefined,
        }) ?? undefined;
      return {
        label: m,
        value: joinParagraphs(tool && `Tool: ${tool}`, how, freq && `Review: ${freq}`),
        ...(readerFriendly ? { readerFriendly } : {}),
      };
    });
    tables.push({ caption: "Instrumentation choices", rows });
  }

  const focusPrimary = asString(ex?.primaryFocusArea);
  const focusSecondary = asString(ex?.secondaryFocusArea);
  const northStar =
    focusPrimary && focusSecondary
      ? `Executive focus pairs “${focusPrimary}” with “${focusSecondary}”—measurement below should prove movement on those themes, not vanity activity.`
      : focusPrimary
        ? `Primary executive focus: “${focusPrimary}”. Metrics should show whether marketing and sales outreach are changing buyer behavior there.`
        : "";

  const intro = joinParagraphs(
    "This is the accountability layer: what improves, how you know, and which signals fire before revenue moves.",
    northStar,
  );

  const hasCore = blocks.length > 0 || (tables?.length ?? 0) > 0;
  if (!hasCore) return null;

  return {
    id: "strategy-outcomes-measurement",
    label: "Outcomes & Measurement",
    intro,
    blocks,
    tables,
  };
}

export function extractConversionAndWeb(diagnostic: Record<string, unknown>): StrategyPlanSection | null {
  const cs = asRecord(diagnostic.conversionStrategy);
  const web = asRecord(diagnostic.websiteCopyDirection);

  const blocks: StrategyNarrativeBlock[] = [];

  /** Thesis first — what conversion *means* for the brand, before page fragments or CTAs. */
  if (cs) {
    const trust = asString(cs.howTrustIsBuilt);
    const clarity = asString(cs.howClarityDrivesAction);
    if (trust) blocks.push({ title: "How trust converts", body: trust });
    if (clarity) blocks.push({ title: "How clarity drives action", body: clarity });
  }

  if (web) {
    const overview = asString(web.overview);
    if (overview) blocks.push({ title: "Web experience strategy", body: overview });

    const principles = Array.isArray(web.copyPrinciples) ? web.copyPrinciples : [];
    if (principles.length > 0) {
      const body = principles
        .slice(0, 6)
        .map((raw) => {
          const r = asRecord(raw) ?? {};
          return joinParagraphs(
            asString(r.principle) && `${asString(r.principle)}`,
            asString(r.example) && `Example: ${asString(r.example)}`,
          );
        })
        .filter(Boolean)
        .join("\n\n");
      if (body) blocks.push({ title: "Copy principles for the experience", body });
    }

    const about = asRecord(web.aboutPage);
    if (about) {
      const parts = [asString(about.openingHook), asString(about.storyFramework), asString(about.teamPositioning)].filter(
        Boolean,
      );
      if (parts.length) blocks.push({ title: "About page narrative", body: parts.join("\n\n") });
    }

    const svc = asRecord(web.servicesPage);
    if (svc) {
      const parts = [asString(svc.pageStructure), asString(svc.serviceFramework), asString(svc.pricingLanguage)].filter(
        Boolean,
      );
      if (parts.length) blocks.push({ title: "Services and offer pages", body: parts.join("\n\n") });
    }

    const hp = asRecord(web.homepage);
    if (hp) {
      const parts = [
        asString(hp.heroHeadline) && `Opening promise: ${asString(hp.heroHeadline)}`,
        asString(hp.heroSubheadline) && `${asString(hp.heroSubheadline)}`,
        asString(hp.heroCtaButton) && `Primary ask on the entry experience: ${asString(hp.heroCtaButton)}`,
        asString(hp.valuePropSection) && `How value is framed after the fold: ${asString(hp.valuePropSection)}`,
        asString(hp.socialProofPlacement) && `Where proof shows up for new visitors: ${asString(hp.socialProofPlacement)}`,
      ].filter(Boolean);
      if (parts.length) blocks.push({ title: "Primary web narrative", body: parts.join("\n\n") });
    }
  }

  /** CTA hierarchy last: one strategic block, prose-first (not a field-by-field todo list). */
  const cta = Array.isArray(cs?.ctaHierarchy) ? cs.ctaHierarchy : [];
  if (cta.length > 0) {
    const body = cta
      .slice(0, 5)
      .map((raw) => {
        const r = asRecord(raw) ?? {};
        const level = asString(r.level);
        const action = asString(r.action);
        const ctx = asString(r.context);
        const bits: string[] = [];
        if (level && action) bits.push(`${level}: ${action}.`);
        else if (action) bits.push(`${action}.`);
        else if (level) bits.push(`${level}.`);
        if (ctx) bits.push(`Usually anchored on or near ${ctx}.`);
        return bits.join(" ");
      })
      .filter(Boolean)
      .join("\n\n");

    if (body) {
      blocks.push({
        title: "Commitment ladder (asks in sequence)",
        body,
      });
    }
  }

  if (blocks.length === 0) return null;

  const intro =
    "How your website and landing pages turn your positioning into action: clear story, believable proof, and a sensible order of “asks” so visitors are not pulled in five directions. Fine-grained page edits belong in Workbook; channel plans and timing live under Activation.";

  return {
    id: "strategy-conversion-web",
    label: "Conversion & Web Experience",
    intro,
    blocks,
  };
}

export function extractContentEditorial(diagnostic: Record<string, unknown>): StrategyPlanSection | null {
  const pillarsRaw = diagnostic.contentPillars;
  const pillars = Array.isArray(pillarsRaw) ? pillarsRaw : [];
  const cal = asRecord(diagnostic.contentCalendarFramework);

  const blocks: StrategyNarrativeBlock[] = [];
  const tables: StrategyPlanSection["tables"] = [];

  if (pillars.length > 0) {
    const body = pillars
      .slice(0, 8)
      .map((raw) => {
        const r = asRecord(raw) ?? {};
        const name = asString(r.name) || "Pillar";
        const desc = asString(r.description);
        const topics = Array.isArray(r.exampleTopics)
          ? (r.exampleTopics as unknown[]).filter((x): x is string => typeof x === "string" && x.trim().length > 0).slice(0, 4)
          : [];
        const fmt = Array.isArray(r.suggestedFormats)
          ? (r.suggestedFormats as unknown[]).filter((x): x is string => typeof x === "string" && x.trim().length > 0).slice(0, 4)
          : [];
        const conn = asString(r.messagingPillarConnection);
        return joinParagraphs(
          name,
          desc,
          topics.length ? `Example topics: ${topics.join("; ")}` : "",
          fmt.length ? `Formats: ${fmt.join(", ")}` : "",
          conn && `Messaging tie-in: ${conn}`,
        );
      })
      .filter(Boolean)
      .join("\n\n");
    if (body) blocks.push({ title: "Editorial pillars", body });
  }

  if (cal) {
    const overview = asString(cal.overview);
    if (overview) blocks.push({ title: "Cadence & operating rhythm", body: overview });
    const months = Array.isArray(cal.monthlyThemes) ? cal.monthlyThemes : [];
    if (months.length > 0) {
      const rows = months.slice(0, 6).map((raw) => {
        const r = asRecord(raw) ?? {};
        const month = asString(r.month) || "Month";
        const theme = asString(r.theme);
        const focus = asString(r.contentPillarFocus);
        const topics = Array.isArray(r.keyTopics)
          ? (r.keyTopics as unknown[]).filter((x): x is string => typeof x === "string").slice(0, 4).join("; ")
          : "";
        return {
          label: month,
          value: joinParagraphs(theme && `Theme: ${theme}`, focus && `Pillar focus: ${focus}`, topics && `Topics: ${topics}`),
        };
      });
      tables.push({ caption: "Thematic calendar (snapshot)", rows });
    }
    const batch = asString(cal.batchingStrategy);
    const rep = asString(cal.repurposingPlaybook);
    if (batch || rep) blocks.push({ title: "Production model", body: joinParagraphs(batch, rep) });
  }

  if (blocks.length === 0 && tables.length === 0) return null;

  return {
    id: "strategy-content-editorial",
    label: "Content & Editorial System",
    intro:
      "Editorial strategy turns messaging pillars into recurring themes—what you publish, how often, and how it reinforces the same buyer story across channels. Channel-specific playbooks live under Activation.",
    blocks,
    tables: tables.length ? tables : undefined,
  };
}

export function extractCredibilityProof(diagnostic: Record<string, unknown>): StrategyPlanSection | null {
  const cr = asRecord(diagnostic.credibilityStrategy);
  if (!cr) return null;

  const blocks: StrategyNarrativeBlock[] = [];
  const overview = asString(cr.overview);
  if (overview) blocks.push({ title: "Proof thesis", body: overview });

  const ts = asRecord(cr.testimonialStrategy);
  if (ts) {
    const body = joinParagraphs(
      asString(ts.whoToAsk) && `Who to feature: ${asString(ts.whoToAsk)}`,
      asString(ts.howToAsk) && `How to invite proof: ${asString(ts.howToAsk)}`,
      asString(ts.whatToCapture) && `What the story must include: ${asString(ts.whatToCapture)}`,
      asString(ts.whereToPlace) && `Where it belongs in the journey: ${asString(ts.whereToPlace)}`,
    );
    if (body) blocks.push({ title: "Social proof architecture", body });
  }

  const gaps = asString(cr.trustGaps);
  if (gaps) blocks.push({ title: "Trust gaps to close", body: gaps });

  const tables: StrategyPlanSection["tables"] = [];
  const proofCreate = Array.isArray(cr.proofPointsToCreate) ? cr.proofPointsToCreate : [];
  if (proofCreate.length > 0) {
    const rows = proofCreate.slice(0, 10).map((raw) => {
      const r = asRecord(raw) ?? {};
      const p = asString(r.proofPoint) || "Proof";
      return {
        label: p,
        value: joinParagraphs(
          asString(r.type) && `Type: ${asString(r.type)}`,
          asString(r.priority) && `Priority: ${asString(r.priority)}`,
          asString(r.howToGet) && `How to produce: ${asString(r.howToGet)}`,
          asString(r.whereToDisplay) && `Where it belongs: ${asString(r.whereToDisplay)}`,
        ),
      };
    });
    tables.push({ caption: "Proof points to build", rows });
  }

  const auth = Array.isArray(cr.authoritySignals) ? cr.authoritySignals : [];
  if (auth.length > 0) {
    const rows = auth.slice(0, 8).map((raw) => {
      const r = asRecord(raw) ?? {};
      return {
        label: asString(r.signal) || "Signal",
        value: joinParagraphs(
          asString(r.impact) && `Impact: ${asString(r.impact)}`,
          asString(r.timeline) && `Timeline: ${asString(r.timeline)}`,
        ),
      };
    });
    tables.push({ caption: "Authority signals", rows });
  }

  if (blocks.length === 0 && tables.length === 0) return null;

  return {
    id: "strategy-credibility-proof",
    label: "Credibility & Proof Strategy",
    intro:
      "How the brand earns belief before and after the sale—what proof you need, where it belongs, and which gaps undermine conversion. Capture workflows are strategic choices, not busywork.",
    blocks,
    tables: tables.length ? tables : undefined,
  };
}

export function extractSalesAlignment(diagnostic: Record<string, unknown>): StrategyPlanSection | null {
  const sgRecord = asRecord(diagnostic.salesConversationGuide);
  const icpPlansPrecheck = Array.isArray(diagnostic.icpGoToMarketPlans) ? diagnostic.icpGoToMarketPlans : [];
  if (!sgRecord && icpPlansPrecheck.length === 0) return null;
  const sg = sgRecord ?? {};

  const blocks: StrategyNarrativeBlock[] = [];
  const tables: StrategyPlanSection["tables"] = [];

  /** Blueprint schema uses `openingFramework` / `discoveryQuestions`; tolerate legacy keys. */
  const opening =
    asString(sg.openingFramework) || asString(sg.overview) || asString(sg.opening_framework);
  if (opening) blocks.push({ title: "Opening & first-call framing", body: opening });

  const icpPlansRaw = diagnostic.icpGoToMarketPlans;
  const icpPlans = Array.isArray(icpPlansRaw) ? icpPlansRaw : [];
  if (icpPlans.length > 0) {
    icpPlans.slice(0, 8).forEach((raw, idx) => {
      const r = asRecord(raw);
      if (!r) return;
      const label = asString(r.icpLabel) || `ICP ${idx + 1}`;
      const align = asString(r.alignmentToBusinessStrategy);
      const focus = asString(r.strategicFocus);
      const cues = asString(r.competitiveConversationCues);
      const planRef = asRecord(r.conversion_intelligence_reference);
      const refBody = planRef
        ? joinParagraphs(
            asString(planRef.icpTier) && `ICP tier: ${asString(planRef.icpTier)}`,
            asString(planRef.funnelStage) && `Funnel stage: ${asString(planRef.funnelStage)}`,
            asString(planRef.matrixCell) && `Intelligence matrix cell: ${asString(planRef.matrixCell)}`,
            asString(planRef.note) && asString(planRef.note),
          )
        : "";
      const needs = Array.isArray(r.campaignContentNeeds)
        ? r.campaignContentNeeds.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
        : [];
      const tactics = Array.isArray(r.priorityTactics)
        ? r.priorityTactics.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
        : [];
      const needsBlock =
        needs.length > 0 ? `Campaign & content needs:\n${needs.map((n) => `• ${n.trim()}`).join("\n")}` : "";
      const tacticsBlock =
        tactics.length > 0
          ? `Priority tactics (90-day):\n${tactics.map((n) => `• ${n.trim()}`).join("\n")}`
          : "";
      const body = joinParagraphs(
        align ? `Strategy tie-in: ${align}` : "",
        focus ? `Segment focus: ${focus}` : "",
        refBody ? `Conversion intelligence anchor:\n${refBody}` : "",
        needsBlock,
        tacticsBlock,
        cues ? `Competitive conversation cues: ${cues}` : "",
      );
      if (body)
        blocks.push({
          title: `ICP playbook — ${label}`,
          body,
          visualVariant: "icp-playbook",
          icpPlaybookIndex: idx + 1,
        });
    });
  }

  const talk = Array.isArray(sg.talkTrackFramework)
    ? sg.talkTrackFramework
    : Array.isArray(sg.talk_track_framework)
      ? sg.talk_track_framework
      : [];
  if (talk.length > 0) {
    const body = talk
      .slice(0, 10)
      .map((raw) => {
        const r = asRecord(raw) ?? {};
        return joinParagraphs(
          asString(r.stage) && `Stage: ${asString(r.stage)}`,
          asString(r.objective) && `Objective: ${asString(r.objective)}`,
          asString(r.keyMessage) && `Key message: ${asString(r.keyMessage)}`,
          asString(r.proofToUse) && `Proof: ${asString(r.proofToUse)}`,
        );
      })
      .filter(Boolean)
      .join("\n\n");
    if (body) blocks.push({ title: "Talk track by stage", body });
  }

  const discRaw = Array.isArray(sg.discoveryQuestions)
    ? sg.discoveryQuestions
    : Array.isArray(sg.discoveryQuestionMap)
      ? sg.discoveryQuestionMap
      : [];
  if (discRaw.length > 0) {
    const rows = discRaw.slice(0, 14).map((raw) => {
      const r = asRecord(raw) ?? {};
      const q = asString(r.question) || "Question";
      return {
        label: q.length > 72 ? `${q.slice(0, 69)}…` : q,
        value: joinParagraphs(
          asString(r.whyThisQuestion) && `Why ask: ${asString(r.whyThisQuestion)}`,
          asString(r.listenFor) && `Listen for: ${asString(r.listenFor)}`,
        ),
      };
    });
    tables.push({ caption: "Discovery questions — why to ask & what to listen for", rows });
  }

  const pp = Array.isArray(sg.proofPointDeployment) ? sg.proofPointDeployment : [];
  if (pp.length > 0) {
    const rows = pp.slice(0, 14).map((raw) => {
      const r = asRecord(raw) ?? {};
      const persona = asString(r.persona) || "Persona";
      return {
        label: `${persona} · ${asString(r.stage) || "Stage"}`,
        value: joinParagraphs(
          asString(r.proofPoint) && `Proof: ${asString(r.proofPoint)}`,
          asString(r.howToDeliver) && `Delivery: ${asString(r.howToDeliver)}`,
        ),
      };
    });
    tables.push({ caption: "Proof by persona & stage", rows });
  }

  const obj = Array.isArray(sg.objectionHandlingPlaybook) ? sg.objectionHandlingPlaybook : [];
  if (obj.length > 0) {
    const rows = obj.slice(0, 12).map((raw) => {
      const r = asRecord(raw) ?? {};
      const o = asString(r.objection) || "Objection";
      return {
        label: o.length > 64 ? `${o.slice(0, 61)}…` : o,
        value: joinParagraphs(
          asString(r.response) && `Response: ${asString(r.response)}`,
          asString(r.pillarConnection) && `Pillar: ${asString(r.pillarConnection)}`,
          asString(r.proofPoint) && `Proof: ${asString(r.proofPoint)}`,
        ),
      };
    });
    tables.push({ caption: "Objection architecture", rows });
  }

  const closing = asString(sg.closingLanguage) || asString(sg.closing_language);
  if (closing) blocks.push({ title: "Closing language & next-step framing", body: closing });

  const ref = asRecord(sg.conversion_intelligence_reference);
  if (ref && icpPlans.length === 0) {
    const refBody = joinParagraphs(
      asString(ref.icpTier) && `ICP tier: ${asString(ref.icpTier)}`,
      asString(ref.funnelStage) && `Funnel stage: ${asString(ref.funnelStage)}`,
      asString(ref.matrixCell) && `Intelligence matrix cell: ${asString(ref.matrixCell)}`,
      asString(ref.note) && asString(ref.note),
    );
    if (refBody) blocks.push({ title: "Conversion intelligence anchor (ICP × stage)", body: refBody });
  }

  if (blocks.length === 0 && tables.length === 0) return null;

  return {
    id: "strategy-sales-alignment",
    label: "Sales & Marketing Alignment",
    intro:
      "One shared playbook for marketing and sales: per-ICP playbooks (when present) tie company goals to campaign needs and 90-day tactics; then how you open a conversation, what you learn before you pitch, which proof fits which buyer and stage, how you handle pushback, and how you close—so ads and content match what reps actually say.",
    blocks,
    tables: tables.length ? tables : undefined,
  };
}

export function collectStrategyPlanSections(diagnostic: Record<string, unknown>): StrategyPlanSection[] {
  try {
    const sections = [
      extractOutcomesAndMeasurement(diagnostic),
      extractConversionAndWeb(diagnostic),
      extractContentEditorial(diagnostic),
      extractCredibilityProof(diagnostic),
      extractSalesAlignment(diagnostic),
    ].filter((s): s is StrategyPlanSection => Boolean(s));
    return sections;
  } catch (err) {
    console.error("[strategy] collectStrategyPlanSections failed", err);
    return [];
  }
}

/**
 * Derives Activation-tab copy from Blueprint+ full_report JSON so the UI shows
 * deployable channel plans (subjects, hooks, stages, ICP labels) instead of generic instructions.
 */

import {
  derivePaidPlatformsList,
  formatNormalizedPaidChannelBlock,
  normalizePaidChannel,
} from "@/lib/activation/paidMediaPlanFields";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function joinBlocks(parts: string[], maxLen = 12000): string {
  const text = parts.filter(Boolean).join("\n\n");
  return text.length > maxLen ? `${text.slice(0, maxLen - 1)}…` : text;
}

function formatEmailPlan(em: Record<string, unknown> | null, companyName: string): string {
  if (!em) return "";
  const lines: string[] = [];
  const overview = asString(em.overview);
  if (overview) lines.push(`Email program overview\n${overview}`);

  const welcome = asRecord(em.welcomeSequence);
  if (welcome) {
    const desc = asString(welcome.description);
    const emails = Array.isArray(welcome.emails) ? welcome.emails : [];
    const blocks = emails.slice(0, 8).map((raw, i) => {
      const e = asRecord(raw) ?? {};
      const sub = asString(e.subject);
      const timing = asString(e.timing);
      const purpose = asString(e.purpose);
      const msg = asString(e.keyMessage);
      const cta = asString(e.ctaButton);
      return [
        `${i + 1}. ${timing || `Step ${i + 1}`}`,
        sub ? `Subject line: "${sub}"` : "",
        purpose ? `Job: ${purpose}` : "",
        msg ? `Core line: ${msg}` : "",
        cta ? `CTA: ${cta}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    });
    if (desc || blocks.length) {
      lines.push(
        `Welcome / onboarding sequence (${companyName})`,
        desc,
        blocks.join("\n\n"),
      );
    }
  }

  const nurture = asRecord(em.nurtureCampaign);
  if (nurture) {
    const desc = asString(nurture.description);
    const emails = Array.isArray(nurture.emails) ? nurture.emails : [];
    const blocks = emails.slice(0, 6).map((raw, i) => {
      const e = asRecord(raw) ?? {};
      return [
        `${i + 1}. ${asString(e.timing) || `Nurture ${i + 1}`}`,
        asString(e.subject) ? `Subject: "${asString(e.subject)}"` : "",
        asString(e.keyMessage) ? `Message: ${asString(e.keyMessage)}` : "",
        asString(e.contentType) ? `Format: ${asString(e.contentType)}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    });
    if (blocks.length) lines.push(`Ongoing nurture\n${desc ? `${desc}\n` : ""}${blocks.join("\n\n")}`);
  }

  const re = asRecord(em.reEngagementSequence);
  if (re) {
    const trigger = asString(re.trigger);
    const emails = Array.isArray(re.emails) ? re.emails : [];
    const blocks = emails.slice(0, 4).map((raw, i) => {
      const e = asRecord(raw) ?? {};
      return [
        `${i + 1}. ${asString(e.timing) || `Re-engagement ${i + 1}`}`,
        asString(e.subject) ? `Subject: "${asString(e.subject)}"` : "",
        asString(e.keyMessage) ? `Message: ${asString(e.keyMessage)}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    });
    if (trigger || blocks.length) {
      lines.push(`Re-engagement (trigger: ${trigger || "see sequence"})\n${blocks.join("\n\n")}`);
    }
  }

  const seg = asString(em.segmentationStrategy);
  if (seg) lines.push(`Segmentation & routing\n${seg}`);

  const formulas = Array.isArray(em.subjectLineFormulas) ? em.subjectLineFormulas : [];
  if (formulas.length) {
    lines.push(
      `Subject line patterns (paste-ready)\n${formulas
        .slice(0, 8)
        .map((f) => (typeof f === "string" ? `• ${f}` : ""))
        .filter(Boolean)
        .join("\n")}`,
    );
  }

  const cadence = asString(em.sendCadence);
  if (cadence) lines.push(`Send cadence\n${cadence}`);

  const triggers = Array.isArray(em.automationTriggers) ? em.automationTriggers : [];
  if (triggers.length) {
    lines.push(
      `Automation triggers\n${triggers
        .slice(0, 8)
        .map((t) => (typeof t === "string" ? `• ${t}` : ""))
        .filter(Boolean)
        .join("\n")}`,
    );
  }

  return joinBlocks(lines);
}

function formatSeoAeo(
  seo: Record<string, unknown> | null,
  aeo: Record<string, unknown> | null,
): string {
  const lines: string[] = [];
  if (seo) {
    const overview = asString(seo.overview);
    if (overview) lines.push(`SEO program\n${overview}`);
    const primary = Array.isArray(seo.primaryKeywords) ? seo.primaryKeywords : [];
    if (primary.length) {
      const rows = primary.slice(0, 8).map((raw) => {
        const k = asRecord(raw) ?? {};
        const kw = asString(k.keyword);
        const intent = asString(k.intent);
        const angle = asString(k.contentAngle);
        const pillar = asString(k.pillarConnection);
        return [kw || "Topic", intent && `Intent: ${intent}`, angle && `Page angle: ${angle}`, pillar && `Pillar: ${pillar}`]
          .filter(Boolean)
          .join(" — ");
      });
      lines.push(`Priority topic & page targets\n${rows.map((r) => `• ${r}`).join("\n")}`);
    }
    const playbook = asString(seo.contentSEOPlaybook);
    if (playbook) lines.push(`Content SEO playbook\n${playbook}`);
  }
  if (aeo) {
    const overview = asString(aeo.overview);
    if (overview) lines.push(`AI discovery (AEO)\n${overview}`);
    const faq = asRecord(aeo.faqStrategy);
    if (faq) {
      const faqs = Array.isArray(faq.priorityFAQs) ? faq.priorityFAQs : [];
      const q = faqs.slice(0, 8).filter((x): x is string => typeof x === "string");
      if (q.length) lines.push(`FAQ / AI answer targets\n${q.map((s) => `• ${s}`).join("\n")}`);
    }
  }
  return joinBlocks(lines);
}

function formatSocialContent(
  social: Record<string, unknown> | null,
  calendar: Record<string, unknown> | null,
): string {
  const lines: string[] = [];
  if (social) {
    const overview = asString(social.overview);
    if (overview) lines.push(`Social program\n${overview}`);
    const platforms = Array.isArray(social.platforms) ? social.platforms : [];
    for (const raw of platforms.slice(0, 4)) {
      const p = asRecord(raw) ?? {};
      const name = asString(p.platform);
      const why = asString(p.whyThisPlatform);
      const strat = asString(p.contentStrategy);
      const freq = asString(p.postingFrequency);
      const posts = Array.isArray(p.examplePosts) ? p.examplePosts : [];
      const postLines = posts
        .slice(0, 3)
        .filter((x): x is string => typeof x === "string")
        .map((s) => `  – ${s}`);
      const imgPrompts = Array.isArray(p.exampleImagePrompts) ? p.exampleImagePrompts : [];
      const imgLines = imgPrompts
        .slice(0, 2)
        .filter((x): x is string => typeof x === "string")
        .map((s) => `  – ${s}`);
      const vidPrompts = Array.isArray(p.exampleVideoPrompts) ? p.exampleVideoPrompts : [];
      const vidLines = vidPrompts
        .slice(0, 2)
        .filter((x): x is string => typeof x === "string")
        .map((s) => `  – ${s}`);
      lines.push(
        [
          `${name || "Platform"} — ${freq || "cadence TBD"}`,
          why && `Why: ${why}`,
          strat && `What to publish: ${strat}`,
          postLines.length ? `Example posts:\n${postLines.join("\n")}` : "",
          imgLines.length ? `Image prompts:\n${imgLines.join("\n")}` : "",
          vidLines.length ? `Video prompts:\n${vidLines.join("\n")}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
      );
    }
    const cross = asString(social.crossPlatformStrategy);
    if (cross) lines.push(`Repurpose / cross-post\n${cross}`);
  }
  if (calendar) {
    const overview = asString(calendar.overview);
    const themes = Array.isArray(calendar.monthlyThemes) ? calendar.monthlyThemes : [];
    if (overview || themes.length) {
      const tlines = themes.slice(0, 3).map((raw) => {
        const t = asRecord(raw) ?? {};
        const topics = Array.isArray(t.keyTopics) ? t.keyTopics.filter((x): x is string => typeof x === "string") : [];
        return `• ${asString(t.month) || "Month"}: ${asString(t.theme) || "Theme"}${topics.length ? ` — Topics: ${topics.join("; ")}` : ""}`;
      });
      lines.push(`Editorial themes\n${overview ? `${overview}\n` : ""}${tlines.join("\n")}`);
    }
  }
  return joinBlocks(lines);
}

function formatPaid(paid: Record<string, unknown> | null): string {
  if (!paid) return "";
  const lines: string[] = [];
  const overview = asString(paid.overview);
  if (overview) lines.push(`Paid media program\n${overview}`);
  const platforms = derivePaidPlatformsList(paid);
  if (platforms.length) {
    lines.push(`Platforms & ad surfaces\n${platforms.map((p) => `• ${p}`).join("\n")}`);
  }
  const channels = Array.isArray(paid.channels) ? paid.channels : [];
  channels.slice(0, 8).forEach((raw, i) => {
    const normalized = normalizePaidChannel(raw);
    lines.push(formatNormalizedPaidChannelBlock(normalized, i));
  });
  const scenarios = Array.isArray(paid.budgetScenarios) ? paid.budgetScenarios : [];
  if (scenarios.length) {
    const s = scenarios.slice(0, 3).map((raw) => {
      const b = asRecord(raw) ?? {};
      const label = asString(b.label);
      const spend = typeof b.monthlySpend === "number" ? b.monthlySpend : 0;
      const fit = asString(b.objectiveFit);
      const out = asString(b.expectedOutcome);
      return `• ${label || "Scenario"}: ~$${spend.toLocaleString()}/mo — ${fit || "fit TBD"} — ${out || "expected outcome"}`;
    });
    lines.push(`Budget scenarios\n${s.join("\n")}`);
  }
  return joinBlocks(lines);
}

function formatPrThought(th: Record<string, unknown> | null): string {
  if (!th) return "";
  const lines: string[] = [];
  const overview = asString(th.overview);
  if (overview) lines.push(`PR & authority program\n${overview}`);
  const angles = Array.isArray(th.mediaAngles) ? th.mediaAngles : [];
  for (const raw of angles.slice(0, 5)) {
    const a = asRecord(raw) ?? {};
    lines.push(
      [
        asString(a.angle) || "Angle",
        asString(a.hook) && `Hook: ${asString(a.hook)}`,
        asString(a.targetMedia) && `Targets: ${asString(a.targetMedia)}`,
        Array.isArray(a.talkingPoints) && a.talkingPoints.length
          ? `Talking points: ${(a.talkingPoints as unknown[]).filter((x): x is string => typeof x === "string").slice(0, 4).join(" | ")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }
  const speaking = Array.isArray(th.speakingTopics) ? th.speakingTopics : [];
  if (speaking.length) {
    const slines = speaking.slice(0, 4).map((raw) => {
      const s = asRecord(raw) ?? {};
      return `• ${asString(s.topic) || "Topic"} (${asString(s.audience) || "audience"}) — ${asString(s.angle) || ""}`;
    });
    lines.push(`Speaking kit\n${slines.join("\n")}`);
  }
  return joinBlocks(lines);
}

function formatJourney(map: Record<string, unknown> | null): string {
  if (!map) return "";
  const lines: string[] = [];
  const overview = asString(map.overview);
  if (overview) lines.push(`Journey orchestration\n${overview}`);
  const stages = Array.isArray(map.stages) ? map.stages : [];
  for (const raw of stages.slice(0, 8)) {
    const s = asRecord(raw) ?? {};
    const stage = asString(s.stage);
    const mindset = asString(s.customerMindset);
    const focus = asString(s.messagingFocus);
    const trigger = asString(s.conversionTrigger);
    const pv = Array.isArray(s.personaVariations) ? s.personaVariations : [];
    const pvl = pv
      .slice(0, 3)
      .map((p) => {
        const pr = asRecord(p) ?? {};
        return asString(pr.persona) && asString(pr.adaptation)
          ? `${asString(pr.persona)}: ${asString(pr.adaptation)}`
          : "";
      })
      .filter(Boolean);
    lines.push(
      [
        `Stage: ${stage || "Stage"}`,
        mindset && `Buyer mindset: ${mindset}`,
        focus && `Message focus: ${focus}`,
        trigger && `Conversion trigger: ${trigger}`,
        pvl.length && `Persona tuning:\n${pvl.map((x) => `  – ${x}`).join("\n")}`,
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }
  return joinBlocks(lines);
}

function formatCompetitive(cp: Record<string, unknown> | null): string {
  if (!cp) return "";
  const lines: string[] = [];
  const diff = asString(cp.differentiationSummary);
  const ws = asString(cp.strategicWhitespace);
  const move = asString(cp.movementPlan);
  const vuln = asString(cp.vulnerabilities);
  if (diff) lines.push(`Differentiation (use in campaigns)\n${diff}`);
  if (ws) lines.push(`Whitespace to own\n${ws}`);
  if (move) lines.push(`Competitive motion (next 90 days)\n${move}`);
  if (vuln) lines.push(`Where rivals press you\n${vuln}`);
  return joinBlocks(lines);
}

function formatAudienceSegments(
  icp: Record<string, unknown> | null,
  personaSeg: Record<string, unknown> | null,
  audienceDef: Record<string, unknown> | null,
): string {
  const lines: string[] = [];

  if (audienceDef) {
    for (const key of ["primaryICP", "secondaryICP"] as const) {
      const block = asRecord(audienceDef[key]);
      if (!block) continue;
      const label = asString(block.icpLabel) || asString(block.name) || key;
      const summary = asString(block.summary);
      const conv = asString(block.conversionPath);
      lines.push(
        [`${label}`, summary && `Profile: ${summary}`, conv && `Conversion path: ${conv}`].filter(Boolean).join("\n"),
      );
    }
    const add = Array.isArray(audienceDef.additionalICPs) ? audienceDef.additionalICPs : [];
    for (const raw of add.slice(0, 3)) {
      const b = asRecord(raw) ?? {};
      const label = asString(b.icpLabel) || asString(b.name) || "ICP";
      lines.push(`${label}\n${asString(b.summary) || ""}`);
    }
  }

  if (icp) {
    const icpOverview = asString(icp.overview);
    if (icpOverview) lines.push(`Conversion intelligence overview\n${icpOverview}`);

    const profiles = Array.isArray(icp.conversionProfile) ? icp.conversionProfile : [];
    for (const raw of profiles.slice(0, 5)) {
      const p = asRecord(raw) ?? {};
      lines.push(
        [
          `ICP tier: ${asString(p.icpTier) || "Tier"}`,
          asString(p.buyingCycleLength) && `Cycle: ${asString(p.buyingCycleLength)}`,
          asString(p.primaryConversionBarrier) && `Barrier: ${asString(p.primaryConversionBarrier)}`,
          asString(p.decisionTrigger) && `Buy trigger: ${asString(p.decisionTrigger)}`,
          asString(p.conversionBehaviorPattern) && `Behavior: ${asString(p.conversionBehaviorPattern)}`,
        ]
          .filter(Boolean)
          .join("\n"),
      );
    }

    const matrix = Array.isArray(icp.contentTypeConversionMatrix) ? icp.contentTypeConversionMatrix : [];
    if (matrix.length) {
      const matrixLines = matrix.slice(0, 12).map((raw) => {
        const m = asRecord(raw) ?? {};
        const attrs = Array.isArray(m.requiredContentAttributes)
          ? (m.requiredContentAttributes as unknown[]).filter((x): x is string => typeof x === "string")
          : [];
        return [
          `— ${asString(m.icpTier) || "ICP"} × ${asString(m.funnelStage) || "stage"} —`,
          asString(m.highestConvertingContentType) && `Winning format: ${asString(m.highestConvertingContentType)}`,
          asString(m.whyItConverts) && `Why it converts: ${asString(m.whyItConverts)}`,
          asString(m.leadMessagePillar) && `Message pillar: ${asString(m.leadMessagePillar)}`,
          attrs.length && `Required in asset: ${attrs.join("; ")}`,
          asString(m.convertingCTA) && `Use this CTA: ${asString(m.convertingCTA)}`,
          asString(m.exampleHeadline) && `Example headline/subject: ${asString(m.exampleHeadline)}`,
          asString(m.examplePrimaryCopy) && `Draft copy:\n${asString(m.examplePrimaryCopy)}`,
          asString(m.exampleImagePrompt) && `Image prompt: ${asString(m.exampleImagePrompt)}`,
          asString(m.exampleVideoPrompt) && `Video prompt: ${asString(m.exampleVideoPrompt)}`,
        ]
          .filter(Boolean)
          .join("\n");
      });
      lines.push(`Content × funnel execution matrix (paste into briefs)\n${matrixLines.join("\n\n")}`);
    }

    const mechanics = Array.isArray(icp.channelLevelConversionMechanics) ? icp.channelLevelConversionMechanics : [];
    if (mechanics.length) {
      const mechLines = mechanics.slice(0, 10).map((raw) => {
        const m = asRecord(raw) ?? {};
        const formats = Array.isArray(m.convertingFormats)
          ? m.convertingFormats.filter((x): x is string => typeof x === "string")
          : [];
        const fails = Array.isArray(m.failurePatterns)
          ? m.failurePatterns.filter((x): x is string => typeof x === "string")
          : [];
        return [
          `— ${asString(m.icpTier) || "ICP"} on ${asString(m.channel) || "channel"} —`,
          formats.length && `Formats that convert: ${formats.join(", ")}`,
          asString(m.optimalMessageLength) && `Message length: ${asString(m.optimalMessageLength)}`,
          asString(m.conversionAction) && `Conversion action: ${asString(m.conversionAction)}`,
          asString(m.followUpLogic) && `Follow-up: ${asString(m.followUpLogic)}`,
          fails.length && `Avoid: ${fails.slice(0, 4).join("; ")}`,
        ]
          .filter(Boolean)
          .join("\n");
      });
      lines.push(`Channel-level conversion mechanics\n${mechLines.join("\n\n")}`);
    }

    const sequences = Array.isArray(icp.multiTouchConversionSequence) ? icp.multiTouchConversionSequence : [];
    for (const raw of sequences.slice(0, 4)) {
      const seq = asRecord(raw) ?? {};
      const steps = Array.isArray(seq.sequence) ? seq.sequence : [];
      const stepLines = steps
        .slice(0, 8)
        .map((sraw) => {
          const s = asRecord(sraw) ?? {};
          const header = [
            `Step ${asString(s.order) || "?"}: ${asString(s.channel) || "Channel"}`,
            asString(s.touchType) && `Touch: ${asString(s.touchType)}`,
            asString(s.objective) && `Objective: ${asString(s.objective)}`,
            asString(s.conversionSignal) && `Signal: ${asString(s.conversionSignal)}`,
          ]
            .filter(Boolean)
            .join(" | ");
          const body = [
            asString(s.headlineOrSubject) && `Headline/subject: ${asString(s.headlineOrSubject)}`,
            asString(s.subhead) && `Subhead: ${asString(s.subhead)}`,
            asString(s.primaryCopy) && `Primary copy:\n${asString(s.primaryCopy)}`,
            asString(s.cta) && `CTA: ${asString(s.cta)}`,
            asString(s.imagePrompt) && `Image prompt: ${asString(s.imagePrompt)}`,
            asString(s.videoPrompt) && `Video prompt: ${asString(s.videoPrompt)}`,
            asString(s.performanceRationale) && `Performance note: ${asString(s.performanceRationale)}`,
          ]
            .filter(Boolean)
            .join("\n");
          return body ? `${header}\n${body}` : header;
        })
        .filter(Boolean);
      const block = [
        `Multi-touch sequence — ${asString(seq.icpTier) || "ICP"}`,
        stepLines.length ? stepLines.join("\n\n") : "",
        asString(seq.criticalTouch) && `Critical touch: ${asString(seq.criticalTouch)}`,
        asString(seq.salesHandoffTrigger) && `Sales handoff when: ${asString(seq.salesHandoffTrigger)}`,
      ]
        .filter(Boolean)
        .join("\n");
      if (block.trim()) lines.push(block);
    }

    const signals = Array.isArray(icp.behavioralSignalLibrary) ? icp.behavioralSignalLibrary : [];
    if (signals.length) {
      const sigLines = signals.slice(0, 12).map((raw) => {
        const s = asRecord(raw) ?? {};
        const chans = Array.isArray(s.recommendedChannels)
          ? s.recommendedChannels.filter((x): x is string => typeof x === "string")
          : [];
        return [
          `Signal: ${asString(s.signal) || "—"} (${asString(s.icpTier) || "ICP"})`,
          asString(s.indicatesStageTransition) && `Stage shift: ${asString(s.indicatesStageTransition)}`,
          chans.length && `Channels: ${chans.join(", ")}`,
          asString(s.primaryHeadline) && `Headline / subject: ${asString(s.primaryHeadline)}`,
          asString(s.subhead) && `Subhead: ${asString(s.subhead)}`,
          asString(s.primaryBody) && `Body / script:\n${asString(s.primaryBody)}`,
          asString(s.cta) && `CTA: ${asString(s.cta)}`,
          asString(s.imagePrompt) && `Image prompt: ${asString(s.imagePrompt)}`,
          asString(s.videoPrompt) && `Video prompt: ${asString(s.videoPrompt)}`,
          asString(s.performanceRationale) && `Performance rationale: ${asString(s.performanceRationale)}`,
          asString(s.triggeredAction) && `Play summary: ${asString(s.triggeredAction)}`,
        ]
          .filter(Boolean)
          .join("\n");
      });
      lines.push(`Behavioral triggers → actions (automations & plays)\n${sigLines.join("\n\n")}`);
    }

    const hooks = Array.isArray(icp.hookTypePerformance) ? icp.hookTypePerformance : [];
    for (const raw of hooks.slice(0, 4)) {
      const h = asRecord(raw) ?? {};
      const good = Array.isArray(h.reliableHookTypes) ? h.reliableHookTypes : [];
      const bad = Array.isArray(h.hookTypesToAvoid) ? h.hookTypesToAvoid : [];
      const goodLines = good.slice(0, 4).map((gr) => {
        const g = asRecord(gr) ?? {};
        return `  • ${asString(g.hookType) || "Hook"}: ${asString(g.whyItConverts) || ""}`.trim();
      });
      const badLines = bad.slice(0, 3).map((br) => {
        const b = asRecord(br) ?? {};
        return `  • ${asString(b.hookType) || "Hook"}: ${asString(b.whyToAvoid) || ""}`.trim();
      });
      const block = [
        `Hook performance — ${asString(h.icpTier) || "ICP"}`,
        goodLines.length ? `Use:\n${goodLines.join("\n")}` : "",
        badLines.length ? `Avoid:\n${badLines.join("\n")}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");
      if (block.trim()) lines.push(block);
    }
  }

  if (personaSeg) {
    const strat = asString(personaSeg.segmentationStrategy);
    if (strat) lines.push(`Segmentation strategy\n${strat}`);
    const segments = Array.isArray(personaSeg.segments) ? personaSeg.segments : [];
    for (const raw of segments.slice(0, 5)) {
      const s = asRecord(raw) ?? {};
      const tactics = Array.isArray(s.conversionTactics) ? s.conversionTactics.filter((x): x is string => typeof x === "string") : [];
      lines.push(
        [
          `Segment: ${asString(s.segmentName) || "Segment"}`,
          asString(s.messagingDifferentiation) && `Message: ${asString(s.messagingDifferentiation)}`,
          asString(s.channelMix) && `Channels: ${asString(s.channelMix)}`,
          tactics.length && `Tactics: ${tactics.slice(0, 4).join("; ")}`,
        ]
        .filter(Boolean)
        .join("\n"),
      );
    }
  }

  return joinBlocks(lines);
}

function formatNinetyDay(r: Record<string, unknown> | null): string {
  if (!r) return "";
  const lines: string[] = [];
  const overview = asString(r.overview);
  if (overview) lines.push(`90-day roadmap\n${overview}`);
  for (const phaseKey of ["phase1", "phase2", "phase3"] as const) {
    const ph = asRecord(r[phaseKey]);
    if (!ph) continue;
    const name = asString(ph.name);
    const objective = asString(ph.objective);
    const weeks = Array.isArray(ph.weeks) ? ph.weeks : [];
    lines.push(`${name || phaseKey}${objective ? ` — ${objective}` : ""}`);
    for (const wraw of weeks.slice(0, 4)) {
      const w = asRecord(wraw) ?? {};
      const tasks = Array.isArray(w.tasks) ? w.tasks : [];
      const taskLines = tasks.slice(0, 4).map((tr) => {
        const t = asRecord(tr) ?? {};
        return `  • ${asString(t.task) || "Task"}${asString(t.deliverable) ? ` → Deliverable: ${asString(t.deliverable)}` : ""}`;
      });
      lines.push(
        `Week ${asString(w.weekNumber) || "?"}: ${asString(w.focus) || "Focus"}\n${taskLines.join("\n")}`,
      );
    }
  }
  return joinBlocks(lines);
}

function formatWebsiteChannel(matrix: Record<string, unknown> | null): string {
  if (!matrix) return "";
  const by = asRecord(matrix.byChannel);
  if (!by) return "";
  const site = asRecord(by.website);
  if (!site) return "";
  const parts = [asString(site.guidance), asString(site.exampleCopy), asString(site.personaNotes)].filter(Boolean);
  return parts.length ? `Website execution\n${parts.join("\n\n")}` : "";
}

/** Deployable lead magnet + landing path from conversion strategy, ICP matrix, and personas — not generic worksheets. */
function formatLeadMagnetPlan(full: Record<string, unknown>, companyName: string): string {
  const lines: string[] = [];
  const conv = asRecord(full.conversionStrategy);
  if (conv) {
    const ht = asString(conv.howTrustIsBuilt);
    const hc = asString(conv.howClarityDrivesAction);
    if (ht) lines.push(`How trust converts\n${ht}`);
    if (hc) lines.push(`How clarity drives action\n${hc}`);
    const ctaH = Array.isArray(conv.ctaHierarchy) ? conv.ctaHierarchy : [];
    if (ctaH.length) {
      lines.push(
        `CTA hierarchy (landing pages, forms, ads)\n${ctaH
          .slice(0, 8)
          .map((raw) => {
            const c = asRecord(raw) ?? {};
            return `• ${asString(c.level) || "Level"}: ${asString(c.action) || ""} — ${asString(c.context) || ""}${asString(c.template) ? ` — Template: ${asString(c.template)}` : ""}`;
          })
          .join("\n")}`,
      );
    }
    const lcr = asRecord(conv.leadCaptureRecommendations);
    if (lcr) {
      const path = asString(lcr.leadPath);
      const ctx = asString(lcr.supportiveContext);
      const primary = asString(lcr.primaryPickTitle);
      const how = asString(lcr.howUsedInCampaigns);
      const opts = Array.isArray(lcr.options) ? lcr.options : [];
      const optBlocks = opts.slice(0, 5).map((raw) => {
        const o = asRecord(raw) ?? {};
        const hooks = asRecord(o.promotionHooks);
        const bullets = Array.isArray(o.outlineBullets) ? o.outlineBullets : [];
        const blines = bullets
          .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
          .slice(0, 8)
          .map((b) => `  • ${b}`);
        return [
          asString(o.workingTitle) && `${asString(o.workingTitle)} (${asString(o.format) || "format"})`,
          asString(o.whyItFits) && `Why it fits: ${asString(o.whyItFits)}`,
          blines.length ? `Outline:\n${blines.join("\n")}` : "",
          asString(o.landingPageHeadline) && `Landing headline: ${asString(o.landingPageHeadline)}`,
          asString(o.primaryCTA) && `CTA: ${asString(o.primaryCTA)}`,
          hooks &&
            [
              asString(hooks.emailOneLiner) && `Email hook: ${asString(hooks.emailOneLiner)}`,
              asString(hooks.socialHook) && `Social hook: ${asString(hooks.socialHook)}`,
              asString(hooks.optionalPaidAngle) && `Paid angle: ${asString(hooks.optionalPaidAngle)}`,
            ]
              .filter(Boolean)
              .join("\n"),
        ]
          .filter(Boolean)
          .join("\n");
      });
      if (path || ctx || primary || how || optBlocks.some(Boolean)) {
        const pathLine =
          path === "optimize_existing"
            ? "Plan type: optimize your existing free offer / sign-up asset"
            : path === "create_new"
              ? "Plan type: new free-offer concepts (pick one to run with)"
              : path
                ? `Plan type: ${path}`
                : "";
        lines.push(
          [
            "Lead capture (tailored to what you told us)",
            pathLine || "",
            ctx || "",
            primary && `Primary offer for campaigns: ${primary}`,
            how && how,
            optBlocks.filter(Boolean).join("\n\n"),
          ]
            .filter(Boolean)
            .join("\n\n"),
        );
      }
    }
    const nurture = asRecord(conv.emailNurtureTemplate);
    if (nurture) {
      const desc = asString(nurture.description);
      const emails = Array.isArray(nurture.emails) ? nurture.emails : [];
      const blocks = emails.slice(0, 4).map((raw) => {
        const e = asRecord(raw) ?? {};
        return [
          asString(e.timing) && `Timing: ${asString(e.timing)}`,
          asString(e.subject) && `Subject: "${asString(e.subject)}"`,
          asString(e.purpose) && `Purpose: ${asString(e.purpose)}`,
          asString(e.body) && `Body:\n${asString(e.body)}`,
        ]
          .filter(Boolean)
          .join("\n");
      });
      if (desc || blocks.length) {
        lines.push(
          `After opt-in — nurture handoff (${companyName})\n${desc ? `${desc}\n\n` : ""}${blocks.filter(Boolean).join("\n\n")}`,
        );
      }
    }
  }

  const icp = asRecord(full.icpConversionIntelligenceFramework);
  if (icp) {
    const overview = asString(icp.overview);
    if (overview) lines.push(`Conversion intelligence\n${overview}`);
    const matrix = Array.isArray(icp.contentTypeConversionMatrix) ? icp.contentTypeConversionMatrix : [];
    for (const raw of matrix.slice(0, 8)) {
      const m = asRecord(raw) ?? {};
      lines.push(
        [
          `ICP: ${asString(m.icpTier) || "Tier"} — Stage: ${asString(m.funnelStage) || "funnel"}`,
          asString(m.highestConvertingContentType) && `Highest-converting format: ${asString(m.highestConvertingContentType)}`,
          asString(m.whyItConverts) && `Why it converts: ${asString(m.whyItConverts)}`,
          asString(m.convertingCTA) && `Primary CTA: ${asString(m.convertingCTA)}`,
          Array.isArray(m.requiredContentAttributes) && m.requiredContentAttributes.length
            ? `Required attributes: ${(m.requiredContentAttributes as unknown[]).filter((x): x is string => typeof x === "string").join("; ")}`
            : "",
        ]
          .filter(Boolean)
          .join("\n"),
      );
    }
  }

  const bpe = asRecord(full.buyerPersonaEcosystem);
  if (bpe) {
    const personas = Array.isArray(bpe.buyerPersonas) ? bpe.buyerPersonas : [];
    for (const raw of personas.slice(0, 5)) {
      const p = asRecord(raw) ?? {};
      const name = asString(p.personaName);
      const cs = asRecord(p.contentStrategy);
      const lmi = cs ? asString(cs.leadMagnetIdea) : "";
      const ctc = cs ? asString(cs.contentThatConverts) : "";
      const cp = asRecord(p.conversionPath);
      const firstTouch = cp ? asString(cp.firstTouch) : "";
      const idealCTA = cp ? asString(cp.idealCTA) : "";
      const mg = asRecord(p.messagingGuide);
      const headline = mg ? asString(mg.headline) : "";
      const vp = mg ? asString(mg.valueProposition) : "";
      if (!name) continue;
      if (lmi || ctc || firstTouch || idealCTA || headline || vp) {
        lines.push(
          [
            `Persona: ${name}`,
            headline && `Headline: ${headline}`,
            vp && `Value prop: ${vp}`,
            lmi && `Lead magnet concept: ${lmi}`,
            ctc && `Content that converts: ${ctc}`,
            firstTouch && `First touch: ${firstTouch}`,
            idealCTA && `Ideal CTA: ${idealCTA}`,
          ]
            .filter(Boolean)
            .join("\n"),
        );
      }
    }
  }

  return joinBlocks(lines);
}

function buildPersonaIcpBanner(full: Record<string, unknown>): string {
  const names: string[] = [];
  const apd = asRecord(full.audiencePersonaDefinition);
  if (apd) {
    for (const key of ["primaryICP", "secondaryICP"] as const) {
      const b = asRecord(apd[key]);
      if (b) {
        const label = asString(b.icpLabel) || asString(b.name);
        if (label) names.push(label);
      }
    }
  }
  const bpe = asRecord(full.buyerPersonaEcosystem);
  if (bpe) {
    const personas = Array.isArray(bpe.buyerPersonas) ? bpe.buyerPersonas : [];
    for (const raw of personas.slice(0, 4)) {
      const p = asRecord(raw) ?? {};
      const n = asString(p.personaName);
      if (n) names.push(n);
    }
  }
  const unique = [...new Set(names)];
  if (!unique.length) return "";
  return `Activation plans are mapped to your buyer context: ${unique.join(" · ")}.`;
}

export type ActivationDiagnostics = {
  channelPlans: Partial<Record<string, string>>;
  buyerJourneySummary: string;
  competitiveMatrixSummary: string;
  executionRoadmapBody: string;
  personaIcpBanner: string;
  /** ICP + persona-segment narrative; used for Audience Segments activation block */
  audienceSegmentsBody: string;
};

/**
 * Pulls channel-ready narratives from Blueprint+ engine output (same keys as stored in full_report).
 */
export function buildActivationDiagnostics(
  fullReport: Record<string, unknown> | null | undefined,
  companyName: string,
): ActivationDiagnostics {
  const empty: ActivationDiagnostics = {
    channelPlans: {},
    buyerJourneySummary: "",
    competitiveMatrixSummary: "",
    executionRoadmapBody: "",
    personaIcpBanner: "",
    audienceSegmentsBody: "",
  };
  if (!fullReport || typeof fullReport !== "object") return empty;

  const meta = asRecord(fullReport._meta);
  const tier = asString(meta?.tier);
  const hasEngine =
    tier === "blueprint_plus" ||
    !!fullReport.emailMarketingFramework ||
    !!fullReport.customerJourneyMap ||
    !!fullReport.icpConversionIntelligenceFramework;

  if (!hasEngine) return empty;

  const email = formatEmailPlan(asRecord(fullReport.emailMarketingFramework), companyName);
  const seoAeo = formatSeoAeo(asRecord(fullReport.seoStrategy), asRecord(fullReport.aeoStrategy));
  const socialCal = formatSocialContent(asRecord(fullReport.socialMediaStrategy), asRecord(fullReport.contentCalendarFramework));
  const paid = formatPaid(asRecord(fullReport.paidMediaStrategy));
  const pr = formatPrThought(asRecord(fullReport.thoughtLeadershipStrategy));
  const journey = formatJourney(asRecord(fullReport.customerJourneyMap));
  const competitive = formatCompetitive(asRecord(fullReport.competitivePositioning));
  const audience = formatAudienceSegments(
    asRecord(fullReport.icpConversionIntelligenceFramework),
    asRecord(fullReport.personaDrivenSegmentation),
    asRecord(fullReport.audiencePersonaDefinition),
  );
  const roadmap = formatNinetyDay(asRecord(fullReport.ninetyDayRoadmap));
  const website = formatWebsiteChannel(asRecord(fullReport.advancedMessagingMatrix));
  const leadMagnet = formatLeadMagnetPlan(fullReport, companyName);

  const channelPlans: Partial<Record<string, string>> = {};
  if (email) channelPlans.email = email;
  if (seoAeo) {
    channelPlans["content-seo"] = seoAeo;
    channelPlans.seo = seoAeo;
  }
  if (socialCal) {
    channelPlans.social = socialCal;
    channelPlans.content = socialCal;
  }
  if (paid) {
    channelPlans.ads = paid;
    channelPlans.campaigns = paid;
  }
  if (pr) {
    channelPlans.pr = pr;
    channelPlans.visibility = pr;
  }
  if (website) channelPlans.website = website;
  if (leadMagnet) channelPlans["lead-magnet"] = leadMagnet;

  return {
    channelPlans,
    buyerJourneySummary: journey,
    competitiveMatrixSummary: competitive,
    executionRoadmapBody: roadmap,
    personaIcpBanner: buildPersonaIcpBanner(fullReport),
    audienceSegmentsBody: audience,
  };
}

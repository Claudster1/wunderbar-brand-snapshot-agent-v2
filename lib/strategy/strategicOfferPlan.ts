/**
 * Renders `strategicOfferContext` from Blueprint / Blueprint+ reports for the Strategy tab.
 * Framing: JTBD-style job statement, outcome/scope discipline, leading signals, channel alignment.
 */

function asStr(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function joinBlocks(...parts: (string | false | undefined | null)[]): string {
  return parts.filter(Boolean).join("\n\n");
}

function formatList(title: string, items: unknown, bullet: boolean): string | null {
  if (!Array.isArray(items) || items.length === 0) return null;
  const lines = items
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean)
    .slice(0, 12);
  if (lines.length === 0) return null;
  if (bullet) return `${title}\n${lines.map((l) => `• ${l}`).join("\n")}`;
  return `${title}\n${lines.join("\n")}`;
}

function formatSignals(raw: unknown): string | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const rows = raw.slice(0, 8).map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return "";
    const r = item as Record<string, unknown>;
    const signal = asStr(r.signal);
    const cadence = asStr(r.reviewCadence);
    const why = asStr(r.whyItMatters);
    return joinBlocks(
      signal && `Signal: ${signal}`,
      cadence && `Review cadence: ${cadence}`,
      why && `Why it matters: ${why}`,
    );
  });
  const body = rows.filter(Boolean).join("\n\n");
  return body ? `Leading success signals\n\n${body}` : null;
}

function formatSecondaryOffers(raw: unknown): string | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const lines = raw.slice(0, 6).map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return "";
    const r = item as Record<string, unknown>;
    const name = asStr(r.name);
    const role = asStr(r.role);
    if (!name) return "";
    return role ? `${name} (${role})` : name;
  });
  const filtered = lines.filter(Boolean);
  if (filtered.length === 0) return null;
  return `Portfolio / adjacent offers\n\n${filtered.map((l) => `• ${l}`).join("\n")}`;
}

/** Plain-text body for Strategy → Strategic offer & portfolio. */
export function buildStrategicOfferPlanBody(diagnostic: Record<string, unknown>): string {
  const raw = diagnostic.strategicOfferContext;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return "";

  const o = raw as Record<string, unknown>;
  const framing = asStr(o.methodologyFraming);
  const job = asStr(o.jobStatement);
  const po = o.primaryOffer;
  let primaryBlock = "";
  if (po && typeof po === "object" && !Array.isArray(po)) {
    const p = po as Record<string, unknown>;
    const name = asStr(p.name);
    const offerType = asStr(p.offerType);
    const pitch = asStr(p.oneLinePitch);
    const who = asStr(p.whoItsFor);
    const subs = asStr(p.substitutesConsidered);
    const whySwitch = asStr(p.whyTheySwitch);
    primaryBlock = joinBlocks(
      name && `Primary offer: ${name}`,
      offerType && `Type: ${offerType.replace(/_/g, " ")}`,
      pitch && pitch,
      who && `Who it is for: ${who}`,
      subs && `Alternatives buyers compare to: ${subs}`,
      whySwitch && `Why they switch to you: ${whySwitch}`,
    );
  }

  const channelAlign = asStr(o.channelExecutionAlignment);
  const risk = asStr(o.riskiestAssumption);

  const body = joinBlocks(
    framing && `How this was framed\n${framing}`,
    job && `Job to be done\n${job}`,
    primaryBlock || undefined,
    formatSecondaryOffers(o.secondaryOffers),
    formatList("Pains relieved", o.painsRelieved, true),
    formatList("Outcomes enabled", o.outcomesEnabled, true),
    formatList("In scope", o.scopeIn, true),
    formatList("Explicitly out of scope (do not promise)", o.scopeOut, true),
    formatSignals(o.leadingSuccessSignals),
    channelAlign && `Channel execution alignment\n${channelAlign}`,
    risk && `Riskiest assumption\n${risk}`,
  );

  return body.trim();
}

/** One-line hook for Activation bridge (optional). */
export function strategicOfferPrimaryLabel(diagnostic: Record<string, unknown>): string | null {
  const raw = diagnostic.strategicOfferContext;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const po = (raw as Record<string, unknown>).primaryOffer;
  if (!po || typeof po !== "object" || Array.isArray(po)) return null;
  const p = po as Record<string, unknown>;
  const name = asStr(p.name);
  const pitch = asStr(p.oneLinePitch);
  if (name && pitch) return `${name} — ${pitch}`;
  return name || pitch || null;
}

/** Parsed `strategicOfferContext` for structured Strategy tab UI (not plain prose). */
export type StrategicOfferPrimaryOfferVM = {
  name: string;
  offerType: string;
  oneLinePitch: string;
  whoItsFor: string;
  substitutesConsidered: string;
  whyTheySwitch: string;
};

export type StrategicOfferSecondaryOfferVM = { name: string; role: string };

export type StrategicOfferSuccessSignalVM = {
  signal: string;
  reviewCadence: string;
  whyItMatters: string;
};

export type StrategicOfferViewModel = {
  methodologyFraming: string;
  jobStatement: string;
  primaryOffer: StrategicOfferPrimaryOfferVM | null;
  secondaryOffers: StrategicOfferSecondaryOfferVM[];
  painsRelieved: string[];
  outcomesEnabled: string[];
  scopeIn: string[];
  scopeOut: string[];
  leadingSuccessSignals: StrategicOfferSuccessSignalVM[];
  channelExecutionAlignment: string;
  riskiestAssumption: string;
};

function asStringArrayField(items: unknown, max: number): string[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean)
    .slice(0, max);
}

/**
 * Returns a view model when `diagnostic.strategicOfferContext` is a non-array object (may still be sparse).
 * Returns `null` when the block is absent or not an object.
 */
export function parseStrategicOfferViewModel(diagnostic: Record<string, unknown>): StrategicOfferViewModel | null {
  const raw = diagnostic.strategicOfferContext;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;

  let primaryOffer: StrategicOfferPrimaryOfferVM | null = null;
  const po = o.primaryOffer;
  if (po && typeof po === "object" && !Array.isArray(po)) {
    const p = po as Record<string, unknown>;
    const name = asStr(p.name);
    const offerType = asStr(p.offerType);
    const oneLinePitch = asStr(p.oneLinePitch);
    const whoItsFor = asStr(p.whoItsFor);
    const substitutesConsidered = asStr(p.substitutesConsidered);
    const whyTheySwitch = asStr(p.whyTheySwitch);
    if (name || offerType || oneLinePitch || whoItsFor || substitutesConsidered || whyTheySwitch) {
      primaryOffer = {
        name,
        offerType,
        oneLinePitch,
        whoItsFor,
        substitutesConsidered,
        whyTheySwitch,
      };
    }
  }

  const secondaryOffers: StrategicOfferSecondaryOfferVM[] = [];
  if (Array.isArray(o.secondaryOffers)) {
    for (const item of o.secondaryOffers.slice(0, 8)) {
      if (!item || typeof item !== "object" || Array.isArray(item)) continue;
      const r = item as Record<string, unknown>;
      const name = asStr(r.name);
      const role = asStr(r.role);
      if (name) secondaryOffers.push({ name, role });
    }
  }

  const leadingSuccessSignals: StrategicOfferSuccessSignalVM[] = [];
  if (Array.isArray(o.leadingSuccessSignals)) {
    for (const item of o.leadingSuccessSignals.slice(0, 8)) {
      if (!item || typeof item !== "object" || Array.isArray(item)) continue;
      const r = item as Record<string, unknown>;
      const signal = asStr(r.signal);
      if (!signal) continue;
      leadingSuccessSignals.push({
        signal,
        reviewCadence: asStr(r.reviewCadence),
        whyItMatters: asStr(r.whyItMatters),
      });
    }
  }

  return {
    methodologyFraming: asStr(o.methodologyFraming),
    jobStatement: asStr(o.jobStatement),
    primaryOffer,
    secondaryOffers,
    painsRelieved: asStringArrayField(o.painsRelieved, 12),
    outcomesEnabled: asStringArrayField(o.outcomesEnabled, 12),
    scopeIn: asStringArrayField(o.scopeIn, 12),
    scopeOut: asStringArrayField(o.scopeOut, 12),
    leadingSuccessSignals,
    channelExecutionAlignment: asStr(o.channelExecutionAlignment),
    riskiestAssumption: asStr(o.riskiestAssumption),
  };
}

export function strategicOfferViewModelHasContent(vm: StrategicOfferViewModel): boolean {
  return Boolean(
    vm.methodologyFraming ||
      vm.jobStatement ||
      vm.primaryOffer ||
      vm.secondaryOffers.length > 0 ||
      vm.painsRelieved.length > 0 ||
      vm.outcomesEnabled.length > 0 ||
      vm.scopeIn.length > 0 ||
      vm.scopeOut.length > 0 ||
      vm.leadingSuccessSignals.length > 0 ||
      vm.channelExecutionAlignment ||
      vm.riskiestAssumption,
  );
}

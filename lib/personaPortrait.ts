/**
 * Deterministic illustrated portraits for buyer personas.
 * Uses DiceBear (SVG) so each company + persona name + role maps to a stable face.
 * One DiceBear style per report (from business context + stable report key); faces differ by seed; backgrounds vary slightly by persona index.
 * When a persona display name implies a gendered presentation, we bias DiceBear options so Lorelei (female-leaning) is not used for clearly male names, and facial hair is suppressed for inferred-female names on Micah / Notionists.
 * CSP: img-src allows https:; no cookies sent if using plain <img>.
 */
const DICEBEAR_VERSION = "7.x";
const DEFAULT_STYLE = "notionists";

/** Professional-leaning illustration sets */
const STYLES_B2B = ["notionists", "micah"] as const;
/** Consumer / warmer sets — still abstract, not photos */
const STYLES_B2C = ["lorelei", "notionists", "micah"] as const;
/** When business model is unclear, rotate across styles */
const STYLES_NEUTRAL = ["notionists", "micah", "lorelei"] as const;

const BG_B2B = ["e8f6fe", "e6f0ff", "eef6ff"] as const;
const BG_B2C = ["fff4ec", "fef3e2", "fdf2f8"] as const;
const BG_NEUTRAL = ["e8f6fe", "f4f0ff", "f0f9ff"] as const;

export type PersonaAudienceKind = "b2b" | "b2c" | "unknown";

export type PersonaPortraitGenderHint = "male" | "female" | "unknown";

function splitNameSet(block: string): Set<string> {
  return new Set(
    block
      .split(/[\s,]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

/** First names that are commonly ambiguous — do not force male/female from these alone. */
const UNISEX_GIVEN_NAMES = splitNameSet(`
  alex alexi avery blair cameron casey devon drew ellis emerson finley frankie gray grey
  harper hayden jamie jay jordan kennedy kiran logan max morgan noel parker pat quinn reese
   riley river rowan sage sam skylar skyler taylor jesse chris kris pat kerry
  shannon shawn sean francis dominique jaime sidney sydney kim
`);

const FEMALE_GIVEN_NAMES = splitNameSet(`
  priya sarah emily jessica ashley amanda melissa deborah stephanie dorothy rebecca laura
  helen maria nancy betty sandra margaret ruth kimberly amy anna brenda pamela emma nicole
  samantha katherine christine debra rachel catherine carolyn janet virginia heather diane
  julie joyce victoria kelly christina joan judith megan cheryl andrea hannah jacqueline
  martha gloria teresa madison grace judy theresa marie janice alexandra natalie olivia
  sophia isabella mia charlotte amelia harper evelyn abigail luna camila aria scarlett
  layla chloe zoe penelope nora lily eleanor hannah lillian addison aubrey ellie stella
  natalie zoe maya naomi elena claire ivy victoria aria skylar lucy paisley anna bella
  anita anjali divya kavita lakshmi meera neha pooja ritu sonia deepa sita indira lisa
  jennifer michelle angela ashley nicole stephanie karen melissa brenda amy anna pamela
  emma olivia sophia charlotte amelia isabella mia evelyn harper luna camila gianna elizabeth
  eleanor ella abigail sofia avery emily aria scarlett violet aurora hazel nova riley
  brooklyn lillian zoe lily penelope layla nora chloe ellie mila grace hannah lucy
  linda susan patricia barbara donna carol sharon natasha monica vanessa julia bianca
  gina rosa svetlana oksana yulia tatiana danielle danica
`);

const MALE_GIVEN_NAMES = splitNameSet(`
  marcus james john robert michael david william richard joseph thomas charles daniel
  matthew anthony mark donald steven paul andrew joshua kenneth kevin brian george timothy
  ronald jason edward jeffrey ryan jacob gary nicholas eric jonathan stephen larry justin
  scott brandon benjamin samuel gregory patrick frank raymond jack dennis jerry tyler aaron
  jose henry adam douglas nathan peter zachary kyle noah ethan jeremy christian austin
  harold wayne ralph carl arthur victor albert willie lawrence roy eugene louis philip
  bobby johnny marvin bruce brad gabriel dean troy sean logan oliver caleb isaac mason
  hunter connor owen landon carter wyatt jaxon jace everett micah parker dominic colin
  easton blake camden brody leo jaxson chase colton cooper xavier diego brayden ian
  carson robert alexander jonathan nathaniel theodore harrison grayson asher lincoln
  raj vikram amit arjun rahul sanjay karan dev rohan anil suresh manish ravi dinesh
  mohammed omar hassan ali ibrahim ahmed oliver henry sebastian jack owen
  theodore levi isaac jonathan luke wyatt isaac jackson nathan daniel ethan landon
  ken brad chad todd brent brett kurt kirk keith neil malcolm colin gavin
  brendan shaun daryl derek derrick brenton clay clyde craig
  fred frederick gordon graham grant hector ignacio javier jorge luis miguel pablo
  roberto sergio stefan vladimir walter warren wayne wesley wes zach zack antoine anton andre andreas bernard bruno cyril damien denis etienne felix francois
  gerard gilles henri jacques jean louis luc marc marcel mathieu michel nicolas olivier
  philippe pierre remy stephane thierry yves
`);

function normalizeGivenToken(raw: string): string {
  return raw.replace(/[^a-zA-ZÀ-ÿ'-]/g, "").toLowerCase();
}

const LEADING_ARTICLES = new Set(["the", "a", "an", "our", "your"]);

/** Role abbreviations often lead persona labels ("VP Priya K.") — never treat as a given name. */
const ROLE_PREFIX_TOKENS = splitNameSet(`
  vp svp evp avp rvp gvp coo ceo cfo cto cmo cro cpo cio chro cdoo clo pm gm hr pr it ux ui ai ml seo sem
`);

/**
 * Best-effort given name from a persona display string (e.g. "Marcus Lee, VP Sales" → marcus; "Park, Priya" → priya).
 */
export function parsePersonaGivenName(personaName: string): string {
  let s = personaName.trim().replace(/^(dr|mr|mrs|ms|mx)\.?\s+/i, "");
  if (!s) return "";
  /** Drop role / title tails so "Priya Sharma — VP" still yields priya. */
  s = s.split(/\s*[-|\u2013\u2014]\s*/u)[0]?.trim() ?? s;
  s = s.replace(/\s*\([^)]*\)\s*$/g, "").trim();
  if (/,\s*\S/.test(s)) {
    const parts = s.split(/\s*,\s*/);
    const after = parts.length >= 2 ? (parts[1]?.trim().split(/\s+/)[0] ?? "") : "";
    const normalized = normalizeGivenToken(after);
    if (normalized.length >= 2) return normalized;
  }
  const tokens = s.split(/\s+/).filter(Boolean);
  let i = 0;
  while (i < tokens.length) {
    const t = normalizeGivenToken(tokens[i] ?? "");
    if (!t || LEADING_ARTICLES.has(t) || ROLE_PREFIX_TOKENS.has(t)) {
      i += 1;
      continue;
    }
    if (t.length >= 2) return t;
    i += 1;
  }
  return "";
}

/** Inline pronouns in a label (e.g. "Priya (she/her)" or bio line), not free prose. */
function genderHintFromPronounPhrase(text: string): PersonaPortraitGenderHint | null {
  if (/\(she\//i.test(text) || /\bshe\s*\/\s*her\b/i.test(text)) return "female";
  if (/\(he\//i.test(text) || /\bhe\s*\/\s*him\b/i.test(text)) return "male";
  return null;
}

function genderFromPersonaRecord(record: Record<string, unknown> | null | undefined): PersonaPortraitGenderHint | null {
  if (!record || typeof record !== "object") return null;
  for (const key of ["gender", "personaGender", "sex", "pronouns"] as const) {
    const v = record[key];
    if (typeof v !== "string") continue;
    const n = v.trim().toLowerCase();
    if (n === "male" || n === "man" || n === "m") return "male";
    if (n === "female" || n === "woman" || n === "f") return "female";
    if (key === "pronouns") {
      if (/\b(she|her|hers)\b/.test(n)) return "female";
      if (/\b(he|him|his)\b/.test(n)) return "male";
    }
  }
  for (const key of ["title", "headline", "role", "jobTitle"] as const) {
    const v = record[key];
    if (typeof v !== "string") continue;
    if (/\b(mr\.?|mister)\b/i.test(v)) return "male";
    if (/\b(mrs\.?|ms\.?|miss|madam)\b/i.test(v)) return "female";
  }
  for (const key of ["name", "fullName", "personaName", "label", "displayName"] as const) {
    const v = record[key];
    if (typeof v !== "string") continue;
    const hint = genderHintFromPronounPhrase(v);
    if (hint) return hint;
  }
  return null;
}

/**
 * Used to tune DiceBear (never blocks rendering). Optional structured `gender` on the persona object wins over the name.
 */
export function inferPersonaPortraitGender(params: {
  personaName: string;
  personaRecord?: Record<string, unknown> | null;
}): PersonaPortraitGenderHint {
  const fromRec = genderFromPersonaRecord(params.personaRecord);
  if (fromRec) return fromRec;
  const fromLabel = genderHintFromPronounPhrase(params.personaName);
  if (fromLabel) return fromLabel;
  const given = parsePersonaGivenName(params.personaName);
  if (!given || given.length < 2) return "unknown";
  if (UNISEX_GIVEN_NAMES.has(given)) return "unknown";
  if (FEMALE_GIVEN_NAMES.has(given)) return "female";
  if (MALE_GIVEN_NAMES.has(given)) return "male";
  return "unknown";
}

function hashToUint(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Infer selling context from diagnostic fields (businessType, industry, audience copy).
 */
export function inferPersonaAudienceKind(
  diagnostic: Record<string, unknown> | null | undefined,
): PersonaAudienceKind {
  if (!diagnostic || typeof diagnostic !== "object") return "unknown";

  const bt = String(diagnostic.businessType ?? diagnostic.business_type ?? "").toLowerCase();
  if (bt.includes("b2c") || bt.includes("service_b2c") || bt.includes("ecommerce") || bt.includes("retail"))
    return "b2c";
  if (bt.includes("b2b") || bt.includes("service_b2b") || bt.includes("saas")) return "b2b";

  const corpus = [
    typeof diagnostic.industry === "string" ? diagnostic.industry : "",
    typeof diagnostic.targetAudience === "string" ? diagnostic.targetAudience : "",
    typeof diagnostic.secondaryAudience === "string" ? diagnostic.secondaryAudience : "",
  ]
    .join(" ")
    .toLowerCase();

  if (
    /\b(b2c|consumer|consumers|shoppers?|patients?|guests?|parents?|homeowners?|dtc|direct[- ]to[- ]consumer|e-?commerce|retail|boutique)\b/.test(
      corpus,
    )
  ) {
    return "b2c";
  }
  if (
    /\b(b2b|enterprise|saas|procurement|stakeholders?|organizations?|companies|cfo|vp |director|rfp|vendors?)\b/.test(
      corpus,
    )
  ) {
    return "b2b";
  }
  return "unknown";
}

export function buildPersonaPortraitSeed(parts: {
  reportId?: string;
  companyName?: string;
  personaName: string;
  role: string;
  index: number;
}): string {
  const chunk = [
    parts.reportId?.trim() ?? "",
    parts.companyName?.trim() ?? "",
    parts.personaName.trim(),
    parts.role.trim(),
    String(parts.index),
  ].join("|");
  return chunk.length > 256 ? chunk.slice(0, 256) : chunk;
}

/** Stable per report (not per persona index) so every face in one atlas uses the same DiceBear style. */
function reportPortraitKey(diagnostic: Record<string, unknown> | null | undefined, seed: string): string {
  const rid =
    diagnostic && typeof diagnostic.reportId === "string"
      ? diagnostic.reportId.trim()
      : typeof diagnostic?.report_id === "string"
        ? String(diagnostic.report_id).trim()
        : "";
  const cn =
    diagnostic && typeof diagnostic.companyName === "string"
      ? diagnostic.companyName.trim()
      : typeof diagnostic?.businessName === "string"
        ? String(diagnostic.businessName).trim()
        : "";
  if (rid || cn) return `${rid}|${cn}`;
  const parts = seed.split("|");
  return `${parts[0] ?? ""}|${parts[1] ?? ""}`;
}

export function resolvePersonaPortraitDiceBear(params: {
  seed: string;
  index: number;
  diagnostic?: Record<string, unknown> | null;
  personaName?: string;
  personaRecord?: Record<string, unknown> | null;
}): {
  style: string;
  backgroundColor: string;
  beardProbability?: number;
  facialHairProbability?: number;
} {
  const gender = inferPersonaPortraitGender({
    personaName: params.personaName?.trim() ?? "",
    personaRecord: params.personaRecord,
  });

  const kind = inferPersonaAudienceKind(params.diagnostic ?? undefined);
  const styles =
    kind === "b2c" ? STYLES_B2C : kind === "b2b" ? STYLES_B2B : STYLES_NEUTRAL;
  const bgs = kind === "b2c" ? BG_B2C : kind === "b2b" ? BG_B2B : BG_NEUTRAL;
  const reportKey = reportPortraitKey(params.diagnostic ?? undefined, params.seed);
  const stylePick = hashToUint(`${reportKey}|${kind}|style`);
  let style = styles[stylePick % styles.length] ?? DEFAULT_STYLE;
  /** Caller may already suffix seed (e.g. persona-gender) for DiceBear PRNG + bg tint. */
  const h = hashToUint(`${params.seed}|bg`);
  const backgroundColor = bgs[(h + params.index * 7) % bgs.length] ?? "e8f6fe";

  /**
   * Lorelei is female-leaning; Micah/Notionists are mixed. When we infer gender from a first name,
   * pick a style set that matches presentation (per-portrait override beats "one style per report"
   * so Marcus/Priya-type labels match faces).
   */
  if (gender === "male" && style === "lorelei") {
    style = "micah";
  }
  if (gender === "female" && (style === "notionists" || style === "micah")) {
    style = "lorelei";
  }

  const out: {
    style: string;
    backgroundColor: string;
    beardProbability?: number;
    facialHairProbability?: number;
  } = { style, backgroundColor };

  if (gender === "female") {
    if (style === "notionists") out.beardProbability = 0;
    if (style === "micah") out.facialHairProbability = 0;
    if (style === "lorelei") out.beardProbability = 0;
  }
  if (gender === "male") {
    if (style === "notionists") out.beardProbability = 55;
    if (style === "micah") out.facialHairProbability = 55;
  }

  return out;
}

export function dicebearPersonaPortraitUrl(
  seed: string,
  options?: {
    style?: string;
    backgroundColor?: string;
    beardProbability?: number;
    facialHairProbability?: number;
  },
): string {
  const s = (seed.trim() || "wunderbar-persona").slice(0, 256);
  const style = options?.style ?? DEFAULT_STYLE;
  const backgroundColor = options?.backgroundColor ?? "e8f6fe";
  const params = new URLSearchParams({
    seed: s,
    backgroundColor,
    radius: "22",
  });
  if (options?.beardProbability !== undefined) {
    params.set("beardProbability", String(options.beardProbability));
  }
  if (options?.facialHairProbability !== undefined) {
    params.set("facialHairProbability", String(options.facialHairProbability));
  }
  return `https://api.dicebear.com/${DICEBEAR_VERSION}/${style}/svg?${params.toString()}`;
}

/** Preferred entry point: stable seed + variety by business context and slot index. */
export function dicebearPersonaPortraitUrlForPersona(opts: {
  seed: string;
  index: number;
  diagnostic?: Record<string, unknown> | null;
  personaName?: string;
  personaRecord?: Record<string, unknown> | null;
}): string {
  const gender = inferPersonaPortraitGender({
    personaName: opts.personaName?.trim() ?? "",
    personaRecord: opts.personaRecord,
  });
  const seedForAvatar =
    gender !== "unknown" ? `${opts.seed}|persona-gender:${gender}` : opts.seed;
  const resolved = resolvePersonaPortraitDiceBear({ ...opts, seed: seedForAvatar });
  return dicebearPersonaPortraitUrl(seedForAvatar, {
    style: resolved.style,
    backgroundColor: resolved.backgroundColor,
    beardProbability: resolved.beardProbability,
    facialHairProbability: resolved.facialHairProbability,
  });
}

// Normalize brandImageryDirection from AI (camelCase) and legacy snake_case for PDF + UI.

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === "string" && x.trim().length > 0).map((s) => s.trim());
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

export type NormalizedMoodBoardDescriptors = {
  adjectives?: string[];
  textures?: string[];
  environments?: string[];
  lighting_conditions?: string;
  color_moods?: string;
  designer_note?: string;
};

export type NormalizedImagerySample = {
  url: string;
  caption?: string;
  rationale?: string;
  source?: string;
};

export type NormalizedPlatformImagery = {
  platform: string;
  dimensions?: string;
  style_adaptation: string;
  examples?: string[];
};

export type NormalizedBrandImageryDirection = {
  photography_style_direction?: string;
  subject_matter_guidance?: { show?: string[]; avoid?: string[] };
  stock_photo_selection_criteria?: {
    lighting?: string;
    composition?: string;
    color_temperature?: string;
    diversity?: string;
    authenticity_markers?: string;
  };
  image_donts?: Array<{ dont: string; why: string; alternative: string }>;
  color_application_in_imagery?: string;
  platform_specific_imagery_guidance?: NormalizedPlatformImagery[];
  mood_board_descriptors?: NormalizedMoodBoardDescriptors;
  imagery_by_audience?: Array<{
    persona: string;
    visual_tone_shift: string;
    example_image_descriptions?: string[];
  }>;
  mood_board_image_samples?: NormalizedImagerySample[];
  ai_image_generation_prompts?: Array<{
    useCase?: string;
    prompt?: string;
    negativePrompt?: string;
    tool?: string;
  }>;
};

function normalizeMoodDescriptors(raw: unknown): NormalizedMoodBoardDescriptors | undefined {
  const m = asRecord(raw);
  if (!m) return undefined;
  const adjectives = asStringArray(m.adjectives);
  const textures = asStringArray(m.textures);
  const environments = asStringArray(m.environments);
  const lighting = asString(m.lightingConditions ?? m.lighting_conditions);
  const colorMoods = asString(m.colorMoods ?? m.color_moods);
  const designerNote = asString(m.designerNote ?? m.designer_note);
  if (
    !adjectives.length &&
    !textures.length &&
    !environments.length &&
    !lighting &&
    !colorMoods &&
    !designerNote
  ) {
    return undefined;
  }
  return {
    adjectives: adjectives.length ? adjectives : undefined,
    textures: textures.length ? textures : undefined,
    environments: environments.length ? environments : undefined,
    lighting_conditions: lighting || undefined,
    color_moods: colorMoods || undefined,
    designer_note: designerNote || undefined,
  };
}

function normalizeImageSamples(raw: unknown): NormalizedImagerySample[] {
  if (!Array.isArray(raw)) return [];
  const out: NormalizedImagerySample[] = [];
  for (const item of raw) {
    const row = asRecord(item) ?? {};
    const url = asString(row.url ?? row.imageUrl ?? row.src);
    if (!url) continue;
    const sample: NormalizedImagerySample = { url };
    const cap = asString(row.caption ?? row.title);
    if (cap) sample.caption = cap;
    const rat = asString(row.rationale ?? row.why);
    if (rat) sample.rationale = rat;
    const src = asString(row.source);
    if (src) sample.source = src;
    out.push(sample);
    if (out.length >= 12) break;
  }
  return out;
}

function normalizeImageDonts(raw: unknown): NormalizedBrandImageryDirection["image_donts"] {
  if (!Array.isArray(raw)) return undefined;
  const out = raw
    .map((item) => {
      const row = asRecord(item) ?? {};
      const dont = asString(row.dont);
      if (!dont) return null;
      return {
        dont,
        why: asString(row.why) || "—",
        alternative: asString(row.alternative) || "—",
      };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));
  return out.length ? out : undefined;
}

function normalizePlatforms(raw: unknown): NormalizedPlatformImagery[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: NormalizedPlatformImagery[] = [];
  for (const item of raw) {
    const row = asRecord(item) ?? {};
    const platform = asString(row.platform);
    const style = asString(row.styleAdaptation ?? row.style_adaptation);
    if (!platform || !style) continue;
    const examplesRaw = row.examples;
    const examples = Array.isArray(examplesRaw)
      ? examplesRaw.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      : undefined;
    const entry: NormalizedPlatformImagery = { platform, style_adaptation: style };
    const dim = asString(row.dimensions);
    if (dim) entry.dimensions = dim;
    if (examples?.length) entry.examples = examples;
    out.push(entry);
  }
  return out.length ? out : undefined;
}

function normalizeSubject(raw: unknown): NormalizedBrandImageryDirection["subject_matter_guidance"] {
  const row = asRecord(raw);
  if (!row) return undefined;
  const show = asStringArray(row.show);
  const avoid = asStringArray(row.avoid);
  if (!show.length && !avoid.length) return undefined;
  return { show: show.length ? show : undefined, avoid: avoid.length ? avoid : undefined };
}

function normalizeStock(raw: unknown): NormalizedBrandImageryDirection["stock_photo_selection_criteria"] {
  const row = asRecord(raw);
  if (!row) return undefined;
  const lighting = asString(row.lighting);
  const composition = asString(row.composition);
  const colorTemperature = asString(row.colorTemperature ?? row.color_temperature);
  const diversity = asString(row.diversity);
  const authenticityMarkers = asString(row.authenticityMarkers ?? row.authenticity_markers);
  if (!lighting && !composition && !colorTemperature && !diversity && !authenticityMarkers) return undefined;
  return {
    lighting: lighting || undefined,
    composition: composition || undefined,
    color_temperature: colorTemperature || undefined,
    diversity: diversity || undefined,
    authenticity_markers: authenticityMarkers || undefined,
  };
}

function normalizeAiPrompts(raw: unknown): NormalizedBrandImageryDirection["ai_image_generation_prompts"] {
  if (!Array.isArray(raw)) return undefined;
  const out = raw
    .map((item) => {
      const row = asRecord(item) ?? {};
      const prompt = asString(row.prompt);
      if (!prompt) return null;
      return {
        useCase: asString(row.useCase ?? row.use_case) || undefined,
        prompt,
        negativePrompt: asString(row.negativePrompt ?? row.negative_prompt) || undefined,
        tool: asString(row.tool) || undefined,
      };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));
  return out.length ? out : undefined;
}

function normalizeImageryByAudience(raw: unknown): NormalizedBrandImageryDirection["imagery_by_audience"] {
  if (!Array.isArray(raw)) return undefined;
  const out = raw
    .map((item) => {
      const row = asRecord(item) ?? {};
      const persona = asString(row.persona);
      const visualToneShift = asString(row.visualToneShift ?? row.visual_tone_shift);
      if (!persona || !visualToneShift) return null;
      const ex = row.exampleImageDescriptions ?? row.example_image_descriptions;
      const example_image_descriptions = Array.isArray(ex)
        ? ex.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
        : undefined;
      return { persona, visual_tone_shift: visualToneShift, example_image_descriptions };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));
  return out.length ? out : undefined;
}

/** Returns null if there is no meaningful imagery content. */
export function normalizeBrandImageryDirection(raw: unknown): NormalizedBrandImageryDirection | null {
  const r = asRecord(raw);
  if (!r) return null;

  const photography = asString(r.photographyStyleDirection ?? r.photography_style_direction);
  const subject = normalizeSubject(r.subjectMatterGuidance ?? r.subject_matter_guidance);
  const stock = normalizeStock(r.stockPhotoSelectionCriteria ?? r.stock_photo_selection_criteria);
  const image_donts = normalizeImageDonts(r.imageDonts ?? r.image_donts);
  const color_application = asString(r.colorApplicationInImagery ?? r.color_application_in_imagery);
  const platforms = normalizePlatforms(r.platformSpecificImageryGuidance ?? r.platform_specific_imagery_guidance);
  const mood_board_descriptors = normalizeMoodDescriptors(r.moodBoardDescriptors ?? r.mood_board_descriptors);
  const mood_board_image_samples = normalizeImageSamples(r.moodBoardImageSamples ?? r.mood_board_image_samples);
  const imagery_by_audience = normalizeImageryByAudience(r.imageryByAudience ?? r.imagery_by_audience);
  const ai_image_generation_prompts = normalizeAiPrompts(
    r.aiImageGenerationPrompts ?? r.ai_image_generation_prompts,
  );

  const hasContent =
    photography ||
    subject ||
    stock ||
    (image_donts && image_donts.length > 0) ||
    color_application ||
    (platforms && platforms.length > 0) ||
    mood_board_descriptors ||
    mood_board_image_samples.length > 0 ||
    (imagery_by_audience && imagery_by_audience.length > 0) ||
    (ai_image_generation_prompts && ai_image_generation_prompts.length > 0);

  if (!hasContent) return null;

  return {
    photography_style_direction: photography || undefined,
    subject_matter_guidance: subject,
    stock_photo_selection_criteria: stock,
    image_donts,
    color_application_in_imagery: color_application || undefined,
    platform_specific_imagery_guidance: platforms,
    mood_board_descriptors,
    imagery_by_audience,
    mood_board_image_samples: mood_board_image_samples.length ? mood_board_image_samples : undefined,
    ai_image_generation_prompts,
  };
}
